# Onboarding flow

Reconnaissance-first analysis for an **unfamiliar codebase**. Produces a scannable onboarding guide and optionally a starter or enhanced `CLAUDE.md`. Do not read every file — use Glob and Grep, then read selectively. Stack here is *detected*. Do not recommend a next framework — that is `super-tech-blueprint`.

## When this mode alone

- First session in a repo, new team, "onboard me", "walk me through this repo"
- "Help me understand this codebase"
- "Generate or update CLAUDE.md" (Phases 1–3; skip the long guide if user only wants CLAUDE.md)

## Phase 1: Reconnaissance

Run in parallel:

1. **Package manifests** — `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `mix.exs`, `pubspec.yaml`
2. **Framework fingerprint** — `next.config.*`, `nuxt.config.*`, `vite.config.*`, Django settings, FastAPI entry, Rails config, etc.
3. **Entry points** — `main.*`, `index.*`, `app.*`, `server.*`, `cmd/`, `src/main/`
4. **Directory snapshot** — top two levels, ignoring `node_modules`, `vendor`, `.git`, `dist`, `build`, `__pycache__`, `.next`
5. **Tooling** — ESLint, Prettier, `tsconfig.json`, Makefile, Dockerfile, CI under `.github/workflows/`, `.env.example`
6. **Tests** — `tests/`, `__tests__/`, `*_test.go`, `*.spec.ts`, runner configs

## Phase 2: Architecture mapping

From recon, document:

- **Tech stack** — languages, frameworks, DB/ORM, build, CI/CD
- **Architecture pattern** — monolith, monorepo, microservices, serverless; API style
- **Key directories** — top-level map with purpose
- **Data flow** — one request from entry → validation → logic → persistence → response

## Phase 3: Convention detection

- File and test naming
- Error handling, DI, state, async style
- Git: branch names, commit style, PR workflow (skip if history shallow or empty)

## Phase 4: Artifacts

### Output 1: Onboarding guide (conversation)

Use this structure:

```markdown
# Onboarding Guide: [Project Name]

## Overview
[2–3 sentences]

## Tech Stack
| Layer | Technology | Version |

## Architecture
[Diagram or prose]

## Key Entry Points
- **…**: `path/` — purpose

## Directory Map

## Request Lifecycle

## Conventions

## Common Tasks
- **Run dev**: `…`

## Where to Look
| I want to… | Look at… |
```

Replace placeholders with detected paths and commands.

### Output 2: Starter CLAUDE.md (file)

If `CLAUDE.md` exists, read it first and **enhance** — preserve project-specific instructions; note what you added.

Sections: Tech Stack, Code Style, Testing, Build & Run, Project Structure, Conventions. Keep under ~100 lines; no dependency laundry list; no restating obvious folder names.

## Best practices

1. Verify from code when config and usage disagree — trust the code.
2. Flag unknowns instead of guessing.
3. Do not copy the README — add structure and entry points the README lacks.

## Examples

| User | Action |
|------|--------|
| "Onboard me" | Full Phases 1–4 → guide in chat + `CLAUDE.md` |
| "Generate CLAUDE.md" | Phases 1–3 → file only |
| "Update CLAUDE.md" | Read existing → Phases 1–3 → merge with clear deltas |
