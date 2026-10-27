#!/usr/bin/env node
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"

function readOption(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1]
}

const [, , input, output] = process.argv

if (!input || input === "--help" || input === "-h" || !output) {
  console.log(
    "Usage: node scripts/optimize-gltf.mjs <input.glb> <output.glb> [--compress meshopt|draco|none] [--texture webp|avif|jpeg|png] [--size 1024]",
  )
  process.exit(input ? 0 : 1)
}

const source = resolve(input)
const target = resolve(output)
const compress = readOption("--compress", "meshopt")
const texture = readOption("--texture", "webp")
const textureSize = readOption("--size", "1024")

if (!existsSync(source)) {
  console.error(`Input model not found: ${source}`)
  process.exit(1)
}

const args = [
  "--yes",
  "@gltf-transform/cli",
  "optimize",
  source,
  target,
  "--texture-compress",
  texture,
  "--texture-size",
  textureSize,
]

if (compress !== "none") {
  args.push("--compress", compress)
}

console.log(`Optimizing ${source}`)
console.log(`Output ${target}`)
console.log(`Compression ${compress}; textures ${texture}; max texture size ${textureSize}`)

const result = spawnSync("npx", args, { stdio: "inherit" })

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 0)
