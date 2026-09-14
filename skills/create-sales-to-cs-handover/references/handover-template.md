# Handover template — full field list

The complete Sales → CS handover fields, with the fill rule for each. Mirrors
the Zime Ignite handover template CS validates against.

## The fill rule

Each field is one of three kinds:

| Kind | Meaning | If unavailable |
|---|---|---|
| **Z** | Zime data can fill it (calls, CRM, signals) | mark the gap, don't guess |
| **R** | Rep-only — not reliably in call data | `[SALES TO FILL]`, always |
| **M** | Mixed — Zime gives a draft, rep confirms | fill + flag for confirmation |

**R fields are never inferred.** Not from context, not from what similar
accounts look like, not from what a call implies. CS treats this document as
authoritative; a fabricated R field becomes a real instruction.

## Header

| Field | Kind | Notes |
|---|---|---|
| Handover by (Sales) | R | |
| Handover date | R | |
| Handover to (CS) | R | |
| CS owner | R | |
| Company drive folder | R | link |
| POC resources sheet | R | link |
| Sales deck | R | link |

## Acceptance checklist

All **R**. Sales ticks these; CS validates and accepts only when all are
confirmed. Reproduce the list unticked — never pre-tick on the rep's behalf.

- NDA signed
- POC charter signed by DM
- NDA/charter links in the onboarding tracker
- Silence-clause acknowledged in writing
- Client objections documented and handling agreed
- Client initiative confirmed, with an ROI target
- Deal stage identified for the POC brain
- Exit criteria filled in
- API access confirmed OR sample calls received
- Playbook resources shared (tribal knowledge, SOPs, QBR template)
- Decision maker name, role, and demo slot confirmed
- Champion name and seniority confirmed
- Drive folder created and shared
- Slack channel created
- What-NOT-to-do list completed
- At least one open question or risk flagged for CS

## 1. Legal and commercial status

| Field | Kind |
|---|---|
| NDA link | R |
| POC charter link | R |
| Post-POC commercial terms | R |
| Pilot cohort / seat count | M |

## 2. Client context

| Field | Kind | Source when Z |
|---|---|---|
| Client name and website | Z | CRM account record |
| What they do | M | calls + web; confirm with rep |
| Sales motion | Z | calls |
| Team size and structure | Z | calls — quote the number stated |
| Their tooling | Z | calls — what they said they use |

## 3. Stakeholders

Per person — **Z**, each row sourced to a call and date:

| Field | Notes |
|---|---|
| Name | as stated on calls |
| Title | as stated |
| Role in POC | champion / decision maker / economic buyer / user |
| Motivation | what they said they care about — close to their phrasing |
| Posture | engaged, sceptical, deferring — only if calls support it |
| Source | call + date |

Never promote someone to "champion" because they spoke most. A champion is
someone who advocated for us, and the call should show it.

| Field | Kind |
|---|---|
| Discovery call slot confirmed | R |
| Demo slot confirmed | R |
| Who must NOT be engaged, and why | R |

## 4. Why we won

**Z.** Each hook needs evidence, a speaker, and a date. These become the
narrative CS uses in every interaction, so a fabricated hook propagates
indefinitely.

| Field | Kind |
|---|---|
| Primary pain | Z |
| Key hooks that landed | Z |
| What Sales committed to deliver | Z — from commitments on calls |
| What was NOT committed | M — Zime may show it; rep confirms |

## 5. Initiative and success criteria

| Field | Kind |
|---|---|
| Primary initiative | M |
| ROI they are targeting | Z — quote the target they stated |
| Deal stage the POC focuses on | M |
| Success criteria | M — must be specific and measurable |
| Secondary use cases (out of scope) | R |

## 6. Current state — how they solve this today

**Z**, from calls:

- How they record and review calls today
- How CRM is updated today
- What has been tried and failed
- Biggest gaps in current behaviour

Where calls are silent, say so — "not discussed on any call" is honest and
tells CS what to ask.

## 7. Recordings, deal data, materials

| Field | Kind |
|---|---|
| Call history (dates, types, attendees) | Z — from list_meetings |
| Last engagement date | Z |
| Observed cadence | Z |
| Sample call details sheet | R |
| API access keys | R |

## 8. Marching orders for CS

| Field | Kind |
|---|---|
| What CS/FDE should focus on first | M — draft from calls, rep confirms |
| Key things to do in the first interaction | M |
| **Key things NOT to do — sensitivities** | **R — never infer** |

The sensitivities field is the single most dangerous one to guess. "Don't
mention Salesforce as a data source" is the kind of instruction that only
exists in a rep's head, and inventing one changes CS behaviour on real calls.

## 9. Open questions and blockers

**Z + R.** Zime can surface unresolved objections from calls; the rep adds what
they know is unresolved commercially. List both, sourced where possible.

## 10. Objections — why the deal can still fail

**Z.** Each with the account context, who raised it, the date, and current
status.

## 11. Additional context

**R.** Travel, timing, relationship dynamics, hiring plans — anything the rep
knows that shapes how CS should engage.

## Output discipline

- Open with the blocking-gaps checklist so CS reads it first.
- Every Z row carries its source (call + date).
- Every R field reads exactly `[SALES TO FILL]` — consistent and greppable.
- Never silently drop a field because it's empty. An omitted field looks
  answered; a marked one gets chased.
