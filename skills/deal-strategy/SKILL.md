---
name: deal-strategy
description: "Digs into one deal. Shows where it stands, the risks and objections, who the stakeholders are, and what to do next. Grounded in real calls, not generic sales advice."
license: MIT
metadata:
  zime:skill-id: 806bcc33-69c8-4989-bc8b-25324195da07
  zime:tag: intelligence
  zime:roles: ae,se
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.3
---

# Deal Strategy

Turns "how do I win the Acme deal?" into a grounded read of that specific
deal. The Zime deal agent sees every call on the deal, its extracted signals
(objections, risks, buying signals, commitments), and the CRM record — so the
answer is about this deal, not deals in general.

## The line this skill holds

Generic sales advice is the failure mode here. "Multi-thread the account" and
"create urgency" are true of every deal and therefore useless about this one.
If the agent returns nothing on a dimension, this skill says the dimension is
unknown rather than filling it with best-practice filler.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEAL STRATEGY                              │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE (this skill)                                   │
│  ✓ list_deals → one deal_id                                      │
│  ✓ Ambiguous → show candidates, ask, pin                         │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — DELEGATE (Zime deal agent)                             │
│  + ask_zime, naming the deal in the question                     │
│  + Agent reads all calls on the deal + signals + CRM             │
│  + Returns the analysis; this skill does not re-reason it         │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Narrower read of a provided transcript or CRM export          │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/deal-strategy <deal or account name>
```

Work through the deal: $ARGUMENTS

## Routing

- Just the deal's fields (stage, amount, close date) → `get-deal`.
- Open commitments and owners → `actions-commitments`.
- MANY deals, totals, what's stuck → `pipeline-review`.
- Competitor patterns across deals → `competitive-intelligence`.
- Preparing for a specific upcoming call on this deal → `call-prep`.

## What I Need From You

The deal or account name. If the user has a specific angle ("they went quiet",
"pricing is the blocker", "I need a path to close this quarter"), pass it
through — it focuses the agent's analysis.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_deals` (resolve) and `ask_zime` (analyze).

> `ask_zime` routes to Zime's agent over the whole workspace — name the
> deal in the question text since there's no separate `deal_id` argument.
> Answering from general sales knowledge while it's available is a failure of
> this skill.

### Step 1 — resolve the deal

```json
{ "query": "Acme expansion" }
```

Note: deals are **not** date-scoped by default — a deal that closed two years
ago is still a legitimate subject. Only pass dates if the user bounded it.

`multiple_matches` → show candidates with stage and amount so they're
distinguishable, ask which one, pin it. `no_match` → say the naming or access
likely explains it; never analyze a similarly-named deal.

### Step 2 — delegate the analysis

```json
{ "question": "For the Acme expansion deal: where does it actually stand? Cover the objections and risks in play, the stakeholders and who is championing us, what has moved and what has stalled, and the two or three concrete moves that would most advance it." }
```

If the user gave an angle, append it verbatim: *"The rep says they've gone
quiet since the security review — factor that in."* Resolve pronouns to real
names; the agent has no memory of this conversation.

### Outcomes

- **An analysis** — deliver per Output below.
- **Thin or empty on some dimension** — relay that honestly ("no objections
  surfaced in the calls on this deal") rather than supplying generic ones.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say plainly the deal agent couldn't be reached and offer the
  local fallback — never pass generic advice off as a grounded read.

## Output

The agent's analysis **is** the deliverable. This skill adds the envelope so
the rep can see which deal was analyzed and its hard facts:

```markdown
**Deal strategy — [deal name]** · [account]
**Stage:** [stage] · **Amount:** [amount] · **Close:** [close date] · **Owner:** [owner]

[the agent's returned analysis, relayed as-is]

_Grounded in this deal's calls and CRM record via Zime._
```

Rules:

- Relay the analysis **as-is** — don't re-rank the risks, merge the moves, or
  round the numbers. The ordering is part of the judgment.
- Keep evidence and dates where the agent attached them. "Raised on the Jun 18
  call" is what makes a risk actionable rather than an assertion.
- Don't append your own recommendations. If the agent surfaced two moves,
  deliver two — a third from general knowledge would be indistinguishable in
  presentation but not grounded.
- Where a dimension came back empty, state it as unknown. Unknown is
  information: it often means nobody asked on the calls.

## Tips

1. **Give the angle you care about** — "they've gone quiet" produces a sharper
   read than an open-ended ask.
2. **Deals aren't time-bounded** — don't add a date range unless you mean it;
   it can hide the deal entirely.
3. **Unknown is a finding** — no objections surfaced often means discovery was
   thin, not that the deal is clean.
4. **One deal at a time** — for cross-deal patterns use `pipeline-review` or
   `competitive-intelligence`.

## Local mode (only when no zime-mcp server is connected)

If the user provides a transcript or CRM export, give a narrower read of those
files only, with every claim traced to a line or field in them. Open with one
line saying the read covers only the provided files, so signals from other
calls on this deal are missing by construction. Mark gaps as gaps rather than
filling them with standard playbook advice.

## What this sends where

MCP mode sends the query words (to `list_deals`), then the analysis question
naming the deal (to `ask_zime`). Local mode reads only the provided files.

## Related Skills

- **get-deal** — the deal's raw fields
- **actions-commitments** — what's still open on it
- **create-sales-asset** — build collateral from this deal's evidence
- **pipeline-review** — the same lens across many deals
