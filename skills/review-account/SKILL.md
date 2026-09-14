---
name: review-account
description: "Everything about the commercial side: one account, one deal, or the whole pipeline, as a CRM record or as a grounded analysis. Use for \"pull up the Acme account\", \"what stage is the Acme expansion\", \"who owns this deal\", \"how do I win the Acme deal\", \"why is this deal at risk\", \"what's at risk this quarter\", \"what's stalled\", \"review Priya's pipeline\", or \"what should I focus on this week\". Works out scope (account, deal, or portfolio) and depth (facts or judgment) from the question itself. Grounded in the live CRM and the calls behind it, never generic sales advice, and reports a dimension as unknown rather than filling it with best practice. For a company not yet in CRM, use account-research instead."
license: MIT
metadata:
  zime:skill-id: 8b888fca-2a7d-442c-988d-fdb64dce6155
  zime:tag: intelligence
  zime:roles: ae,se,cs,pm
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.10
---

# Review Account

Everything about the commercial side: one account, one deal, or the whole
pipeline, as a record or as a grounded analysis. Two questions decide the
route, and this skill answers both from the question itself rather than making
the user pick a tool.

## The two questions

**Scope** — how many things is this about?


| Signal                                                           | Scope     |
| ---------------------------------------------------------------- | --------- |
| One company named, asked about the company itself                | Account   |
| One deal or opportunity named                                    | Deal      |
| No entity named, or a filter like a rep, segment, stage, quarter | Portfolio |


**Depth** — facts, or judgment?


| Signal                                                  | Depth    |
| ------------------------------------------------------- | -------- |
| stage, amount, owner, close date, domain, industry      | Record   |
| why, risk, what should I do, what's stuck, how do I win | Analysis |


Portfolio scope is always Analysis: there is no single record to return.

## The line this skill holds

Generic sales advice is the failure mode on every Analysis route.
"Multi-thread the account" and "create urgency" are true of every deal and
therefore useless about this one. If the agent returns nothing on a dimension,
say the dimension is unknown rather than filling it with best-practice filler.
Unknown is information: no objections surfaced often means discovery was thin,
not that the deal is clean.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       REVIEW ACCOUNT                             │
├─────────────────────────────────────────────────────────────────┤
│  PORTFOLIO  (many deals — no entity named)                       │
│  ✗ Do NOT resolve one deal first; that answers a smaller         │
│    question than the one asked                                   │
│  + ask_zime, with window/segment/rep stated in the question      │
├─────────────────────────────────────────────────────────────────┤
│  DEAL  (one opportunity named)                                   │
│  ✓ list_deals → one deal_id                                      │
│  ▸ Record   → stop, return the fields                            │
│  ▸ Analysis → ask_zime, naming the deal in the question          │
├─────────────────────────────────────────────────────────────────┤
│  ACCOUNT  (one company named, in CRM)                            │
│  ✓ list_accounts → one account_id                                │
│  ▸ Record   → stop, return the fields                            │
│  ▸ Analysis → ask_zime, naming the account                       │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ Company NOT in CRM yet        → account-research              │
│  ✗ Open commitments and owners   → actions-commitments           │
│  ✗ Competitor patterns           → competitive-intelligence      │
│  ✗ Today's schedule              → daily-briefing                │
│  ✗ One call's recap or words     → review-call                   │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Analyze a CRM export the user provides                        │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/review-account <account, deal, segment, rep, or window> [+ your angle]
```

Review: $ARGUMENTS

## Routing

- A **prospect** not yet in CRM, ICP fit, outside company intel →
`account-research`. That skill web-searches; this one reads CRM and calls.
- Open commitments and who owes what → `actions-commitments`.
- Competitor patterns across deals → `competitive-intelligence`.
- Today's schedule and immediate priorities → `daily-briefing`.
- One call's recap, record, or exact words → `review-call`.
- Preparing for a specific upcoming call → `call-prep`.

## What I Need From You

Nothing required for a portfolio review. For one deal or account, the name.
Scope narrows a portfolio review usefully: a rep, a segment, a close-date
window, or a stage.

If the user has an angle ("they went quiet", "pricing is the blocker", "I only
care about what can close this month"), pass it through verbatim. It focuses
the agent's analysis and changes what it prioritizes.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_accounts`, `list_deals`, `ask_zime`.

