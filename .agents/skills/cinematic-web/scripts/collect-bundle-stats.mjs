#!/usr/bin/env node
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"

const [, , buildDirArg = ".next", outputArg = "artifacts/bundle-stats.json"] = process.argv

if (buildDirArg === "--help" || buildDirArg === "-h") {
  console.log("Usage: node scripts/collect-bundle-stats.mjs [.next-directory] [output-json]")
  process.exit(0)
}

const buildDir = resolve(buildDirArg)
const output = resolve(outputArg)
const chunksDir = join(buildDir, "static", "chunks")

if (!existsSync(chunksDir)) {
  console.error(`Chunk directory not found: ${chunksDir}`)
  console.error("Run the app build first, then collect bundle stats.")
  process.exit(1)
}

const files = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(file)
      continue
    }

    if ([".js", ".css"].includes(extname(entry.name))) {
      files.push({
        file: relative(buildDir, file),
        bytes: statSync(file).size,
      })
    }
  }
}

walk(chunksDir)
files.sort((a, b) => b.bytes - a.bytes)

const payload = {
  generatedAt: new Date().toISOString(),
  buildDir,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  files,
}

writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${output}`)
