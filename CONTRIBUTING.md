# Contributing to Zime GTM Skills

Thanks for helping make Claude better at go-to-market work. This guide explains how skills get into this repository, what a good skill looks like, and what to do when you find a problem.

## This repository is generated

`skills/` and `.claude-plugin/` are rendered by the Zime skills publisher from the Zime database. Every publish rebuilds them. **A pull request that edits those paths will be overwritten**, so please do not send one.

Pull requests are welcome for everything else: this guide, the README, issue templates.

## How to contribute a skill

1. Sign in to the [Zime dashboard](https://app.zime.ai), open **Skills**, and choose **New skill**.
2. Write it. The **Skill Builder** skill in this catalogue can draft one from a plain-language request and knows the Zime connector's tools.
3. Set the visibility to **Open source** and publish.

Your skill is scanned, rendered into this repository on the next publish run, and listed on [zime.ai/gtm-skills](https://zime.ai/gtm-skills) with your name, role, company and, if you add it, your LinkedIn profile. Publishing open source always credits the author; that recognition is the point.

## How to improve an existing skill

Only a skill's author can edit it. If you see a way to make one better:

- Open an issue here titled with the skill's slug, for example `follow-up: handle calls with no next step`. Describe what went wrong and what you expected.
- Or publish your own variant under a different name. Say in the description how it differs.

## What a good skill looks like

**The description is the trigger.** Claude reads it to decide whether to use the skill, so write it as the requests a person would actually make: "Use for 'prep me for my 3pm', 'what should I know before the Acme call'". Say what the skill does not cover. Keep it under 1,000 characters so it also fits claude.ai's skill library.

**The body is the playbook.** In this order:

1. What the skill produces and for whom.
2. How to resolve what the user means (which call, which deal) and what to do when it is ambiguous.
3. Which Zime tools to call and in what order.
4. The shape of the answer.
5. Guardrails: use only real evidence from calls and CRM, never invent quotes or numbers, never send anything on the user's behalf, say plainly when something is unknown.

**Naming and metadata**

- Slug: `kebab-case`, a verb or the thing it produces (`call-prep`, `follow-up`, `review-account`).
- Category: one of `workflow`, `research`, `communication`, `intelligence`, `execution`.
- Roles: pick the roles it serves (AE, SE, BDR, Marketing, PM, CS).
- Reference files live in `references/`, `assets/` or `scripts/` only.

**Tone.** Write for a sales rep, not a developer. Short sentences, plain words, no jargon the reader would not use themselves.

## Content rules

Every publish runs a content scan. A skill is held, not published, if it contains:

- Links to any host other than `zime.ai` subdomains, `docs.anthropic.com` or `support.anthropic.com`.
- Anything that looks like a credential, token or API key.
- Instructions that try to override Claude's own guidance or another skill.
- Hidden characters such as zero-width spaces.

Also do not include customer names, deal values or call excerpts from real accounts in the skill text itself. The skill should fetch that at run time through the connector.

## Testing before you publish

Run the skill in Claude against a real call or deal you have access to. Check that:

- It triggers on the phrasings in its description and not on unrelated ones.
- Every fact in the answer traces back to a call or CRM record.
- It says "unknown" rather than guessing when the evidence is not there.

## Reporting problems

- **A skill gives wrong or made-up output:** open an issue with the skill slug, the prompt you used, and what came back. Redact customer details.
- **Install or connector problems:** support@zime.ai.
- **Security concerns:** email support@zime.ai with "security" in the subject rather than opening a public issue.

## Code of conduct

Be respectful and specific. No harassment, no spam, no sharing of confidential customer information. Maintainers may close issues or decline contributions that do not meet this bar.

## License

By publishing a skill as open source you agree that it is released under the [MIT License](LICENSE), the same license as everything else here. You keep the credit; everyone gets to use it.
