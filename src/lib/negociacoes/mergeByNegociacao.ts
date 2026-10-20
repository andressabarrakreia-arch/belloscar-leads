import type {
  AvaliacaoConvRow,
  NegociacaoLine,
  NegociacoesDataset,
  NegociacoesImportMeta,
} from "./types";

export function emptyNegociacoesDataset(): NegociacoesDataset {
  return {
    updatedAt: new Date().toISOString(),
    imports: [],
    lines: [],
    avaliacoes: [],
  };
}

export function normalizeNegociacoesDataset(dataset: NegociacoesDataset): NegociacoesDataset {
  return {
    ...dataset,
    lines: dataset.lines || [],
    imports: dataset.imports || [],
    avaliacoes: dataset.avaliacoes || [],
  };
}

/**
 * Merge acumulativo: substitui todas as linhas do mesmo nº de Negociação
 * pelas do arquivo novo (arquivo mais recente vence o grupo).
 */
export function mergeByNegociacao(
  existing: NegociacaoLine[],
  incoming: NegociacaoLine[]
): { lines: NegociacaoLine[]; kept: number; replaced: number; removed: number; notes: string[] } {
  const notes: string[] = [];
  const byId = new Map<string, NegociacaoLine[]>();
  for (const line of existing) {
    const list = byId.get(line.negociacaoId) || [];
    list.push(line);
    byId.set(line.negociacaoId, list);
  }

  let replaced = 0;
  let kept = 0;
  let removed = 0;

  const batchById = new Map<string, NegociacaoLine[]>();
  for (const line of incoming) {
    if (!line.negociacaoId) {
      removed += 1;
      continue;
    }
    const list = batchById.get(line.negociacaoId) || [];
    list.push(line);
    batchById.set(line.negociacaoId, list);
  }

  for (const [id, group] of batchById) {
    if (byId.has(id)) {
      replaced += 1;
      if (notes.length < 25) {
        notes.push(`Negociação ${id}: atualizada com arquivo novo (${group.length} linha(s))`);
      }
    } else {
      kept += 1;
    }
    byId.set(id, group);
  }

  return { lines: [...byId.values()].flat(), kept, replaced, removed, notes };
}

/** Substitui avaliações dos meses presentes no arquivo novo; mantém os demais. */
export function mergeAvaliacoes(
  existing: AvaliacaoConvRow[],
  incoming: AvaliacaoConvRow[]
): { avaliacoes: AvaliacaoConvRow[]; kept: number; replaced: number; notes: string[] } {
  const months = new Set(incoming.map((r) => r.monthKey));
  const keptMonths = existing.filter((r) => !months.has(r.monthKey));
  const notes = [...months].slice(0, 12).map((m) => `Avaliações ${m}: substituídas pelo arquivo novo`);
  return {
    avaliacoes: [...keptMonths, ...incoming],
    kept: incoming.length,
    replaced: months.size,
    notes,
  };
}

export function applyNegociacoesImport(
  current: NegociacoesDataset,
  incoming: NegociacaoLine[],
  fileName: string,
  label?: string
): { dataset: NegociacoesDataset; meta: NegociacoesImportMeta } {
  const base = normalizeNegociacoesDataset(current);
  const { lines, kept, replaced, removed, notes } = mergeByNegociacao(base.lines, incoming);

  const meta: NegociacoesImportMeta = {
    fileName,
    label: label || fileName,
    at: new Date().toISOString(),
    received: incoming.length,
    kept,
    replaced,
    removed,
    notes,
  };

  return {
    dataset: {
      updatedAt: meta.at,
      imports: [meta, ...base.imports].slice(0, 50),
      lines,
      avaliacoes: base.avaliacoes,
    },
    meta,
  };
}

export function applyAvaliacoesImport(
  current: NegociacoesDataset,
  incoming: AvaliacaoConvRow[],
  fileName: string,
  label?: string
): { dataset: NegociacoesDataset; meta: NegociacoesImportMeta } {
  const base = normalizeNegociacoesDataset(current);
  const { avaliacoes, kept, replaced, notes } = mergeAvaliacoes(base.avaliacoes, incoming);

  const meta: NegociacoesImportMeta = {
    fileName,
    label: label || fileName,
    at: new Date().toISOString(),
    received: incoming.length,
    kept,
    replaced,
    removed: 0,
    notes: ["Tipo: conversão de avaliações", ...notes],
  };

  return {
    dataset: {
      updatedAt: meta.at,
      imports: [meta, ...base.imports].slice(0, 50),
      lines: base.lines,
      avaliacoes,
    },
    meta,
  };
}
