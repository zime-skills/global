---
name: pipeline-review
description: "Reviews your whole pipeline. Shows what's at risk, what's stalled, and what to focus on this week."
license: MIT
metadata:
  zime:skill-id: ae3aac2b-10cc-460c-b206-9484dfeb0bd9
  zime:tag: intelligence
  zime:roles: ae,pm
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.5
---

# Pipeline Review

Answers "what's at risk this quarter?" across the whole pipeline. No entity
resolution here — the scope *is* many deals, so this skill hands the question
straight to Zime's global agent, which sees the CRM records, the calls behind
them, and the movement between stages.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      PIPELINE REVIEW                             │
├─────────────────────────────────────────────────────────────────┤
│  NO RESOLVE STEP                                                 │
│  ✓ Scope is many deals — nothing to pin                          │
│  ✗ Do NOT resolve one deal first; that answers a smaller         │
│    question than the one asked                                   │
├─────────────────────────────────────────────────────────────────┤
│  DELEGATE (Zime global agent)                                    │
│  + ask_zime with the filters/window stated in the question       │
│  + Agent sees CRM records, calls, and stage movement             │
│  + Returns the analysis; this skill does not recompute it        │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Analyze a CRM export the user uploads                         │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/pipeline-review [segment, rep, or window]
```

Review the pipeline for: $ARGUMENTS

## Routing

- ONE named deal in depth → `deal-strategy`.
- One deal's raw fields → `get-deal`.
- Open commitments rather than deal health → `actions-commitments`.
- Today's schedule and immediate priorities → `daily-briefing`.
- Competitor patterns → `competitive-intelligence`.

## What I Need From You

Nothing required. Scope narrows it usefully: a rep, a segment, a close-date
window, or a stage. If the user has a lens ("I only care about what can close
this month"), pass it through — it changes what the agent prioritizes.

## MCP mode (required when zime-mcp is connected)

**Required tool:** `ask_zime` (fully qualified `Zime:ask_zime`).

Computing pipeline totals, risk calls, or "what's stuck" from memory or from
deals mentioned earlier in the chat is a failure of this skill — those numbers
have to come from the live CRM, and a remembered figure in a pipeline review
gets repeated in a forecast.

### Arguments

`ask_zime` takes a single `question`. It has no memory of this conversation
and no separate filter or date parameters, so **everything belongs in the
question text**: the window, the segment, the rep, the stage.

**Example** — "what's at risk this quarter?":

```json
{ "question": "Which deals in the current quarter are most at risk, and why? Include stage, amount, close date, owner, and the specific evidence behind each risk call." }
```

**Example** — scoped to a rep and a lens:

```json
{ "question": "Review Priya's pipeline for deals closing this month: which are most likely to close, which are stalled, and what is the single next action on each?" }
```

Ask for the evidence explicitly. A risk call without a reason is not
reviewable, and the agent will supply the reasoning if the question asks
for it.

### Outcomes

- **An analysis** — deliver per Output below.
- **Thin on a dimension** — relay it honestly. "No stalled deals in this
  window" is a real answer.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say plainly the pipeline service couldn't be reached and offer
  the local fallback — never substitute remembered numbers.

> This is the broadest question any skill asks, so it is the slowest. If it
> takes a while, that's the agent reading across many deals rather than a
> failure.

## Output

The agent's analysis **is** the deliverable. This skill adds the envelope
naming the scope, so the numbers are never read against the wrong window:

```markdown
**Pipeline review** · [window] · [segment or rep, if scoped]

[the agent's returned analysis, relayed as-is]

_Live CRM and call data via Zime._
```

Rules:

- Relay the analysis **as-is**. Don't re-rank the deals, re-bucket them, or
  recompute a total to "check" it — a number you derive and a number the agent
  returned look identical on the page but aren't equally grounded.
- Keep amounts, stages, close dates, and owners exactly as returned. Don't
  round $47,300 to $47K.
- Keep the evidence attached to each risk call. "Stalled — no customer reply
  since Jul 2" is actionable; "at risk" alone is not.
- Don't add deals from memory or from earlier in the chat, even if they seem
  obviously relevant. The agent's scope is the scope.
- If the user asked for a specific window and the answer doesn't state one,
  say the window is unconfirmed rather than assuming it matched.


### Render it as a visual artifact

Present the finished output as a self-contained HTML artifact rather than
plain markdown in the chat, so it's scannable at a glance:

- **Card-style sections** for each block above, not one long wall of text.
- **Badges** for short labelled values (stage, status, owner, dates).
- **Light colour accents on status and risk fields only** — red for
  at-risk/blocked/overdue, amber for needs-attention, green for
  on-track/confirmed. Colour carries meaning here, so never colour a field
  that has no status semantics, and always keep the word as well as the
  colour: colour alone is unreadable for anyone who can't distinguish it.
- **Keep prose in the chat response, not in the artifact.** Caveats, what
  you did, and what to do next belong in the surrounding message. The
  artifact holds the structured result.
- Every grounding rule above still applies. An artifact makes gaps *less*
  visible, so a missing value stays visible as "not stated" rather than
  being quietly dropped to keep a card tidy.

Fall back to the markdown above when artifacts aren't available in the
current environment (for example Claude Code in a terminal). Say which you
did only if the user asked for a specific format.

## Tips

1. **State the window** — "this quarter" belongs in the question; there are no
   date parameters.
2. **Ask for the why** — request evidence per risk call, or you get labels
   without reasons.
3. **Give your lens** — "only what can close this month" reprioritizes the
   whole review.
4. **Expect it to be slower** than the single-entity skills; it's reading far
   more.

## Local mode (only when no zime-mcp server is connected)

If the user uploads a CRM export (`.csv`), analyze that file: flag stalled
deals, past-due close dates, missing next steps, and single-threaded deals;
rank by amount and close date. Open with one line saying the review covers
only the uploaded file — so call activity, stage movement, and anything not in
the export are missing by construction. Don't infer engagement from a CSV that
has no activity columns.

## What this sends where

MCP mode sends only the question text to the zime-mcp server, which reads the
CRM and call data the workspace already holds. Local mode reads only the file
the user uploaded.

## Related Skills

- **deal-strategy** — one deal, in depth
- **daily-briefing** — today's version of "what should I do"
- **actions-commitments** — what's promised across the pipeline
