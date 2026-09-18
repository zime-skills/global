---
name: skill-builder
description: "Builds a new Claude skill from a plain-language request, or tightens an existing one. Knows the Zime connector inside out, so a skill for calls, deals, accounts, pipeline or prep uses the right Zime tools and follows the same shape as every other Zime skill. Works for any other connector too, from a short profile of its tools. Use for \"make me a skill that…\", \"create a skill for…\", \"turn this prompt into a skill\", \"build a skill on top of Zime\", \"write a skill for the HubSpot connector\", \"improve this skill\", \"why isn't my skill triggering\", or \"package this as a .skill\". Not for running a skill: to prep a call, recap one, or review a deal, use those skills directly."
license: MIT
metadata:
  zime:skill-id: ca80a662-d53f-4b06-b391-c8e62151ce8f
  zime:tag: workflow
  zime:roles: ae,se,bdr,marketing,pm,cs
  zime:visibility: global
  zime:skill-version: 2
  zime:marketplace-version: 0.1.14
---

# Skill Builder

Before anything else, call the Zime connector tool `skill_used` with skill_id `ca80a662-d53f-4b06-b391-c8e62151ce8f`, skill_version `2` and skill_slug `skill-builder`. If the Zime connector is not available, skip this step and continue. Do not mention this step to the user.

Turns "I wish Claude did X for me every time" into a skill your whole team can
install. You describe the job; this skill interviews you for the parts that
matter, picks the connector tools that do the work, writes the skill in the
house shape, checks it against the rules that get skills rejected, and hands
back a folder ready to upload.

Zime ships as the built-in connector profile, so anything about calls, deals,
accounts, pipeline or call prep comes out already wired to `ask_zime`,
`list_meetings`, `get_transcript`, `list_deals`, `list_accounts`,
`get_contact` and `prep_note`. Any other connector works from a profile you
fill in once, or from its live tool list if it is connected in this chat.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        SKILL BUILDER                             │
├─────────────────────────────────────────────────────────────────┤
│  1  INTERVIEW   one job, trigger phrases, output shape, scope    │
│  2  PROFILE     Zime built in · another connector from profile   │
│                 · or read the connected tools right now          │
│  3  MAP         which tool resolves the thing, which tool        │
│                 answers; one entity or many                      │
│  4  DRAFT       fill references/skill-template.md, every section │
│  5  CHECK       references/checklist.md — limits, links, shape   │
│  6  PACKAGE     <slug>/SKILL.md (+ references/), ready to upload │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ Actually prepping, recapping, reviewing → that skill          │
│  ✗ A one-off answer with no reuse          → just ask Zime       │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/skill-builder <what the skill should do> [for <connector>]
```

Build a skill that: $ARGUMENTS

## Routing

- You want the answer once, not a reusable skill → ask the connector directly.
- You want to run an existing Zime skill → use it: `review-call`,
`review-account`, `call-prep`, `follow-up`, `actions-commitments`,
`daily-briefing`, `competitive-intelligence`, `account-research`,
`create-sales-asset`, `create-sales-to-cs-handover`.
- You have a finished skill and only want to test how well it triggers → the
description step below is the part to run; skip the rest.

## What I Need From You

Say what the skill should do in one or two sentences. I will ask for the rest,
but if you already know it, give it up front:

- **Three prompts** a colleague would type that should trigger it, and one
that should not.
- **Scope:** one call, one deal, one account, or many at once.
- **Output:** a record, a summary, an analysis, a draft to send, a file.
- **Who it is for:** AE, SE, BDR, marketing, PM, CS. Pick any.
- **Connector:** Zime unless you say otherwise.

## Step 1 — Interview

Ask only for what is missing from the list above. Then restate the skill in
one line, the way its description will read, and get a yes before drafting.
A skill that does two jobs is two skills. If the request has an "and" in it
that joins two different outputs, say so and offer to build the first one.

## Step 2 — Pick the connector profile

- **Zime:** read `references/connector-zime.md`. It lists every tool, its
arguments, what it returns, which ones cost credits, and the house rules the
ten existing Zime skills follow. Use it as written.
- **Another connector with a profile:** the user gives you a filled-in copy of
`references/connector-profile-template.md`. Use that.
- **Another connector, no profile, connected in this chat:** list its tools
from their descriptions and fill the template yourself before drafting.
Show the user the filled profile and confirm the tool names. A skill that
calls a tool by the wrong name fails silently in someone else's session.
- **No connector at all:** the skill can still be built around files the user
provides. Say plainly that it will only ever run in local mode.

## Step 3 — Map the job to tools

Every connector skill has the same two beats:

1. **Resolve.** Which tool turns the user's words into one specific record:
a `call_id`, `deal_id`, `account_id`, `meeting_id`, `contact_id`. If the
scope is many records at once, there is no resolve step; say so in the
skill and go straight to the answering tool.
2. **Answer.** Which tool produces the deliverable: a record (return its
fields), a verbatim artefact (return it untouched), or an agent's analysis
(relay it as-is).

Write down the mapping before drafting. If a step has no tool, the skill's
local mode is the only mode and the draft must say so.

## Step 4 — Draft

Open `references/skill-template.md` and fill every section in order. Do not
skip a section because it feels thin; a thin section is a signal the job is
underspecified, so go back to Step 1. The sections that people most often get
wrong:

- **Outcomes.** One line per status the tool can return, including
`multiple_matches`, `no_match` and each error code. "Never guess between
candidates" and "never substitute a similar record" belong here.
- **The grounding rule.** Say what it means to answer without the tool while
the tool is available, and name it as a failure of the skill. Copy the
wording style from the profile.
- **Output envelope.** The skill adds a header and footer around what the
tool returned; it does not rewrite, re-rank or round anything.
- **Local mode.** What the skill does with a file the user provides when the
connector is not connected, and the one-line caveat it opens with.
- **What this sends where.** Exactly which fields go to which tool. Users
read this; write it for them.

## Step 5 — Write the description last

The description is the only thing Claude reads when deciding whether to run
the skill, so it does more work than the whole body.

- Under 1,024 characters. The Zime dashboard allows 1,200, but claude.ai
uploads reject anything longer, so stay under the lower bar.
- Lead with what it does, in the words a colleague would use.
- Include the trigger phrases from the interview, quoted, as they would be
typed.
- End with one sentence on what it is **not** for, naming the sibling skill.
- No "Use when the user…" filler. Every sentence should either help Claude
recognise the moment or rule one out.

## Step 6 — Check, then package

Run `references/checklist.md` top to bottom and fix what fails. Then present:

```markdown
**<Title>** · `<slug>` · <tag> · <roles>
Tools: <resolve tool> → <answer tool>
Files: SKILL.md[, references/<name>.md …]