Computing pipeline totals, risk calls, or "what's stuck" from memory or from
deals mentioned earlier in the chat is a failure of this skill. Those numbers
have to come from the live CRM, and a remembered figure in a pipeline review
gets repeated in a forecast. A remembered stage or amount can be stale or
wrong.

### Portfolio — `ask_zime` only

`ask_zime` takes a single `question`. It has no memory of this conversation and
no separate filter or date parameters, so **everything belongs in the question
text**: the window, the segment, the rep, the stage.

```json
{ "question": "Which deals in the current quarter are most at risk, and why? Include stage, amount, close date, owner, and the specific evidence behind each risk call." }
```

Scoped to a rep and a lens:

```json
{ "question": "Review Priya's pipeline for deals closing this month: which are most likely to close, which are stalled, and what is the single next action on each?" }
```

Ask for the evidence explicitly. A risk call without a reason is not
reviewable, and the agent will supply the reasoning if the question asks for
it.

> This is the broadest question any skill asks, so it is the slowest. If it
> takes a while, that's the agent reading across many deals rather than a
> failure.

### Deal — `list_deals`, then optionally `ask_zime`

Arguments for `list_deals`:

- `query` — deal or account name, e.g. "Acme expansion". Omit if you already
have `deal_id`.
- `deal_id` — pin an exact deal from a prior `multiple_matches` response or
already known this conversation. Never invent one.
- `account_name` — narrow when the deal name alone is ambiguous.
- `start_date` / `end_date` — YYYY-MM-DD. Deals are **not** date-scoped by
default, and a deal that closed two years ago is still a legitimate subject.
Only pass dates if the user bounded it; a stray range can hide the deal
entirely.

For Analysis, follow with `ask_zime`, naming the deal in the question text
since there is no `deal_id` argument:

```json
{ "question": "For the Acme expansion deal: where does it actually stand? Cover the objections and risks in play, the stakeholders and who is championing us, what has moved and what has stalled, and the two or three concrete moves that would most advance it." }
```

If the user gave an angle, append it verbatim: *"The rep says they've gone
quiet since the security review, factor that in."* Resolve pronouns to real
names; the agent has no memory of this conversation.

### Account — `list_accounts`, then optionally `ask_zime`

Arguments for `list_accounts`:

- `query` — account or company name, e.g. "Acme". Omit if you already have
`account_id`.
- `account_id` — pin an exact account. Never invent one.
- `domain` — narrow when the name alone is ambiguous. A domain resolves more
precisely than a name.

### Outcomes, for every resolve step

- `{"status": "resolved", "data": {...}}` — deliver per Output, or continue to
`ask_zime` if the depth is Analysis.
- `{"status": "multiple_matches", "candidates": [...]}` — show candidates with
enough detail to tell them apart (stage and amount for deals, domain for
accounts), ask which one, re-call pinned. Never guess. "The most recent one"
→ take the first.
- `{"status": "no_match", "candidates": [...]}` — nothing matched confidently.
This does **not** mean it doesn't exist: it may be named differently in CRM,
outside the date window, or not visible to this user. Say that, show
near-misses, and consider whether the user meant a prospect (→
`account-research`). Never substitute a similarly-named account or deal, and
never tell the user the deal doesn't exist.
- An error — `{"error": "<CODE>"}`. `INTERNAL_ERROR` is usually transient,
retry once. `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of
access. `INVALID_ARGUMENT` means malformed arguments, fix and re-call. If it
fails twice, say plainly the service couldn't be reached and offer the local
fallback. Never pass generic advice off as a grounded read, and never
substitute remembered numbers.

## Output

### Account record

```markdown
**[Account name]**

| Field | Value |
|---|---|
| Domain | [domain] |
| Industry | [industry] |
| Account type | [type] |
| Owner | [owner name / email] |
| Account ID | `[crm_id]` |

_Live CRM record via Zime._
```

### Deal record

```markdown
**[Deal name]** · [Account name]

| Field | Value |
|---|---|
| Stage | [stage] |
| Amount | [amount] |
| Owner | [owner name / email] |
| Close date | [date] |
| Pipeline | [pipeline] |
| Deal ID | `[crm_deal_id]` |

_Live CRM record via Zime._
```

For both records: relay fields exactly as returned, with no inference and no
rounding. A field the record doesn't carry is shown as absent, never filled
with a plausible guess. Keep the ID line; later skills pin to it.

### Analysis, any scope

The agent's analysis **is** the deliverable. This skill adds the envelope so
the reader knows what was analyzed and, for a deal, its hard facts:

```markdown
**Deal strategy — [deal name]** · [account]
**Stage:** [stage] · **Amount:** [amount] · **Close:** [close date] · **Owner:** [owner]

