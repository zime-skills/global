# Skill template

Fill every section, in this order. Replace everything in angle brackets.
Delete the guidance lines in *italics* once each section is written. Keep the
headings exactly as they are; readers of one Zime skill can then read any
other.

---

```markdown
---
name: <slug>
description: "<Under 1,024 characters. What it does, the trigger phrases quoted, one sentence on what it is not for.>"
license: MIT
metadata:
  zime:tag: <workflow | research | communication | intelligence | execution>
  zime:roles: <comma-separated subset of ae,se,bdr,marketing,pm,cs>
---

# <Title>

<Two or three sentences. What question this answers, which tool does the real
work, and what this skill itself is responsible for. If an agent does the
thinking, say the skill "resolves the right <record> and delivers what the
agent returns".>

## How It Works

┌─────────────────────────────────────────────────────────────────┐
│                         <TITLE, UPPER>                           │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE (this skill)                                   │
│  ✓ <tool> → one <record>_id                                      │
│  ✓ Ambiguous → show candidates, ask, pin                         │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — <DELEGATE | FETCH | RETURN> (<tool or agent>)          │
│  + <what the tool does with the pinned id>                       │
│  + Returns the <thing>; this skill does not rewrite it           │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ <adjacent job>                → <sibling skill>               │
│  ✗ <adjacent job>                → <sibling skill>               │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no <connector>)                                 │
│  ~ <what it does with a file the user provides>                  │
└─────────────────────────────────────────────────────────────────┘

*Wrap the box in a fenced code block. If the scope is many records, replace
STEP 1 with "NO RESOLVE STEP" and say why (see review-account's portfolio
branch).*

## Usage

    /<slug> <what the user types> [+ optional hint]

<One imperative line that ends with: $ARGUMENTS>

## Routing

- <Adjacent job stated the way a user would> → `<sibling-slug>`.
- <Another> → `<sibling-slug>`.
- <The case this skill refuses, and what to say instead.>

*Three to six lines. Every slug named here must exist in the catalogue.*

## What I Need From You

<What the user must supply, what is optional, and what happens when it is
ambiguous. "If several match, I will show candidates and ask; I will not pick
for you." If an angle or lens sharpens the result, invite it here.>

## MCP mode (required when <connector> is connected)

**Required tools:** `<resolve tool>` and `<answer tool>`.

<The grounding rule, in one paragraph. Name what it means to answer without
the tool while the tool is available, and call it a failure of this skill.
Say why: the tool sees what a chat history cannot.>

### Step 1 — resolve the <record>

<Argument list for the resolve tool: name, meaning, where time hints go.>

    { "<arg>": "<example>", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }

### Step 2 — <delegate | fetch>

<Argument list. For an agent tool, show the exact question text with the
record named in it and every pronoun resolved. Say to append the user's angle
verbatim if they gave one.>

    { "<arg>": "<example>" }

### Outcomes

- `resolved` → <what to do next>.
- `multiple_matches` → show candidates with <the fields that tell them
  apart>, ask which one, re-call pinned. Never guess. "The latest" means the
  newest.
- `no_match` → <the most likely cause>, show near-misses, offer to widen.
  Never substitute a similar <record>.
- <Any tool-specific status, one line each.>
- An error → `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access;
  `INVALID_ARGUMENT` means malformed arguments, fix and re-call. If it fails
  twice, say plainly the service could not be reached and offer the local
  fallback. Never present a hand-written result as tool-backed.

## Output

<The envelope. A header naming the record and its hard facts, the tool's
output relayed as-is, a one-line footer naming the source.>

    **<Label> — [record name]** · [date or key fact]
    **<Field>:** [value] · **<Field>:** [value]

    [the tool's returned content, as-is]

    _<Source line, e.g. "Live CRM record via Zime.">_

Rules:

- Relay as-is. No re-ranking, condensing, merging or rounding.
- Keep every date, owner, amount and evidence marker the tool attached.
- Add nothing the tool did not return. Unknown is a finding; state it.
- <Any rule specific to this output, e.g. quotes only from get_transcript.>

*If the output is an analysis, add the "Render it as a visual artifact" block
from review-account: cards, badges, colour only on status fields, prose stays
in the chat, gaps stay visible as "not stated".*

## Tips

1. <The mistake people make with this skill, and the fix.>
2. <How to get a sharper result: the angle, the window, the name.>
3. <The boundary with the nearest sibling skill.>

## Local mode (only when no <connector> is connected)

<Which file types the skill can work from (.txt .vtt .json .md for
transcripts, .csv for CRM or calendar exports). Open with one line saying the
answer covers only the provided file, so <what is missing by construction>.
Mark gaps as gaps rather than inferring. No file and no connection → say so.>

## What this sends where

MCP mode sends <exact fields> to `<tool>`, then <exact fields> to `<tool>`.
Local mode reads only the file the user provided.

## Related Skills

- **<sibling-slug>** — <one line>
- **<sibling-slug>** — <one line>
```

---

## Sibling files

Put long supporting material beside SKILL.md, not inside it:

- `references/` for format guides, question banks, rubrics.
- `assets/` for sample inputs the local mode can demonstrate on.
- `scripts/` for anything executable.

Point at each one from the body with its relative path and a sentence on when
to read it. Up to 20 files, each under 100 KB, 500 KB in total.
