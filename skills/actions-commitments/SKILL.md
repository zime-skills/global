---
name: actions-commitments
description: "Shows open action items and commitments. Who promised what, and by when. Works for one call, one deal, or a whole account."
license: MIT
metadata:
  zime:skill-id: 65cb2c4b-4d72-4393-81b5-7546750abae2
  zime:tag: execution
  zime:roles: ae,cs
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.9
---

# Actions & Commitments

Answers "what's still open?" with commitments that were actually made — who
owns each one and when it's due. The value here is that nothing is invented:
an unclaimed action with no owner is reported as unowned, not assigned to
whoever seems likely.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACTIONS & COMMITMENTS                         │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE SCOPE (this skill)                             │
│  ✓ One call    → list_meetings  → call_id                        │
│  ✓ One deal    → list_deals     → deal_id                        │
│  ✓ An account  → list_deals / list_meetings for that account     │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — DELEGATE (Zime agent)                                  │
│  + ask_zime, naming the call, deal, or account in the question    │
│  + Agent extracts commitments, owners, dates from real calls     │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Extract from a transcript file the user provides              │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/actions-commitments <call, deal, or account> [+ when]
```

Show open commitments for: $ARGUMENTS

## Routing

- A full recap of one call, not just its actions → `call-recap`.
- The email that chases these items → `follow-up`.
- Deal risk and strategy rather than open items → `deal-strategy`.
- Pipeline-wide status across many deals → `pipeline-review`.

## What I Need From You

The scope — a call, a deal, or an account — and a time window if you want it
bounded ("this week", "since the QBR"). If the scope is ambiguous I'll ask
rather than guessing between a call and a deal.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_meetings` and/or `list_deals` (resolve), plus
`ask_zime` (extract).

> `ask_zime` routes to Zime's global agent, with no separate id
> argument — name the call, deal, or account in the question text. Extracting
> commitments yourself from a fetched transcript while it's available is a
> failure of this skill: the agent also sees extracted signals and CRM
> linkage, and it distinguishes a firm commitment from an idea someone
> floated.

### Step 1 — resolve the scope

Pick the narrowest scope the request implies:

| Request shape | Resolve with | Then |
|---|---|---|
| "on the Acme call" | `list_meetings` (`recorded: true`) | name the call in the question |
| "on the Northwind deal" | `list_deals` | name the deal in the question |
| "what did I promise Concerto" | `list_deals` for that account | name the account in the question |

`multiple_matches` → show candidates, ask, pin the id. Never guess.
`no_match` → say the window or naming likely excludes it; offer to widen.

### Step 2 — delegate the extraction

```json
{ "question": "List every commitment and action item from the Acme call on Aug 12: what was promised, who owns it, and the due date if one was stated. Separate our commitments from the customer's." }
```

or, for a deal or account arc:

```json
{ "question": "List the open action items and commitments across the Northwind deal: what was promised, by whom, when it was promised, and whether it has been closed out." }
```

Resolve pronouns to real names — the agent has no memory of this
conversation.

### Outcomes

- **A list of commitments** — deliver per Output below.
- **Nothing open** — say that plainly. "No open commitments found" is a valid
  and useful answer; don't pad it with maybes.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say so and offer the local fallback.

## Output

Group by owner, because that's how the rep acts on it.

```markdown
**Open commitments — [scope]** · [window]

### Ours
| Commitment | Owner | Due | Source |
|---|---|---|---|
| [what was promised] | [name] | [date, or "not stated"] | [call, date] |

### Customer's
| Commitment | Owner | Due | Source |
|---|---|---|---|
| [what they promised] | [name] | [date, or "not stated"] | [call, date] |

### Unowned
| Commitment | Raised on | Note |
|---|---|---|
| [item with no clear owner] | [call, date] | needs an owner |

_Extracted from the workspace's calls via Zime._
```

Rules:

- **Never invent an owner.** If nobody claimed it, it goes under Unowned.
  Guessing an owner creates a false accountability trail.
- **Never invent a due date.** "not stated" is the correct value when no date
  was agreed — a plausible date read as real causes missed commitments.
- Keep the source (which call, what date) on every row; that's what makes an
  item checkable.
- Distinguish ours from the customer's. A rep chasing their own list is a
  different action from chasing the customer's.
- If the agent marked something already closed, either omit it or label it
  closed — don't silently re-open it.

## Tips

1. **Narrow the scope** — one call is sharper than a whole account.
2. **"not stated" is the honest answer** for a missing date; treat it as a
   prompt to go confirm.
3. **Unowned items are the real finding** — they're the ones that get dropped.
4. **Chase them with `follow-up`** once you know what's open.

## Local mode (only when no zime-mcp server is connected)

If the user provides a transcript, extract commitments from that file only,
using the same owner/date discipline. Open with one line saying the list
covers just that call, so items agreed elsewhere are missing by construction.

## What this sends where

MCP mode sends query words and dates (to `list_meetings`/`list_deals`), then
the extraction question naming the call, deal, or account (to `ask_zime`).
Local mode reads only the provided file.

## Related Skills

- **follow-up** — the email that chases these
- **call-recap** — the full picture of one call
- **create-sales-to-cs-handover** — commitments carried into the handover doc
