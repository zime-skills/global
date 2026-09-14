---
name: get-deal
description: "Looks up one deal's CRM record. Shows stage, amount, owner, and close date."
license: MIT
metadata:
  zime:skill-id: 96cea89f-3c27-4a45-9118-79e226ee5a1e
  zime:tag: research
  zime:roles: ae
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.9
---

# Get Deal

Answers "what stage is the Acme expansion in?" with the one CRM record for
that deal — nothing synthesized, nothing inferred. This is a lookup, not an
analysis.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                          GET DEAL                                │
├─────────────────────────────────────────────────────────────────┤
│  RESOLVE (this skill's whole job)                                │
│  ✓ Name or fragment → one deal_id                                │
│  ✓ Ambiguous → show candidates, ask, re-call pinned              │
│  ✓ Return the record's fields verbatim                           │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ Why the deal is at risk        → deal-strategy                │
│  ✗ Many deals / totals / at-risk  → pipeline-review              │
│  ✗ Open commitments on the deal   → actions-commitments          │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Look the row up in a CRM export the user provides             │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/get-deal <deal or account name>
```

Look up the deal: $ARGUMENTS

## Routing

- Objections, risk, or "how do I win this" for this deal → `deal-strategy`.
- Next steps / open commitments on this deal → `actions-commitments`.
- Questions about MANY deals (filters, totals, "what's stuck", "deals at
  risk") → `pipeline-review`. This skill resolves exactly one deal and will
  not answer those.
- The account behind this deal → the returned record already names it; for
  the account's own record use `get-account`.

## What I Need From You

Just the deal or account name. If several deals match, I'll show you the
candidates and ask which one — I will not pick for you.

If you already have a `deal_id` from an earlier turn, say so and I'll pin it
directly.

## MCP mode (required when zime-mcp is connected)

**Required tool:** `list_deals` (fully qualified `Zime:list_deals`; some
clients surface it as `mcp__claude_ai_Zime__list_deals`).

Answering from memory or chat context while the tool is available is a
failure of this skill — the tool reads the live CRM record, and a remembered
stage or amount can be stale or wrong.

### Arguments

- `query` — deal or account name, e.g. "Acme expansion". Omit if you already
  have `deal_id`.
- `deal_id` — pin an exact deal, from a prior `multiple_matches` response or
  already known this conversation. Never invent one.
- `account_name` — narrow when the deal name alone is ambiguous.
- `start_date` / `end_date` — YYYY-MM-DD, inclusive. Convert time hints here
  and keep time words out of `query`.

**Example** — "what stage is the Acme expansion in?":

```json
{ "query": "Acme expansion" }
```

### Outcomes

- `{"status": "resolved", "data": {...}}` — the deal record. Deliver per
  Output below.
- `{"status": "multiple_matches", "candidates": [...]}` — show the
  candidates, ask which one, re-call with the chosen `deal_id`. Never guess
  among them. If the user says "the most recent one", take the first.
- `{"status": "no_match", "candidates": [...]}` — nothing matched
  confidently. This does **not** mean the deal doesn't exist: it may be
  named differently in CRM, outside the date window, or not visible to this
  user. Say that, show any near-miss candidates, and never substitute a
  similarly-named deal. Do not tell the user the deal doesn't exist.
- An error — `isError: true` with `{"error": "<CODE>"}`. `INTERNAL_ERROR` is
  usually transient: retry once. `UNAUTHORIZED` / `FORBIDDEN` means the Zime
  connection needs re-authorizing or lacks access. `INVALID_ARGUMENT` means
  malformed arguments — fix and re-call. If it still fails, say plainly the
  lookup service couldn't be reached and offer the local fallback.

## Output

A compact record — no prose analysis, no inferred fields.

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

Rules:

- Relay fields exactly as returned. Don't add, infer, or round anything the
  record doesn't state.
- A field the record doesn't carry (e.g. no close date set) is shown as
  absent — never filled with a plausible guess.
- Keep the `Deal ID` line: it's what later skills pin to.

## Tips

1. **Name the account if the deal name is generic** — "the renewal" matches
   many; "the Acme renewal" resolves.
2. **Put dates in the date fields, not the name** — "the Acme deal closing
   this quarter" works better as `query: "Acme"` plus a date range.
3. **Reuse the Deal ID** — once resolved, later skills can skip the lookup.

## Local mode (only when no zime-mcp server is connected)

If the user provides a CRM export (`.csv`), look up the row there and say
the answer is limited to that file, not the live CRM. No file and no
connection → say so rather than guessing at stage, amount, or close date.

## What this sends where

MCP mode sends only the query words, dates, account name, and (when pinning)
a `deal_id` to the zime-mcp server. Local mode reads only the file the user
provided.

## Related Skills

- **deal-strategy** — why this deal is at risk and what to do about it
- **pipeline-review** — many deals, totals, and what's stuck
- **get-account** — the account record behind this deal
