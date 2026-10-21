import { useEffect, useMemo, useState } from "react";
import { indexCampanhas, type CampanhaRecord } from "../lib/campanhas/analytics";
import { SCHEDULING_DATA_URL } from "../lib/scheduling/storage";
import { normalizeSchedulingDataset } from "../lib/scheduling/mergeById";
import type { SchedulingDataset } from "../lib/scheduling/types";

/**
 * Lê o JSON publicado de agendamentos (não o localStorage desse módulo)
 * e recorta o universo Meta. Campanhas não grava chave de Agendamentos.
 */
export function useCampanhas() {
  const [dataset, setDataset] = useState<SchedulingDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(SCHEDULING_DATA_URL, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível carregar a base publicada.");
        return normalizeSchedulingDataset((await res.json()) as SchedulingDataset);
      })
      .then((data) => {
        if (!cancelled) setDataset(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar campanhas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo<CampanhaRecord[]>(
    () => (dataset ? indexCampanhas(dataset) : []),
    [dataset]
  );

  return { dataset, rows, loading, error };
}
