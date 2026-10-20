import { buildSummary, calcMetrics } from "./metrics";
import {
  buildNegociacoesKpis,
  buildVendedorRows,
  filterAvaliacoes,
} from "./negociacoes/metrics";
import type { AvaliacaoConvRow, NegociacaoDeal, NegociacoesFilters } from "./negociacoes/types";
import {
  buildCanalKpis,
  filterLeadsAtendimentos,
  splitByCanal,
} from "./scheduling/metrics";
import type { AgendamentoItem, LeadAtendimentoItem, SchedulingFilters } from "./scheduling/types";
import type { Dataset } from "./types";

export function buildCampanhasTickerItems(dataset: Dataset): string[] {
  const kpis = calcMetrics(dataset.leads);
  const summary = buildSummary(dataset.leads);
  const topOrigin = summary.byOrigin[0];
  const updated = new Date(dataset.updatedAt).toLocaleDateString("pt-BR");

  const items = [
    `Leads: ${kpis.leads.toLocaleString("pt-BR")}`,
    `Visitas: ${kpis.visitas.toLocaleString("pt-BR")} (${kpis.taxaVisita}%)`,
    `Sucessos: ${kpis.sucessos.toLocaleString("pt-BR")} (${kpis.taxaSucesso}%)`,
    `Visita → Sucesso: ${kpis.taxaVisitaParaSucesso}%`,
  ];

  if (topOrigin) {
    items.push(
      `Top origem: ${topOrigin.canal} · ${topOrigin.leads} leads · ${topOrigin.sucessos} sucessos`
    );
  }

  items.push(`Atualizado em ${updated}`);
  return items;
}

export function buildAgendamentosTickerItems(
  items: AgendamentoItem[],
  leads: LeadAtendimentoItem[],
  updatedAt: string,
  filterHint?: string
): string[] {
  const { preVenda, recepcao } = splitByCanal(items);
  const kpisPv = buildCanalKpis(preVenda, "Pré-Venda");
  const kpisRec = buildCanalKpis(recepcao, "Recepção");
  const updated = new Date(updatedAt).toLocaleDateString("pt-BR");

  const out = [
    `Agendamentos: ${items.length.toLocaleString("pt-BR")}`,
    `Atendimentos (LEADS): ${leads.length.toLocaleString("pt-BR")}`,
    `Pré-Venda: ${kpisPv.total.toLocaleString("pt-BR")} · Su ${kpisPv.sucessos} (${kpisPv.taxaSucesso}%)`,
    `Recepção: ${kpisRec.total.toLocaleString("pt-BR")} · Su ${kpisRec.sucessos} (${kpisRec.taxaSucesso}%)`,
  ];
  if (filterHint) out.unshift(`Filtro: ${filterHint}`);
  out.push(`Atualizado em ${updated}`);
  return out;
}

export function schedulingFilterHint(filters: SchedulingFilters): string | undefined {
  const parts: string[] = [];
  if (filters.from || filters.to) {
    parts.push(`${filters.from || "…"} → ${filters.to || "…"}`);
  }
  if (filters.sdr) parts.push(filters.sdr);
  if (filters.vendedor) parts.push(filters.vendedor);
  if (filters.origem) parts.push(filters.origem);
  if (filters.tipoProposta) parts.push(filters.tipoProposta);
  return parts.length ? parts.join(" · ") : undefined;
}

export function buildNegociacoesTickerItems(
  deals: NegociacaoDeal[],
  avaliacoesRows: AvaliacaoConvRow[],
  filters: NegociacoesFilters,
  updatedAt: string
): string[] {
  const kpis = buildNegociacoesKpis(deals);
  const vendedores = buildVendedorRows(deals);
  const topNeg = [...vendedores].sort((a, b) => b.vendasMaisTrocas - a.vendasMaisTrocas)[0];
  const avaliacoes = filterAvaliacoes(avaliacoesRows, filters);
  const topConv = [...avaliacoes]
    .filter((a) => a.realizadas > 0)
    .sort(
      (a, b) =>
        b.percentual - a.percentual ||
        b.aprovadas - a.aprovadas ||
        a.vendedor.localeCompare(b.vendedor, "pt-BR")
    )[0];
  const updated = new Date(updatedAt).toLocaleDateString("pt-BR");

  const hint = negociacoesFilterHint(filters);
  const items: string[] = [];
  if (hint) items.push(`Filtro: ${hint}`);

  items.push(
    `Negócios: ${kpis.total.toLocaleString("pt-BR")}`,
    `Vendas: ${kpis.vendas} · Trocas: ${kpis.trocas}`,
    `Compras: ${kpis.compras} · Consignações: ${kpis.consignacoes}`
  );

  if (topNeg) {
    items.push(`Top Vendas+Trocas: ${topNeg.vendedor} · ${topNeg.vendasMaisTrocas}`);
  }
  if (topConv) {
    items.push(
      `Top conv. avaliação: ${topConv.vendedor} · ${topConv.percentual}% (${topConv.aprovadas}/${topConv.realizadas})`
    );
  }

  items.push(`Atualizado em ${updated}`);
  return items;
}

export function negociacoesFilterHint(filters: NegociacoesFilters): string | undefined {
  const parts: string[] = [];
  if (filters.month !== "all") parts.push(filters.month);
  if (filters.period !== "all") parts.push(filters.period);
  if (filters.vendedor !== "all") parts.push(filters.vendedor);
  if (filters.tipo !== "all") parts.push(filters.tipo);
  if (filters.status !== "all") parts.push(filters.status);
  if (filters.tipoVenda !== "all") parts.push(filters.tipoVenda);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Reexport para shells que já filtraram leads. */
export { filterLeadsAtendimentos };
