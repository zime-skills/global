---
name: get-meeting
description: "Looks up one meeting or call. Shows the date, who was there, the linked deal, and if it was recorded."
license: MIT
metadata:
  zime:skill-id: 0ca12fd7-f9da-4a9c-b2c6-4ddf7549c589
  zime:tag: research
  zime:roles: ae
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.6
---

# Get Meeting

Answers "when is my Acme call?" or "who was on the Northwind demo?" with the
one meeting record — nothing synthesized. This is a lookup, not a recap.

## Meetings vs calls

One tool covers both, because neither is a subset of the other:

| | Scheduled meeting | Recorded call |
|---|---|---|
| Exists in | calendar | recording + transcript store |
| Time | past **or future** | always past |
| Has transcript | never | yes |

- An ad-hoc call that got recorded has **no** calendar entry.
- Anything upcoming, and any unrecorded past meeting, has **no** recording.

So a returned row carries `meeting_id`, `call_id`, and `has_transcript` —
and any of the first two may be null. That's information, not an error: a
row with `call_id: null` is exactly why no transcript exists.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        GET MEETING                               │
├─────────────────────────────────────────────────────────────────┤
│  RESOLVE (this skill's whole job)                                │
│  ✓ Name/topic/attendee + date → one meeting or call              │
│  ✓ Window spans past AND future (phrasing rarely signals tense)  │
│  ✓ Ambiguous → show candidates, ask, re-call pinned              │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ The transcript itself      → get-transcript                   │
│  ✗ Summary of what was said   → call-recap                       │
│  ✗ Prep for an upcoming one   → call-prep                        │
│  ✗ "What's on my calendar"    → daily-briefing                   │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Read a calendar/call export the user provides                 │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/get-meeting <company, topic, or attendee> [+ when]
```

Find the meeting: $ARGUMENTS

## Routing

- The transcript text → `get-transcript`.
- What was discussed / decided → `call-recap`.
- Getting ready for an upcoming one → `call-prep`.
- Today's or this week's whole schedule → `daily-briefing`.

## What I Need From You

Who or what the meeting was about. A date hint helps a lot but isn't
required — the default window looks both back and forward, because "my Acme
meeting" can just as easily mean last week's or tomorrow's.

## MCP mode (required when zime-mcp is connected)

**Required tool:** `list_meetings` (fully qualified `Zime:list_meetings`).

### Arguments

- `query` — words identifying the meeting: company, attendee, or topic. Keep
  time words OUT of this field.
- `call_id` / `meeting_id` — pin an exact record from a prior
  `multiple_matches` response. Never invent one.
- `start_date` / `end_date` — YYYY-MM-DD, inclusive. Put every time hint
  here. Convert "yesterday", "last week", "tomorrow" to real dates yourself.
- `recorded` — optional filter when the user explicitly wants only recorded
  calls or only unrecorded meetings.

**Example** — "who was on the Northwind demo last week?":

```json
{ "query": "Northwind demo", "start_date": "2026-08-04", "end_date": "2026-08-10" }
```

### Outcomes

- `{"status": "resolved", "data": {...}}` — the meeting record. Deliver per
  Output below.
- `{"status": "multiple_matches", "candidates": [...]}` — show candidates
  with their dates so the user can tell them apart, ask which one, re-call
  pinned. Never guess. If the user asked for "the latest", take the newest.
- `{"status": "no_match", "candidates": [...]}` — nothing matched in the
  window. This does **not** mean the meeting doesn't exist — the most common
  cause is a date window that excludes it. Say that, show near-misses, and
  offer to widen the range. Never substitute a different meeting.
- An error — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access;
  `INVALID_ARGUMENT` means malformed dates — fix and re-call.

## Output

```markdown
**[Meeting title]** · [date, time]

| Field | Value |
|---|---|
| Attendees | [names / emails] |
| Linked deal | [deal name, or none] |
| Recorded | [yes / no] |
| Transcript | [available / not available] |
| Call ID | `[call_id]` (absent if not recorded) |
| Meeting ID | `[meeting_id]` (absent if ad-hoc) |

_Live meeting record via Zime._
```

Rules:

- Relay fields as returned; no inference.
- When `has_transcript` is false, say so plainly and explain which case it
  is — upcoming, or happened but unrecorded. Don't imply a transcript could
  be fetched.
- Keep the ID lines: `call-recap`, `follow-up`, and `get-transcript` pin to
  `call_id`; `call-prep` pins to `meeting_id`.

## Tips

1. **Time words go in the date fields** — "the Acme call yesterday" resolves
   better as `query: "Acme"` + a one-day range.
2. **A wrong date guess causes a miss, not a wrong answer** — that's
   deliberate. If nothing matched, widen the window rather than trusting a
   guessed date.
3. **Attendee names work** — not just company or topic.

## Local mode (only when no zime-mcp server is connected)

If the user provides a calendar or call export (`.csv`), look the row up
there and say the answer is limited to that file. No file and no connection →
say so rather than guessing at who attended or when.

## What this sends where

MCP mode sends only the query words, date range, and (when pinning) a
`call_id`/`meeting_id` to the zime-mcp server. Local mode reads only the
provided file.

## Related Skills

- **get-transcript** — the full text of a recorded call
- **call-recap** — what was discussed and decided
- **call-prep** — get ready for an upcoming one
