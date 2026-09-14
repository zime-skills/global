---
name: get-transcript
description: "Gets the full word for word transcript of one recorded call. Use when you need the exact words said, or a quotable line."
license: MIT
metadata:
  zime:skill-id: ae3bdac9-557b-4eea-a611-87eaaaf553bf
  zime:tag: research
  zime:roles: ae,se
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.8
---

# Get Transcript

Returns the actual words from one recorded call. This is the only skill that
produces literally quotable text — everything else works from synthesis.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       GET TRANSCRIPT                             │
├─────────────────────────────────────────────────────────────────┤
│  RESOLVE + FETCH                                                 │
│  ✓ Call name/topic + date → one call_id                          │
│  ✓ Fetch full verbatim transcript                                │
│  ✓ Ambiguous → show candidates, ask, re-call pinned              │
├─────────────────────────────────────────────────────────────────┤
│  NOT THIS SKILL (route away)                                     │
│  ✗ Summary instead of raw text  → call-recap                     │
│  ✗ Action items from the call   → actions-commitments            │
│  ✗ Follow-up email              → follow-up                      │
│  ✗ Upcoming meeting             → no transcript exists yet       │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Read a transcript file the user provides                      │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/get-transcript <call topic or company> [+ when]
```

Get the transcript for: $ARGUMENTS

## Routing

- A summary rather than raw text → `call-recap`.
- Extracted commitments and owners → `actions-commitments`.
- A drafted follow-up → `follow-up`.
- Which call, when, who attended → `get-meeting`.
- **Nothing to return** for an upcoming meeting or an unrecorded past one.
  Say that plainly instead of substituting a different call.

## What I Need From You

The company or topic, plus a date hint if you have one. If several calls
match, I'll show candidates and ask — a transcript is long, so returning the
wrong one wastes a lot of context.

## MCP mode (required when zime-mcp is connected)

**Required tool:** `get_transcript` (fully qualified `Zime:get_transcript`).

Reconstructing or paraphrasing a transcript while the tool is available is a
failure of this skill. A remembered "quote" is not a quote.

### Arguments

- `query` — words identifying the call: company, attendee, or topic. Keep
  time words OUT.
- `call_id` — pin an exact call from a prior `multiple_matches` response or
  a `get-meeting` result. Never invent one.
- `start_date` / `end_date` — YYYY-MM-DD, inclusive. All time hints go here.

**Example** — "get me the transcript of the Acme renewal call in May":

```json
{ "query": "Acme renewal", "start_date": "2026-05-01", "end_date": "2026-05-31" }
```

### Outcomes

- `{"status": "resolved", "data": {...}}` — the transcript plus call
  metadata. Deliver per Output below.
- `{"status": "multiple_matches", "candidates": [...]}` — show candidates
  with dates, ask which one, re-call with the chosen `call_id`. Never guess:
  the cost of the wrong transcript is high.
- `{"status": "no_match", "candidates": [...]}` — nothing matched. Most
  often the date window excludes it, or the call was never recorded. Say
  which is likely, show near-misses, offer to widen the window. Never
  substitute a different call's transcript.
- An error — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access.
  This call fetches a large payload, so a timeout is a real possibility — if
  it fails twice, say so plainly rather than filling in from memory.

## Output

Lead with what call this is, then the transcript itself.

```markdown
**Transcript — [call title]** · [date] · [duration if returned]
**Attendees:** [names]
**Linked deal:** [deal name, or none]

---

[full transcript text, verbatim as returned]
```

Rules:

- Relay the transcript **verbatim**. Don't clean it up, re-punctuate,
  condense, or reorder — its value is that it's exactly what was said.
- If it's long, deliver it as-is rather than summarizing unprompted. If the
  user wants a summary, that's `call-recap`.
- Never merge two calls' transcripts into one answer.
- Anything you present in quotation marks elsewhere must have come from
  here, not from a synthesis tool's paraphrase.


### Render it inline in the chat

Render the **header block** (call, date, attendees, linked deal) as a small
inline visual — a card with badges for the metadata fields — so the reader
can see at a glance which call this is.

**The transcript itself stays plain text below it.** No re-wrapping, no
re-styling of speaker turns, no truncation, no colour: this skill exists to
return exactly what was said, and a long transcript is easier to read and
copy as text than inside a rendered box.

Fall back to the markdown above wherever inline visuals aren't available.

## Tips

1. **Narrow the date range** — transcripts are big; the wrong one is costly.
2. **Resolve first if unsure** — run `get-meeting` to pick the call, then
   pass its `call_id` here.
3. **Quotes must come from here** — if you need something in quotation
   marks, fetch it rather than paraphrasing a summary.

## Local mode (only when no zime-mcp server is connected)

If the user provides a transcript file (`.txt`, `.vtt`, `.json`, `.md`), read
it and say the answer is limited to that file. No file and no connection →
say so rather than reconstructing what was probably said.

## What this sends where

MCP mode sends only the query words, date range, and (when pinning) a
`call_id` to the zime-mcp server. Local mode reads only the provided file.

## Related Skills

- **get-meeting** — identify which call first
- **call-recap** — a structured summary instead of raw text
- **create-sales-asset** — turn an exact quote into collateral
