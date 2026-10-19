/**
 * Gera public/data/agendamentos-dataset.json a partir das planilhas base.
 *
 * Ordem: AGENDAMENTOS → INSUCESSOS (enrich) → LEADS GERAL (enrich + volume de atendimentos)
 * Exclui LEADS CAMPANHA e LEADS POR UTM.
 *
 * Uso: npm run generate:agendamentos
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const argDir = process.argv.find((a) => a.startsWith("--dir="))?.slice(6);
const dataDir = resolve(argDir || join(root, "..", "EXEMPLO ARQUIVO DE DADOS"));
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

function pickFile(files, predicate, label) {
  const hit = files.find(predicate);
  if (!hit) throw new Error(`${label} não encontrado em ${dataDir}`);
  return join(dataDir, hit);
}

async function main() {
  const {
    parseSchedulingArrayBuffer,
    applySchedulingImport,
    emptySchedulingDataset,
  } = await loadModules();

  const files = readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith(".xlsx"));
  const agPath = pickFile(
    files,
    (f) => /agendamentos/i.test(f) && !/performance/i.test(f),
    "AGENDAMENTOS"
  );
  const insPath = pickFile(files, (f) => /insucessos/i.test(f), "INSUCESSOS");
  const leadsPath = pickFile(
    files,
    (f) =>
      /leads\s*geral/i.test(f) ||
      (/leads/i.test(f) &&
        !/campanha/i.test(f) &&
        !/utm/i.test(f) &&
        !/performance/i.test(f)),
    "LEADS GERAL"
  );

  console.log("Fonte:", dataDir);
  console.log("1)", agPath);
  console.log("2)", insPath);
  console.log("3)", leadsPath);

  let dataset = emptySchedulingDataset();

  const steps = [
    ["Base AGENDAMENTOS 01/01–15/10/2026", agPath],
    ["Enrich INSUCESSOS 01/01–15/10/2026", insPath],
    ["Enrich LEADS GERAL 01/01–15/10/2026", leadsPath],
  ];

  for (const [label, filePath] of steps) {
    const buf = readFileSync(filePath);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const { kind, rows } = parseSchedulingArrayBuffer(ab);
    const fileName = filePath.split(/[/\\]/).pop() || filePath;
    const result = applySchedulingImport(dataset, rows, kind, fileName, label);
    dataset = result.dataset;
    console.log(
      `→ ${label} [${kind}]: recebidos=${result.meta.received} novos=${result.meta.kept} enriquecidos=${result.meta.enriched} ignorados=${result.meta.removed} total=${dataset.items.length}`
    );
  }

  // Política: Insucesso sem motivo cruzado não entra na base publicada
  const beforeDrop = dataset.items.length;
  dataset = {
    ...dataset,
    items: dataset.items.filter(
      (i) => i.status !== "Insucesso" || (i.motivoInsucesso && String(i.motivoInsucesso).trim())
    ),
  };
  const dropped = beforeDrop - dataset.items.length;
  if (dropped > 0) {
    console.log(`→ Removidos ${dropped} Insucesso sem motivo`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(dataset, null, 2), "utf8");

  const summary = {
    items: dataset.items.length,
    leadsAtendimentos: (dataset.leadsAtendimentos || []).length,
    sucessos: dataset.items.filter((i) => i.status === "Sucesso").length,
    visitas: dataset.items.filter((i) => i.teveVisita).length,
    insucessos: dataset.items.filter((i) => i.status === "Insucesso").length,
    comMotivo: dataset.items.filter((i) => i.motivoInsucesso).length,
    comOrigem: dataset.items.filter((i) => i.origem && i.origem !== "Não informado")
      .length,
    comEmail: dataset.items.filter((i) => i.email).length,
    financimento: dataset.items.filter((i) => i.tipoProposta === "Financiamento").length,
    recepcao: dataset.items.filter((i) => i.canal === "Recepção").length,
    preVenda: dataset.items.filter((i) => i.canal === "Pré-Venda").length,
  };

  console.log("\nGravado:", outPath);
  console.log(JSON.stringify(summary, null, 2));

  if (dataset.items.length < 4000) {
    throw new Error(`Base suspeita: ${dataset.items.length} itens (esperado ~4450)`);
  }
  if (summary.comMotivo < 2000) {
    throw new Error(`Poucos motivos cruzados: ${summary.comMotivo}`);
  }
  if (summary.comOrigem < 4000) {
    throw new Error(`Poucas origens cruzadas: ${summary.comOrigem}`);
  }
  if (summary.leadsAtendimentos < 5000) {
    throw new Error(
      `Poucos atendimentos LEADS GERAL: ${summary.leadsAtendimentos} (esperado dezenas de milhares)`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
