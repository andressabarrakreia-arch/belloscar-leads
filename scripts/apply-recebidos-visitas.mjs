/**
 * Aplica o CSV de recebidos na base: Visita / Data Visita → realizados.
 * Uso: node scripts/apply-recebidos-visitas.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const csvPath = resolve(
  root,
  "..",
  "EXEMPLO ARQUIVO DE DADOS",
  "recebidoss ate 26_10.csv"
);
const outPath = join(root, "public", "data", "agendamentos-dataset.json");
const tmpOut = join(root, "scripts", ".tmp-scheduling-bundle.mjs");

async function loadModules() {
  await build({
    entryPoints: [join(root, "src", "lib", "scheduling", "seedEntry.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: tmpOut,
    packages: "external",
    logLevel: "silent",
  });
  return import(pathToFileURL(tmpOut).href + `?t=${Date.now()}`);
}

function countVisitas(realizados, sdrNeedle, from, to) {
  const needle = sdrNeedle.toLowerCase();
  return realizados.filter((r) => {
    if (!r.teveVisita || !r.dataVisita) return false;
    if (r.dataVisita < from || r.dataVisita > to) return false;
    return String(r.sdr || "").toLowerCase().includes(needle);
  });
}

async function main() {
  if (!existsSync(csvPath)) throw new Error(`CSV não encontrado: ${csvPath}`);
  if (!existsSync(outPath)) throw new Error(`Dataset não encontrado: ${outPath}`);

  const { parseSchedulingArrayBuffer, applySchedulingImport } = await loadModules();
  const current = JSON.parse(readFileSync(outPath, "utf8"));
  const buffer = readFileSync(csvPath);
  const parsed = parseSchedulingArrayBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  if (parsed.kind !== "leads") {
    throw new Error(`Esperado kind=leads, veio ${parsed.kind}`);
  }

  const { dataset, meta } = applySchedulingImport(
    current,
    parsed.rows,
    parsed.kind,
    "recebidoss ate 26_10.csv",
    "Recebidos até 26/10"
  );

  writeFileSync(outPath, JSON.stringify(dataset, null, 2), "utf8");

  const allan = countVisitas(dataset.realizados || [], "allan junior", "2026-10-01", "2026-10-31");
  const thayna = countVisitas(dataset.realizados || [], "thayna", "2026-10-01", "2026-10-31");

  console.log(JSON.stringify({
    kind: parsed.kind,
    rows: parsed.rows.length,
    metaNotes: meta.notes,
    updatedAt: dataset.updatedAt,
    allanOutubro: allan.length,
    thaynaOutubro: thayna.length,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
