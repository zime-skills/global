# Zime global skills

The global tier of the Zime Skill Tree: every skill a Zime user has published
with visibility **Global**, rendered here by the Zime skills publisher.

**Do not edit by hand.** The database is the source of truth. Every publish
rebuilds `skills/` and `.claude-plugin/plugin.json` from Postgres and
force-moves `main`; a hand commit to those paths is overwritten on the next run.

The same skills are also rendered into every tenant's own marketplace repo, so
a customer installs one plugin and receives the globals with it. This repo is
the canonical copy: the publisher stamps a global skill's published state from
commits here, and the version in `plugin.json` is the global catalogue's semver.

## License

The skills in this repository are released under the [MIT License](LICENSE).
Every `SKILL.md` carries `license: MIT` in its frontmatter, and the plugin
manifest declares the same. Copyright (c) 2026 Inner Fit Research Inc. (Zime).
