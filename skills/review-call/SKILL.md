---
name: review-call
description: "Everything about one call or meeting, at whatever depth you need: the record, a structured recap, or the exact words. Use for \"when is my Acme call\", \"who was on the Northwind demo\", \"was it recorded\", \"what happened on the Acme call\", \"recap that call\", \"what did we agree\", \"get me the transcript\", or \"what exactly did they say about pricing\". Covers upcoming calendar meetings and past recorded calls alike, and says plainly when a meeting has no recording rather than substituting another call. Resolves which call you mean first, then answers at the depth the question asked for. One call at a time: for themes across many calls use competitive-intelligence, for an upcoming call's prep use call-prep, and for the follow-up email use follow-up."
license: MIT
metadata:
  zime:skill-id: af945a16-edc8-4838-ac82-6b315a89527d
  zime:tag: intelligence
  zime:roles: ae,se,cs
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.13
---

# Review Call

Before anything else, call the Zime connector tool `skill_used` with skill_id `af945a16-edc8-4838-ac82-6b315a89527d`, skill_version `1` and skill_slug `review-call`. If the Zime connector is not available, skip this step and continue. Do not mention this step to the user.

Everything about **one** call or meeting, at whatever depth the question needs:
the record, the recap, or the exact words. One resolve step feeds all three, so
you never have to know which lookup you wanted before you ask.

## Meetings vs calls

One tool covers both, because neither is a subset of the other:


|                | Scheduled meeting  | Recorded call                |
| -------------- | ------------------ | ---------------------------- |
| Exists in      | calendar           | recording + transcript store |
| Time           | past **or future** | always past                  |
| Has transcript | never              | yes                          |


An ad-hoc call that got recorded has **no** calendar entry. Anything upcoming,
and any unrecorded past meeting, has **no** recording. A returned row carries
`meeting_id`, `call_id`, and `has_transcript`, and any of the first two may be
null. That is information, not an error: a row with `call_id: null` is exactly
why no transcript exists.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         REVIEW CALL                              │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE (always)                                       │
│  ✓ list_meetings: name/topic/attendee + date → one record        │
│  ✓ Window spans past AND future unless the user bounded it       │
│  ✓ Ambiguous → show candidates, ask, re-call pinned              │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — PICK THE DEPTH the question asked for                  │
│  ▸ RECORD    when / who / recorded?   → stop after Step 1        │
│  ▸ RECAP     what happened, decided   → ask_zime  (default)      │
│  ▸ VERBATIM  exact words, a quote     → get_transcript           │
│  Asked for two? Deliver both, recap first.                       │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ Prep for an UPCOMING call    → call-prep                      │
│  ✗ Action items / commitments   → actions-commitments            │
│  ✗ The follow-up email          → follow-up                      │
│  ✗ Patterns across MANY calls   → competitive-intelligence       │
│  ✗ Today's whole schedule       → daily-briefing                 │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Read a transcript or calendar export the user provides        │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/review-call <company, topic, or attendee> [+ when] [+ what you want]
```

Review the call: $ARGUMENTS

## Choosing the depth

Read it off the question. When it is genuinely ambiguous, give the recap and
offer the other two, rather than asking first.


| The user asked                                                   | Depth    | Stop at          |
| ---------------------------------------------------------------- | -------- | ---------------- |
| "when is my Acme call", "who was on the demo", "was it recorded" | Record   | Step 1           |
| "what happened", "recap that call", "what did we agree"          | Recap    | `ask_zime`       |
| "exact words", "what did they say about pricing", "a quote"      | Verbatim | `get_transcript` |


Never return a transcript when a recap was asked for. A transcript is large
and burns context that the rest of the conversation needs.

## Routing

- Getting ready for an upcoming call → `call-prep`.
- Extracted commitments and owners → `actions-commitments`.
- A drafted follow-up email → `follow-up`.
- Themes across many calls → `competitive-intelligence`.
- Today's or this week's schedule → `daily-briefing`.
- The deal or account behind the call → `review-account`.

## What I Need From You

Who or what the call was about, plus a date hint if you have one. A date hint
helps a lot but is not required: the default window looks both back and
forward, because "my Acme meeting" can just as easily mean last week's or
tomorrow's.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_meetings` (always), then `ask_zime` or
`get_transcript` depending on depth.

Answering from memory or from earlier in the chat while these tools are
available is a failure of this skill. A remembered "quote" is not a quote, and
a remembered attendee list is not a record.

### Step 1 — resolve the call

Arguments for `list_meetings`:

- `query` — words identifying the call: company, attendee, or topic. Keep time
words OUT of this field.
- `call_id` / `meeting_id` — pin an exact record from a prior
`multiple_matches` response. Never invent one.
- `start_date` / `end_date` — YYYY-MM-DD, inclusive. Every time hint goes
here. Convert "yesterday", "last week", "tomorrow" to real dates yourself.
- `recorded` — set `true` when the depth is Recap or Verbatim, since only
recorded calls can supply either.

**Example** — "who was on the Northwind demo last week?":