[the agent's returned analysis, relayed as-is]

_Grounded in this deal's calls and CRM record via Zime._
```

For a portfolio review, name the scope instead, so the numbers are never read
against the wrong window:

```markdown
**Pipeline review** · [window] · [segment or rep, if scoped]

[the agent's returned analysis, relayed as-is]

_Live CRM and call data via Zime._
```

Rules:

- Relay the analysis **as-is**. Don't re-rank the risks or deals, re-bucket
them, merge the moves, or recompute a total to "check" it. A number you
derive and a number the agent returned look identical on the page but are not
equally grounded. The ordering is part of the judgment.
- Keep amounts, stages, close dates and owners exactly as returned. Don't round
$47,300 to $47K.
- Keep evidence and dates where the agent attached them. "Raised on the Jun 18
call" and "stalled, no customer reply since Jul 2" are what make a risk
actionable rather than an assertion.
- Don't append your own recommendations. If the agent surfaced two moves,
deliver two; a third from general knowledge would be indistinguishable in
presentation but not grounded.
- Don't add deals from memory or from earlier in the chat, even if they seem
obviously relevant. The agent's scope is the scope.
- Where a dimension came back empty, state it as unknown.
- If the user asked for a specific window and the answer doesn't state one, say
the window is unconfirmed rather than assuming it matched.

### Render an analysis as a visual artifact

Present a finished analysis as a self-contained HTML artifact rather than plain
markdown, so it is scannable at a glance:

- **Card-style sections** for each block, not one long wall of text.
- **Badges** for short labelled values (stage, status, owner, dates).
- **Light colour accents on status and risk fields only** — red for
at-risk/blocked/overdue, amber for needs-attention, green for
on-track/confirmed. Colour carries meaning here, so never colour a field with
no status semantics, and always keep the word as well as the colour: colour
alone is unreadable for anyone who can't distinguish it.
- **Keep prose in the chat response, not in the artifact.** Caveats, what you
did, and what to do next belong in the surrounding message. The artifact
holds the structured result.
- Every grounding rule above still applies. An artifact makes gaps *less*
visible, so a missing value stays visible as "not stated" rather than being
quietly dropped to keep a card tidy.

A plain record needs no artifact; the table is already the answer. Fall back to
markdown when artifacts aren't available, for example Claude Code in a
terminal. Say which you did only if the user asked for a specific format.

## Tips

1. **Domain beats name** for accounts — "acme.com" resolves more precisely
 than "Acme".
2. **Name the account if the deal name is generic** — "the renewal" matches
 many; "the Acme renewal" resolves.
3. **State the window** on a portfolio review; there are no date parameters, so
 "this quarter" belongs in the question.
4. **Ask for the why**, or you get labels without reasons.
5. **Give your angle** — "they've gone quiet" or "only what can close this
 month" produces a sharper read than an open-ended ask.
6. **CRM vs prospect** — researching someone you've never sold to is
 `account-research`, not this.
7. **Expect portfolio reviews to be slower** than single-entity questions;
 they read far more.

## Local mode (only when no zime-mcp server is connected)

If the user provides a CRM export (`.csv`), work from that file and open with
one line saying the answer is limited to it, so call activity, stage movement
and anything not in the export are missing by construction. For a portfolio
review, flag stalled deals, past-due close dates, missing next steps and
single-threaded deals, ranked by amount and close date. Don't infer engagement
from a CSV that has no activity columns. For one deal or account, trace every
claim to a line or field in the file. Mark gaps as gaps rather than filling
them with standard playbook advice. No file and no connection → say so rather
than guessing at stage, amount, or close date.

## What this sends where

MCP mode sends the query words, domain, dates and any pinned id to
`list_accounts` or `list_deals`, and the analysis question to `ask_zime`, which
reads the CRM and call data the workspace already holds. Local mode reads only
the file the user provided.

## Related Skills

- **account-research** — a company not yet in CRM, web research and ICP fit
- **actions-commitments** — what's still open, and who owes it
- **review-call** — one call's record, recap, or exact words
- **create-sales-asset** — build collateral from this deal's evidence
- **create-sales-to-cs-handover** — package a won account for CS
