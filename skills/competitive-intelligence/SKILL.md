---
name: competitive-intelligence
description: "Shows what customers actually say about competitors. Where they come up, what they claim, and how we compare. Only uses real quotes from real calls."
license: MIT
metadata:
  zime:skill-id: 97b63479-93dc-4cf2-9ee1-754a216267b4
  zime:tag: intelligence
  zime:roles: ae,se
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.10
---

# Competitive Intelligence

Answers "what are customers actually saying about Competitor X?" from the
workspace's own calls. The value is that it's evidence from real
conversations, not what the internet says about a competitor — and the two are
often very different.

## The line this skill holds

General market knowledge about a competitor is the failure mode. What their
website claims, their published pricing, their reputation — none of that is
what this skill returns. If the corpus has nothing on a competitor, the answer
is "nothing in our calls mentions them", not a summary from training data.
That distinction is the whole point: a rep can act on "three customers raised
their SSO gap last quarter" and cannot act on "they're generally seen as
cheaper."

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPETITIVE INTELLIGENCE                        │
├─────────────────────────────────────────────────────────────────┤
│  SCOPE FIRST (this skill decides which)                          │
│  ✓ "on the Acme call"    → list_meetings, then name the call in the │
│                             ask_zime question                │
│  ✓ "across our deals"    → ask_zime directly (no resolve needed)  │
├─────────────────────────────────────────────────────────────────┤
│  DELEGATE (Zime agent)                                           │
│  + Agent reads real calls, mentions, and extracted signals       │
│  + Returns evidence with accounts and dates attached             │
├─────────────────────────────────────────────────────────────────┤
│  NEVER                                                           │
│  ✗ Competitor facts from general knowledge                       │
│  ✗ A "typical" objection nobody actually raised                  │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Scan a transcript file the user provides                      │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/competitive-intelligence <competitor> [+ scope] [+ when]
```

Competitive intel on: $ARGUMENTS

## Routing

- Objections on ONE deal, competitor or not → `deal-strategy`.
- A recap of one call that happened to mention a competitor → `call-recap`.
- Turning competitive evidence into a battlecard or talking points →
  `create-sales-asset`.
- Win/loss rates and pipeline totals → `pipeline-review`.

## What I Need From You

The competitor name. Scope and window help: "on the Acme call" is a different
question from "across our deals this quarter", and this skill routes them
differently.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `ask_zime` (all scopes). For single-call scope also
`list_meetings` first, to name the exact call in the question.

> `ask_zime` routes to Zime's global agent across the whole accessible
> corpus, with no separate scoping argument — narrow it by naming the call,
> account, or window inside the question text. Answering from general
> knowledge about the competitor while it's available is a failure of this
> skill.

### Choosing the scope

| Request shape | Path |
|---|---|
| "did Competitor X come up on the Acme call" | `list_meetings` to confirm the call, then name it in the question |
| "where is Competitor X showing up" | `ask_zime` directly |
| "how do we position against them in deals we won" | `ask_zime` directly |
| "what did they say about them last quarter" | `ask_zime` with the window in the question |

Don't narrow to one call when the question is corpus-wide — that would
silently answer a much smaller question than the one asked.

### Cross-corpus

```json
{ "question": "Where has Concerto come up in our calls in the last quarter, what did customers say about them, and how did we position against them?" }
```

Send the question close to verbatim with the competitor named explicitly and
the time window stated in the text — `ask_zime` has no memory of this
conversation and no separate date parameters.

### Single call

Resolve first, so the call is named correctly:

```json
{ "query": "Acme", "start_date": "2026-08-01", "end_date": "2026-08-13", "recorded": true }
```

then name it in the question:

```json
{ "question": "On the Acme call on Aug 12, did Concerto or any competitor come up? What exactly was said, and how did we respond?" }
```

### Outcomes

- **Evidence returned** — deliver per Output below.
- **Nothing found** — say plainly that nothing in the accessible calls
  mentions this competitor, and stop. Do **not** supplement with what you know
  about them from elsewhere. A clean "no mentions" is a real answer and often
  a useful one.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say so and offer the local fallback.

## Output

Evidence-first, because a claim without an account and a date can't be used in
front of a customer.

```markdown
**Competitive intel — [competitor]** · [scope] · [window]

### Where they came up
| Account | What was said | When |
|---|---|---|
| [account] | [what the customer actually said] | [date] |

### Recurring patterns
- **[pattern]** — [accounts it appears in] — [what it means]

### How we're positioned
[the agent's read, relayed as-is]

### Gaps
- [dimension the corpus had nothing on]

_From the workspace's own calls via Zime. Not market research._
```

Rules:

- Every row needs an **account and a date**. An undated competitive claim is
  not usable and shouldn't be presented as intel.
- Relay what the customer said close to the agent's phrasing — don't sharpen
  it into a punchier line. "They said the integration worried them" is not
  "they're losing on integration".
- Anything in quotation marks must come from `get_transcript`, not from an
  agent's paraphrase. Fetch it if the rep needs a literal quote.
- Keep the Gaps section. Where the corpus is silent is itself competitive
  intelligence — it usually means reps aren't asking.
- Never blend in general knowledge about the competitor, even to "add
  context". Label the boundary explicitly.

## Tips

1. **Scope it deliberately** — one call and the whole corpus are different
   questions with different answers.
2. **Put the window in the question** for `ask_zime` — it has no date
   parameters.
3. **"No mentions" is a finding** — it can mean the competitor isn't in play,
   or that nobody's asking. Both are actionable.
4. **Need a battlecard?** Pass this evidence to `create-sales-asset`.

## Local mode (only when no zime-mcp server is connected)

If the user provides transcripts, scan those files only for competitor
mentions. Open with one line saying the scan covers just the provided files,
so this is not a corpus-wide view. Same rule: no general knowledge about the
competitor, only what the files contain.

## What this sends where

MCP mode sends the question text, with any call/account/window named inside
it (to `ask_zime`), and query words plus dates when confirming a call
first (to `list_meetings`). Local mode reads only the provided files.

## Related Skills

- **create-sales-asset** — turn this evidence into a battlecard
- **deal-strategy** — competitor dynamics on one specific deal
- **get-transcript** — the exact quotable line
