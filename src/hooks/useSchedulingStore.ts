import { useEffect, useMemo, useState } from "react";
import {
  buildComparisonRows,
  buildGlobalKpis,
  buildPeriodSeries,
  buildProposalDistribution,
  buildSdrMetrics,
  buildTimeSeries,
  buildVendedorMetrics,
  filterAgendamentos,
  getSchedulingFilterOptions,
} from "../lib/scheduling/metrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import type { SchedulingDataset, SchedulingFilters } from "../lib/scheduling/types";

export function useSchedulingStore() {
  const [dataset, setDataset] = useState<SchedulingDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedulingDataset()
      .then(setDataset)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar agendamentos"))
      .finally(() => setLoading(false));
  }, []);

  return { dataset, setDataset, error, loading };
}

export function useSchedulingAnalytics(
  dataset: SchedulingDataset | null,
  filters: SchedulingFilters
) {
  return useMemo(() => {
    if (!dataset) return null;
    const filtered = filterAgendamentos(dataset.items, filters);
    const sdrMetrics = buildSdrMetrics(filtered);
    const vendedorMetrics = buildVendedorMetrics(filtered);
    return {
      filtered,
      options: getSchedulingFilterOptions(dataset.items),
      kpis: buildGlobalKpis(filtered),
      sdrMetrics,
      vendedorMetrics,
      comparison: buildComparisonRows(sdrMetrics, vendedorMetrics),
      proposals: buildProposalDistribution(filtered),
      timeSeries: buildTimeSeries(filtered),
      periodSeries: buildPeriodSeries(filtered),
    };
  }, [dataset, filters]);
}
