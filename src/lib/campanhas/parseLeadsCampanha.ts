import * as XLSX from "xlsx";
import { toIsoDate } from "../scheduling/dates";
import { normHeader } from "../scheduling/normalize";
import type { LeadCampanhaItem } from "../scheduling/types";
import { formatPhoneDisplay, phoneKey } from "./phoneMatch";

/**
 * Data do export Meta em inglês, mês/dia: "10/20/2026 7:37pm" ou "10/12/2026 23:56".
 * Dia/mês só quando o primeiro número passa de 12.
 */
export function parseFormCreatedAt(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDate(value) || "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const utc = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (Number.isNaN(utc.getTime())) return "";
    const y = utc.getUTCFullYear();
    const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utc.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const match = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?)?/i
  );
  if (!match) return toIsoDate(raw) || "";

  let first = Number(match[1]);
  let second = Number(match[2]);
  const year = Number(match[3]);
  let month: number;
  let day: number;
  if (first > 12 && second <= 12) {
    day = first;
    month = second;
  } else {
    month = first;
    day = second;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  const d = new Date(year, month - 1, day, 12, 0, 0);
  if (Number.isNaN(d.getTime()) || d.getMonth() !== month - 1) return "";
  const m = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${m}-${dd}`;
}

function readRows(buffer: ArrayBuffer): unknown[][] {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: false,
    codepage: 65001,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: true,
  });
}

function headerMap(row: unknown[]): Record<string, number> {
  const out: Record<string, number> = {};
  row.forEach((cell, idx) => {
    const key = normHeader(cell);
    if (key && out[key] === undefined) out[key] = idx;
  });
  return out;
}

export function isLeadsCampanhaHeader(row: unknown[]): boolean {
  const headers = headerMap(row);
  return (
    headers.formulario !== undefined &&
    headers.telefone !== undefined &&
    (headers.nome !== undefined || headers["criado em"] !== undefined)
  );
}

/** Null quando o arquivo não é o export LEADS POR CAMPANHA. */
export function parseLeadsCampanhaArrayBuffer(buffer: ArrayBuffer): LeadCampanhaItem[] | null {
  const rows = readRows(buffer);
  const max = Math.min(rows.length, 15);
  let headerIndex = -1;
  let headers: Record<string, number> = {};
  for (let i = 0; i < max; i++) {
    const row = rows[i] || [];
    if (!isLeadsCampanhaHeader(row)) continue;
    headerIndex = i;
    headers = headerMap(row);
    break;
  }
  if (headerIndex < 0) return null;

  const parsed: LeadCampanhaItem[] = [];
  let emptyStreak = 0;
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (!row.some((cell) => String(cell ?? "").trim() !== "")) {
      emptyStreak += 1;
      if (emptyStreak > 50) break;
      continue;
    }
    emptyStreak = 0;
    const nome = String(row[headers.nome] ?? "").trim();
    const formulario = String(row[headers.formulario] ?? "").trim();
    const rawPhones = [
      row[headers.telefone],
      row[headers["numero do whatsapp"]],
      row[headers["numero de telefone secundario"]],
    ];
    const phoneKeys: string[] = [];
    for (const phone of rawPhones) {
      const key = phoneKey(phone);
      if (key && !phoneKeys.includes(key)) phoneKeys.push(key);
    }
    const shown = rawPhones.find((phone) => String(phone ?? "").trim() !== "") ?? "";
    if (!nome && !formulario && phoneKeys.length === 0) continue;
    parsed.push({
      criadoEm: parseFormCreatedAt(row[headers["criado em"]]),
      nome,
      telefone: formatPhoneDisplay(shown) || String(shown ?? "").trim(),
      formulario: formulario || "(sem formulário)",
      phoneKey: phoneKeys[0] || "",
      phoneKeys,
    });
  }
  return parsed;
}
