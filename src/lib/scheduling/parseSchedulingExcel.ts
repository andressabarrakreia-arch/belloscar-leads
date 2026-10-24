import * as XLSX from "xlsx";
import { isoToMonthKey, isoToPeriodKey, toIsoDate } from "./dates";
import {
  canalFromSdr,
  isVisitFlag,
  isVisitYesNo,
  normalizeId,
  normalizeStatus,
  normalizeTipoProposta,
  normHeader,
} from "./normalize";
import type { AgendamentoItem, SchedulingSheetKind } from "./types";

export type SheetKind = SchedulingSheetKind;

export type ParsedSchedulingRow = Partial<AgendamentoItem> & {
  id: string;
  kind: SheetKind;
  /** REALIZADOS: Atendido em */
  dataAtendido?: string;
  /** REALIZADOS: Visita em */
  dataVisita?: string | null;
  /** SUCESSOS: Finalizado em */
  dataFinalizado?: string;
  /** Texto original da coluna Status, antes de normalizar. */
  statusTexto?: string;
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

const REALIZADOS_ALIASES: Record<string, string> = {
  id: "id",
  "#id": "id",
  responsavel: "sdr",
  "atendido por": "sdr",
  "atendido em": "dataAtendido",
  visita: "visita",
  "visita em": "dataVisita",
  "data visita": "dataVisita",
  "data da visita": "dataVisita",
  status: "status",
  cliente: "cliente",
  celular: "celular",
  origem: "origem",
  "tipo proposta": "tipoProposta",
  "tipo de negociacao": "tipoProposta",
};

const SUCESSOS_ALIASES: Record<string, string> = {
  id: "id",
  "#id": "id",
  "finalizado em": "dataFinalizado",
  "atendido por": "sdr",
  "agendado para": "vendedor",
  "tipo de negociacao": "tipoProposta",
  "tipo negociacao": "tipoProposta",
  cliente: "cliente",
  celular: "celular",
  origem: "origem",
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
  // Não mapear "atendido em" como SDR
  if (norm === "atendido por" || norm.startsWith("atendido por")) return "sdr";
  return undefined;
}

function mapHeaders(
  row: unknown[],
  aliases: Record<string, string>
): Record<string, number> {
  const out: Record<string, number> = {};
  row.forEach((cell, idx) => {
    const key = resolveHeaderAlias(cell, aliases);
    if (key && out[key] === undefined) out[key] = idx;
  });
  return out;
}

function cell(row: unknown[], idx: number | undefined): unknown {
  if (idx === undefined) return "";
  return row[idx] ?? "";
}

function aliasesFor(kind: SheetKind): Record<string, string> {
  switch (kind) {
    case "agendamentos":
      return AGENDAMENTOS_ALIASES;
    case "insucessos":
      return INSUCESSOS_ALIASES;
    case "realizados":
      return REALIZADOS_ALIASES;
    case "sucessos":
      return SUCESSOS_ALIASES;
    case "leads":
      return LEADS_ALIASES;
    default:
      return LEADS_ALIASES;
  }
}

function detectKind(headerRow: unknown[]): SheetKind {
  const headers = headerRow.map(normHeader);
  const has = (h: string) => headers.includes(h);
  const hasPrefix = (p: string) => headers.some((h) => h.startsWith(p) || h.includes(p));

  // Insucessos: tem Motivo (+ Finalizado em / Origem)
  if (has("motivo") && (has("origem") || has("finalizado em"))) return "insucessos";
  if (has("motivo")) return "insucessos";

  // Sucessos: Finalizado em sem Motivo
  if (has("finalizado em") && (has("atendido por") || hasPrefix("veiculo"))) {
    return "sucessos";
  }

  // AGENDAMENTOS: Agendado em + Agendado para (pode também ter Atendido em / Visita em)
  if (has("agendado em") && has("agendado para")) return "agendamentos";
  if (has("agendado para") && has("status") && has("#id")) return "agendamentos";

  // REALIZADOS: Atendido em + Visita, sem Agendado em (coluna "Agendado" = Sim/Não)
  if (
    has("atendido em") &&
    (has("visita") || has("visita em") || has("data visita")) &&
    !has("agendado em")
  ) {
    return "realizados";
  }
  if (has("atendido em") && hasPrefix("responsa") && !has("agendado em")) {
    return "realizados";
  }

  if (has("criado em") && has("origem") && has("tipo proposta")) return "leads";
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
      "Não foi possível identificar o tipo de planilha (agendamentos, insucessos, realizados, sucessos ou leads)."
    );
  }

  const aliases = aliasesFor(kind);
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

    if (kind === "realizados") {
      const dataAtendido =
        toIsoDate(cell(row, headers.dataAtendido)) ||
        toIsoDate(cell(row, headers.dataAgendamento)) ||
        undefined;
      const dataVisita = toIsoDate(cell(row, headers.dataVisita)) || null;
      const teveVisita = isVisitYesNo(cell(row, headers.visita));
      const sdr = String(cell(row, headers.sdr) ?? "").trim() || "(sem SDR)";
      parsed.push({
        id,
        kind,
        dataAtendido,
        dataVisita,
        dataAgendamento: dataAtendido,
        sdr,
        teveVisita,
        status: normalizeStatus(cell(row, headers.status)),
        origem: String(cell(row, headers.origem) ?? "").trim() || undefined,
        tipoProposta: normalizeTipoProposta(cell(row, headers.tipoProposta)),
        cliente: String(cell(row, headers.cliente) ?? "").trim() || undefined,
        celular: String(cell(row, headers.celular) ?? "").trim() || undefined,
      });
      continue;
    }

    if (kind === "sucessos") {
      const dataFinalizado = toIsoDate(cell(row, headers.dataFinalizado)) || undefined;
      const sdr = String(cell(row, headers.sdr) ?? "").trim() || "(sem SDR)";
      const vendedor =
        String(cell(row, headers.vendedor) ?? "").trim() || "(sem vendedor)";
      parsed.push({
        id,
        kind,
        dataFinalizado,
        dataAgendamento: dataFinalizado,
        sdr,
        vendedor,
        tipoProposta: normalizeTipoProposta(cell(row, headers.tipoProposta)),
        status: "Sucesso",
        teveVisita: true,
        origem: String(cell(row, headers.origem) ?? "").trim() || undefined,
        cliente: String(cell(row, headers.cliente) ?? "").trim() || undefined,
        celular: String(cell(row, headers.celular) ?? "").trim() || undefined,
      });
      continue;
    }

    // leads — enriquecimento (origem/email/cliente)
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
      statusTexto: String(cell(row, headers.status) ?? "").trim(),
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
