---
name: daily-briefing
description: "Gives you your day at a glance. Today's meetings, what changed on your deals, and what needs attention now."
license: MIT
metadata:
  zime:skill-id: aa4d7a1f-2f3c-4c5d-be5f-6d7cec6f6816
  zime:tag: workflow
  zime:roles: ae,bdr
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.11
---

# Daily Briefing

Answers "what do I need to know this morning?" — the day's meetings, what
moved on the deals, and what's about to slip. Optimized for speed: this is the
skill a rep runs before their first call, so it uses Zime's instant agent
rather than the deep one.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      DAILY BRIEFING                              │
├─────────────────────────────────────────────────────────────────┤
│  NO ENTITY RESOLVE                                               │
│  ✓ Scope is the rep's whole day — nothing to pin                 │
├─────────────────────────────────────────────────────────────────┤
│  OPTIONAL — CONCRETE SCHEDULE                                    │
│  ✓ list_meetings for today's actual meetings, with times         │
├─────────────────────────────────────────────────────────────────┤
│  DELEGATE (Zime instant agent)                                   │
│  + ask_zime for what changed and what needs attention            │
│  + Fast tier by design — this runs before the first call         │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Read a calendar or CRM export the user provides               │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/daily-briefing [today | this week | date]
```

Brief me for: $ARGUMENTS

## Routing

- Prep for ONE specific upcoming call → `call-prep`. This skill lists the
  day; that one prepares you for a meeting.
- Full pipeline health across many deals → `pipeline-review`.
- One deal in depth → `deal-strategy`.
- Everything outstanding regardless of today → `actions-commitments`.

## What I Need From You

Nothing. Default to today. Accept "this week" or a specific date if given.

## MCP mode (required when zime-mcp is connected)

**Required tool:** `ask_zime`. **Recommended:** `list_meetings` for the
schedule.

Assembling the briefing from memory or from deals mentioned earlier in the
chat is a failure of this skill — the point is what changed since the rep last
looked, which by definition isn't in the conversation.

### Step 1 (optional) — the actual schedule

For a concrete list of today's meetings with times, call `list_meetings` with
today's date on both ends:

```json
{ "query": "", "start_date": "2026-08-13", "end_date": "2026-08-13" }
```

This returns both scheduled meetings and recorded calls for the day. Use it
when the rep wants times and attendees; skip it if they only asked what
changed.

### Step 2 — delegate the briefing

```json
{ "question": "Brief me for today: what meetings do I have, what changed on my deals since yesterday, and what needs my attention today. Include the specific deal or account behind each item." }
```

`ask_zime` has no memory of this conversation and no date parameters — put the
day in the question text. Ask for the deal or account behind each item, or you
get a list of alerts with nothing to act on.

### Outcomes

- **A briefing** — deliver per Output below.
- **A quiet day** — "nothing changed and you have no meetings" is a valid,
  useful answer. Don't manufacture items to fill it out.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say so and offer the local fallback. If only `list_meetings`
  succeeded, deliver the schedule alone and say the change summary was
  unavailable — a partial briefing labelled as partial is fine.

## Output

Schedule first (a rep reads this between calls), then what changed.

```markdown
**Briefing — [date]**

### Today's meetings
| Time | Meeting | Account | Prep |
|---|---|---|---|
| [time] | [title] | [account] | [prepped / not prepped] |

### What changed
[the agent's returned summary, relayed as-is]

### Needs attention today
[the agent's returned items, relayed as-is]

_Live calendar, CRM, and call data via Zime._
```

Rules:

- Relay the agent's sections **as-is** — don't re-prioritize what needs
  attention. Ordering is judgment, and reordering it silently overrides that.
- Keep the account or deal name on every item. An alert without an entity
  isn't actionable.
- Keep times exactly as returned, and say which timezone if the tool states
  one. A briefing with a shifted time is worse than no briefing.
- If a section came back empty, show it empty. A short honest briefing beats a
  padded one.
- Don't fold in items from earlier in the conversation.

## Tips

1. **Run it before your first call** — that's the design point; it uses the
   fast tier deliberately.
2. **"This week" works** — say so in the request and it goes into the question.
3. **Not prepped?** Chain into `call-prep` for the meeting that matters most.
4. **Wanting depth, not speed?** That's `pipeline-review`.

## Local mode (only when no zime-mcp server is connected)

If the user provides a calendar or CRM export, list the day's meetings and
flag deals with past-due close dates or missing next steps from that file.
Open with one line saying the briefing covers only the provided file — so
"what changed" isn't available, since a static export has no change history.
Don't infer change from a snapshot.

## What this sends where

MCP mode sends a date range and empty query (to `list_meetings`) and the
question text (to `ask_zime`). Local mode reads only the provided file.

## Related Skills

- **call-prep** — prepare for the meeting this briefing surfaced
- **pipeline-review** — the deeper weekly version
- **actions-commitments** — everything open, not just today
