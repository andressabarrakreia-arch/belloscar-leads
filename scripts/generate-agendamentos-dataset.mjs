/**
 * Gera public/data/agendamentos-dataset.json a partir das planilhas base.
 *
 * Ordem:
 * 1. AGENDAMENTOS (Agendado em)
 * 2. INSUCESSOS (enrich)
 * 3. LEADS GERAL (enrich origem)
 * 4. LEADS REALIZADOS (Atendido em / Visita em)
 * 5. SUCESSOS (Finalizado em)
 *
 * Se existir dataset anterior, preserva itens de agendamento já publicados
 * (ex.: atualização até 19/10) e só reprocessa coleções.
 *
 * Uso: npm run generate:agendamentos
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
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

function pickFile(files, predicate, label, optional = false) {
  const hit = files.find(predicate);
  if (!hit) {
    if (optional) return null;
    throw new Error(`${label} não encontrado em ${dataDir}`);
  }
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
    (f) => /agendamentos/i.test(f) && !/performance/i.test(f) && !/realizad/i.test(f),
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
        !/performance/i.test(f) &&
        !/realizad/i.test(f)),
    "LEADS GERAL"
  );
  const realizadosPath = pickFile(
    files,
    (f) => /realizad/i.test(f),
    "LEADS REALIZADOS",
    true
  );
  const sucessosPath = pickFile(
    files,
    (f) => /^sucessos/i.test(f) || /\bsucessos\b/i.test(f),
    "SUCESSOS",
    true
  );

  console.log("Fonte:", dataDir);
  console.log("1)", agPath);
  console.log("2)", insPath);
  console.log("3)", leadsPath);
  console.log("4)", realizadosPath || "(ausente)");
  console.log("5)", sucessosPath || "(ausente)");

  // Preserva só a base de agendamentos já publicada (ex.: lote até 19/10).
  // REALIZADOS/SUCESSOS são sempre reprocessados do zero a partir das planilhas.
  let dataset = emptySchedulingDataset();
  if (existsSync(outPath)) {
    try {
      const prev = JSON.parse(readFileSync(outPath, "utf8"));
      if (Array.isArray(prev.items) && prev.items.length > 0) {
        dataset = {
          ...emptySchedulingDataset(),
          items: prev.items,
          // leads/realizados/sucessos serão reimportados abaixo
          leadsAtendimentos: [],
          realizados: [],
          sucessosEventos: [],
          imports: [],
          updatedAt: prev.updatedAt,
        };
        console.log(`→ Base anterior: ${dataset.items.length} agendamentos preservados`);
      }
    } catch {
      /* ignora JSON inválido */
    }
  }

  const steps = [
    ["Base AGENDAMENTOS", agPath],
    ["Enrich INSUCESSOS", insPath],
    ["Enrich LEADS GERAL", leadsPath],
  ];
  if (realizadosPath) steps.push(["REALIZADOS (Atendido em / Visita em)", realizadosPath]);
  if (sucessosPath) steps.push(["SUCESSOS (Finalizado em)", sucessosPath]);

  for (const [label, filePath] of steps) {
    const buf = readFileSync(filePath);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const { kind, rows } = parseSchedulingArrayBuffer(ab);
    const fileName = filePath.split(/[/\\]/).pop() || filePath;
    const result = applySchedulingImport(dataset, rows, kind, fileName, label);
    dataset = result.dataset;
    console.log(
      `→ ${label} [${kind}]: recebidos=${result.meta.received} novos=${result.meta.kept} enriquecidos=${result.meta.enriched} ignorados=${result.meta.removed} ag=${dataset.items.length} realizados=${(dataset.realizados || []).length} sucessos=${(dataset.sucessosEventos || []).length}`
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
    realizados: (dataset.realizados || []).length,
    sucessosEventos: (dataset.sucessosEventos || []).length,
    visitasComData: (dataset.realizados || []).filter((r) => r.teveVisita && r.dataVisita)
      .length,
    sucessos: dataset.items.filter((i) => i.status === "Sucesso").length,
    visitasAgenda: dataset.items.filter((i) => i.teveVisita).length,
    insucessos: dataset.items.filter((i) => i.status === "Insucesso").length,
    comMotivo: dataset.items.filter((i) => i.motivoInsucesso).length,
    comOrigem: dataset.items.filter((i) => i.origem && i.origem !== "Não informado")
      .length,
  };

  console.log("\nGravado:", outPath);
  console.log(JSON.stringify(summary, null, 2));

  if (dataset.items.length < 4000) {
    throw new Error(`Base suspeita: ${dataset.items.length} itens (esperado ~4450)`);
  }
  if (summary.realizados < 5000) {
    throw new Error(
      `Poucos REALIZADOS: ${summary.realizados} (esperado dezenas de milhares)`
    );
  }
  if (summary.sucessosEventos < 100) {
    throw new Error(`Poucos SUCESSOS: ${summary.sucessosEventos}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