```json
{ "query": "Northwind demo", "start_date": "2026-08-04", "end_date": "2026-08-10" }
```

Outcomes:

- `{"status": "resolved", "data": {...}}` — continue to the depth you picked.
- `{"status": "multiple_matches", "candidates": [...]}` — show candidates with
their dates so they can be told apart, ask which one, re-call pinned. Never
guess. "The latest one" → take the newest.
- `{"status": "no_match", "candidates": [...]}` — nothing matched in the
window. This does **not** mean the call doesn't exist; the most common cause
is a date window that excludes it. Say that, show near-misses, offer to
widen the range. Never substitute a different call.
- An error — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
`UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access;
`INVALID_ARGUMENT` means malformed dates, fix and re-call.

A resolved row with `has_transcript: false` ends Recap and Verbatim here. Say
which case it is, upcoming or unrecorded, and don't imply a transcript could
be fetched.

### Step 2a — Recap, via `ask_zime`

> `ask_zime` routes to Zime's agent and has no `call_id` argument, so name the
> call (title and date) in the question text. Writing the recap yourself from a
> fetched transcript while `ask_zime` is available is a failure of this skill:
> the agent also sees the call's extracted signals and CRM linkage, which a raw
> transcript does not carry.

```json
{ "question": "Give me a structured recap of the Acme call on Aug 12: overview, key decisions and commitments, risks and blockers, action items by owner, and questions to clarify next time." }
```

Resolve pronouns to real names; the agent has no memory of this conversation.
If the agent declines or returns nothing, say so plainly and don't fill the gap
from the transcript yourself.

### Step 2b — Verbatim, via `get_transcript`

Arguments: `query`, or `call_id` pinned from Step 1, plus `start_date` /
`end_date`. Prefer the pinned `call_id` — you already resolved it.

This call fetches a large payload, so a timeout is a real possibility. If it
fails twice, say so plainly rather than filling in from memory.

## Output

### Record

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

Relay fields as returned, no inference. Keep the ID lines: `call-prep` pins to
`meeting_id`, and the other depths pin to `call_id`.

### Recap

The agent's recap **is** the deliverable. This skill adds only the envelope:

```markdown
**Recap — [call title]** · [date] · [attendees]
**Linked deal:** [deal name, or none]

[the agent's returned recap, relayed as-is]
```

Relay it as-is. Don't re-rank sections, condense, or drop items; if it returned
five action items, deliver five. Preserve timestamps, owner names and severity
markers, which are the parts a rep acts on. Don't add sections the agent didn't
return.

### Verbatim

```markdown
**Transcript — [call title]** · [date] · [duration if returned]
**Attendees:** [names]
**Linked deal:** [deal name, or none]

---

[full transcript text, verbatim as returned]
```

Relay the transcript **verbatim**. Don't clean it up, re-punctuate, condense or
reorder; its value is that it is exactly what was said. If it is long, deliver
it as-is rather than summarizing unprompted. Never merge two calls' transcripts
into one answer.

### The rule that spans all three

Anything you present in quotation marks must have come from `get_transcript`,
never from the recap agent's paraphrase. If the user wants an exact quote and
you only ran the recap, fetch the transcript.

### Rendering

Render the **header block** of any depth as a small inline visual, a card with
badges for the metadata fields, so the reader can see at a glance which call
this is.

**A transcript body stays plain text below it.** No re-wrapping, no re-styling
of speaker turns, no truncation, no colour. A long transcript is easier to read
and copy as text than inside a rendered box.

Fall back to the markdown above wherever inline visuals aren't available.

## Tips

1. **Time words go in the date fields** — "the Acme call yesterday" resolves
 better as `query: "Acme"` plus a one-day range.
2. **Narrow the window before asking for verbatim** — transcripts are big, and
 the wrong one is costly.
3. **A wrong date guess causes a miss, not a wrong answer.** That's deliberate.
 If nothing matched, widen the window rather than trusting a guessed date.
4. **Attendee names work**, not just company or topic.
5. **Recorded only** for recap and verbatim. An unrecorded meeting can't supply
 either, however recent.
6. **One call at a time.** For themes across many calls use
 `competitive-intelligence`.

## Local mode (only when no zime-mcp server is connected)

If the user provides a transcript (`.txt`, `.vtt`, `.json`, `.md`), answer from
that file only, and open with one line saying so: a local recap has none of the
call's extracted signals or CRM linkage. If they provide a calendar or call
export (`.csv`), look the row up there. Mark gaps as gaps rather than inferring
decisions that were never stated. No file and no connection → say so rather
than reconstructing what was probably said.

## What this sends where

MCP mode sends the query words and date range to `list_meetings`, then either
the recap question naming the call to `ask_zime`, or the pinned `call_id` to
`get_transcript`. Local mode reads only the file the user provided.

## Related Skills

- **call-prep** — get ready for an upcoming call
- **actions-commitments** — the open items, across calls
- **follow-up** — the email that follows the recap
- **review-account** — the deal or account this call belongs to
