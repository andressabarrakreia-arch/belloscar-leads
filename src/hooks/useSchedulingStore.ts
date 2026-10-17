import { useEffect, useMemo, useState } from "react";
import {
  buildCanalKpis,
  buildComparisonRows,
  buildPeriodSeries,
  buildProposalDistribution,
  buildSdrMetrics,
  buildVendedorMetrics,
  filterAgendamentos,
  getSchedulingFilterOptions,
  splitByCanal,
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
    const { preVenda, recepcao } = splitByCanal(filtered);

    const sdrPreVenda = buildSdrMetrics(preVenda);
    const sdrRecepcao = buildSdrMetrics(recepcao);
    const vendedorMetrics = buildVendedorMetrics(filtered);

    return {
      filtered,
      preVenda,
      recepcao,
      options: getSchedulingFilterOptions(dataset.items),
      kpisPreVenda: buildCanalKpis(preVenda, "Pré-Venda"),
      kpisRecepcao: buildCanalKpis(recepcao, "Recepção"),
      sdrPreVenda,
      sdrRecepcao,
      vendedorMetrics,
      comparisonPreVenda: buildComparisonRows(sdrPreVenda, vendedorMetrics, "Pré-Venda"),
      comparisonRecepcao: buildComparisonRows(sdrRecepcao, vendedorMetrics, "Recepção"),
      proposalsPreVenda: buildProposalDistribution(preVenda),
      proposalsRecepcao: buildProposalDistribution(recepcao),
      periodSeriesPreVenda: buildPeriodSeries(preVenda),
      periodSeriesRecepcao: buildPeriodSeries(recepcao),
    };
  }, [dataset, filters]);
}
