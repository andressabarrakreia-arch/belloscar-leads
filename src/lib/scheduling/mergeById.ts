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

function isMissingOrigem(origem?: string | null): boolean {
  const s = (origem || "").trim();
  return !s || s === "Não informado";
}

function isMissingTipo(
  tipo?: RealizadoItem["tipoProposta"] | AgendamentoItem["tipoProposta"] | null
): boolean {
  return !tipo || tipo === "não informado(celulas em branco)";
}

/**
 * Após qualquer import: recruzar por ID origem/tipo entre
 * LEADS GERAL ↔ REALIZADOS ↔ agenda ↔ SUCESSOS.
 * Assim subir LEADS depois do REALIZADOS já atualiza Portais sem reenviar tudo.
 */
export function reconcileSchedulingDataset(dataset: SchedulingDataset): {
  dataset: SchedulingDataset;
  notes: string[];
} {
  const base = normalizeSchedulingDataset(dataset);
  const origemById = new Map<string, string>();
  const tipoById = new Map<string, RealizadoItem["tipoProposta"]>();

  const preferOrigem = (id: string, origem?: string | null) => {
    if (isMissingOrigem(origem)) return;
    if (!origemById.has(id)) origemById.set(id, origem!.trim());
  };
  const preferTipo = (
    id: string,
    tipo?: RealizadoItem["tipoProposta"] | null
  ) => {
    if (isMissingTipo(tipo)) return;
    if (!tipoById.has(id)) tipoById.set(id, tipo!);
  };

  // Prioridade: LEADS (mais completo) → agenda → sucessos → realizados
  for (const l of base.leadsAtendimentos || []) {
    preferOrigem(l.id, l.origem);
    preferTipo(l.id, l.tipoProposta);
  }
  for (const i of base.items) {
    preferOrigem(i.id, i.origem);
    preferTipo(i.id, i.tipoProposta);
  }
  for (const s of base.sucessosEventos || []) {
    preferOrigem(s.id, s.origem);
    preferTipo(s.id, s.tipoProposta);
  }
  for (const r of base.realizados || []) {
    preferOrigem(r.id, r.origem);
    preferTipo(r.id, r.tipoProposta);
  }

  let filledRealizados = 0;
  let filledItems = 0;
  let filledSucessos = 0;
  let filledTipos = 0;

  const realizados = (base.realizados || []).map((r) => {
    let next = r;
    if (isMissingOrigem(r.origem) && origemById.has(r.id)) {
      filledRealizados += 1;
      next = { ...next, origem: origemById.get(r.id)! };
    }
    if (isMissingTipo(next.tipoProposta) && tipoById.has(r.id)) {
      filledTipos += 1;
      next = { ...next, tipoProposta: tipoById.get(r.id)! };
    }
    return next;
  });

  const items = base.items.map((i) => {
    let next = i;
    if (isMissingOrigem(i.origem) && origemById.has(i.id)) {
      filledItems += 1;
      next = { ...next, origem: origemById.get(i.id)! };
    }
    if (isMissingTipo(next.tipoProposta) && tipoById.has(i.id)) {
      filledTipos += 1;
      next = { ...next, tipoProposta: tipoById.get(i.id)! };
    }
    return next;
  });

  const sucessosEventos = (base.sucessosEventos || []).map((s) => {
    if (isMissingOrigem(s.origem) && origemById.has(s.id)) {
      filledSucessos += 1;
      return { ...s, origem: origemById.get(s.id)! };
    }
    return s;
  });

  const notes: string[] = [];
  if (filledRealizados > 0) {
    notes.push(
      `Reconciliação: origem preenchida em ${filledRealizados} REALIZADOS (cruzamento por ID)`
    );
  }
  if (filledItems > 0) {
    notes.push(
      `Reconciliação: origem preenchida em ${filledItems} agendamentos (cruzamento por ID)`
    );
  }
  if (filledSucessos > 0) {
    notes.push(
      `Reconciliação: origem preenchida em ${filledSucessos} SUCESSOS (cruzamento por ID)`
    );
  }
  if (filledTipos > 0) {
    notes.push(`Reconciliação: tipo de proposta preenchido em ${filledTipos} registros`);
  }
  if (notes.length === 0) {
    notes.push("Reconciliação: coleções já alinhadas por ID");
  }

  return {
    dataset: {
      ...base,
      items,
      realizados,
      sucessosEventos,
      leadsAtendimentos: base.leadsAtendimentos,
    },
    notes,
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

function finishImport(
  draft: SchedulingDataset,
  meta: SchedulingImportMeta
): { dataset: SchedulingDataset; meta: SchedulingImportMeta } {
  const { dataset: reconciled, notes: reconNotes } = reconcileSchedulingDataset(draft);
  const fullMeta: SchedulingImportMeta = {
    ...meta,
    notes: [...meta.notes, ...reconNotes],
  };
  return {
    dataset: {
      ...reconciled,
      updatedAt: meta.at,
      imports: [fullMeta, ...(draft.imports || [])].slice(0, 50),
    },
    meta: fullMeta,
  };
}

export function applySchedulingImport(
  current: SchedulingDataset,
  incoming: ParsedSchedulingRow[],
  kind: SheetKind,
  fileName: string,
  label?: string
): { dataset: SchedulingDataset; meta: SchedulingImportMeta } {
  const base = normalizeSchedulingDataset(current);
  const at = new Date().toISOString();

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
      at,
      received: incoming.length,
      kept,
      removed,
      enriched: Math.max(0, enriched),
      notes: [
        `REALIZADOS: ${realizados.length} atendimentos únicos (Atendido em / Visita em)`,
        ...notes,
      ],
    };
    return finishImport(
      {
        updatedAt: at,
        imports: base.imports,
        items: base.items,
        leadsAtendimentos: base.leadsAtendimentos,
        realizados,
        sucessosEventos: base.sucessosEventos,
      },
      meta
    );
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
      at,
      received: incoming.length,
      kept,
      removed,
      enriched: Math.max(0, enriched),
      notes: [
        `SUCESSOS: ${sucessosEventos.length} eventos únicos (Finalizado em)`,
        ...notes,
      ],
    };
    return finishImport(
      {
        updatedAt: at,
        imports: base.imports,
        items: base.items,
        leadsAtendimentos: base.leadsAtendimentos,
        realizados: base.realizados,
        sucessosEventos,
      },
      meta
    );
  }

  // Insucessos só enriquecem a agenda. LEADS: agenda enrich-only + volume em leadsAtendimentos.
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
      ? [
          `LEADS GERAL: ${leadsAtendimentos.length} leads únicos na base`,
          "Após o import, origem/tipo são recruzados por ID em REALIZADOS/agenda/SUCESSOS",
        ]
      : [];

  const meta: SchedulingImportMeta = {
    fileName,
    label: label || fileName,
    kind,
    at,
    received: incoming.length,
    kept,
    removed: removed + skipped,
    enriched,
    notes: [
      ...(skipped > 0
        ? [`${skipped} IDs sem agendamento (não criam órfãos na agenda)`]
        : []),
      ...leadNote,
      ...notes,
    ],
  };
  return finishImport(
    {
      updatedAt: at,
      imports: base.imports,
      items,
      leadsAtendimentos,
      realizados: base.realizados,
      sucessosEventos: base.sucessosEventos,
    },
    meta
  );
}
