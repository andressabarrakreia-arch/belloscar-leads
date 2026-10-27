#!/usr/bin/env node
import { mkdirSync } from "node:fs"
import { resolve } from "node:path"

const [, , url, outArg = "artifacts/screens"] = process.argv

if (!url || url === "--help" || url === "-h") {
  console.log("Usage: node scripts/screenshot-compare.mjs <url> [output-directory]")
  process.exit(url ? 0 : 1)
}

const outDir = resolve(outArg)
mkdirSync(outDir, { recursive: true })

let chromium
try {
  ;({ chromium } = await import("playwright"))
} catch {
  console.error("Playwright is not installed. Run `npm install -D playwright` in the target project.")
  process.exit(1)
}

const browser = await chromium.launch()

const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 390, height: 844 },
]

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.screenshot({ path: `${outDir}/${viewport.name}.png`, fullPage: true })
  await page.close()
}

const reducedPage = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  reducedMotion: "reduce",
})
await reducedPage.goto(url, { waitUntil: "networkidle" })
await reducedPage.screenshot({ path: `${outDir}/desktop-reduced-motion.png`, fullPage: true })
await reducedPage.close()

await browser.close()
console.log(`Screenshots written to ${outDir}`)
