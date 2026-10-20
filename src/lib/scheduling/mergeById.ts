import { canalFromSdr } from "./normalize";
import { isoToMonthKey, isoToPeriodKey } from "./dates";
import type {
  AgendamentoItem,
  LeadAtendimentoItem,
  RealizadoItem,
  SchedulingDataset,
  SchedulingImportMeta,
  SucessoItem,
} from "./types";
import type { ParsedSchedulingRow, SheetKind } from "./parseSchedulingExcel";

export type { SheetKind };

function mergeLeadsAtendimentos(
  current: LeadAtendimentoItem[],
  incoming: ParsedSchedulingRow[]
): LeadAtendimentoItem[] {
  const map = new Map(current.map((l) => [l.id, l]));
  for (const row of incoming) {
    if (!row.id) continue;
    const prev = map.get(row.id);
    const sdr = row.sdr?.trim() || prev?.sdr || "(sem SDR)";
    const origem =
      row.origem?.trim() && row.origem.trim() !== "Não informado"
        ? row.origem.trim()
        : prev?.origem || row.origem?.trim() || "Não informado";
    const tipoProposta =
      row.tipoProposta && row.tipoProposta !== "não informado(celulas em branco)"
        ? row.tipoProposta
        : prev?.tipoProposta || row.tipoProposta || "não informado(celulas em branco)";
    map.set(row.id, {
      id: row.id,
      data: row.dataAgendamento || prev?.data || "1970-01-01",
      sdr,
      origem,
      tipoProposta,
    });
  }
  return [...map.values()];
}

function mergeRealizados(
  current: RealizadoItem[],
  incoming: ParsedSchedulingRow[],
  origemById: Map<string, string>
): RealizadoItem[] {
  const map = new Map(current.map((r) => [r.id, r]));
  for (const row of incoming) {
    if (!row.id) continue;
    const prev = map.get(row.id);
    const sdr = row.sdr?.trim() || prev?.sdr || "(sem SDR)";
    const origemFromRow =
      row.origem?.trim() && row.origem.trim() !== "Não informado"
        ? row.origem.trim()
        : "";
    const origem =
      origemFromRow ||
      prev?.origem ||
      origemById.get(row.id) ||
      "Não informado";
    const tipoProposta =
      row.tipoProposta && row.tipoProposta !== "não informado(celulas em branco)"
        ? row.tipoProposta
        : prev?.tipoProposta || row.tipoProposta || "não informado(celulas em branco)";
    map.set(row.id, {
      id: row.id,
      dataAtendido:
        row.dataAtendido || row.dataAgendamento || prev?.dataAtendido || "1970-01-01",
      dataVisita:
        row.dataVisita !== undefined ? row.dataVisita : prev?.dataVisita ?? null,
      teveVisita:
        row.teveVisita !== undefined ? Boolean(row.teveVisita) : Boolean(prev?.teveVisita),
      sdr,
      origem,
      tipoProposta,
      cliente: row.cliente?.trim() || prev?.cliente || "",
      celular: row.celular?.trim() || prev?.celular || "",
    });
  }
  return [...map.values()];
}

function mergeSucessosEventos(
  current: SucessoItem[],
  incoming: ParsedSchedulingRow[]
): SucessoItem[] {
  const map = new Map(current.map((s) => [s.id, s]));
  for (const row of incoming) {
    if (!row.id) continue;
    const prev = map.get(row.id);
    map.set(row.id, {
      id: row.id,
      dataFinalizado:
        row.dataFinalizado ||
        row.dataAgendamento ||
        prev?.dataFinalizado ||
        "1970-01-01",
      sdr: row.sdr?.trim() || prev?.sdr || "(sem SDR)",
      vendedor: row.vendedor?.trim() || prev?.vendedor || "(sem vendedor)",
      tipoProposta:
        row.tipoProposta && row.tipoProposta !== "não informado(celulas em branco)"
          ? row.tipoProposta
          : prev?.tipoProposta || row.tipoProposta || "não informado(celulas em branco)",
      origem:
        row.origem?.trim() && row.origem.trim() !== "Não informado"
          ? row.origem.trim()
          : prev?.origem || "Não informado",
      cliente: row.cliente?.trim() || prev?.cliente || "",
      celular: row.celular?.trim() || prev?.celular || "",
    });
  }
  return [...map.values()];
}

