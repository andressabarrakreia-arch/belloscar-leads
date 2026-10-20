import { useEffect, useMemo, useState } from "react";
import {
  buildLancamentoRows,
  buildNegociacoesKpis,
  buildPeriodSeries,
  buildUnifiedRankings,
  buildVendedorRows,
  dealsFromLines,
  filterAvaliacoes,
  filterDeals,
  getNegociacoesFilterOptions,
  statusBreakdown,
} from "../lib/negociacoes/metrics";
import { loadNegociacoesDataset } from "../lib/negociacoes/storage";
import type { NegociacoesDataset, NegociacoesFilters } from "../lib/negociacoes/types";

export function useNegociacoesStore() {
  const [dataset, setDataset] = useState<NegociacoesDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNegociacoesDataset()
      .then(setDataset)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar negociações")
      )
      .finally(() => setLoading(false));
  }, []);

  return { dataset, setDataset, error, loading };
}

export function useNegociacoesAnalytics(
  dataset: NegociacoesDataset | null,
  filters: NegociacoesFilters
) {
  return useMemo(() => {
    if (!dataset) return null;
    const allDeals = dealsFromLines(dataset.lines);
    const filtered = filterDeals(allDeals, filters);
    const vendedores = buildVendedorRows(filtered);
    const avaliacoes = filterAvaliacoes(dataset.avaliacoes || [], filters);
    return {
      allDeals,
      filtered,
      options: getNegociacoesFilterOptions(allDeals),
      kpis: buildNegociacoesKpis(filtered),
      vendedores,
      avaliacoes,
      rankings: buildUnifiedRankings(vendedores, avaliacoes),
      periodSeries: buildPeriodSeries(filtered),
      statusRows: statusBreakdown(filtered),
      lancamentos: buildLancamentoRows(filtered),
    };
  }, [dataset, filters]);
}
