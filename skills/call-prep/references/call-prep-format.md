# Prep-note format

This format governs LOCAL mode only — when the note is assembled from
user-provided files. In MCP mode the `prep_note` tool returns finished
markdown that is relayed as-is; do not restructure it to match this file.

The note is for a rep walking into the call, possibly on a phone screen
five minutes beforehand. Optimize for a 60-second read: bottom line first,
specifics over generalities, language they can actually say out loud.

## Voice and grounding rules

- Direct, practical, confident, businesslike. No filler, no hedging
  paragraphs — if something isn't known, one line saying so beats three
  qualifying it.
- **Never invent facts.** Every name, number, date, quote, and commitment
  in the note comes from the tool output or the provided files. Never
  overstate certainty about what a prospect thinks or will do.
- **Gaps are findings.** A section the sources can't fill gets a one-line
  gap marker plus, where useful, the question the rep should open with to
  fill it ("No budget signal on record — worth asking who approves spend
  at this size").
- **Competitors:** never frame a competitor as better. If a competitor is
  in the deal, position where your product is stronger for this customer's
  use case, using only proof points found in the sources. No fabricated
  metrics, ever.
- **Links:** when a past call or document in the sources carries an id and
  the tool output provides a recording or document base URL, attach the
  link inline to the item it supports. If the id or base URL is missing,
  present the item without a link — silently. Never write "link
  unavailable".
- **Timestamps:** state the meeting time with its timezone. Tool
  timestamps are typically UTC — say so rather than silently converting.
- Bold is for section headings only, never words inside sentences.
- No backend narration: nothing about which tools were called, filters
  tried, queries that returned empty, or ids as raw text.

## The seven sections

Keep the order. Drop a section entirely only when it cannot apply (for
example, "Landmines" on a first-ever touch with nothing on record —
though "no history on record" is itself worth a line).

### 1. Meeting snapshot

Two or three lines: what the meeting is, when (with timezone), who
requested it if known, and the one sentence of context that frames it
("third call in the eval; last call ended on an unresolved SSO question").

### 2. Deal state

Stage, owner, amount if known, open/closed status, and anything unusual
(reopened after a closed-lost, long gap since last touch, stage moved
backward). If the deal record and the call history disagree, surface both
and flag the gap — don't pick one silently.

### 3. Who's who

Each external attendee: name, company (watch for multiple attendee
domains — a second domain means a partner, reseller, or consultant is in
the room, and that's worth a line of its own), role or title if the
sources have it, and whether they've appeared on prior calls. Mark
first-time attendees explicitly — new faces change the talk track. Then
one line on who's joining from your own side and why.

### 4. What happened before

The prior-call history that matters, newest first: key moments, decisions
made, objections raised, and — most important — **open commitments from
either side.** An action item your side promised and hasn't delivered is
the first thing the customer will remember. Cite the call (date, title,
link when available) for each item.

### 5. Likely pains and objections

Only pains and objections the sources actually support — quoted or
paraphrased from prior calls, or recorded in CRM notes. For each: the
pain/objection, where it surfaced, and one suggested response angle the
rep can use in the moment. If the sources show nothing, say so and give
the rep the discovery question to ask instead.

### 6. Goals for this call

Two or three concrete objectives, not a wish list. At least one must be
the **next-step commitment to land** — specific, dated, mutually owned
("leave with a security-review kickoff on the calendar for next week"),
never "build rapport" or "circle back".

### 7. Landmines

Anything the rep must not step on: closed-lost history with this account,
a competitor actively in the deal, an unresolved support issue, a stale
promise, pricing friction from a prior call. One line each, sourced. If
there are none on record, omit the section.
