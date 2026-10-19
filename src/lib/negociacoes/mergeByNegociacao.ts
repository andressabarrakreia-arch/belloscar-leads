import type { NegociacaoLine, NegociacoesDataset, NegociacoesImportMeta } from "./types";

export function emptyNegociacoesDataset(): NegociacoesDataset {
  return {
    updatedAt: new Date().toISOString(),
    imports: [],
    lines: [],
  };
}

export function normalizeNegociacoesDataset(dataset: NegociacoesDataset): NegociacoesDataset {
  return {
    ...dataset,
    lines: dataset.lines || [],
    imports: dataset.imports || [],
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

  const incomingIds = new Set(incoming.map((l) => l.negociacaoId));
  let replaced = 0;
  let kept = 0;
  let removed = 0;

  // Dedupe dentro do lote: se o mesmo id aparece, todas as linhas do lote entram juntas
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

  const lines = [...byId.values()].flat();
  void incomingIds;
  return { lines, kept, replaced, removed, notes };
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
    },
    meta,
  };
}
