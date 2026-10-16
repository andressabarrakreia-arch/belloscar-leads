import * as XLSX from "xlsx";
import { excelSerialToDate, monthKeyFromDate, periodKeyFromDate } from "./dates";
import { hasPriorityKeep, isScheduledStatus, isSuccessStatus, isVisitFlag } from "./leadFlags";
import { normalizePhone } from "./phone";
import type { ParsedLead } from "./types";

const HEADER_ALIASES: Record<string, string> = {
  id: "id",
  "criado em": "criadoEm",
  responsavel: "responsavel",
  status: "status",
  visita: "visita",
  "data visita": "dataVisita",
  origem: "origem",
  "tipo proposta": "tipoProposta",
  cliente: "cliente",
  celular: "celular",
};

function normHeader(h: unknown): string {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapHeaders(row: unknown[]): Record<string, number> {
  const map: Record<string, number> = {};
  row.forEach((cell, idx) => {
    const key = HEADER_ALIASES[normHeader(cell)];
    if (key) map[key] = idx;
  });
  return map;
}

function cell(row: unknown[], idx: number | undefined): unknown {
  if (idx === undefined) return "";
  return row[idx] ?? "";
}

export function parseExcelArrayBuffer(buffer: ArrayBuffer): ParsedLead[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Planilha vazia: nenhuma aba encontrada.");
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (rows.length < 2) throw new Error("Planilha sem dados.");

  const headers = mapHeaders(rows[0] as unknown[]);
  for (const r of ["criadoEm", "status", "origem", "celular"]) {
    if (headers[r] === undefined) throw new Error(`Coluna obrigatória ausente: ${r}`);
  }

  const leads: ParsedLead[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || !row.some((c) => String(c ?? "").trim() !== "")) continue;

    const createdAtLead = excelSerialToDate(cell(row, headers.criadoEm));
    if (!createdAtLead) continue;

    const status = String(cell(row, headers.status) ?? "").trim();
    const visita = String(cell(row, headers.visita) ?? "").trim() || "Não";
    const origem = String(cell(row, headers.origem) ?? "").trim() || "Não informado";
    const responsavel =
      String(cell(row, headers.responsavel) ?? "").trim() || "(sem responsável)";
    const tipoProposta =
      String(cell(row, headers.tipoProposta) ?? "").trim() || "Não informado";
    const cliente = String(cell(row, headers.cliente) ?? "").trim();
    const celularRaw = cell(row, headers.celular);
    const phoneNormalized = normalizePhone(celularRaw as string | number);
    const externalId =
      headers.id !== undefined ? String(cell(row, headers.id) ?? "").trim() || null : null;
    const dataVisita =
      headers.dataVisita !== undefined ? excelSerialToDate(cell(row, headers.dataVisita)) : null;

    leads.push({
      externalId,
      createdAtLead,
      monthKey: monthKeyFromDate(createdAtLead),
      periodKey: periodKeyFromDate(createdAtLead),
      responsavel,
      status,
      visita,
      dataVisita,
      origem,
      tipoProposta,
      cliente,
      celular: String(celularRaw ?? ""),
      phoneNormalized,
      hasVisit: isVisitFlag(visita, status),
      isSuccess: isSuccessStatus(status),
      isScheduled: isScheduledStatus(status),
      hasPriority: hasPriorityKeep(visita, status),
    });
  }

  return leads;
}
