import { useEffect, useMemo, useState } from "react";
import {
  buildAtendimentosComFallback,
  buildCanalKpis,
  buildInsucessoKpis,
  buildMotivosBySdr,
  buildMotivosByVendedor,
  buildMotivosStats,
  buildPeriodSeries,
  buildProposalDistribution,
  buildRecepcaoConsolidatedMetrics,
  buildResponsavelById,
  buildSdrPreVendaRows,
  buildSdrVendedorProposalRows,
  buildVendedorComparisonRows,
  buildVendedorMetrics,
  eventMatchesCanal,
  filterAgendamentos,
  filterLeadsAtendimentos,
  filterRealizadosVisitas,
  filterSucessosEventos,
  getSchedulingFilterOptions,
  resolveResponsavel,
} from "../lib/scheduling/metrics";
import { isRecepcaoName } from "../lib/scheduling/normalize";
import { buildPortalDashboard } from "../lib/scheduling/portalMetrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import type {
  AgendamentoItem,
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

function splitAgendaByResponsavel(
  items: AgendamentoItem[],
  responsavelById: Map<string, string>
): { preVenda: AgendamentoItem[]; recepcao: AgendamentoItem[] } {
  const preVenda: AgendamentoItem[] = [];
  const recepcao: AgendamentoItem[] = [];
  for (const item of items) {
    const who = resolveResponsavel(item.id, item.sdr, responsavelById);
    if (isRecepcaoName(who)) recepcao.push(item);
    else preVenda.push(item);
  }
  return { preVenda, recepcao };
}

export function useSchedulingAnalytics(
  dataset: SchedulingDataset | null,
  filters: SchedulingFilters
) {
  return useMemo(() => {
    if (!dataset) return null;
    const realizados = dataset.realizados || [];
    const leadsGerais = dataset.leadsAtendimentos || [];
    const responsavelById = buildResponsavelById(realizados, leadsGerais);

    const filtered = filterAgendamentos(dataset.items, filters, responsavelById);
    const filteredRealizados = buildAtendimentosComFallback(
      realizados,
      leadsGerais,
      filters
    );
    const filteredVisitas = filterRealizadosVisitas(realizados, filters);
    const filteredSucessos = filterSucessosEventos(
      dataset.sucessosEventos || [],
      filters,
      responsavelById
    );

    // Fallback legado: sem REALIZADOS, usa LEADS GERAL para atendimentos
    const legacyLeads = filterLeadsAtendimentos(leadsGerais, filters);
    const atendSource =
      realizados.length > 0
        ? filteredRealizados
        : legacyLeads.map(
            (l): LeadAtendimentoItem & { dataAtendido?: string } => l
          );

    const { preVenda, recepcao } = splitAgendaByResponsavel(filtered, responsavelById);
    const atendPv = filteredRealizados.filter((l) => !isRecepcaoName(l.sdr));
    const atendRec = filteredRealizados.filter((l) => isRecepcaoName(l.sdr));
    const visitasPv = filteredVisitas.filter((l) => !isRecepcaoName(l.sdr));
    const visitasRec = filteredVisitas.filter((l) => isRecepcaoName(l.sdr));
    const sucessosPv = filteredSucessos.filter((s) => !isRecepcaoName(s.sdr));
    const sucessosRec = filteredSucessos.filter((s) => isRecepcaoName(s.sdr));

    const sdrPreVendaRows =
      realizados.length > 0 || leadsGerais.length > 0
        ? buildSdrPreVendaRows(
            filtered,
            atendPv,
            visitasPv,
            sucessosPv,
            responsavelById
          )
        : buildSdrPreVendaRows(preVenda, [], [], [], responsavelById);

    const sdrRecepcao =
      realizados.length > 0 || leadsGerais.length > 0
        ? buildRecepcaoConsolidatedMetrics(
            recepcao,
            atendRec,
            visitasRec,
            sucessosRec
          )
        : buildRecepcaoConsolidatedMetrics(recepcao, [], [], []);

    const vendedorMetrics = buildVendedorMetrics(filtered, {
      visitas: filteredVisitas,
      sucessos: filteredSucessos,
      agenda: dataset.items,
    });

    const leadsForPortal: LeadAtendimentoItem[] =
      filteredRealizados.length > 0
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
      filteredVisitas.filter((row) =>
        eventMatchesCanal(
          row.id,
          resolveResponsavel(row.id, row.sdr, responsavelById),
          canal,
          agendaById
        )
      );
    const sucessosDoCanal = (canal: "Pré-Venda" | "Recepção") =>
      filteredSucessos.filter((row) =>
        eventMatchesCanal(
          row.id,
          resolveResponsavel(row.id, row.sdr, responsavelById),
          canal,
          agendaById
        )
      );
    const visitasPreVenda = visitasDoCanal("Pré-Venda");
    const visitasRecepcaoCanal = visitasDoCanal("Recepção");
    const sucessosPreVenda = sucessosDoCanal("Pré-Venda");
    const sucessosRecepcaoCanal = sucessosDoCanal("Recepção");
    const fonteAtendimentos = filteredRealizados.length > 0 ? filteredRealizados : legacyLeads;
    const atendimentosDoCanal = (canal: "Pré-Venda" | "Recepção") =>
      fonteAtendimentos.filter((row) =>
        eventMatchesCanal(
          row.id,
          resolveResponsavel(row.id, row.sdr, responsavelById),
          canal,
          agendaById
        )
      );

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
        atendimentos: atendimentosDoCanal("Pré-Venda").length,
      }),
      kpisRecepcao: buildCanalKpis(recepcao, "Recepção", {
        visitas: visitasRecepcaoCanal.length,
        sucessos: sucessosRecepcaoCanal.length,
        atendimentos: atendimentosDoCanal("Recepção").length,
      }),
      sdrPreVendaRows,
      sdrRecepcao,
      vendedorMetrics,
      comparisonVendedoresPreVenda: buildVendedorComparisonRows(vendedorMetrics, "Pré-Venda"),
      comparisonVendedoresRecepcao: buildVendedorComparisonRows(vendedorMetrics, "Recepção"),
      sdrVendedorPairs: buildSdrVendedorProposalRows(
        filtered,
        {
          visitas: filteredVisitas,
          sucessos: filteredSucessos,
          agenda: dataset.items,
        },
        responsavelById
      ),
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
      motivosBySdr: buildMotivosBySdr(filtered, responsavelById),
      motivosByVendedor: buildMotivosByVendedor(filtered),
      portais: buildPortalDashboard(filtered, leadsForPortal, {
        visitas: filteredVisitas,
        sucessos: filteredSucessos,
        agenda: dataset.items,
      }),
      atendSourceCount: atendSource.length,
      responsavelById,
    };
  }, [dataset, filters]);
}
