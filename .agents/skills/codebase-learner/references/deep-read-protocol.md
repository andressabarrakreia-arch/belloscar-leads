# Deep read protocol

Use when the user needs maximum fidelity on **source code** in the repo (not marketing site IA). Front-loads context so later work costs fewer tokens.

## Requirement

Systematically read **every source file in full**, no matter how many there are. This is critical and non-negotiable for this mode.

For large files, page with the Read tool (`offset` and `limit`, e.g. 500 lines per chunk).

## Scope

- Include application source, tests, configs that define behavior, and scripts that ship with the product.
- Skip obvious vendored trees (`node_modules`, `vendor`, `.git`, build output) unless the user asks otherwise.
- Prefer `Glob` to enumerate paths, then `Read` each file.

## Note for reviewers

This mode uses many tokens but builds a durable mental model of the codebase. Weigh that against warning the user about cost only when they have not asked for a full read.
