/**
 * Gera public/data/negociacoes-dataset.json a partir do export de exemplo.
 * Uso: node scripts/generate-negociacoes-dataset.mjs [caminho.xlsx]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Build TS libs via vite isn't available; duplicate parse with xlsx + inline rules
const XLSX = require("xlsx");

const defaultXlsx = path.resolve(
  root,
  "..",
  "EXEMPLOS DE ARQUIVOS NEGOCIAÇÕES",
  "negociações 01_01_2026 a 15_10_2026.xlsx"
);
const input = process.argv[2] ? path.resolve(process.argv[2]) : defaultXlsx;
const outPath = path.join(root, "public", "data", "negociacoes-dataset.json");

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isCompraDeConsignado(tipoRaw) {
  const key = normalizeKey(tipoRaw);
  return key.includes("compra") && key.includes("consignado");
}

function normalizeTipo(tipoRaw) {
  const key = normalizeKey(tipoRaw);
  if (key.includes("troca")) return "Troca";
  if (key.includes("consign")) return "Consignação";
  if (key.includes("compra")) return "Compra";
  if (key.includes("venda")) return "Venda";
  return "Outro";
}

function cellStr(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v).trim();
}

function toIsoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}

function isoToMonthKey(iso) {
  return iso.slice(0, 7);
}

function isoToPeriodKey(iso) {
  const day = Number(iso.slice(8, 10));
  return `${iso.slice(0, 7)}-${day <= 15 ? "Q1" : "Q2"}`;
}

function cellNumber(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

if (!fs.existsSync(input)) {
  console.error("Arquivo não encontrado:", input);
  process.exit(1);
}

const wb = XLSX.readFile(input, { cellDates: true });
const sheet = wb.Sheets["Página1"] || wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const lines = [];
let skippedCompraConsig = 0;
for (const row of rows) {
  const negociacaoId = cellStr(row["Negociação"] ?? row["Negociacao"]);
  if (!negociacaoId) continue;
  const tipoRaw = cellStr(row["Tipo Negociação"] ?? row["Tipo de Negociação"]);
  if (isCompraDeConsignado(tipoRaw)) {
    skippedCompraConsig += 1;
    continue;
  }
  const dataIso = toIsoDate(row["Data Entrada"] ?? row["Data"]) || "1970-01-01";
  lines.push({
    negociacaoId,
    dataEntrada: dataIso,
    cliente: cellStr(row["Cliente Negociação"] ?? row["Cliente"]),
    vendedor: cellStr(row["Vendedor Negociação"] ?? row["Vendedor"]) || "(sem vendedor)",
    tipo: normalizeTipo(tipoRaw),
    tipoRaw: tipoRaw || "Não informado",
    status: cellStr(row["Status Negociação"] ?? row["Status"]) || "Não informado",
    placa: cellStr(row["Placa"]),
    tipoVeiculo: cellStr(row["Tipo Veículo"]),
    marca: cellStr(row["Marca"]),
    modelo: cellStr(row["Modelo"]),
    versao: cellStr(row["Versão"]),
    estoque: cellStr(row["Estoque"]),
    tipoVenda: cellStr(row["Tipo Venda"]) || "Não informado",
    movimentacao: cellStr(row["Movimentação"] ?? row["Movimentacao"]),
    valorCompra: cellNumber(row["Valor Compra"]),
    valorVenda: cellNumber(row["Valor Venda"]),
    monthKey: isoToMonthKey(dataIso),
    periodKey: isoToPeriodKey(dataIso),
    solicitante: cellStr(row["Solicitante"]),
    avaliador: cellStr(row["Avaliador"]),
  });
}

const avalPath = path.resolve(
  root,
  "..",
  "EXEMPLOS DE ARQUIVOS NEGOCIAÇÕES",
  "conversão avaliação 01_01_2026 a 15_10_2026.xlsx"
);

function parsePercent(value, aprovadas, realizadas) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value <= 1 ? Math.round(value * 10000) / 100 : Math.round(value * 100) / 100;
  }
  const raw = String(value ?? "")
    .replace("%", "")
    .replace(",", ".")
    .trim();
  const n = Number(raw);
  if (Number.isFinite(n)) {
    return n <= 1 && !String(value).includes("%")
      ? Math.round(n * 10000) / 100
      : Math.round(n * 100) / 100;
  }
  return realizadas ? Math.round((aprovadas / realizadas) * 10000) / 100 : 0;
}

const avaliacoes = [];
if (fs.existsSync(avalPath)) {
  const awb = XLSX.readFile(avalPath, { cellDates: true });
  const arows = XLSX.utils.sheet_to_json(awb.Sheets[awb.SheetNames[0]], {
    header: 1,
    defval: "",
    cellDates: true,
  });
  let monthKey = null;
  let inTable = false;
  for (const row of arows) {
    const c0 = row[0];
    if (c0 instanceof Date && !Number.isNaN(c0.getTime())) {
      const y = c0.getFullYear();
      const m = String(c0.getMonth() + 1).padStart(2, "0");
      monthKey = `${y}-${m}`;
      inTable = false;
      continue;
    }
    const h0 = String(c0 || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    if (h0 === "vendedor" && String(row[1] || "").toLowerCase().includes("aprov")) {
      inTable = true;
      continue;
    }
    if (!inTable || !monthKey) continue;
    const vendedor = String(c0 || "").trim();
    if (!vendedor || vendedor.toLowerCase() === "total") {
      if (vendedor.toLowerCase() === "total") inTable = false;
      continue;
    }
    const aprovadas = Number(row[1]) || 0;
    const realizadas = Number(row[2]) || 0;
    avaliacoes.push({
      monthKey,
      vendedor,
      aprovadas,
      realizadas,
      percentual: parsePercent(row[3], aprovadas, realizadas),
    });
  }
}

const dataset = {
  updatedAt: new Date().toISOString(),
  imports: [
    {
      fileName: path.basename(input),
      label: "Seed inicial (exemplos)",
      at: new Date().toISOString(),
      received: lines.length,
      kept: new Set(lines.map((l) => l.negociacaoId)).size,
      replaced: 0,
      removed: skippedCompraConsig,
      notes: [
        `Seed de ${path.basename(input)}`,
        skippedCompraConsig
          ? `${skippedCompraConsig} linhas Compra de Consignado ignoradas`
          : "Sem Compra de Consignado",
        avaliacoes.length
          ? `+ ${avaliacoes.length} linhas conversão avaliações`
          : "Sem arquivo de avaliações",
      ],
    },
  ],
  lines,
  avaliacoes,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(dataset));
console.log(
  `OK ${outPath}: ${lines.length} linhas, ${new Set(lines.map((l) => l.negociacaoId)).size} nº únicos, skip consignado=${skippedCompraConsig}, avaliacoes=${avaliacoes.length}`
);
