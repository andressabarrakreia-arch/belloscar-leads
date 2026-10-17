import { canalFromSdr } from "./normalize";
import { isoToMonthKey, isoToPeriodKey } from "./dates";
import type { AgendamentoItem, SchedulingDataset, SchedulingImportMeta } from "./types";
import type { ParsedSchedulingRow, SheetKind } from "./parseSchedulingExcel";

export type { SheetKind };

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
  notes: string[];
};

/**
 * Merge acumulativo com dedupe estrito por id.
 * Mesma data de agendamento NÃO remove registros distintos.
 */
export function mergeById(
  existing: AgendamentoItem[],
  incoming: ParsedSchedulingRow[]
): MergeByIdResult {
  const map = new Map<string, AgendamentoItem>();
  for (const item of existing) {
    map.set(item.id, item);
  }

  let kept = 0;
  let enriched = 0;
  let removed = 0;
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
    notes,
  };
}

export function emptySchedulingDataset(): SchedulingDataset {
  return {
    updatedAt: new Date().toISOString(),
    imports: [],
    items: [],
  };
}

export function applySchedulingImport(
  current: SchedulingDataset,
  incoming: ParsedSchedulingRow[],
  kind: SheetKind,
  fileName: string,
  label?: string
): { dataset: SchedulingDataset; meta: SchedulingImportMeta } {
  const { items, kept, removed, enriched, notes } = mergeById(current.items, incoming);
  const meta: SchedulingImportMeta = {
    fileName,
    label: label || fileName,
    kind,
    at: new Date().toISOString(),
    received: incoming.length,
    kept,
    removed,
    enriched,
    notes,
  };
  return {
    dataset: {
      updatedAt: meta.at,
      imports: [meta, ...current.imports].slice(0, 50),
      items,
    },
    meta,
  };
}
