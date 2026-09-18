// Quality gate for pull requests into main.
//
// Layer 1, always on: deterministic rules. Generated paths are off limits,
// text must be clean UTF-8 with no hidden characters or secrets, links stay
// on allowed hosts, SKILL.md frontmatter is well formed, and prose must look
// like prose (a handful of gibberish heuristics).
//
// Layer 2, when ANTHROPIC_API_KEY is set: Claude reads each changed markdown
// file and grades whether it is coherent, on-topic content for a catalogue of
// GTM skills. Scores below the bar fail the check with the reason printed.
//
// Exit code 1 fails the check. Everything it flags is printed so the author
// can fix it without reading this file.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const repoRoot = path.resolve(process.cwd(), "../..");
const base = process.env.BASE_SHA;
const head = process.env.HEAD_SHA ?? "HEAD";

// ---------------------------------------------------------------- inputs

function changedFiles() {
  if (process.env.CHANGED_FILES) {
    return process.env.CHANGED_FILES.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  const range = base ? `${base}...${head}` : "HEAD~1...HEAD";
  const out = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", range], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

const files = changedFiles();
const problems = [];
const notes = [];
const fail = (file, msg) => {
  const line = `${file}: ${msg}`;
  if (!problems.includes(line)) problems.push(line);
};

// ---------------------------------------------------------------- rules

const GENERATED = [/^skills\//, /^\.claude-plugin\//];
const ALLOWED_HOSTS = [
  /(^|\.)zime\.ai$/,
  /^claude\.ai$/,
  /^docs\.anthropic\.com$/,
  /^support\.anthropic\.com$/,
  /^github\.com$/,
  /^img\.shields\.io$/,
  /^(www\.)?linkedin\.com$/,
];
const SECRET_PATTERNS = [
  [/\bzm_live_[a-f0-9]{16,}/i, "Zime API key"],
  [/\bsk-ant-[A-Za-z0-9_-]{10,}/, "Anthropic API key"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/\b(password|passwd|secret|api[_-]?key)\s*[:=]\s*['"][^'"\s]{8,}['"]/i, "hardcoded credential"],
];
// Zero-width and bidirectional control characters, built from code points so
// the file itself never has to contain them.
const HIDDEN_CHARS = new RegExp(
  "[" + [[0x200b, 0x200f], [0x2028, 0x202e], [0x2060, 0x2064], [0xfeff, 0xfeff]]
    .map(([a, b]) => String.fromCodePoint(a) + "-" + String.fromCodePoint(b))
    .join("") + "]",
);
const PLACEHOLDERS = /\b(lorem ipsum|asdf|qwerty|foo ?bar ?baz|test test test|todo:? fill|tbd tbd)\b/i;
const TAGS = new Set(["workflow", "research", "communication", "intelligence", "execution"]);
const ROLES = new Set(["ae", "se", "bdr", "marketing", "pm", "cs"]);

const isText = (f) => /\.(md|markdown|json|ya?ml|txt|mjs|js|ts)$/i.test(f);
const isMarkdown = (f) => /\.(md|markdown)$/i.test(f);

function stripMarkdownNoise(md) {
  return md
    .replace(/^---[\s\S]*?\n---\n/, "") // frontmatter
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[|#>*_~-]+/g, " ");
}

/** Cheap signals that a block of text is keyboard mash rather than language. */
function gibberishReport(prose) {
  const tokens = prose.split(/\s+/).filter(Boolean);
  if (tokens.length < 12) return null; // too short to judge; the LLM judge covers it
  const words = tokens.filter((t) => /^[A-Za-z][A-Za-z'’]*$/.test(t));
  const wordRatio = words.length / tokens.length;
  const letters = words.join("").toLowerCase();
  const vowels = (letters.match(/[aeiouy]/g) ?? []).length;
  const vowelRatio = letters.length ? vowels / letters.length : 0;
  const noVowel = words.filter((w) => w.length > 3 && !/[aeiouy]/i.test(w)).length / Math.max(words.length, 1);
  const longRun = words.some((w) => /(.)\1{3,}/i.test(w));
  const overlong = words.filter((w) => w.length > 24).length;
  const meanLen = words.length ? letters.length / words.length : 0;
  const reasons = [];
  if (wordRatio < 0.55) reasons.push(`only ${Math.round(wordRatio * 100)}% of tokens are words`);
  if (vowelRatio < 0.28 || vowelRatio > 0.62) reasons.push(`vowel ratio ${vowelRatio.toFixed(2)} is outside the range of English text`);
  if (noVowel > 0.12) reasons.push(`${Math.round(noVowel * 100)}% of words have no vowel`);
  if (longRun) reasons.push("a word repeats one character four or more times");
  if (overlong > 0) reasons.push(`${overlong} word(s) longer than 24 letters`);
  if (meanLen < 3 || meanLen > 10) reasons.push(`mean word length ${meanLen.toFixed(1)} does not look like prose`);
  return reasons.length ? reasons : null;
}

function checkFrontmatter(file, text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return fail(file, "SKILL.md must start with YAML frontmatter");
  const fm = Object.fromEntries(
    m[1].split("\n").map((l) => l.split(/:\s*/, 2)).filter((kv) => kv.length === 2).map(([k, v]) => [k.trim(), v.trim().replace(/^"|"$/g, "")]),
  );
  const dir = path.basename(path.dirname(file));
  if (fm.name !== dir) fail(file, `frontmatter name "${fm.name}" must equal the folder name "${dir}"`);
  if (!fm.description || fm.description.length < 40) fail(file, "description must be at least 40 characters and say when to use the skill");
  if (fm.description && fm.description.length > 1200) fail(file, "description is over 1,200 characters");
  if (fm["zime:tag"] && !TAGS.has(fm["zime:tag"])) fail(file, `zime:tag "${fm["zime:tag"]}" is not one of ${[...TAGS].join(", ")}`);
  if (fm["zime:roles"]) {
    const bad = fm["zime:roles"].replace(/[\[\]]/g, "").split(",").map((r) => r.trim()).filter((r) => r && !ROLES.has(r));
    if (bad.length) fail(file, `zime:roles has unknown roles: ${bad.join(", ")}`);
  }
  if (fm.license && fm.license !== "MIT") fail(file, `license must be MIT, got "${fm.license}"`);
  const bodyWords = stripMarkdownNoise(m[2]).split(/\s+/).filter(Boolean).length;
  if (bodyWords < 80) fail(file, `body has ${bodyWords} words; a usable skill needs at least 80`);
}

// ---------------------------------------------------------------- layer 1

const generatedTouched = files.filter((f) => GENERATED.some((re) => re.test(f)));
if (generatedTouched.length) {
  fail(
    generatedTouched[0],
    `${generatedTouched.length} file(s) under skills/ or .claude-plugin/ are generated by the Zime skills publisher and overwritten on the next publish. Publish the skill from the Zime dashboard instead (see CONTRIBUTING.md).`,
  );
}

const markdownForJudge = [];
for (const file of files) {
  const abs = path.join(repoRoot, file);
  if (!existsSync(abs) || !isText(file)) continue;
  const buf = readFileSync(abs);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    fail(file, "is not valid UTF-8");
    continue;
  }
  if (HIDDEN_CHARS.test(text)) fail(file, "contains zero-width or bidirectional control characters");
  for (const [re, label] of SECRET_PATTERNS) if (re.test(text)) fail(file, `looks like it contains a ${label}`);
  if (isMarkdown(file)) {
    // Link hosts are a rule for content people read; lockfiles and configs
    // legitimately point at registries.
    for (const url of text.match(/https?:\/\/[^\s)\]'"<>]+/g) ?? []) {
      let host;
      try {
        host = new URL(url).hostname.toLowerCase();
      } catch {
        continue;
      }
      if (!ALLOWED_HOSTS.some((re) => re.test(host))) fail(file, `links to ${host}, which is not an allowed host`);
    }
    if (PLACEHOLDERS.test(text)) fail(file, "contains placeholder text (lorem ipsum, asdf, qwerty, ...)");
    if (/\/SKILL\.md$/.test(file)) checkFrontmatter(file, text);
    const prose = stripMarkdownNoise(text);
    const g = gibberishReport(prose);
    if (g) fail(file, `does not read like prose: ${g.join("; ")}`);
    if (prose.split(/\s+/).filter(Boolean).length < 8 && file.toUpperCase() !== "LICENSE") {
      fail(file, "has almost no readable text");
    }
    markdownForJudge.push({ file, text });
  }
}

// ---------------------------------------------------------------- layer 2

const JUDGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["coherent", "on_topic", "score", "reasons"],
  properties: {
    coherent: { type: "boolean", description: "The text is meaningful, grammatical language a reader could act on." },
    on_topic: { type: "boolean", description: "The text belongs in a public catalogue of go-to-market skills for Claude: skills, docs about them, contribution or licence notes." },
    score: { type: "integer", enum: [1, 2, 3, 4, 5], description: "1 = gibberish or spam, 3 = rough but usable, 5 = clear and well written." },
    reasons: { type: "array", items: { type: "string" }, description: "One to three short, specific reasons an author could act on." },
  },
};

async function judge(entries) {
  if (!process.env.ANTHROPIC_API_KEY) {
    notes.push("LLM judge skipped: ANTHROPIC_API_KEY is not set for this repository.");
    return;
  }
  const client = new Anthropic();
  for (const { file, text } of entries) {
    const clipped = text.length > 60_000 ? text.slice(0, 60_000) + "\n[truncated for review]" : text;
    try {
      const res = await client.beta.messages.create({
        model: "claude-opus-5",
        max_tokens: 1024,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low", format: { type: "json_schema", schema: JUDGE_SCHEMA } },
        system:
          "You review files proposed for a public GitHub repository that catalogues open-source go-to-market skills for Claude (call prep, follow-ups, deal reviews and similar), with a README and contributing guide. Decide whether the text is coherent, on-topic content or garbage: gibberish, keyboard mash, spam, placeholder filler, or something unrelated to the repository. Judge substance, not style. Be strict about nonsense and lenient about plain or terse writing.",
        messages: [{ role: "user", content: `File: ${file}\n\n<file>\n${clipped}\n</file>` }],
      });
      if (res.stop_reason === "refusal") {
        notes.push(`${file}: judge declined to assess (${res.stop_details?.category ?? "no category"}); deterministic rules still apply.`);
        continue;
      }
      const textBlock = res.content.find((b) => b.type === "text");
      const verdict = JSON.parse(textBlock?.text ?? "{}");
      const line = `score ${verdict.score}/5; ${verdict.reasons?.join("; ") ?? ""}`;
      if (!verdict.coherent || !verdict.on_topic || verdict.score < 3) fail(file, `LLM judge rejected it (${line})`);
      else notes.push(`${file}: LLM judge passed (${line})`);
    } catch (err) {
      // The judge is a second opinion. If the API is unreachable the
      // deterministic rules alone decide; say so rather than blocking merges.
      notes.push(`${file}: LLM judge unavailable (${err?.constructor?.name ?? "error"}: ${err?.message ?? err}).`);
    }
  }
}

await judge(markdownForJudge);

// ---------------------------------------------------------------- report

console.log(`Checked ${files.length} changed file(s).`);
for (const n of notes) console.log(`note: ${n}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error("\nFix the items above and push again. See CONTRIBUTING.md for what belongs here.");
  process.exit(1);
}
console.log("Quality gate passed.");