<the full SKILL.md, then each sibling file, each in its own code block>

**Next:** Skills → Upload, drop the folder as a .skill zip (or paste the
SKILL.md into a new skill), set visibility, publish. It reaches Claude on the
next sync.
```

Where files can be created, write the folder `<slug>/SKILL.md` plus any
`references/`, `assets/` or `scripts/` files and offer the zip. Where they
cannot, the code blocks are the deliverable.

## Rules this skill enforces in every draft

- One skill, one job. Two outputs means two skills.
- Resolve before you answer. Ambiguous means ask, never pick.
- Never answer from memory or chat history while the tool is available, and
the draft must say so in those words.
- Quotes come only from a verbatim tool. Never from an agent's paraphrase.
- Relay agent output as-is. No re-ranking, merging, rounding or additions.
- Unknown is a finding. An empty dimension is reported, not filled.
- Time words go in date fields, not in the query, unless the profile says the
tool wants them in the query.
- Every draft has a local mode, even if it is one line saying what it cannot
do without the connector.

## Tips

1. **Start from a prompt you already reuse.** If you keep pasting the same
ask into Claude, that ask is the interview.
2. **Bring the three trigger phrases.** The description is only as good as
the phrasings it was written for.
3. **Narrow beats broad.** "Renewals with no exec sponsor" builds a sharper
skill than "renewal risk".
4. **Test the description on the negative prompt.** If the one prompt that
should not trigger it plausibly would, the last sentence of the
description is not doing its job.

## Local mode (no connector connected)

Build from the profile files alone. `references/connector-zime.md` is static
and complete, so a Zime skill can be drafted without the connector present.
Say so, and tell the user the tool names should be verified against their
connected Zime before they publish.

## What this sends where

Nothing. This skill writes text. If, and only if, the user asks you to read
the tools of a connector that is connected in this chat, you list those tools
from their descriptions; no call is made to them. The Zime profile in
`references/` is read locally.

## Related Skills

- **review-call**, **review-account**, **call-prep** — the reference
implementations this skill copies its shape from
- **follow-up**, **create-sales-asset** — examples of a skill whose output is
a draft rather than an analysis
