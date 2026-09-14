---
name: account-research
description: "Research a new prospect company before you reach out. Checks if they fit our ICP and who the buyers might be. Use for companies not yet in CRM. For existing accounts, use get-account instead."
license: MIT
metadata:
  zime:skill-id: a996cb94-8af5-4b6d-ae1e-5bd2fe043782
  zime:tag: research
  zime:roles: ae,bdr
  zime:visibility: global
  zime:skill-version: 1
  zime:marketplace-version: 0.1.8
---

# Account Research

Researches a company **before** there's a relationship. The entity isn't in
CRM, there are no calls to read, and no Zime signals exist for it — so this
skill is web research with one grounding call, not a workspace lookup.

## What makes this different from every other skill here

Every other skill in this plugin resolves an entity in Zime and delegates to
an agent. This one inverts that:

- **No resolve step.** The prospect isn't in our CRM. If they were, the user
  wants `get-account`.
- **Claude web search is the primary source**, not a fallback.
- **`ask_zime` is called once, and not about the prospect.** It's called about
  *us* — to pull our ICP definition and what our won customers look like, so
  "do they fit" is measured against something real instead of a guess.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     ACCOUNT RESEARCH                             │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1 — GROUND THE BASELINE (once, about US)                   │
│  ✓ ask_zime: our ICP, our won-customer patterns                  │
├─────────────────────────────────────────────────────────────────┤
│  STEP 2 — RESEARCH THE PROSPECT (web search, primary)            │
│  ✓ What they do, size, funding, customers                        │
│  ✓ Their GTM / CS motion — how they sell and support             │
│  ✓ Buyers and likely champions                                   │
│  ✓ Trigger events: funding, hiring, launches, reorgs             │
├─────────────────────────────────────────────────────────────────┤
│  STEP 3 — SCORE THE FIT (Claude, against Step 1's baseline)      │
│  ✓ ICP scorecard with evidence per dimension                     │
│  ✓ Recommended angle and entry point                             │
├─────────────────────────────────────────────────────────────────┤
│  NEVER                                                           │
│  ✗ Invented headcount, revenue, or funding figures               │
│  ✗ A named "champion" with no source                             │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

```
/account-research <company name or domain>
```

Research the prospect: $ARGUMENTS

## Routing

- An **existing CRM account** — record, owner, industry → `get-account`. This
  skill is for companies not yet in CRM.
- A deal already in flight → `deal-strategy`.
- A competitor rather than a prospect → `competitive-intelligence` (which
  reads our calls, not the web).
- Building the outreach asset after research → `create-sales-asset`.

## What I Need From You

The company name, ideally with a domain. Helpful additions:

- **Who you'd be selling to** (CS leader, VP Sales, RevOps) — focuses the
  buyer research
- **Why they're on your list** — inbound, a trigger event, a referral

If the company turns out to already be in CRM, say so and offer
`get-account` rather than researching them as new.

## MCP mode (when zime-mcp is connected)

**Required tool:** `ask_zime`, used once for the baseline.

### Step 1 — pull our own ICP baseline

```json
{ "question": "What is our ICP definition, and what do our won customers have in common — company size, industry, GTM motion, team structure, and the pains that made them buy?" }
```

Do this **first**. Without it, the fit assessment is Claude's prior about what
a good customer looks like rather than ours. If `ask_zime` returns nothing
useful on ICP, say the fit assessment is unanchored and label the scorecard as
provisional — don't quietly substitute a generic B2B SaaS ICP.

Note: `ask_zime` cannot tell you anything about the prospect. It only sees our
workspace. Asking it about a company we've never spoken to will correctly
return nothing.

### Step 2 — web research

Run these searches and cite what you use:

1. `[company]` — homepage, what they sell, positioning
2. `[company] customers` / case studies — who they serve
3. `[company] funding` — stage, amount, investors, date
4. `[company] careers sales` OR `careers customer success` — GTM motion and
   team shape; open roles are the strongest public signal of how they sell
5. `[company] leadership` — likely buyers and their backgrounds
6. `[company] news` — trigger events in the last 90 days
7. `[buyer name] LinkedIn` — background for named individuals

Extract only what the sources say. If a source doesn't state headcount, the
scorecard says headcount is unknown.

## Output

```markdown
# Prospect research: [Company]

**Researched:** [date] · **Sources:** web search[ + Zime ICP baseline]

## Quick take
[3 sentences: who they are, why they might need us, the sharpest angle.]

## Company profile
| Field | Value | Source |
|---|---|---|
| What they do | [description] | [link] |
| Size | [headcount, or unknown] | [link] |
| Funding | [stage, amount, date] | [link] |
| Customers | [who they serve] | [link] |

## How they sell and support
| Dimension | What we found | Source |
|---|---|---|
| Sales motion | [direct / channel / PLG / hybrid] | [link] |
| Team shape | [dedicated AEs? generalists? CS function?] | [link] |
| Tooling | [CRM, call recorder, support tool if public] | [link] |
| Scale pressure | [account:CSM ratio, growth signals] | [link] |

## Likely buyers
### [Name] — [Title]
- **Background:** [prior roles] · [LinkedIn]
- **Why they'd care:** [tie to a pain we solve]

## ICP fit
**Verdict: [strong fit / partial fit / poor fit / insufficient data]**

| ICP dimension (ours) | Their signal | Fit |
|---|---|---|
| [dimension from Step 1] | [evidence + source] | ✅ / ⚠️ / ❌ / ❓ |

**Why:** [2-3 sentences against the baseline, not against generic ideals.]

## Trigger events
- **[event]** — [date] — [why it creates an opening] — [source]

## Recommended approach
- **Entry point:** [person and why them]
- **Opening hook:** [the specific thing to lead with]
- **Discovery questions:** [3, aimed at the gaps marked ❓ above]

## Gaps
- [what we could not establish, and how to find out]

## Sources
- [title](url)
```

### Rules

- **Every factual row cites a source.** A company profile without links is
  indistinguishable from a guess.
- **Unknown is a valid cell.** Never fill headcount, revenue, or funding with
  a plausible number — a made-up figure in a research brief gets quoted back
  in a pitch.
- **A named buyer needs a source.** No inventing a "likely champion".
- **Score against Step 1's baseline, not a generic ICP.** If the baseline is
  missing, label the verdict provisional.
- **`insufficient data` is a real verdict.** Prefer it to a confident score
  built on two thin sources.
- Keep the Gaps section — it becomes the discovery agenda.

## Tips

1. **Give the domain** — disambiguates common company names immediately.
2. **Say who you'd sell to** — sharpens the buyer research considerably.
3. **Careers pages are the best public GTM signal** — who they're hiring tells
   you how they sell.
4. **Already a customer?** You want `get-account`, not this.

## Standalone mode (no zime-mcp connected)

Web search alone still produces the full brief. Skip Step 1, and label the ICP
section provisional, stating plainly that fit was assessed without our own ICP
definition. Everything else is unchanged — this skill's primary source doesn't
depend on Zime.

## What this sends where

MCP mode sends one question about **our** ICP to the zime-mcp server — never
the prospect's name, since Zime has no data on them. Web searches send the
prospect's public name to the search tool.

## Related Skills

- **get-account** — a company already in CRM
- **create-sales-asset** — build the outreach asset from this research
- **call-prep** — once the first meeting is booked
