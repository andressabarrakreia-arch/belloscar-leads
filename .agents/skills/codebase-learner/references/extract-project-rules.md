# Extract project rules

Discover coding conventions and architectural patterns in the **current repo**, then offer to persist them as Claude Code rules under `.claude/rules/`. Orchestrator workflow; deep analysis may delegate to a `learn-analyst` sub-agent if available.

## When this mode alone

- "Learn from this project", "extract project rules", "discover patterns", "auto-generate rules"
- Codify conventions after joining a project
- Before a large feature so the agent follows local standards

**Not the same as deep-read** — this mode hunts repeatable conventions with evidence, not line-by-line reading.

## Phase 1: Project context

1. Confirm project root markers (`package.json`, `go.mod`, `pyproject.toml`, `.git/`, etc.)
2. Scan existing rules: `.claude/rules/`, `CLAUDE.md`, `AGENTS.md`, `.cursorrules`
3. Rough size: manifest files at depth 1, approximate source file count
4. Briefly tell the user what you found before analysis

## Phase 2: Deep analysis

If a `learn-analyst` agent exists, delegate synchronously with a prompt to return classified findings as JSON.

Otherwise perform the same work inline: discovery, pattern extraction, classification, prioritization.

## Phase 3: Filter

- Each finding: clear title, evidence from ≥2 files, impact ≥4, well-formed markdown body
- Deduplicate against existing `.claude/rules/`
- Present top 3 by impact (or fewer if nothing strong remains)

## Phase 4: User approval

Present findings with impact scores. **Never write files without explicit approval** (save all / choose / cancel).

## Phase 5: Persist

For each approved rule:

```bash
mkdir -p .claude/rules
```

- Filename: kebab-case from title (e.g. `api-response-envelope-convention.md`)
- If file exists, ask replace / merge / skip
- Write analyst-formatted content; list paths saved

## Constraints

1. Project-local only — never global rule paths
2. Analysis is read-only until Phase 5
3. Evidence-based — no invented patterns
4. One convention per rule file
5. Large monorepos: representative sampling is acceptable

## After save

Recommend committing `.claude/rules/` so the team shares them.
