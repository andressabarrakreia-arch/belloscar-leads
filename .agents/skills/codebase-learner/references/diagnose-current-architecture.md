# Diagnose current architecture

Surface architectural friction in **existing** code. The deliverable is a diagnosis of what is shallow, leaked, or hard to test *today* — not a new stack.

If the user wants a target framework, cloud, or migration blueprint, stop after the diagnosis (or skip this mode) and load `super-tech-blueprint`. Pointer: one owner for target work is that skill; this file does not duplicate its TCO or comparison procedures.

Informed by the project's domain model:

- Vocabulary below (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**). Use these terms exactly — do not drift into "component," "service," "API," or "boundary" when you mean these.
- Domain language in `CONTEXT.md` names good seams. ADRs in `docs/adr/` are decisions this mode should not re-litigate.

## 1. Explore

**Scope before you scan — YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on parts that have recently changed. Decide *where* to look before you look:

- If the user named a direction — a module, a subsystem, a pain point — take it, and skip the inference below.
- Otherwise, walk a stretch of `git log --oneline` for hot spots — files and areas that keep coming up — and look there first. If changes are scattered, widen the net.

Read `CONTEXT.md` and any ADRs in the area you are touching first.

Then explore the codebase (an Explore subagent is fine). Note friction organically:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they are called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

## 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html`. Open it — `xdg-open` on Linux, `open` on macOS, `start` on Windows — and tell the user the absolute path.

Scaffold, diagram patterns, and glossary tone: `html-architecture-report.md` (linked from this skill's SKILL.md).

For each candidate, a card with:

- **Files** — which files/modules are involved
- **Problem** — why the *current* architecture is causing friction
- **Solution** — what would change *in this tree* (deepen, collapse wrappers, move logic behind one interface). If the real fix is a new stack, framework, or migration, do not design it here: one line "handoff to `super-tech-blueprint`" and why.
- **Benefits** — locality, leverage, and how tests would improve
- **Before / After diagram** — side-by-side, illustrating shallowness and deepening
- **Recommendation strength** — `Strong`, `Worth exploring`, or `Speculative`

End with **Top recommendation**: which candidate to tackle first and why.

Use `CONTEXT.md` vocabulary for the domain. If `CONTEXT.md` defines "Order," talk about "the Order intake module" — not "the FooBarHandler."

**ADR conflicts:** only surface a candidate that contradicts an ADR when the friction is real enough to reopen it. Mark it on the card. Do not list every theoretical refactor an ADR forbids.

Do not propose target-stack interfaces or a next framework in the report. After the file is written, ask: "Which of these would you like to explore?"

## 3. After the user picks

- **In-place deepening** (same stack, deeper module): run `challenge-me` **grill-docs** for the decision tree — constraints, the shape of the deepened module, what sits behind the seam, what tests survive. Keep `CONTEXT.md` current as names crystallize. If the user rejects with a load-bearing reason, offer an ADR so a future diagnose pass does not re-suggest it (skip ephemeral "not now").
- **New stack, layering at system level, or migration:** load `super-tech-blueprint` and pass the diagnosis (files, problem, constraints). Do not invent the target here.
