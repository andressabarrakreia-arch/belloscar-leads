#!/usr/bin/env node
import { existsSync, statSync } from "node:fs"
import { basename, resolve } from "node:path"
import { spawnSync } from "node:child_process"

const [, , input] = process.argv

if (!input || input === "--help" || input === "-h") {
  console.log("Usage: node scripts/inspect-gltf.mjs <model.glb|model.gltf>")
  process.exit(input ? 0 : 1)
}

const file = resolve(input)

if (!existsSync(file)) {
  console.error(`Model not found: ${file}`)
  process.exit(1)
}

const sizeMb = statSync(file).size / 1024 / 1024
console.log(`Inspecting ${basename(file)} (${sizeMb.toFixed(2)} MB)`)

const result = spawnSync(
  "npx",
  ["--yes", "@gltf-transform/cli", "inspect", file],
  { stdio: "inherit" },
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 0)
