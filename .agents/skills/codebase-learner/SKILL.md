---
name: codebase-learner
description: "Learn how a codebase works today, read-only: explain one flow or subsystem ('how does X work', walkthroughs, 'where should this live', 'which package owns this'), onboard onto a repo, deep-read it, write ARCHITECTURE.md of what exists, diagnose layering and architecture smells, extract conventions into rules, or plan site IA of the product as built. Splits a wide question into parallel explorer subagents, then one explainer writes a senior-engineer mental model. Use when onboarding, priming context, mapping modules and data flow, or before changing unfamiliar code. Not for why code is shaped this way (trace), reviewing a diff (second-opinion), or choosing a target stack, TCO, greenfield design or a migration blueprint (super-tech-blueprint)."
metadata:
  version: 1.0.0
  author: levistack
  license: MIT
  group: knowledge
  category: knowledge
  department: knowledge
  related_skills:
    - trace
    - research
    - create-agents-md
  tags:
    - onboarding
    - architecture
    - map
  capabilities:
    - codebase_explanation
  languages:
    - en

---

# Codebase learner

Answers **how does this codebase work today?** Current state only: one flow explained, onboarding, deep-read, architecture docs of what exists, smells and layering of existing code, conventions, site IA of the product as built.

**Not for** inventing a target stack, TCO, greenfield design or a migration blueprint. That is `super-tech-blueprint`. After this skill maps the current state, hand off there for *what to build toward*.

## Hard rules

1. **Read-only.** No code edits, migrations, deploys or writes to shared systems, in every mode. The only files this skill writes are the documents a mode names (`ARCHITECTURE.md`, `CLAUDE.md`, `.claude/rules/`, an HTML report), and only after the user agrees. After any subagent returns, check that `git status` did not change.
2. **Cite paths and symbols.** Every non-obvious claim names a file or function that was actually read.
3. **Label gaps.** Mark a claim `unknown` when nobody opened the source.
4. **Explain, do not justify.** "Why we chose this" is `trace`. Say what the code does.

## Router

Pick a mode from the user's words, and load only that reference. Combine modes only when the user asks for both.

| If the user wants… | Mode | Load |
|---|---|---|
| How one flow, module or subsystem works, a walkthrough, where a change should live, who owns a behavior | **explain** | [explainer-prompt](references/explainer-prompt.md), [explorer-prompt](references/explorer-prompt.md) |
| Read everything, prime, get up to speed on code | **deep-read** | [deep-read-protocol](references/deep-read-protocol.md) |
| Join a repo, onboarding guide, understand the codebase, CLAUDE.md | **onboard** | [onboarding-flow](references/onboarding-flow.md) |
| Document architecture, ARCHITECTURE.md, map the system, "edit here for X" | **summarize** | [architecture-doc-template](references/architecture-doc-template.md) |
| Write reader-facing docs, API reference or doc comments, or check docs after a change | **document handoff** | `create-documentation`. Use **explain** first only when code facts are missing |
| Current architecture friction, shallow modules, layering smells, HTML architecture review | **diagnose** | [diagnose-current-architecture](references/diagnose-current-architecture.md) |
| Learn from the project, extract rules, discover conventions | **extract-rules** | [extract-project-rules](references/extract-project-rules.md) |
| Sitemap, site structure, page hierarchy, IA, nav design, URL plan of a marketing site | **site-ia** | [site-information-architecture](references/site-information-architecture.md) |
| Compare frameworks, pick a stack, TCO, greenfield blueprint, migrate *to* X | **not this skill** | `super-tech-blueprint` |

**Precedence:** explicit user wording beats defaults. If unclear, prefer **explain** for a question about one area, **onboard** for a new repo, **summarize** when they ask for a durable doc, **diagnose** when they ask what is wrong with the architecture *as it is*.

**Disambiguation**

- "How does X work?" about one area → **explain**. About the whole repo → **onboard**.
- Repo folders, APIs, modules → **explain**, **onboard**, **summarize**, **diagnose** or **deep-read**, not **site-ia**.
- Marketing pages, header nav, `/blog/slug` URLs → **site-ia**, not **summarize**.
- "Learn the codebase" without "every file" → **onboard**. With insistence on an exhaustive read → **deep-read**.
- "Create onboarding docs" for developers → **summarize** (file) or **onboard** (chat guide). Ask if they want `ARCHITECTURE.md` on disk.
- "Improve the architecture" meaning *document or smell the current tree* → **diagnose** (optionally after **summarize**). Meaning *pick a new stack or target shape* → **not this skill**, load `super-tech-blueprint`.

## Subagents

| Role | Spawn | Model |
|---|---|---|
| Explorer | `explorer` agent (read-only tools) | omit `model` to use the session model, or `sonnet` for a wide, cheap sweep |
| Explainer | `general-purpose`; the brief says "do not edit files" | `opus` |
| Bulk reader (deep-read, huge files) | `bulk-reader` agent | its own small model. Facts only; judgment stays with the explainer |
| Docs harvest (onboard, extract-rules) | `context-harvester` agent | omit `model` |

No subagents in this host? Do each angle yourself, one after another, then write the result with the same template.

## How every mode explores

**explain** runs these four steps end to end. **onboard**, **summarize**, **diagnose** and **deep-read** use steps 1 to 3 to gather facts on a wide repo, then write their own template instead of step 4's output.

