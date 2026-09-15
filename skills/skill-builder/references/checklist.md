# Checklist

Run top to bottom before packaging. Each line is something that gets a skill
rejected at upload, ignored by Claude, or wrong in someone else's session.

## Identity

- [ ] `name` is lowercase letters, digits and hyphens, at most 64 characters,
      and matches the folder name exactly.
- [ ] Title is not already taken in the Skill Library. Check the catalogue;
      global titles are unique across every workspace.
- [ ] Exactly one `zime:tag`: workflow, research, communication,
      intelligence or execution.
- [ ] One to six `zime:roles` from ae, se, bdr, marketing, pm, cs.

## Description

- [ ] Under 1,024 characters. Count it.
- [ ] Opens with what the skill does, in a colleague's words.
- [ ] Contains the trigger phrases from the interview, quoted.
- [ ] Ends with what it is not for, naming the sibling skill.
- [ ] The negative test prompt would not plausibly trigger it.

## Body

- [ ] Every template section is present, in order, with the same headings.
- [ ] Under 100,000 characters.
- [ ] Every tool named exists in the connector profile, spelled exactly.
- [ ] Every status the resolve tool can return has a line under Outcomes,
      including `multiple_matches`, `no_match` and each error code.
- [ ] The grounding rule is stated: answering without the tool while it is
      available is a failure of the skill.
- [ ] Output says "relay as-is" and lists what must not be re-ranked,
      rounded, merged or added.
- [ ] Local mode names the file types and the caveat line.
- [ ] "What this sends where" names the exact fields and tools.
- [ ] Every slug under Routing and Related Skills exists in the catalogue.
- [ ] One job. No "and" joining two different outputs.

## Files

- [ ] Sibling files only under `references/`, `assets/` or `scripts/`.
- [ ] At most 20 files, each under 100 KB, under 500 KB in total.
- [ ] No file named `SKILL.md` among the siblings; it is rendered from the
      body.
- [ ] Each sibling is pointed at from the body by relative path.

## Content that fails the scan

Skills are scanned on save. Any of these rejects the version:

- [ ] No link to a host other than `zime.ai` and its subdomains,
      `docs.anthropic.com` or `support.anthropic.com`. A skill can instruct
      Claude to send data to any URL it names, so everything else is blocked.
- [ ] No credential-shaped strings: cloud access keys, tokens, private key
      blocks, or `password = "…"` style assignments, even as examples.
- [ ] No instruction-override phrasing, even when describing what not to do.
      Write "answering from memory is a failure of this skill", not the
      override phrase itself.
- [ ] No shell one-liners that pipe a download into a shell, and no paths to
      system credential files.
- [ ] No zero-width or bidirectional-override characters. Paste from plain
      text, not from a rich editor.

## Before you hand it over

- [ ] Read the whole SKILL.md once as the colleague who will run it. Every
      "you" is them, not the author.
- [ ] The three trigger prompts each map to the Usage line without
      rewording.
