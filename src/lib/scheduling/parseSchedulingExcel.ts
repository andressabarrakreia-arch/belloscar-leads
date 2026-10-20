import * as XLSX from "xlsx";
import { isoToMonthKey, isoToPeriodKey, toIsoDate } from "./dates";
import {
  canalFromSdr,
  isVisitFlag,
  normalizeId,
  normalizeStatus,
  normalizeTipoProposta,
  normHeader,
} from "./normalize";
import type { AgendamentoItem } from "./types";

export type SheetKind = "agendamentos" | "insucessos" | "leads" | "desconhecido";

export type ParsedSchedulingRow = Partial<AgendamentoItem> & {
  id: string;
  kind: SheetKind;
};

const AGENDAMENTOS_ALIASES: Record<string, string> = {
  "#id": "id",
  id: "id",
  "atendido por": "sdr",
  "agendado para": "vendedor",
  "agendado em": "dataAgendamento",
  visita: "visita",
  "tipo de negociacao": "tipoProposta",
  "tipo negociacao": "tipoProposta",
  status: "status",
  cliente: "cliente",
  celular: "celular",
};

const INSUCESSOS_ALIASES: Record<string, string> = {
  id: "id",
  "#id": "id",
  "atendido por": "sdr",
  "agendado para": "vendedor",
  visita: "visita",
  "finalizado em": "dataAgendamento",
  motivo: "motivoInsucesso",
  cliente: "cliente",
  "tipo de negociacao": "tipoProposta",
  "tipo negociacao": "tipoProposta",
  celular: "celular",
  "e-mail": "email",
  email: "email",
  origem: "origem",
};

const LEADS_ALIASES: Record<string, string> = {
  id: "id",
  "#id": "id",
  "criado em": "dataAgendamento",
  responsavel: "sdr",
  "atendido por": "sdr",
  status: "status",
  visita: "visita",
  origem: "origem",
  "tipo proposta": "tipoProposta",
  cliente: "cliente",
  celular: "celular",
  "e-mail": "email",
  email: "email",
};

/** Resolve alias; fallback para cabeçalhos com encoding quebrado. */
function resolveHeaderAlias(
  raw: unknown,
  aliases: Record<string, string>
): string | undefined {
  const norm = normHeader(raw);
  if (aliases[norm]) return aliases[norm];
  // Mojibake residual / variações: ResponsÃ¡vel → responsa¡vel
  if (norm.startsWith("responsa") || norm.includes("responsavel")) return "sdr";
  if (norm.includes("atendido")) return "sdr";
  return undefined;
}

function mapHeaders(
  row: unknown[],
  aliases: Record<string, string>
): Record<string, number> {
  const map: Record<string, number> = {};
  row.forEach((cell, idx) => {
    const key = resolveHeaderAlias(cell, aliases);
    if (key && map[key] === undefined) map[key] = idx;
  });
  return map;
}

function cell(row: unknown[], idx: number | undefined): unknown {
  if (idx === undefined) return "";
  return row[idx] ?? "";
}

function detectKind(headerRow: unknown[]): SheetKind {
  const headers = headerRow.map(normHeader);
  const has = (h: string) => headers.includes(h);
  if (has("motivo") && (has("origem") || has("finalizado em"))) return "insucessos";
  if (has("agendado para") && has("agendado em") && has("status")) return "agendamentos";
  if (has("agendado para") && has("#id")) return "agendamentos";
  if (has("criado em") && has("origem") && has("tipo proposta")) return "leads";
  if (has("motivo")) return "insucessos";
  return "desconhecido";
}

function findHeaderRow(rows: unknown[][]): { index: number; kind: SheetKind } {
  const max = Math.min(rows.length, 15);
  for (let i = 0; i < max; i++) {
    const kind = detectKind(rows[i] as unknown[]);
    if (kind !== "desconhecido") return { index: i, kind };
  }
  return { index: 0, kind: "desconhecido" };
}

function buildBaseItem(
  id: string,
  dataAgendamento: string,
  sdr: string,
  vendedor: string,
  tipoProposta: AgendamentoItem["tipoProposta"],
  status: AgendamentoItem["status"],
  visitaRaw: unknown,
  origem: string,
  motivoInsucesso: string | null,
  cliente: string,
  celular: string,
  email: string
): AgendamentoItem {
  const teveVisita = isVisitFlag(visitaRaw, status);
  return {
    id,
    dataAgendamento,
    sdr,
    vendedor,
    tipoProposta,
    teveVisita,
    status,
    origem: origem || "Não informado",
    motivoInsucesso,
    cliente,
    celular,
    email,
    canal: canalFromSdr(sdr),
    monthKey: isoToMonthKey(dataAgendamento),
    periodKey: isoToPeriodKey(dataAgendamento),
  };
}

