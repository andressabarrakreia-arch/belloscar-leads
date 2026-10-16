import type { Dataset, ImportMeta, Lead, ParsedLead } from "./types";
import { mergeAndDedupe } from "./dedupe";

const DATA_URL = `${import.meta.env.BASE_URL}data/dataset.json`;

export async function loadDataset(): Promise<Dataset> {
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) {
    return { updatedAt: new Date().toISOString(), imports: [], leads: [] };
  }
  return (await res.json()) as Dataset;
}

export function emptyDataset(): Dataset {
  return { updatedAt: new Date().toISOString(), imports: [], leads: [] };
}

export function applyImport(
  current: Dataset,
  incoming: ParsedLead[],
  fileName: string,
  label?: string
): { dataset: Dataset; meta: ImportMeta } {
  const { leads, removedCount, keptIncoming, notes } = mergeAndDedupe(current.leads, incoming);
  const meta: ImportMeta = {
    fileName,
    label: label || fileName,
    at: new Date().toISOString(),
    received: incoming.length,
    kept: keptIncoming,
    removed: removedCount,
    notes,
  };
  const dataset: Dataset = {
    updatedAt: meta.at,
    imports: [meta, ...current.imports].slice(0, 50),
    leads,
  };
  return { dataset, meta };
}

export function downloadDataset(dataset: Dataset, fileName = "dataset.json") {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export type { Lead, Dataset };
