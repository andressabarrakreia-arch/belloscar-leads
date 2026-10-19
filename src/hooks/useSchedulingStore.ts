import { useEffect, useMemo, useState } from "react";
import {
  buildCanalKpis,
  buildInsucessoKpis,
  buildMotivosBySdr,
  buildMotivosByVendedor,
  buildMotivosStats,
  buildPeriodSeries,
  buildProposalDistribution,
  buildRecepcaoConsolidatedMetrics,
  buildSdrPreVendaRows,
  buildSdrVendedorProposalRows,
  buildVendedorComparisonRows,
  buildVendedorMetrics,
  filterAgendamentos,
  filterLeadsAtendimentos,
  getSchedulingFilterOptions,
  splitByCanal,
} from "../lib/scheduling/metrics";
import { isRecepcaoName } from "../lib/scheduling/normalize";
import { buildPortalDashboard } from "../lib/scheduling/portalMetrics";
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
    const filteredLeads = filterLeadsAtendimentos(
      dataset.leadsAtendimentos || [],
      filters
    );
    const { preVenda, recepcao } = splitByCanal(filtered);
    const leadsPv = filteredLeads.filter((l) => !isRecepcaoName(l.sdr));
    const leadsRec = filteredLeads.filter((l) => isRecepcaoName(l.sdr));

    const sdrPreVendaRows = buildSdrPreVendaRows(preVenda, leadsPv);
    const sdrRecepcao = buildRecepcaoConsolidatedMetrics(recepcao, leadsRec);
    const vendedorMetrics = buildVendedorMetrics(filtered);

    return {
      filtered,
      filteredLeads,
      preVenda,
      recepcao,
      options: getSchedulingFilterOptions(dataset.items),
      kpisPreVenda: buildCanalKpis(preVenda, "Pré-Venda"),
      kpisRecepcao: buildCanalKpis(recepcao, "Recepção"),
      sdrPreVendaRows,
      sdrRecepcao,
      vendedorMetrics,
      comparisonVendedoresPreVenda: buildVendedorComparisonRows(vendedorMetrics, "Pré-Venda"),
      comparisonVendedoresRecepcao: buildVendedorComparisonRows(vendedorMetrics, "Recepção"),
      sdrVendedorPairs: buildSdrVendedorProposalRows(preVenda),
      proposalsPreVenda: buildProposalDistribution(preVenda),
      proposalsRecepcao: buildProposalDistribution(recepcao),
      periodSeriesPreVenda: buildPeriodSeries(preVenda),
      periodSeriesRecepcao: buildPeriodSeries(recepcao),
      insucessoKpis: buildInsucessoKpis(filtered),
      motivosInsucesso: buildMotivosStats(filtered),
      motivosBySdr: buildMotivosBySdr(filtered),
      motivosByVendedor: buildMotivosByVendedor(filtered),
      portais: buildPortalDashboard(filtered, filteredLeads),
    };
  }, [dataset, filters]);
}
