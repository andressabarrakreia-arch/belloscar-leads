import { sliceCampanhas, type CampanhaKpis } from "./campanhas/analytics";
import type { CampanhaRecord } from "./campanhas/analytics";
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

export function buildCampanhasTickerItems(
  rows: CampanhaRecord[],
  updatedAt: string,
  kpis?: CampanhaKpis
): string[] {
  const totals = kpis ?? sliceCampanhas(rows, {}).kpis;
  const updated = new Date(updatedAt).toLocaleDateString("pt-BR");
  return [
    "Campanhas: Facebook Ads e Instagram Ads",
    `Atendimentos: ${totals.atendimentos.toLocaleString("pt-BR")}`,
    `Visitas: ${totals.visitas.toLocaleString("pt-BR")} (${totals.taxaVisita}%)`,
    `Agendamentos: ${totals.agendamentos.toLocaleString("pt-BR")}`,
    `Sucessos: ${totals.sucessos.toLocaleString("pt-BR")} (${totals.taxaVisitaParaSucesso}% da visita)`,
    `Atualizado em ${updated}`,
  ];
}

export function buildAgendamentosTickerItems(
  items: AgendamentoItem[],
  leads: LeadAtendimentoItem[],
  updatedAt: string,
  filterHint?: string,
  extras?: { visitas?: number; sucessos?: number }
): string[] {
  const { preVenda, recepcao } = splitByCanal(items);
  const kpisPv = buildCanalKpis(preVenda, "Pré-Venda");
  const kpisRec = buildCanalKpis(recepcao, "Recepção");
  const updated = new Date(updatedAt).toLocaleDateString("pt-BR");

  const out = [
    `Agendamentos: ${items.length.toLocaleString("pt-BR")}`,
    `Atendimentos: ${leads.length.toLocaleString("pt-BR")}`,
  ];
  if (extras?.visitas !== undefined) {
    out.push(`Visitas: ${extras.visitas.toLocaleString("pt-BR")}`);
  }
  if (extras?.sucessos !== undefined) {
    out.push(`Sucessos: ${extras.sucessos.toLocaleString("pt-BR")}`);
  }
  out.push(
    `Pré-Venda ag.: ${kpisPv.total.toLocaleString("pt-BR")}`,
    `Recepção ag.: ${kpisRec.total.toLocaleString("pt-BR")}`
  );
  if (filterHint) out.unshift(`Filtro: ${filterHint}`);
  out.push(`Atualizado em ${updated}`);
  return out;
}

export function schedulingFilterHint(filters: SchedulingFilters): string | undefined {
  const parts: string[] = [];
  if (filters.from && filters.to && filters.from.slice(0, 7) === filters.to.slice(0, 7)) {
    const ym = filters.from.slice(0, 7);
    const [y, m] = ym.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const monthEnd = `${ym}-${String(last).padStart(2, "0")}`;
    if (filters.from.endsWith("-01") && filters.to === monthEnd) {
      const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
      parts.push(label);
    } else {
      parts.push(`${filters.from} → ${filters.to}`);
    }
  } else if (filters.from || filters.to) {
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