function mergeItem(
  existing: AgendamentoItem | undefined,
  incoming: ParsedSchedulingRow
): AgendamentoItem {
  if (!existing) {
    const dataAgendamento = incoming.dataAgendamento || "1970-01-01";
    const sdr = incoming.sdr || "(sem SDR)";
    const status = incoming.status || "Agendado";
    return {
      id: incoming.id,
      dataAgendamento,
      sdr,
      vendedor: incoming.vendedor || "(sem vendedor)",
      tipoProposta: incoming.tipoProposta || "não informado(celulas em branco)",
      teveVisita: Boolean(incoming.teveVisita),
      status,
      origem: incoming.origem || "Não informado",
      motivoInsucesso: incoming.motivoInsucesso ?? null,
      cliente: incoming.cliente || "",
      celular: incoming.celular || "",
      email: incoming.email || "",
      canal: canalFromSdr(sdr),
      monthKey: isoToMonthKey(dataAgendamento),
      periodKey: isoToPeriodKey(dataAgendamento),
    };
  }

  const sdr = incoming.sdr?.trim() ? incoming.sdr : existing.sdr;
  const dataAgendamento = incoming.dataAgendamento || existing.dataAgendamento;

  // Planilha de agendamentos é fonte autoritativa de status/vendedor/data
  const fromAgenda = incoming.kind === "agendamentos";

  return {
    id: existing.id,
    dataAgendamento,
    sdr,
    vendedor: fromAgenda
      ? incoming.vendedor || existing.vendedor
      : incoming.vendedor?.trim()
        ? incoming.vendedor
        : existing.vendedor,
    tipoProposta: fromAgenda
      ? incoming.tipoProposta || existing.tipoProposta
      : incoming.tipoProposta &&
          incoming.tipoProposta !== "não informado(celulas em branco)"
        ? incoming.tipoProposta
        : existing.tipoProposta,
    teveVisita: fromAgenda
      ? Boolean(incoming.teveVisita)
      : existing.teveVisita || Boolean(incoming.teveVisita),
    status: fromAgenda ? incoming.status || existing.status : existing.status,
    origem:
      incoming.origem && incoming.origem !== "Não informado"
        ? incoming.origem
        : existing.origem,
    motivoInsucesso:
      incoming.motivoInsucesso !== undefined && incoming.motivoInsucesso !== null
        ? incoming.motivoInsucesso
        : existing.motivoInsucesso,
    cliente: incoming.cliente?.trim() ? incoming.cliente : existing.cliente,
    celular: incoming.celular?.trim() ? incoming.celular : existing.celular,
    email: incoming.email?.trim() ? incoming.email : existing.email,
    canal: canalFromSdr(sdr),
    monthKey: isoToMonthKey(dataAgendamento),
    periodKey: isoToPeriodKey(dataAgendamento),
  };
}

export type MergeByIdResult = {
  items: AgendamentoItem[];
  kept: number;
  removed: number;
  enriched: number;
  skipped: number;
  notes: string[];
};

export type MergeByIdOptions = {
  /**
   * Se true, só enriquece IDs já existentes (não cria órfãos).
   * Usado para INSUCESSOS e LEADS GERAL.
   */
  enrichOnly?: boolean;
};

/**
 * Merge acumulativo com dedupe estrito por id.
 * Mesma data de agendamento NÃO remove registros distintos.
 */
export function mergeById(
  existing: AgendamentoItem[],
  incoming: ParsedSchedulingRow[],
  options: MergeByIdOptions = {}
): MergeByIdResult {
  const enrichOnly = Boolean(options.enrichOnly);
  const map = new Map<string, AgendamentoItem>();
  for (const item of existing) {
    map.set(item.id, item);
  }

  let kept = 0;
  let enriched = 0;
  let removed = 0;
  let skipped = 0;
  const notes: string[] = [];
  const seenInBatch = new Map<string, ParsedSchedulingRow>();

  for (const row of incoming) {
    if (!row.id) {
      removed += 1;
      continue;
    }
    // Dedupe dentro do próprio lote por id (última linha vence)
    if (seenInBatch.has(row.id)) {
      removed += 1;
      if (notes.length < 25) {
        notes.push(`Duplicado no arquivo id ${row.id}: mantida última ocorrência`);
      }
    }
    seenInBatch.set(row.id, row);
  }

  for (const row of seenInBatch.values()) {
    const prev = map.get(row.id);
    if (prev) {
      enriched += 1;
      map.set(row.id, mergeItem(prev, row));
    } else if (enrichOnly) {
      skipped += 1;
      if (notes.length < 25) {
        notes.push(`ID ${row.id} ignorado (enrich-only: não existe na base de agendamentos)`);
      }
    } else {
      kept += 1;
      map.set(row.id, mergeItem(undefined, row));
    }
  }

  return {
    items: [...map.values()],
    kept,
    removed,
    enriched,
    skipped,
    notes,
  };
}

export function emptySchedulingDataset(): SchedulingDataset {
  return {
    updatedAt: new Date().toISOString(),
    imports: [],
    items: [],
    leadsAtendimentos: [],
    realizados: [],
    sucessosEventos: [],
  };
}

export function normalizeSchedulingDataset(dataset: SchedulingDataset): SchedulingDataset {
  return {
    ...dataset,
    leadsAtendimentos: dataset.leadsAtendimentos ?? [],
    realizados: dataset.realizados ?? [],
    sucessosEventos: dataset.sucessosEventos ?? [],
  };
}