export function parseSchedulingArrayBuffer(buffer: ArrayBuffer): {
  kind: SheetKind;
  rows: ParsedSchedulingRow[];
} {
  // codepage 65001 = UTF-8 (CSV exportado do sistema com acentos em Responsável)
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    codepage: 65001,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Planilha vazia: nenhuma aba encontrada.");
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (rows.length < 2) throw new Error("Planilha sem dados.");

  const { index: headerIndex, kind } = findHeaderRow(rows);
  if (kind === "desconhecido") {
    throw new Error(
      "Não foi possível identificar o tipo de planilha (agendamentos, insucessos ou leads)."
    );
  }

  const aliases =
    kind === "agendamentos"
      ? AGENDAMENTOS_ALIASES
      : kind === "insucessos"
        ? INSUCESSOS_ALIASES
        : LEADS_ALIASES;

  const headers = mapHeaders(rows[headerIndex] as unknown[], aliases);
  if (headers.id === undefined) {
    throw new Error("Coluna obrigatória ausente: ID");
  }

  // Excel costuma reservar ~1M linhas vazias — para após sequência vazia.
  const parsed: ParsedSchedulingRow[] = [];
  let emptyStreak = 0;

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || !row.some((c) => String(c ?? "").trim() !== "")) {
      emptyStreak += 1;
      if (emptyStreak > 50) break;
      continue;
    }
    emptyStreak = 0;

    const id = normalizeId(cell(row, headers.id));
    if (!id) continue;

    if (kind === "agendamentos") {
      const dataAgendamento =
        toIsoDate(cell(row, headers.dataAgendamento)) ||
        toIsoDate(new Date()) ||
        "1970-01-01";
      const sdr = String(cell(row, headers.sdr) ?? "").trim() || "(sem SDR)";
      const vendedor =
        String(cell(row, headers.vendedor) ?? "").trim() || "(sem vendedor)";
      const tipoProposta = normalizeTipoProposta(cell(row, headers.tipoProposta));
      const status = normalizeStatus(cell(row, headers.status));
      const visitaRaw = cell(row, headers.visita);
      // Insucesso com visita deve contar visita
      const statusForVisit =
        status === "Insucesso" && isVisitFlag(visitaRaw, "Agendado")
          ? "Visita"
          : status;
      const item = buildBaseItem(
        id,
        dataAgendamento,
        sdr,
        vendedor,
        tipoProposta,
        status,
        visitaRaw,
        "",
        null,
        String(cell(row, headers.cliente) ?? "").trim(),
        String(cell(row, headers.celular) ?? "").trim(),
        ""
      );
      item.teveVisita = isVisitFlag(visitaRaw, statusForVisit);
      parsed.push({ ...item, kind });
      continue;
    }

    if (kind === "insucessos") {
      const dataAgendamento = toIsoDate(cell(row, headers.dataAgendamento));
      const sdr = String(cell(row, headers.sdr) ?? "").trim();
      const vendedor = String(cell(row, headers.vendedor) ?? "").trim();
      const tipoProposta = normalizeTipoProposta(cell(row, headers.tipoProposta));
      const visitaRaw = cell(row, headers.visita);
      const motivo = String(cell(row, headers.motivoInsucesso) ?? "").trim() || null;
      const origem = String(cell(row, headers.origem) ?? "").trim();
      parsed.push({
        id,
        kind,
        dataAgendamento: dataAgendamento || undefined,
        sdr: sdr || undefined,
        vendedor: vendedor || undefined,
        tipoProposta,
        status: "Insucesso",
        teveVisita: isVisitFlag(visitaRaw, "Insucesso"),
        origem: origem || undefined,
        motivoInsucesso: motivo,
        cliente: String(cell(row, headers.cliente) ?? "").trim() || undefined,
        celular: String(cell(row, headers.celular) ?? "").trim() || undefined,
        email: String(cell(row, headers.email) ?? "").trim() || undefined,
      });
      continue;
    }

    // leads — enriquecimento (origem/email/cliente) e fallback se id novo
    const dataAgendamento = toIsoDate(cell(row, headers.dataAgendamento));
    const sdr = String(cell(row, headers.sdr) ?? "").trim();
    const status = normalizeStatus(cell(row, headers.status));
    const tipoProposta = normalizeTipoProposta(cell(row, headers.tipoProposta));
    const visitaRaw = cell(row, headers.visita);
    parsed.push({
      id,
      kind,
      dataAgendamento: dataAgendamento || undefined,
      sdr: sdr || undefined,
      vendedor: undefined,
      tipoProposta,
      status,
      teveVisita: isVisitFlag(visitaRaw, status),
      origem: String(cell(row, headers.origem) ?? "").trim() || undefined,
      motivoInsucesso: null,
      cliente: String(cell(row, headers.cliente) ?? "").trim() || undefined,
      celular: String(cell(row, headers.celular) ?? "").trim() || undefined,
      email: String(cell(row, headers.email) ?? "").trim() || undefined,
    });
  }

  return { kind, rows: parsed };
}
