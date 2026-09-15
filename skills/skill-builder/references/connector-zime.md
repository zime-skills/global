# Connector profile: Zime

The Zime MCP connector at `https://mcp.zime.ai/mcp`. Users sign in with their
Zime work email; every tool returns only what that person can already see in
the Zime dashboard.

Seven tools. Five are free lookups, two run Zime's agents and use credits.

| Tool | Job | Credits |
|---|---|---|
| `list_meetings` | Resolve one meeting or recorded call, or browse them | no |
| `get_transcript` | The full verbatim transcript of one call | no |
| `list_deals` | Resolve one deal, or browse deals | no |
| `list_accounts` | Resolve one CRM account, or browse accounts | no |
| `get_contact` | Resolve one CRM contact | no |
| `ask_zime` | Zime's agent: any question over calls, deals, signals, strategy | yes |
| `prep_note` | Zime's prep-note agent for one upcoming scheduled call | yes |

## Resolve tools

All five return the same envelope:

- `{"status": "resolved", "data": {...}}`
- `{"status": "multiple_matches", "candidates": [...]}` → show them with the
  fields that tell them apart, ask, re-call pinned by id. Never guess.
- `{"status": "no_match", "candidates": [...]}` → not proof it does not
  exist; usually the window excludes it or it is named differently. Show
  near-misses, offer to widen. Never substitute a similar record.
- `{"error": "<CODE>"}` → `INTERNAL_ERROR` retry once; `UNAUTHORIZED` /
  `FORBIDDEN` re-authorize or lack of access; `INVALID_ARGUMENT` fix the
  arguments.

### `list_meetings`

Covers recorded calls **and** calendar meetings, upcoming or unrecorded. A row
carries `meeting_id`, `call_id` and `has_transcript`; either id may be null,
and that is information: `call_id: null` is exactly why no transcript exists.

- `query` — company, attendee or topic. **Time words go in the date
  fields, not here.**
- `call_id` / `meeting_id` — pin from a prior candidates response.
- `start_date` / `end_date` — `YYYY-MM-DD`. Defaults: 90 days ago to 14 days
  ahead, so the window looks both back and forward.
- `recorded` — `true` recorded only, `false` upcoming or unrecorded only,
  omit for both. Set `true` when the next step needs a transcript.
- `list` + `limit` — browse recent or upcoming instead of resolving one.

### `get_transcript`

Returns the entire transcript, verbatim. Large payload; a timeout is a real
possibility, so if it fails twice say so rather than filling in from memory.

- `call_id` from `list_meetings`, or `query` plus `start_date` / `end_date`
  (defaults 90 days ago to today).
- This is the **only** source of quotable text. Anything in quotation marks
  anywhere must have come from here.

### `list_deals`

- `query` — deal or account name. `deal_id` to pin. `account_name` to narrow.
- `start_date` / `end_date` — **deals are not date-scoped by default**; a deal
  that closed two years ago is a legitimate subject. Only pass dates if the
  user bounded it; a stray range hides the deal entirely.
- `list` + `limit` — browse recent deals.
- Questions about **many** deals (filters, totals, "what's stuck") are not for
  this tool. Send them to `ask_zime`.

### `list_accounts`

- `query` — company name. `account_id` to pin. `domain` narrows better than a
  name. `list` + `limit` to browse.
- A company **not in CRM** is not a lookup; that is web research.

### `get_contact`

- `query` — name or email, e.g. "Jane at Acme". `contact_id` to pin.
  `account_name` to narrow.

## Agent tools

### `ask_zime`

One argument, `question`. The agent has no memory of the chat and no separate
filter or date parameters, so **everything belongs in the question text**:
the record by name, the window, the segment, the rep, the lens, the output
shape. Resolve every pronoun.

Answers descriptive questions (what happened, what was said, who attended,
what are my action items) and prescriptive ones (how do I win this, why am I
losing to X, what should I do next, what is working in won deals). Sees
analysed call signals, CRM state and the playbook together.

Not for schema, SQL or how-the-data-is-stored questions. When a request
matches a fixed-purpose tool exactly, use that tool instead.

