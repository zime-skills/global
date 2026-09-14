---
name: call-recap
description: "Summarizes one past call. Shows what was decided, what's risky, and what's still open."
license: MIT
metadata:
  zime:skill-id: 804c8a6e-d47a-4b7a-aee2-90a5729af5a0
  zime:tag: communication
  zime:roles: ae,cs
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.5
---

# Call Recap

Turns "what happened on the Acme call?" into a structured recap. The Zime
call agent reads the full transcript plus the call's extracted signals and
linked CRM record — so the recap reflects what the workspace knows, not just
what a transcript literally says.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         CALL RECAP                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE (this skill)                                   │
│  ✓ list_meetings, recorded calls only                            │
│  ✓ Ambiguous → show candidates, ask, pin call_id                 │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — DELEGATE (Zime agent)                                  │
│  + ask_zime with the recap question, naming the call        │
│  + Agent reads transcript + signals + linked deal                │
│  + Returns the recap; this skill does not rewrite it              │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL FALLBACK (no zime-mcp)                                    │
│  ~ Recap a transcript file the user provides                     │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/call-recap <company or call topic> [+ when]
```

Recap the call: $ARGUMENTS

## Routing

- Getting ready for an UPCOMING call → `call-prep`.
- Just the action items, no recap → `actions-commitments`.
- The follow-up email → `follow-up`.
- The raw verbatim text → `get-transcript`.
- Patterns across MANY calls → `competitive-intelligence`.

## What I Need From You

The company or topic, plus a date hint if you have one. Only **recorded**
calls can be recapped — if the meeting happened but wasn't recorded, there's
nothing to work from and I'll say so.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_meetings` (resolve) and `ask_zime` (delegate).

> `ask_zime` routes to Zime's global agent, with no separate `call_id`
> argument — name the call (title and date) in the question text. Writing the
> recap yourself from a fetched transcript while `ask_zime` is available
> is a failure of this skill: the agent also sees the call's extracted
> signals and CRM linkage, which a raw transcript does not carry.

### Step 1 — resolve the call

```json
{ "query": "Acme", "start_date": "2026-08-06", "end_date": "2026-08-13", "recorded": true }
```

- `resolved` → take `call_id`, go to Step 2.
- `multiple_matches` → show candidates with dates, ask which one, pin it.
  Never guess. "The latest one" → take the newest.
- `no_match` → most likely the date window excludes it, or it wasn't
  recorded. Say which, offer to widen the window. Never recap a different
  call.
- A resolved row with `has_transcript: false` → the meeting happened but
  wasn't recorded. Say that; don't proceed to Step 2.

### Step 2 — delegate to the agent

```json
{ "question": "Give me a structured recap of the Acme call on Aug 12: overview, key decisions and commitments, risks and blockers, action items by owner, and questions to clarify next time." }
```

Resolve pronouns to real names in the question — the agent has no memory of
this conversation.

### Outcomes

- **A recap** (prose/markdown) — deliver per Output below.
- **The agent declines or has nothing** — say so plainly and don't fill the
  gap from the transcript yourself.
- **An error** — `{"error": "<CODE>"}`. `INTERNAL_ERROR` retry once;
  `UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access. If it
  fails twice, say plainly the recap service couldn't be reached and offer
  the local fallback — never present a hand-written recap as agent-backed.

## Output

The agent's recap **is** the deliverable. This skill adds only the envelope:

```markdown
**Recap — [call title]** · [date] · [attendees]
**Linked deal:** [deal name, or none]

[the agent's returned recap, relayed as-is]
```

Rules:

- Relay the recap **as-is** — don't re-rank sections, condense, or drop
  items. If it returned five action items, deliver five.
- Preserve any timestamps, owner names, and severity markers it includes;
  those are the parts a rep acts on.
- Don't add sections the agent didn't return. No invented next steps.
- Anything in quotation marks must have come from `get_transcript`, not from
  the agent's paraphrase. If the user wants an exact quote, fetch it.

## Tips

1. **Date-bound it** — "my Acme call" over a 90-day window usually needs
   disambiguating.
2. **Recorded only** — unrecorded meetings can't be recapped, however recent.
3. **Need the exact words?** Use `get-transcript` alongside this.
4. **Recapping several calls?** That's `competitive-intelligence` or
   `actions-commitments`, not this one call at a time.

## Local mode (only when no zime-mcp server is connected)

If the user provides a transcript (`.txt`, `.vtt`, `.json`, `.md`), recap
that file only. Open with one line saying the recap covers the provided
transcript, without the call's extracted signals or CRM linkage. Mark gaps as
gaps rather than inferring decisions that were never stated.

## What this sends where

MCP mode sends the query words and date range (to `list_meetings`), then the
recap question naming the call (to `ask_zime`). Local mode reads only
the file the user provided.

## Related Skills

- **actions-commitments** — just the open items, across calls
- **follow-up** — the email that follows this recap
- **get-transcript** — the verbatim text
