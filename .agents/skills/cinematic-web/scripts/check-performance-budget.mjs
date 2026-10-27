#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"

const [, , targetArg = "."] = process.argv

if (targetArg === "--help" || targetArg === "-h") {
  console.log("Usage: node scripts/check-performance-budget.mjs [target-directory]")
  process.exit(0)
}

const root = resolve(targetArg)

if (!existsSync(root)) {
  console.error(`Target not found: ${root}`)
  process.exit(1)
}

const ignoredDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
  "tmp",
  "artifacts",
])

const budgets = {
  ".glb": 2 * 1024 * 1024,
  ".gltf": 2 * 1024 * 1024,
  ".png": 900 * 1024,
  ".jpg": 900 * 1024,
  ".jpeg": 900 * 1024,
  ".webp": 700 * 1024,
  ".avif": 500 * 1024,
  ".mp4": 4 * 1024 * 1024,
  ".webm": 4 * 1024 * 1024,
}

const findings = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(join(dir, entry.name))
      continue
    }

    const file = join(dir, entry.name)
    const ext = extname(entry.name).toLowerCase()
    const max = budgets[ext]

    if (!max) continue

    const size = statSync(file).size
    if (size > max) {
      findings.push({
        file: relative(root, file),
        size,
        max,
      })
    }
  }
}

walk(root)

if (findings.length === 0) {
  console.log("Performance budget check passed.")
  process.exit(0)
}

console.error("Performance budget check failed:")
for (const finding of findings) {
  console.error(
    `- ${finding.file}: ${(finding.size / 1024 / 1024).toFixed(2)} MB, budget ${(finding.max / 1024 / 1024).toFixed(2)} MB`,
  )
}

process.exit(1)
