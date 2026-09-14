# Deck grammar — the house format

The section order and evidence discipline our decks follow. Derived from the
account-review, post-POC, and pitch decks the team actually ships.

## The invariant

**Evidence → meaning → action.** Never lead with a conclusion. A reader who
disagrees with the conclusion must be able to see the evidence it came from and
check it themselves. That's why every evidence row carries a date and an
account: it makes the claim falsifiable.

## Section order by asset type

### Account review deck

1. **Title** — subject, date, who prepared it
2. **Agenda** — 3-4 numbered blocks, one line each
3. **The problem, in their words** — a verbatim quote from a named person with
   a date. Not a paraphrase, not our framing of their problem.
4. **Where expansion is showing up** — evidence table
5. **Where churn risk is showing up** — evidence table
6. **Where engagement has gone quiet** — account + last-engagement date +
   next action
7. **Full account view** — the 6-panel per-account breakdown (below)
8. **Objection patterns** — pattern + accounts + evidence + how to handle
9. **ROI / outcomes** — only with real numbers; omit the section otherwise
10. **Next steps** — owner and date per item

### Proof-point one-pager

1. Title + internal-draft caption
2. The customer in one line (industry, size, what they use)
3. Before — the problem in their words, quoted and dated
4. After — outcomes, each with a number and a source
5. The quote — one strong verbatim line, named and dated
6. Where it applies — which prospect profiles this proof point fits
7. Open gaps

### Battlecard section

1. Competitor name + where they show up (accounts, dates)
2. What customers actually say about them — quoted, dated
3. Their claims we hear repeated — with the account that repeated them
4. How we've positioned successfully — evidence from won deals
5. Objections that recur + how each was handled
6. What we don't know — gaps

### Case-study writeup

1. Customer + context
2. The trigger — why they started looking, in their words
3. What they adopted and when
4. Outcomes — numbers only, each sourced
5. Quote
6. Open gaps

### Objection talking points

1. The objection, phrased as customers actually phrase it (quoted)
2. Which accounts raised it, with dates
3. What worked — the response that moved it, with the account it worked on
4. What didn't work — if the evidence shows a failed approach, include it
5. Proof points to reach for
6. Gaps

## The evidence table

Every evidence table uses this shape. Columns may be renamed for the asset,
but the four load-bearing fields never drop out:

| Account | Signal / pattern | Evidence | Date | Next action |
|---|---|---|---|---|
| Holcim | Renewal-confidence risk | Cost-optimization feature unresolved 5+ weeks | 2026-06-24 | Prioritize caching; align new stakeholder |

**Rules:**

- **Account** — never "a customer" or "several accounts". Name it.
- **Evidence** — what was actually said or observed, close to the original
  phrasing. Not our interpretation of it.
- **Date** — the call date. An undated row does not ship.
- **Next action** — concrete and assignable. "Monitor" is not an action.

A row missing account, evidence, or date is dropped or moved to Open gaps. It
is never shipped with the missing field blank or inferred.

## The full account view (6 panels)

Used in account reviews. Each panel is 2-3 sentences with a dated source.
Panels with nothing behind them say so rather than being padded.

| Panel | What goes in it |
|---|---|
| Champion | Who, how engaged, what they said in our favour, when |
| Product sentiment | Positive/negative + the most recent signal + date |
| Renewal signal | Positive/negative + the specific reason + date |
| Adoption / usage | How deeply embedded, scale, expansion plans + date |
| Expansion signal | What they want next and what unblocks it + date |
| Churn signal | What's putting the relationship at risk + date |

## ROI and numbers

- A number appears **only** if a tool returned it. No modelled, estimated, or
  illustrative figures.
- If the format has an ROI section and no numbers came back, the section reads
  "No outcome metrics available from call data — needs input from the account
  team." That is an honest and useful line.
- Never annualize, extrapolate, or round a returned figure into a rounder one.

## Build-vs-buy and pricing sections

Only when the user asks for them, and only from material they provide. These
are commercial positions, not call-derived evidence — this skill does not
originate pricing, contract terms, or competitive cost claims.

## Sourcing footer

Every asset ends with the sources line naming the accounts and date range the
evidence came from:

```
Sources: Zime call recordings — Holcim, Jun 18 and Jun 24 2026.
```

## The caption that always appears

```
Internal draft. Assembled from Zime call and CRM data on [date].
Not reviewed by marketing or legal.
```

Calls contain confidential customer language. This caption is not boilerplate —
it's the thing that stops an internal draft from being pasted into a
customer-facing deck unreviewed.
