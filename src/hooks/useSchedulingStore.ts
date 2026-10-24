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
  eventMatchesCanal,
  filterAgendamentos,
  filterLeadsAtendimentos,
  filterRealizadosAtendimentos,
  filterRealizadosVisitas,
  filterSucessosEventos,
  getSchedulingFilterOptions,
  splitByCanal,
} from "../lib/scheduling/metrics";
import { isRecepcaoName } from "../lib/scheduling/normalize";
import { buildPortalDashboard } from "../lib/scheduling/portalMetrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import type {
  LeadAtendimentoItem,
  SchedulingDataset,
  SchedulingFilters,
} from "../lib/scheduling/types";

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
    const realizados = dataset.realizados || [];
    const filteredRealizados = filterRealizadosAtendimentos(realizados, filters);
    const filteredVisitas = filterRealizadosVisitas(realizados, filters);
    const filteredSucessos = filterSucessosEventos(
      dataset.sucessosEventos || [],
      filters
    );

    // Fallback legado: sem REALIZADOS, usa LEADS GERAL para atendimentos
    const legacyLeads = filterLeadsAtendimentos(
      dataset.leadsAtendimentos || [],
      filters
    );
    const atendSource =
      realizados.length > 0
        ? filteredRealizados
        : legacyLeads.map(
            (l): LeadAtendimentoItem & { dataAtendido?: string } => l
          );

    const { preVenda, recepcao } = splitByCanal(filtered);
    const atendPv = filteredRealizados.filter((l) => !isRecepcaoName(l.sdr));
    const atendRec = filteredRealizados.filter((l) => isRecepcaoName(l.sdr));
    const visitasPv = filteredVisitas.filter((l) => !isRecepcaoName(l.sdr));
    const visitasRec = filteredVisitas.filter((l) => isRecepcaoName(l.sdr));
    const sucessosPv = filteredSucessos.filter((s) => !isRecepcaoName(s.sdr));
    const sucessosRec = filteredSucessos.filter((s) => isRecepcaoName(s.sdr));

    const sdrPreVendaRows =
      realizados.length > 0
        ? buildSdrPreVendaRows(preVenda, atendPv, visitasPv, sucessosPv)
        : buildSdrPreVendaRows(
            preVenda,
            legacyLeads
              .filter((l) => !isRecepcaoName(l.sdr))
              .map((l) => ({
                id: l.id,
                dataAtendido: l.data,
                dataVisita: null,
                teveVisita: false,
                sdr: l.sdr,
                origem: l.origem,
                tipoProposta: l.tipoProposta,
                cliente: "",
                celular: "",
              })),
            [],
            []
          );

    const sdrRecepcao =
      realizados.length > 0
        ? buildRecepcaoConsolidatedMetrics(
            recepcao,
            atendRec,
            visitasRec,
            sucessosRec
          )
        : buildRecepcaoConsolidatedMetrics(
            recepcao,
            legacyLeads
              .filter((l) => isRecepcaoName(l.sdr))
              .map((l) => ({
                id: l.id,
                dataAtendido: l.data,
                dataVisita: null,
                teveVisita: false,
                sdr: l.sdr,
                origem: l.origem,
                tipoProposta: l.tipoProposta,
                cliente: "",
                celular: "",
              })),
            [],
            []
          );

    const vendedorMetrics = buildVendedorMetrics(filtered, {
      visitas: filteredVisitas,
      sucessos: filteredSucessos,
      agenda: dataset.items,
    });

    const leadsForPortal: LeadAtendimentoItem[] =
      realizados.length > 0
        ? filteredRealizados.map((r) => ({
            id: r.id,
            data: r.dataAtendido,
            sdr: r.sdr,
            origem: r.origem,
            tipoProposta: r.tipoProposta,
          }))
        : legacyLeads;

    const agendaById = new Map(dataset.items.map((item) => [item.id, item]));
    const visitasDoCanal = (canal: "Pré-Venda" | "Recepção") =>
      filteredVisitas.filter((row) => eventMatchesCanal(row.id, row.sdr, canal, agendaById));
    const sucessosDoCanal = (canal: "Pré-Venda" | "Recepção") =>
      filteredSucessos.filter((row) => eventMatchesCanal(row.id, row.sdr, canal, agendaById));
    const visitasPreVenda = visitasDoCanal("Pré-Venda");
    const visitasRecepcaoCanal = visitasDoCanal("Recepção");
    const sucessosPreVenda = sucessosDoCanal("Pré-Venda");
    const sucessosRecepcaoCanal = sucessosDoCanal("Recepção");

    return {
      filtered,
      filteredLeads: leadsForPortal,
      filteredRealizados,
      filteredVisitas,
      filteredSucessos,
      preVenda,
      recepcao,
      options: getSchedulingFilterOptions(dataset.items),
      kpisPreVenda: buildCanalKpis(preVenda, "Pré-Venda", {
        visitas: visitasPreVenda.length,
        sucessos: sucessosPreVenda.length,
      }),
      kpisRecepcao: buildCanalKpis(recepcao, "Recepção", {
        visitas: visitasRecepcaoCanal.length,
        sucessos: sucessosRecepcaoCanal.length,
      }),
      sdrPreVendaRows,
      sdrRecepcao,
      vendedorMetrics,
      comparisonVendedoresPreVenda: buildVendedorComparisonRows(vendedorMetrics, "Pré-Venda"),
      comparisonVendedoresRecepcao: buildVendedorComparisonRows(vendedorMetrics, "Recepção"),
      sdrVendedorPairs: buildSdrVendedorProposalRows(preVenda, {
        visitas: filteredVisitas,
        sucessos: filteredSucessos,
        agenda: dataset.items,
      }),
      proposalsPreVenda: buildProposalDistribution(preVenda),
      proposalsRecepcao: buildProposalDistribution(recepcao),
      periodSeriesPreVenda: buildPeriodSeries(preVenda, {
        visitas: visitasPreVenda,
        sucessos: sucessosPreVenda,
      }),
      periodSeriesRecepcao: buildPeriodSeries(recepcao, {
        visitas: visitasRecepcaoCanal,
        sucessos: sucessosRecepcaoCanal,
      }),
      insucessoKpis: buildInsucessoKpis(filtered),
      motivosInsucesso: buildMotivosStats(filtered),
      motivosBySdr: buildMotivosBySdr(filtered),
      motivosByVendedor: buildMotivosByVendedor(filtered),
      portais: buildPortalDashboard(filtered, leadsForPortal, {
        visitas: filteredVisitas,
        sucessos: filteredSucessos,
        agenda: dataset.items,
      }),
      atendSourceCount: atendSource.length,
    };
  }, [dataset, filters]);
}
