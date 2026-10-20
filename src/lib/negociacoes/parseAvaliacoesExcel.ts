import * as XLSX from "xlsx";
import { isoToMonthKey, toIsoDate } from "../scheduling/dates";
import { cellStr, normalizeKey } from "./normalize";
import type { AvaliacaoConvRow } from "./types";

function parsePercent(value: unknown, aprovadas: number, realizadas: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value <= 1 ? Math.round(value * 10000) / 100 : Math.round(value * 100) / 100;
  }
  const raw = cellStr(value).replace("%", "").replace(",", ".").trim();
  const n = Number(raw);
  if (Number.isFinite(n)) {
    return n <= 1 && !String(value).includes("%") ? Math.round(n * 10000) / 100 : Math.round(n * 100) / 100;
  }
  return realizadas ? Math.round((aprovadas / realizadas) * 10000) / 100 : 0;
}

function monthKeyFromCell(value: unknown): string | null {
  const iso = toIsoDate(value);
  if (iso) return isoToMonthKey(iso);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return isoToMonthKey(toIsoDate(value) || "");
  }
  return null;
}

/** Detecta planilha de conversão de avaliações (Aprovadas/Realizadas). */
export function isAvaliacoesSheet(buffer: ArrayBuffer): boolean {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  if (!sheet) return false;
  const rows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(sheet, {
    header: 1,
    defval: "",
  });
  for (const row of rows.slice(0, 40)) {
    const cells = row.map((c) => normalizeKey(cellStr(c)));
    if (cells.includes("aprovadas") && cells.includes("realizadas")) return true;
    if (cells.some((c) => c.includes("solicitacoes de avaliacao"))) return true;
  }
  // Se tem Negociação no header, é planilha de negócios
  for (const row of rows.slice(0, 5)) {
    if (row.some((c) => normalizeKey(cellStr(c)) === "negociacao")) return false;
  }
  return false;
}

export function parseAvaliacoesArrayBuffer(buffer: ArrayBuffer): AvaliacaoConvRow[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(sheet, {
    header: 1,
    defval: "",
  });

  const out: AvaliacaoConvRow[] = [];
  let monthKey: string | null = null;
  let inTable = false;

  for (const row of rows) {
    const c0 = row[0];
    const c1 = row[1];
    const mk = monthKeyFromCell(c0);
    if (mk && cellStr(c1) === "" && cellStr(row[2]) === "") {
      monthKey = mk;
      inTable = false;
      continue;
    }

    const h0 = normalizeKey(cellStr(c0));
    const h1 = normalizeKey(cellStr(c1));
    if (h0 === "vendedor" && h1 === "aprovadas") {
      inTable = true;
      continue;
    }

    if (!inTable || !monthKey) continue;

    const vendedor = cellStr(c0);
    if (!vendedor || normalizeKey(vendedor) === "total") {
      if (normalizeKey(vendedor) === "total") inTable = false;
      continue;
    }

    const aprovadas = Number(c1) || 0;
    const realizadas = Number(row[2]) || 0;
    const percentual = parsePercent(row[3], aprovadas, realizadas);
    out.push({ monthKey, vendedor, aprovadas, realizadas, percentual });
  }

  return out;
}