Ask for the evidence explicitly. A risk call without a reason is not
reviewable; the agent supplies reasoning when the question asks for it.

Skill rule: writing the recap, analysis or review yourself from raw records
while `ask_zime` is available is a failure of the skill. The agent sees the
extracted signals and CRM linkage a raw transcript does not carry.

### `prep_note`

Only for preparing for **one specific upcoming, scheduled** call. Both
conditions required. Anything about past calls, general deal strategy, or
"what meetings do I have" goes to `ask_zime` or `list_meetings`.

- `query` — the user's request **minimally rewritten**, keeping the company or
  person and any time hint. Unlike every other Zime tool, time words belong
  here. Never invent a company or time that was not said.
- `calendar_event_id` — only on a follow-up call after the tool returned a
  candidate list and the user picked one.

Statuses beyond the note itself: a candidate list (show it, pick again),
"no upcoming external meetings", "prep notes aren't configured for your
workspace yet" (ask the Zime admin), "already being generated" (wait a few
seconds, call once more).

## Which tool for which job

| The user wants | Resolve with | Answer with |
|---|---|---|
| When is / who was on one meeting | `list_meetings` | stop, return the record |
| What happened on one call | `list_meetings` (recorded) | `ask_zime`, naming the call and date |
| Exact words from one call | `list_meetings` | `get_transcript` |
| One deal's fields | `list_deals` | stop, return the record |
| One deal's risk, strategy, stakeholders | `list_deals` | `ask_zime`, naming the deal |
| One account's fields | `list_accounts` | stop, return the record |
| Many deals, pipeline, "what's at risk" | none | `ask_zime` with window and lens in the question |
| Themes across many calls | none | `ask_zime` |
| Prep for an upcoming call | `list_meetings`, forward window | `prep_note` with the `meeting_id` |
| A person's role, email, account | `get_contact` | stop, return the record |
| A company not yet in CRM | none | web research, not Zime |

## House rules every Zime skill states

- Answering from memory or chat history while the tool is available is a
  failure of the skill. A remembered stage, amount or quote can be stale or
  wrong.
- Relay agent output as-is. Do not re-rank, merge, condense, round or add. The
  ordering is part of the judgment; "$47,300" stays "$47,300".
- Keep evidence and dates the agent attached. "Raised on the Jun 18 call" is
  what makes a risk actionable.
- Unknown is a finding. "No objections surfaced" often means discovery was
  thin, not that the deal is clean.
- Quotes only from `get_transcript`.
- Never merge two calls' transcripts into one answer.
- The wrong date guess causes a miss, not a wrong answer. That is deliberate:
  widen the window rather than trust a guess.
- On `multiple_matches`, never pick for the user. "The latest" means the
  newest.

## Local mode conventions

When the connector is not connected, Zime skills work from files the user
provides and say so in the first line:

- Transcripts: `.txt`, `.vtt`, `.json`, `.md`. The answer covers only that
  file, with none of the call's extracted signals or CRM linkage.
- CRM or calendar exports: `.csv`. Look the row up; do not infer engagement
  from a file with no activity columns.
- No file and no connection → say so rather than reconstructing.

## Output conventions

- Header block naming the record and its hard facts (title, date, attendees,
  linked deal; or stage, amount, close, owner).
- Footer naming the source: `_Live CRM record via Zime._`,
  `_Live meeting record via Zime._`, `_Grounded in this deal's calls and CRM
  record via Zime._`, `_Live CRM and call data via Zime._`.
- Analyses render as a visual artifact: card sections, badges for short
  labelled values, colour only on status fields (red at-risk, amber
  needs-attention, green on-track) and always with the word as well as the
  colour. Prose stays in the chat. Missing values stay visible as "not
  stated".
- A transcript body stays plain text. No re-wrapping, no styling, no
  truncation.

## Sibling skills in the catalogue

`account-research`, `actions-commitments`, `call-prep`,
`competitive-intelligence`, `create-sales-asset`,
`create-sales-to-cs-handover`, `daily-briefing`, `follow-up`,
`review-account`, `review-call`. Route to these by slug; do not invent others.
