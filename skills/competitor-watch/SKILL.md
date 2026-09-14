---
name: competitor-watch
description: "Pulls the competitors actually showing up in the workspace's Zime calls, then web-searches each one for recent launches, funding, M&A, layoffs, pricing changes and positioning shifts, and returns a battlecard that keeps call evidence and public reporting clearly separated. Use this whenever someone asks what competitors are up to, what's new with a competitor, whether a competitor shipped or raised or repriced something, wants a refreshed or updated battlecard, asks 'who are we running into lately and what changed', or is prepping for a competitive deal and needs more than what's in the calls. Use it even when no competitor is named — working out who is actually in play is step one."
license: MIT
metadata:
  zime:skill-id: f90d8513-ec0b-4af3-ae09-325df61fcbab
  zime:tag: intelligence
  zime:roles: ae,se,marketing,pm
  zime:visibility: global
  zime:skill-version: 2
  zime:marketplace-version: 0.1.4
---

# Competitor Watch

Two halves that are useless apart. Zime knows which competitors are actually
in your deals and what customers said about them — but it can't know the
competitor shipped a new enablement module last month. The web knows the
launch and not whether anyone in your pipeline cares. This skill runs both
and joins them.

The join is the deliverable. A launch nobody in your calls asked for is
noise; a launch that closes a gap three of your accounts raised is a
battlecard update you need before your next call.

## The line this skill holds

`competitive-intelligence` deliberately refuses outside knowledge — it's a
pure call-evidence skill. This one is allowed on the web, which makes source
discipline the main risk. Every claim carries its origin. Call evidence and
web findings never merge into one undifferentiated paragraph, because a rep
repeating "customers say they're cheaper" in front of a buyer needs to know
whether a customer said that or a press release did.

Nothing comes from memory. Competitor facts from training data are stale by
definition and are the failure mode here — if it wasn't in a call or in a
search result fetched this session, it doesn't go in the output.

## How it works

```
┌──────────────────────────────────────────────────────────────────┐
│  1. WHO  — ask_zime: which competitors appear in recent calls    │
│           default window: last 90 days, all accessible calls     │
├──────────────────────────────────────────────────────────────────┤
│  2. CLEAN — dedupe variants, drop non-competitors, confirm set   │
├──────────────────────────────────────────────────────────────────┤
│  3. WHAT — web_search each competitor, 4 axes:                   │
│           launches · funding/M&A/layoffs · pricing · positioning │
├──────────────────────────────────────────────────────────────────┤
│  4. JOIN — match web movement against what customers raised      │
│           flag where the web contradicts what your calls assume  │
├──────────────────────────────────────────────────────────────────┤
│  NEVER  ✗ competitor facts recalled from training data           │
│         ✗ web findings presented as customer evidence            │
│         ✗ an undated web claim                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Step 1 — Get the competitor set from Zime

Default scope is every competitor across recent calls. Call `ask_zime` once:

```json
{ "question": "Which competitors have come up across our calls in the last 90 days? For each one, list the accounts where they were mentioned, the dates, what the customer actually said about them, and how we positioned against them." }
```

`ask_zime` has no memory of this conversation and no date parameters — state
the window inside the question text. Keep the user's own scope if they gave
one: "on the Swisscom deals" or "since June" goes into the question rather
than being dropped or widened.

If the user named a competitor outright ("what's new with Gong"), still run
this step scoped to that name — the call evidence is what makes the web half
actionable, and "they haven't come up in 90 days" is itself worth saying.

Three outcomes, and the middle one is the common one:

- **Names with evidence** — accounts, dates, quotes. Ideal. Proceed.
- **Names without evidence** — the agent lists competitors but can't
substantiate per-account quotes. This happens often and is not a failure:
the names are still a real signal of who's in play. Proceed to the web half,
and say plainly in the output that the call side is mention-frequency only.
If Zime offers a deeper transcript review (a "deep dive" or similar), tell
the user it's available rather than deciding for them.
- **Nothing** — say so and ask whether to widen the window or name competitors
directly. Do not web-search competitors you guessed.

Errors: `INTERNAL_ERROR` retry once. `UNAUTHORIZED` / `FORBIDDEN` means
re-authorize. If it fails twice, offer the web-only fallback and label it.

## Step 2 — Clean the list before searching

Zime returns raw mention data, which means the list needs judgment applied
before it's worth searching. Searching a junk list wastes the run and fills
the battlecard with irrelevance.

- **Collapse variants.** "Fireflies / Firefly variants" and "RFP.io / RFP IO"
are one competitor each, not two.
- **Drop what isn't a competitor.** Transcription mentions of general AI
tools, a platform you integrate with, or a name that surfaced because
someone said it in passing. If unsure whether something is a real
competitor, ask rather than silently cutting it — the user knows their
market and the answer takes them two seconds.
- **Rank by frequency and recency**, then take the top 3–5. More than five
and the battlecard stops being readable. Name the ones you set aside and
offer to run them.

With a long or noisy list, show the user the shortlist and let them adjust
before spending the searches.

## Step 3 — Web search each competitor

For each competitor, search the four axes. Two to four searches each is
usually right; more when results are thin or contradictory.


| Axis                    | What to look for                                                    | Query shape                                                        |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Launches                | new products, major releases, integrations, GA of a beta            | `<competitor> product launch <year>`, `<competitor> release notes` |
| Money &amp; headcount   | funding, acquisitions, being acquired, mergers, layoffs             | `<competitor> funding acquisition`, `<competitor> layoffs <year>`  |
| Pricing &amp; packaging | price changes, new tiers, free tier removed, seat model changes     | `<competitor> pricing change`, `<competitor> new plan tiers`       |
| Positioning             | repositioning, category claims, exec changes, notable customer wins | `<competitor> announcement`, `<competitor> CEO`                    |


### Search discipline

- **Confirm you have the right company.** Close-name collisions are common and
produce confidently wrong intel — Clari (revenue ops) versus Clario
(clinical trials) is a live example. Check that the industry, location and
product in a result match the competitor your calls actually referenced, and
discard results that don't.
- **Include the current year** in queries where recency matters, using the
actual current date rather than the year in training data.
- **Fetch the source** when a snippet is doing important work. Snippets get
truncated in ways that invert meaning — "considering raising prices" and
"raised prices" look alike in twenty words.
- **Prefer primary.** The company's own newsroom, blog, changelog, docs, or
regulatory filings beat aggregators and SEO content farms. A competitor's
pricing page beats a third-party "X pricing explained" article.
- **Watch undated newsroom pages.** Press-release index pages often list
years-old announcements with no visible date, which reads as current. Get a
date on the specific item or drop it.
- **Skip employee-review and anonymous-forum content.** Glassdoor threads,
Blind, Reddit venting. It's morale gossip, not competitive intelligence, and
putting it in front of a rep invites them to repeat it to a customer.
- **Flag conflicting figures rather than picking one.** Layoff trackers and
news outlets routinely disagree on headcount numbers. Two sources saying
different things is reportable as "reported between X and Y" — silently
choosing the bigger number is how a rep ends up corrected in a meeting.
- **Default freshness is the last six months.** Older items only when they're
still the current state of play, and then say how old they are.
- **Nothing found is a finding.** Write "no significant public movement found"
rather than padding with background about what the competitor does.

Paraphrase what sources say. Keep any direct quote short and use at most one
per source — the value is the synthesis, not reproduced copy.

## Step 4 — Join the two halves

This is where the skill earns its keep. For each competitor, work out which
applies and say so explicitly:

- **Closes a gap we were winning on** — customers raised a weakness and the
competitor just shipped the fix. Highest urgency; the current talk track is
about to go stale.
- **Confirms a gap we already exploit** — nothing shipped, the weakness
stands. Useful reassurance, worth dating.
- **Changes the commercial picture** — repricing, new tier, funding, layoffs,
a merger. Affects how a deal gets negotiated even when the product didn't
move.
- **Contradicts what our calls assume** — customers believe something about
the competitor that the public record doesn't support, or the reverse. Flag
it loudly; most valuable and most easily missed.
- **Not connected** — real news, no hook into any live deal. Keep it to a line
and say it's context only.

Don't manufacture a connection. If the two halves genuinely don't touch, the
honest line is "no link to anything raised in our calls", which tells a rep to
ignore it and move on.

## Output

Battlecard-style markdown, one block per competitor, most active first.

```markdown
# Competitor watch — [window] · [N] competitors

