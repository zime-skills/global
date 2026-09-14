---
name: create-sales-asset
description: "Builds a sales asset from real customer evidence only, never made up facts. Covers account review decks (as slides), one-pagers, battlecards, case studies, and objection talking points. Always an internal draft, not customer-ready."
license: MIT
metadata:
  zime:skill-id: 33b3e084-8df2-40bd-b91f-1d5199dd9a14
  zime:tag: communication
  zime:roles: ae,marketing
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.7
---

# Sales Asset Builder

Turns "build me an account review for Acme" into a draft in our house format.
This skill owns the **structure and framing**; the agents own the **facts**. It
never originates a metric, a quote, or a "customer said" line.

## The hard rule

Every factual claim in the asset — a metric, a quoted line, a stated customer
outcome, a competitive win — must trace to something a tool returned in **this
conversation**, with the account and date attached. If a needed fact wasn't
returned, the asset marks the gap open rather than filling it with a plausible
number or a paraphrased "customers typically say" line.

This is the one rule the skill cannot bend. Arranging real tool output is the
job; inventing supporting evidence is a failure of it — even when the invented
line looks exactly like something a customer would say. An asset is the
artifact most likely to be pasted into a customer-facing deck, which is
precisely why fabrication here is the most expensive.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   SALES ASSET BUILDER                            │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — RESOLVE THE SUBJECT                                    │
│  ✓ list_accounts (account asset) or list_deals (deal asset)      │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — GATHER DATED EVIDENCE                                  │
│  + ask_zime — signals, risks, expansion, outcomes, patterns │
│  + get_transcript — the exact line, when a real quote is needed  │
├─────────────────────────────────────────────────────────────────┤
│  STEP 3 — ASSEMBLE (Claude, house format)                        │
│  ✓ references/deck-grammar.md — the section order we use         │
│  ✓ Every row carries evidence + date + account                   │
├─────────────────────────────────────────────────────────────────┤
│  STEP 4 — DELIVER                                                │
│  ✓ Account review deck → real slides (Google Slides) when connected │
│  ✓ Every other asset type → a doc, or markdown if no connector   │
├─────────────────────────────────────────────────────────────────┤
│  ALWAYS                                                          │
│  ! Internal draft. Needs review before it leaves the building.   │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/create-sales-asset <asset type> for <account, deal, or competitor>
```

Build: $ARGUMENTS

## Routing

- A pipeline stat with no asset to build → `pipeline-review`.
- Risk or strategy on one deal, no asset → `deal-strategy`.
- A recap of one call, or the email after it → `call-recap` / `follow-up`.
- Competitive evidence gathering with no asset yet →
  `competitive-intelligence` (then come back here to shape it).
- One CRM fact alone → `get-account` / `get-deal`.
- Researching a **prospect** we haven't sold to → `account-research`.

## What I Need From You

**Which asset**, and **what it's about**:

| Asset | Subject | Typically needs |
|---|---|---|
| Account review deck | one account | signals, risks, expansion, open items |
| Proof-point one-pager | one account/deal | outcomes with numbers, a real quote |
| Battlecard section | a competitor | how we position, objections, wins |
| Case-study writeup | one customer | before/after, outcomes, a quote |
| Objection talking points | an objection theme | how it was handled successfully |

If the user names an audience ("for the CS team", "for the QBR"), keep it —
it changes emphasis, not evidence.

## MCP mode (required when zime-mcp is connected)

**Required tools:** `list_accounts` / `list_deals` (resolve), `ask_zime`
(evidence), `get_transcript` (exact quotes).

> Hand-building a proof point from general product knowledge while
> `ask_zime` is available is a failure of this skill: only it sees the
> workspace's real calls, CRM records, and extracted signals.

### Step 1 — resolve the subject

```json
{ "query": "Acme" }
```

`multiple_matches` → show candidates, ask, pin. Never guess: building an asset
about the wrong account wastes the whole artifact.

Skip this step for a competitor-only battlecard — go straight to `ask_zime`.

### Step 2 — gather evidence, asking for dates explicitly

Name the account or deal in the question itself, since `ask_zime` has no
separate id argument:

```json
{ "question": "For the Acme account: what expansion signals, churn risks, and open commitments appear in our calls? For each one give the evidence, the call date, and who said it." }
```

Cross-account or competitive:

```json
{ "question": "How do we position against Concerto in deals we have won, and what objections about them recur? Include the account and date for each example." }
```

**Always ask for the date and the speaker.** An undated claim can't go in an
asset — see the deck grammar. If the agent returns claims without dates, ask
once more for them rather than shipping undated rows.

### Step 3 — exact quotes only via `get_transcript`

If the asset needs something in quotation marks:

```json
{ "query": "Acme renewal", "start_date": "2026-06-01", "end_date": "2026-06-30" }
```

A quote in the asset must come from here. Putting an agent's paraphrase inside
quotation marks is fabrication with extra steps.

### Outcomes

Each tool returns the usual shapes — `resolved` / `multiple_matches` /
`no_match`, or `{"error": "<CODE>"}` (`INTERNAL_ERROR` retry once;
`UNAUTHORIZED` / `FORBIDDEN` means re-authorize or lack of access). If a needed
evidence call fails or returns nothing, the corresponding asset section says
the gap is open. Never substitute a remembered figure.

## Output

Follow [references/deck-grammar.md](references/deck-grammar.md) for section
order and the evidence-table shape. The short version:

```markdown
# [Asset title] — [subject]
_Internal draft. Assembled from Zime call and CRM data on [date]. Not reviewed
by marketing or legal._