### 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Explore and explain in one pass in this session, with `references/explainer-prompt.md` minus the explorer-findings section. Go to step 4.
- **Complex** (a subsystem across several files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

### 2. Explore (complex only)

Split the question into 2 to 4 angles, each a distinct slice of the subsystem (for example entry points, data and state, ownership and boundaries, failure paths). Spawn all explorers in one message, each with `references/explorer-prompt.md` and its angle filled in.

### 3. Synthesize (complex only)

When every explorer has returned, spawn one explainer with `references/explainer-prompt.md` and all explorer findings filled in.

### 4. Present

Present the explainer's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

When the user asked where a change should live, end with **Put it here**: the file or module, the reason in one line, and the layer it must not leak into.

## Output format

**explain:** use the sections in `references/explainer-prompt.md` and drop any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.

Other modes use their own template, and keep the same sections where they fit (an onboarding guide still has Where Things Live and Gotchas).

## Mode summaries

### explain

One question about one area, answered as a mental model a senior engineer can work from. Read-only, no files written.

### deep-read

Full-file read of the source tree. Highest token cost, so use it when fidelity matters more than speed. Hand very large files to `bulk-reader`. See the protocol reference.

### onboard

Fast recon with Glob and Grep, an onboarding guide in chat, and an optional `CLAUDE.md`. It does not read every file. Stack facts here are *detected*, not recommended.

### summarize

Produces or updates `ARCHITECTURE.md` (or an equivalent) with diagrams, entry points, how-to sections and a checklist from the template. It describes what the code does today. Do not invent a next stack in that file.

### diagnose

Scans existing code for architectural friction (shallow modules, leaked seams, hot spots) and presents candidates as a temporary HTML report. In-place deepening stays here and in `challenge-me` (**grill-docs**). A new stack or migration target is a handoff to `super-tech-blueprint`. Report scaffold: [html-architecture-report](references/html-architecture-report.md).

### extract-rules

Evidence-based convention discovery, optionally with `context-harvester` for existing docs. Writes `.claude/rules/` only after the user approves.

### site-ia

Business-site planning: ASCII hierarchy, Mermaid visual sitemap, URL map, nav spec, internal linking. Deep dives: [site-type-templates](references/site-type-templates.md), [navigation-patterns](references/navigation-patterns.md), [mermaid-templates](references/mermaid-templates.md). Site-IA eval scenarios: [evals/evals.json](evals/evals.json).

## Combined flows

| Request | Order |
|---|---|
| "How does auth work, then document it" | **explain** → **summarize** (reuse the findings, do not re-explore) |
| "Onboard me and write architecture docs" | **onboard** → **summarize** (reuse recon, avoid re-scanning) |
| "Learn everything then extract rules" | **deep-read** → **extract-rules** |
| "Document the app and plan our marketing site" | **summarize** then **site-ia** (separate deliverables) |
| "Review architecture then propose a target stack" | **diagnose** (and **summarize** if there is no current-state doc) → hand off to `super-tech-blueprint` |

## References (bulk detail)

| File | Origin |
|---|---|
| [explainer-prompt.md](references/explainer-prompt.md) | pstack `how` (MIT) |
| [explorer-prompt.md](references/explorer-prompt.md) | pstack `how` (MIT) |
| [deep-read-protocol.md](references/deep-read-protocol.md) | learn-codebase |
| [onboarding-flow.md](references/onboarding-flow.md) | codebase-onboarding |
| [architecture-doc-template.md](references/architecture-doc-template.md) | codebase-summarizer |
| [diagnose-current-architecture.md](references/diagnose-current-architecture.md) | improve-codebase-architecture (current-state) |
| [html-architecture-report.md](references/html-architecture-report.md) | improve-codebase-architecture (current-state) |
| [extract-project-rules.md](references/extract-project-rules.md) | learn |
| [site-information-architecture.md](references/site-information-architecture.md) | site-architecture |
| [site-type-templates.md](references/site-type-templates.md) | site-architecture |
| [navigation-patterns.md](references/navigation-patterns.md) | site-architecture |
| [mermaid-templates.md](references/mermaid-templates.md) | site-architecture |

## Breaking renames

These skill folders were merged and removed:

- `how` → **explain** mode
- `learn` → **extract-rules** mode
- `learn-codebase` → **deep-read** mode
- `codebase-onboarding` → **onboard** mode
- `codebase-summarizer` → **summarize** mode
- `site-architecture` → **site-ia** mode
- `improve-codebase-architecture` → **diagnose** mode for *current* smells and layering. The target stack and migration blueprint half is `super-tech-blueprint`.

## Related skills

- `create-documentation`: write pages for readers, or check which docs a change made stale.
- `trace`: the question is why the code is shaped this way.
- `second-opinion`: a change needs review, and the explain mode gives the reviewers context.
- `super-tech-blueprint`: choose or migrate to a target stack.
- `super-architecture`: name the current style or choose one.
- `ready-spec` or `write-plan`: the mental model is clear and the change needs a plan.
- `challenge-me`: stress-test the findings or the next step.
- `safe-refactor`: act on the smells you found.
- `create-agents-md`: write the findings into AGENTS.md or CLAUDE.md.
- `handoff`: save the map for a fresh session.
