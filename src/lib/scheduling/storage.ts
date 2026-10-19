import type { SchedulingAdminConfig, SchedulingDataset } from "./types";
import { emptySchedulingDataset, normalizeSchedulingDataset } from "./mergeById";

/** Namespace isolado — não compartilhar com campanhas. */
export const SCHEDULING_DATASET_KEY = "agendamentos_dataset";
export const SCHEDULING_ADMIN_CONFIG_KEY = "agendamentos_admin_config";

export const SCHEDULING_DATA_URL = `${import.meta.env.BASE_URL}data/agendamentos-dataset.json`;
export const SCHEDULING_GITHUB_PATH = "public/data/agendamentos-dataset.json";

const DEFAULT_ADMIN_CONFIG: SchedulingAdminConfig = {
  autoPublish: true,
};

export function loadSchedulingAdminConfig(): SchedulingAdminConfig {
  try {
    const raw = localStorage.getItem(SCHEDULING_ADMIN_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_ADMIN_CONFIG };
    return { ...DEFAULT_ADMIN_CONFIG, ...(JSON.parse(raw) as SchedulingAdminConfig) };
  } catch {
    return { ...DEFAULT_ADMIN_CONFIG };
  }
}

export function saveSchedulingAdminConfig(config: SchedulingAdminConfig) {
  try {
    localStorage.setItem(SCHEDULING_ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

export function loadLocalSchedulingDataset(): SchedulingDataset | null {
  try {
    const raw = localStorage.getItem(SCHEDULING_DATASET_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SchedulingDataset;
  } catch {
    return null;
  }
}

export function saveLocalSchedulingDataset(dataset: SchedulingDataset) {
  try {
    localStorage.setItem(SCHEDULING_DATASET_KEY, JSON.stringify(dataset));
  } catch {
    /* ignore — dataset grande */
  }
}

export async function loadSchedulingDataset(): Promise<SchedulingDataset> {
  const local = loadLocalSchedulingDataset();

  try {
    const res = await fetch(SCHEDULING_DATA_URL, { cache: "no-store" });
    if (res.ok) {
      const published = normalizeSchedulingDataset(
        (await res.json()) as SchedulingDataset
      );
      if (!local) return published;
      // Preferir o mais recente entre publicado e local
      if (new Date(local.updatedAt) > new Date(published.updatedAt)) {
        return normalizeSchedulingDataset(local);
      }
      return published;
    }
  } catch {
    /* rede offline */
  }

  return local ? normalizeSchedulingDataset(local) : emptySchedulingDataset();
}

export function downloadSchedulingDataset(
  dataset: SchedulingDataset,
  fileName = "agendamentos-dataset.json"
) {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadClientsCsv(
  rows: { nome: string; email: string; telefone: string }[],
  fileName = "clientes-agendamentos.csv"
) {
  const header = "nome,email,telefone";
  const body = rows
    .map((r) =>
      [r.nome, r.email, r.telefone]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