### Render it as a visual artifact

Present the finished output as a self-contained HTML artifact rather than
plain markdown in the chat, so it's scannable at a glance:

- **Card-style sections** for each block above, not one long wall of text.
- **Badges** for short labelled values (stage, status, owner, dates).
- **Light colour accents on status and risk fields only** — red for
  at-risk/blocked/overdue, amber for needs-attention, green for
  on-track/confirmed. Colour carries meaning here, so never colour a field
  that has no status semantics, and always keep the word as well as the
  colour: colour alone is unreadable for anyone who can't distinguish it.
- **Keep prose in the chat response, not in the artifact.** Caveats, what
  you did, and what to do next belong in the surrounding message. The
  artifact holds the structured result.
- Every grounding rule above still applies. An artifact makes gaps *less*
  visible, so a missing value stays visible as "not stated" rather than
  being quietly dropped to keep a card tidy.

Fall back to the markdown above when artifacts aren't available in the
current environment (for example Claude Code in a terminal). Say which you
did only if the user asked for a specific format.

## The problem (in their words)
> "[verbatim quote]" — [name, title], [date]

## [Evidence section — signals / risks / expansion]
| [Account] | [Signal] | Evidence | Date | Next action |
|---|---|---|---|---|
| [account] | [signal] | [what was said] | [date] | [action] |

## What this means
[synthesis — clearly framing, not new facts]

## Open gaps
- [section with no supporting evidence returned]

---
_Sources: Zime call recordings — [account], [dates]._
```

## Deliver in the right format

- **Account review deck:** this is a presentation, not a document. Break the
  content above into one slide per section (title, problem, evidence, what
  it means, gaps). If a Google Slides connector is available, create the
  file with `mimeType: "application/vnd.google-apps.presentation"` and one
  slide's worth of text per section, then share the link. Slide conversion
  from plain text is rough — tell the user the layout will need a quick pass
  in Slides to clean up spacing and bullets. If no connector is available,
  give the markdown above and say it needs to be turned into slides
  manually.
- **Every other asset type** (one-pager, battlecard section, case study,
  objection talking points): these are documents, not slides. If a Google
  Drive connector is available, create a Google Doc from the markdown
  above. Otherwise hand back the markdown to paste in.

### Rules

- **Every row: account, evidence, date.** A row missing any of the three
  doesn't ship — that's the format's whole discipline.
- **Quotes come from `get_transcript`**, attributed to a named speaker with a
  date. No exceptions.
- **Relay claims close to the agent's phrasing.** Don't sharpen "the
  integration worried them" into "integration is why we're losing".
- **Never invent a number.** No ROI figure, headcount, or percentage that a
  tool didn't return. If the asset format wants an ROI section and no numbers
  came back, the section says so.
- **Keep Open gaps.** Removing it makes a partial asset look complete.
- **Always caption it as an internal draft**, every time. Calls contain
  confidential customer language; anything built here needs review before it
  goes to a prospect, into an external deck, or anywhere published.

## Tips

1. **Name the asset type** — "account review deck" and "proof point" have
   different section orders.
2. **Ask for dates in the evidence question** — retrofitting them later means
   re-calling.
3. **Fetch quotes separately** — one `get_transcript` call is what makes a
   quote quotable.
4. **Gaps are useful** — they tell the rep what to go ask on the next call.

## Local mode (only when no zime-mcp server is connected)

If the user provides transcripts or a CRM export, build a narrower asset from
those files only — same rule: every claim traces to a line or field in the
provided files. Open with one line saying the asset covers only those files,
not the full account history, and repeat the internal-draft caveat.

## What this sends where

MCP mode sends query words (to `list_accounts`/`list_deals`), question text
naming the subject (to `ask_zime`), and query/dates plus a `call_id`
(to `get_transcript`). If a Google Drive or Slides connector is available,
the finished asset content is sent to it to create the file. Local mode
reads only the provided files.

## Related Skills

- **competitive-intelligence** — gather competitor evidence first
- **deal-strategy** — the analysis behind a deal-focused asset
- **create-sales-to-cs-handover** — the handover doc, a different house format
- **get-transcript** — the exact quotable line
