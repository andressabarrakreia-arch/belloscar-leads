import { emptyNegociacoesDataset, normalizeNegociacoesDataset } from "./mergeByNegociacao";
import type { NegociacoesAdminConfig, NegociacoesDataset } from "./types";

/** Namespace isolado — não compartilhar com campanhas/agendamentos. */
export const NEGOCIACOES_DATASET_KEY = "negociacoes_dataset";
export const NEGOCIACOES_ADMIN_CONFIG_KEY = "negociacoes_admin_config";

export const NEGOCIACOES_DATA_URL = `${import.meta.env.BASE_URL}data/negociacoes-dataset.json`;
export const NEGOCIACOES_GITHUB_PATH = "public/data/negociacoes-dataset.json";

const DEFAULT_ADMIN_CONFIG: NegociacoesAdminConfig = {
  autoPublish: true,
};

export function loadNegociacoesAdminConfig(): NegociacoesAdminConfig {
  try {
    const raw = localStorage.getItem(NEGOCIACOES_ADMIN_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_ADMIN_CONFIG };
    return { ...DEFAULT_ADMIN_CONFIG, ...(JSON.parse(raw) as NegociacoesAdminConfig) };
  } catch {
    return { ...DEFAULT_ADMIN_CONFIG };
  }
}

export function saveNegociacoesAdminConfig(config: NegociacoesAdminConfig) {
  try {
    localStorage.setItem(NEGOCIACOES_ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

export function loadLocalNegociacoesDataset(): NegociacoesDataset | null {
  try {
    const raw = localStorage.getItem(NEGOCIACOES_DATASET_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NegociacoesDataset;
  } catch {
    return null;
  }
}

export function saveLocalNegociacoesDataset(dataset: NegociacoesDataset) {
  try {
    localStorage.setItem(NEGOCIACOES_DATASET_KEY, JSON.stringify(dataset));
  } catch {
    /* ignore */
  }
}

export async function loadNegociacoesDataset(): Promise<NegociacoesDataset> {
  const local = loadLocalNegociacoesDataset();

  try {
    const res = await fetch(NEGOCIACOES_DATA_URL, { cache: "no-store" });
    if (res.ok) {
      const published = normalizeNegociacoesDataset(
        (await res.json()) as NegociacoesDataset
      );
      if (!local) return published;
      if (new Date(local.updatedAt) > new Date(published.updatedAt)) {
        return normalizeNegociacoesDataset(local);
      }
      return published;
    }
  } catch {
    /* offline */
  }

  return local ? normalizeNegociacoesDataset(local) : emptyNegociacoesDataset();
}

export function downloadNegociacoesDataset(
  dataset: NegociacoesDataset,
  fileName = "negociacoes-dataset.json"
) {
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