function dedupeCount(incoming: ParsedSchedulingRow[]): {
  unique: ParsedSchedulingRow[];
  removed: number;
  notes: string[];
} {
  const seen = new Map<string, ParsedSchedulingRow>();
  let removed = 0;
  const notes: string[] = [];
  for (const row of incoming) {
    if (!row.id) {
      removed += 1;
      continue;
    }
    if (seen.has(row.id)) {
      removed += 1;
      if (notes.length < 25) {
        notes.push(`Duplicado no arquivo id ${row.id}: mantida última ocorrência`);
      }
    }
    seen.set(row.id, row);
  }
  return { unique: [...seen.values()], removed, notes };
}

export function applySchedulingImport(
  current: SchedulingDataset,
  incoming: ParsedSchedulingRow[],
  kind: SheetKind,
  fileName: string,
  label?: string
): { dataset: SchedulingDataset; meta: SchedulingImportMeta } {
  const base = normalizeSchedulingDataset(current);

  // REALIZADOS / SUCESSOS: coleções próprias (não entram como órfãos de agendamentos)
  if (kind === "realizados") {
    const { unique, removed, notes } = dedupeCount(incoming);
    const origemById = new Map<string, string>();
    for (const l of base.leadsAtendimentos || []) {
      if (l.origem && l.origem !== "Não informado") origemById.set(l.id, l.origem);
    }
    for (const i of base.items) {
      if (i.origem && i.origem !== "Não informado" && !origemById.has(i.id)) {
        origemById.set(i.id, i.origem);
      }
    }
    const before = (base.realizados || []).length;
    const realizados = mergeRealizados(base.realizados || [], unique, origemById);
    const kept = Math.max(0, realizados.length - before);
    const enriched = unique.length - kept;
    const meta: SchedulingImportMeta = {
      fileName,
      label: label || fileName,
      kind,
      at: new Date().toISOString(),
      received: incoming.length,
      kept,
      removed,
      enriched: Math.max(0, enriched),
      notes: [
        `REALIZADOS: ${realizados.length} atendimentos únicos (Atendido em / Visita em)`,
        ...notes,
      ],
    };
    return {
      dataset: {
        updatedAt: meta.at,
        imports: [meta, ...base.imports].slice(0, 50),
        items: base.items,
        leadsAtendimentos: base.leadsAtendimentos,
        realizados,
        sucessosEventos: base.sucessosEventos,
      },
      meta,
    };
  }

  if (kind === "sucessos") {
    const { unique, removed, notes } = dedupeCount(incoming);
    const before = (base.sucessosEventos || []).length;
    const sucessosEventos = mergeSucessosEventos(base.sucessosEventos || [], unique);
    const kept = Math.max(0, sucessosEventos.length - before);
    const enriched = unique.length - kept;
    const meta: SchedulingImportMeta = {
      fileName,
      label: label || fileName,
      kind,
      at: new Date().toISOString(),
      received: incoming.length,
      kept,
      removed,
      enriched: Math.max(0, enriched),
      notes: [
        `SUCESSOS: ${sucessosEventos.length} eventos únicos (Finalizado em)`,
        ...notes,
      ],
    };
    return {
      dataset: {
        updatedAt: meta.at,
        imports: [meta, ...base.imports].slice(0, 50),
        items: base.items,
        leadsAtendimentos: base.leadsAtendimentos,
        realizados: base.realizados,
        sucessosEventos,
      },
      meta,
    };
  }

  // Insucessos/leads só enriquecem a base de agendamentos — não criam órfãos.
  const enrichOnly = kind === "insucessos" || kind === "leads";
  const { items, kept, removed, enriched, skipped, notes } = mergeById(
    base.items,
    incoming,
    { enrichOnly }
  );

  const leadsAtendimentos =
    kind === "leads"
      ? mergeLeadsAtendimentos(base.leadsAtendimentos || [], incoming)
      : base.leadsAtendimentos || [];

  const leadNote =
    kind === "leads"
      ? [`LEADS GERAL: ${leadsAtendimentos.length} leads únicos (enrich)`]
      : [];

  const meta: SchedulingImportMeta = {
    fileName,
    label: label || fileName,
    kind,
    at: new Date().toISOString(),
    received: incoming.length,
    kept,
    removed: removed + skipped,
    enriched,
    notes: [
      ...(skipped > 0 ? [`${skipped} IDs ignorados (enrich-only)`] : []),
      ...leadNote,
      ...notes,
    ],
  };
  return {
    dataset: {
      updatedAt: meta.at,
      imports: [meta, ...base.imports].slice(0, 50),
      items,
      leadsAtendimentos,
      realizados: base.realizados,
      sucessosEventos: base.sucessosEventos,
    },
    meta,
  };
}
