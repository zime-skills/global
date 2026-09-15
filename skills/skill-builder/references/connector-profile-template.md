# Connector profile: <name>

Fill this in once per connector. Skill Builder reads it to know which tool
resolves a record, which tool answers, what each returns, and what the skills
built on it must promise. If the connector is connected in this chat, the tool
descriptions are the source; copy names and arguments exactly.

## Identity

- **Connector:** <name as it appears in Claude>
- **Server URL:** <https://…>
- **Sign-in:** <how a user authenticates; what scope of data they see>
- **Cost:** <which tools consume credits or quota, if any>

## Tools

| Tool | Job | Resolves or answers? | Cost |
|---|---|---|---|
| `<tool>` | <one line> | resolve / answer / both | <free / credits> |

### `<tool>`

- `<arg>` — <meaning; where time hints go; defaults>
- `<arg>` — <pin argument, if any, and where its value comes from>

**Returns:** <the shape; the status values; what an ambiguous result looks
like; what "not found" means and what it does not mean>

**Errors:** <codes and what the skill should do for each>

*(Repeat per tool.)*

## Which tool for which job

| The user wants | Resolve with | Answer with |
|---|---|---|
| <job> | `<tool>` | `<tool>` or "stop, return the record" |

## House rules skills on this connector must state

- <e.g. Never answer from memory while the tool is available.>
- <e.g. Relay agent output as-is.>
- <e.g. Which tool is the only source of quotable text, if any.>
- <e.g. Time words: in the query, or in date fields?>

## Local mode conventions

- <File types a skill can fall back to, and the caveat line it opens with.>

## Output conventions

- <Header fields to show. Footer line naming the source.>
- <Whether analyses render as an artifact, and the colour rules.>

## Sibling skills

<Slugs of the skills already published on this connector, so new skills can
route to them and avoid building the same thing twice.>
