# Zime GTM Skills for Claude

**Open-source sales skills for Claude, grounded in your real calls, deals and accounts.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-11-orange.svg)](#the-skills)
[![Browse the catalogue](https://img.shields.io/badge/browse-zime.ai%2Fgtm--skills-fe7f50.svg)](https://zime.ai/gtm-skills)
[![Claude plugin](https://img.shields.io/badge/claude-plugin%20marketplace-8a6cff.svg)](#install-in-claude)

This repository is the public catalogue of GTM skills published open source by the Zime community. Each skill is a reusable instruction set (`SKILL.md`) that teaches Claude how to do one go-to-market job well: prepare for a sales call, write the follow-up, review a deal, brief you on your day, or build a battlecard from what customers actually said.

Every skill runs on the [Zime MCP connector](https://claude.ai/directory/zime), so Claude works from your recorded calls, CRM deals and accounts instead of guessing. Browse them with full text and author credits at **[zime.ai/gtm-skills](https://zime.ai/gtm-skills)**.

## What is a GTM skill?

A skill is a folder with a `SKILL.md` file. The file's `description` tells Claude when to use it, and the body tells Claude how: which Zime tools to call, how to resolve which call or deal you mean, what the answer should look like, and what it must never do (invent a quote, guess a number, send an email on your behalf).

Skills are written for sales reps, sales engineers, BDRs, customer success, marketing and product managers. They read like a good colleague's playbook, not like code.

## The skills

| Skill | What it does | Category |
|---|---|---|
| [account-research](https://zime.ai/gtm-skills/account-research) | Research a prospect company before outreach: ICP fit and likely buyers. For companies not yet in CRM. | Research |
| [actions-commitments](https://zime.ai/gtm-skills/actions-commitments) | Open action items and commitments: who promised what, by when. One call, one deal, or a whole account. | Execution |
| [call-prep](https://zime.ai/gtm-skills/call-prep) | A prep note before an upcoming call: the biggest risk and two or three things to do. | Workflow |
| [competitive-intelligence](https://zime.ai/gtm-skills/competitive-intelligence) | What customers actually say about competitors, with real quotes from real calls. | Intelligence |
| [create-sales-asset](https://zime.ai/gtm-skills/create-sales-asset) | Account review decks, one-pagers, battlecards, case studies and objection talking points from customer evidence only. | Communication |
| [create-sales-to-cs-handover](https://zime.ai/gtm-skills/create-sales-to-cs-handover) | The Sales to Customer Success handover doc for a deal or account: stakeholders, why we won, open objections, commitments. | Workflow |
| [daily-briefing](https://zime.ai/gtm-skills/daily-briefing) | Your day at a glance: today's meetings, what changed on your deals, what needs attention. | Workflow |
| [follow-up](https://zime.ai/gtm-skills/follow-up) | The follow-up email after a call, using only what was said. Always a draft for you to review. | Communication |
| [review-account](https://zime.ai/gtm-skills/review-account) | One account, one deal or the whole pipeline, as a CRM record or a grounded analysis of risk and next steps. | Intelligence |
| [review-call](https://zime.ai/gtm-skills/review-call) | One call at any depth: the record, a structured recap, or the exact words from the transcript. | Intelligence |
| [skill-builder](https://zime.ai/gtm-skills/skill-builder) | Builds a new Claude skill from a plain-language request, using the Zime connector's tools correctly. | Workflow |

Each skill's full `SKILL.md`, reference files and author are on its page at [zime.ai/gtm-skills](https://zime.ai/gtm-skills).

## Install in Claude

You need a Zime account. The skills call the Zime MCP connector for calls, deals and accounts.

**Claude Code**

```
/plugin marketplace add zime-skills/zime-skills
/plugin install zime-skills@zime-skills
```

The plugin bundles the connector configuration (`.mcp.json`), so Claude Code prompts you to sign in to Zime the first time a skill runs.

**claude.ai (Team and Enterprise)**

1. Connect Zime from the [Claude directory](https://claude.ai/directory/zime). Workspace owners connect it for the whole team.
2. In Organization settings, open **Plugins**, choose **Add plugins**, then **Sync from GitHub**, and pick `zime-skills/zime-skills`.
3. Skills appear under `/` in every chat.

**One skill at a time**

Open the skill on [zime.ai/gtm-skills](https://zime.ai/gtm-skills) and download it as a `.zip` to upload under Customize, Skills in claude.ai.

## Example prompts

- "Prep me for my 3pm with Acme."
- "Recap yesterday's Northwind demo and list what we committed to."
- "Why is the Globex deal at risk?"
- "Draft the follow-up for this morning's call."
- "What are customers saying about Gong this quarter?"
- "Build a battlecard against Competitor X from our calls."

## How skills get here

Skills are written in the Zime dashboard and published with the **Open source** visibility. The Zime skills publisher renders every open-source skill into this repository and lists it on [zime.ai/gtm-skills](https://zime.ai/gtm-skills), credited to its author by name, role and company.

That means `skills/` is generated, along with the `version` and `name` fields in `.claude-plugin/plugin.json`. Do not edit them by hand; the next publish overwrites them. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or improve a skill.

## Data and privacy

Every skill calls the Zime MCP connector (`https://mcp.zime.ai/mcp`), which reads your workspace's recorded calls, CRM deals, accounts and contacts, including people's names and email addresses. Questions sent to Zime are stored in your Zime workspace as conversation history, and prep notes are cached so repeat requests return quickly. Each skill also starts by calling the connector's `skill_used` tool, which records which skill ran and when so Zime can measure usage; nothing from your conversation is sent with it.

Three skills can also send data outside Zime:

| Skill | What is sent | Where |
|---|---|---|
| account-research | The prospect company's and people's public names | Claude's web search |
| create-sales-asset | The finished asset | Your Google Drive or Google Slides connector, only if you have connected one |
| create-sales-to-cs-handover | The finished handover doc | Your Google Drive connector, only if you have connected one |

No skill sends email, writes to your CRM, or runs code. Each skill's "What this sends where" section lists exactly which fields go to which tool. See the [Zime privacy policy](https://zime.ai/privacy-policy).

## Frequently asked questions

**Do the skills work without Zime?**
No. They are grounded in your recorded calls, CRM deals and accounts through the Zime MCP connector. Without it Claude has nothing real to work from.

**Can I use these commercially?**
Yes. Everything here is MIT licensed. See [LICENSE](LICENSE).

**Who wrote them?**
Zime's team and Zime customers. Each skill's page on zime.ai/gtm-skills names the author.

**Where do I report a problem with a skill?**
Open an issue in this repository or write to support@zime.ai.

## About Zime

[Zime](https://zime.ai) is a revenue intelligence platform. It records and analyses sales calls, tracks deals and accounts, and gives Claude and other AI agents grounded access to that evidence through the Zime MCP connector at `https://mcp.zime.ai/mcp`.

## License

[MIT](LICENSE). Copyright (c) 2026 Inner Fit Research Inc. (Zime).