## [Competitor name]
**In our calls:** [N] mentions · [accounts if known] · most recent [date]

### What our customers said · _Zime call evidence_
| Account | What was said | When |
|---|---|---|
| [account] | [what the customer actually said] | [date] |

### What changed publicly · _web, searched [today's date]_
| What | When | Source |
|---|---|---|
| [launch / raise / merger / price change / positioning shift] | [date] | [publication or company newsroom] |

### So what
- **[Closes a gap / Confirms a gap / Commercial shift / Contradiction / Context only]** — [the specific link between the two tables, or the explicit absence of one]

### What to do about it
- [concrete move — a talk track to change, a deal to revisit, a question to start asking]

---

_Call evidence from Zime. Public updates from web search on [date] — reported, not verified with the competitor._
```

When the call side came back as names only, replace that table with a single
line — `Mentioned in calls; no per-account evidence available in this run` —
and keep everything else. Don't fabricate rows to fill the shape, and don't
drop the section, since its emptiness is part of what the reader is learning.

Rules for the output:

- **Keep the two tables separate.** Never move a web finding into the call
table to make a point land harder.
- **Every row is dated.** Undated competitive intel can't be used in front of
a customer and shouldn't be presented as intel.
- **Relay call evidence close to the agent's phrasing.** "They said the
integration worried them" is not "we're losing on integration".
- **Quotation marks mean a literal quote.** For call content that means it came
from `get_transcript`, not a paraphrase. Fetch it if the rep needs the line.
- **"What to do about it" must be actionable today.** "Monitor the situation"
is not an action. "Ask Swisscom directly whether the new tier changes their
budget" is.
- **Keep the footer.** Readers need to know the web half is unverified
reporting, not confirmed fact.

## Fallbacks

- **No zime-mcp connected** — ask which competitors to research, run the web
half only, and open with a line saying there's no call evidence in this run
so the "so what" is unanchored.
- **No web search available** — deliver the call evidence alone, say the web
half didn't run, and point at `competitive-intelligence`, which is the skill
built for calls-only.
- **User provides transcripts instead of Zime** — scan only those files for
competitor mentions and say the scan covers just what they gave you.

## Routing

- Customer evidence only, no market research → `competitive-intelligence`.
- Competitor dynamics inside one specific deal → `deal-strategy`.
- Turning this into a customer-facing battlecard or one-pager →
`create-sales-asset`.
- Prepping a specific upcoming call → `call-prep` / `prep_note`.

## What this sends where

To `ask_zime`: the question text, with the window and any account or deal
scope named inside it. To web search: the competitor name plus generic terms
about launches, funding, pricing and positioning. Account names, deal values,
customer quotes and anything else from the calls never go into a web query.
