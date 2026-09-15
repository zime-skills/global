# Zime global skills

The global tier of the Zime Skill Tree: every skill a Zime user has published
with visibility **Global**, rendered here by the Zime skills publisher.

This is a skills repo, not a plugin. There is no plugin manifest and no
connector: each directory under `skills/` is one standalone skill you can read,
clone or link on its own.

**Do not edit by hand.** The database is the source of truth. Every publish
rebuilds `skills/` from Postgres and force-moves `main`; a hand commit there is
overwritten on the next run.

Customers never install this repository. The same skills are rendered into each
tenant's own marketplace repo alongside their team's skills, and that plugin is
what carries the Zime MCP connector. This repo is the canonical, browsable copy.
