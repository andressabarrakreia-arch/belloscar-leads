import { formatPeriodLabel } from "../dates";
import { linesToDeals } from "./deals";
import type {
  AvaliacaoConvRow,
  NegociacaoDeal,
  NegociacaoLine,
  NegociacoesFilters,
  NegociacoesKpis,
  VendedorNegociacaoRow,
} from "./types";

export function dealsFromLines(lines: NegociacaoLine[]): NegociacaoDeal[] {
  return linesToDeals(lines);
}

export function filterDeals(
  deals: NegociacaoDeal[],
  filters: NegociacoesFilters
): NegociacaoDeal[] {
  return deals.filter((d) => {
    if (filters.month !== "all" && d.monthKey !== filters.month) return false;
    if (filters.period !== "all" && d.periodKey !== filters.period) return false;
    if (filters.vendedor !== "all" && d.vendedor !== filters.vendedor) return false;
    if (filters.tipo !== "all" && d.tipo !== filters.tipo) return false;
    if (filters.status !== "all" && d.status !== filters.status) return false;
    if (filters.tipoVenda !== "all" && d.tipoVenda !== filters.tipoVenda) return false;
    return true;
  });
}

export function getNegociacoesFilterOptions(deals: NegociacaoDeal[]) {
  const months = [...new Set(deals.map((d) => d.monthKey))].sort().reverse();
  const periods = [...new Set(deals.map((d) => d.periodKey))].sort().reverse();
  const vendedores = [...new Set(deals.map((d) => d.vendedor))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  const tipos = [...new Set(deals.map((d) => d.tipo))].sort();
  const statuses = [...new Set(deals.map((d) => d.status))].sort();
  const tiposVenda = [...new Set(deals.map((d) => d.tipoVenda))].sort();
  return { months, periods, vendedores, tipos, statuses, tiposVenda };
}

export function buildNegociacoesKpis(deals: NegociacaoDeal[]): NegociacoesKpis {
  const kpis: NegociacoesKpis = {
    total: deals.length,
    vendas: 0,
    trocas: 0,
    compras: 0,
    consignacoes: 0,
    outros: 0,
  };
  for (const d of deals) {
    if (d.tipo === "Venda") kpis.vendas += 1;
    else if (d.tipo === "Troca") kpis.trocas += 1;
    else if (d.tipo === "Compra") kpis.compras += 1;
    else if (d.tipo === "Consignação") kpis.consignacoes += 1;
    else kpis.outros += 1;
  }
  return kpis;
}

export function buildVendedorRows(deals: NegociacaoDeal[]): VendedorNegociacaoRow[] {
  const map = new Map<string, VendedorNegociacaoRow>();
  for (const d of deals) {
    const cur = map.get(d.vendedor) || {
      vendedor: d.vendedor,
      vendasMaisTrocas: 0,
      consignacoes: 0,
      compras: 0,
      total: 0,
      vendas: 0,
      trocas: 0,
    };
    cur.total += 1;
    if (d.tipo === "Venda") {
      cur.vendas += 1;
      cur.vendasMaisTrocas += 1;
    } else if (d.tipo === "Troca") {
      cur.trocas += 1;
      cur.vendasMaisTrocas += 1;
    } else if (d.tipo === "Compra") {
      cur.compras += 1;
    } else if (d.tipo === "Consignação") {
      cur.consignacoes += 1;
    }
    map.set(d.vendedor, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export type PeriodNegociacaoPoint = {
  periodKey: string;
  label: string;
  total: number;
  vendas: number;
  trocas: number;
  compras: number;
  consignacoes: number;
};

export function buildPeriodSeries(deals: NegociacaoDeal[]): PeriodNegociacaoPoint[] {
  const map = new Map<string, PeriodNegociacaoPoint>();
  for (const d of deals) {
    const cur = map.get(d.periodKey) || {
      periodKey: d.periodKey,
      label: formatPeriodLabel(d.periodKey),
      total: 0,
      vendas: 0,
      trocas: 0,
      compras: 0,
      consignacoes: 0,
    };
    cur.total += 1;
    if (d.tipo === "Venda") cur.vendas += 1;
    else if (d.tipo === "Troca") cur.trocas += 1;
    else if (d.tipo === "Compra") cur.compras += 1;
    else if (d.tipo === "Consignação") cur.consignacoes += 1;
    map.set(d.periodKey, cur);
  }
  return [...map.values()].sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

export function statusBreakdown(
  deals: NegociacaoDeal[]
): { status: string; quantidade: number }[] {
  const map = new Map<string, number>();
  for (const d of deals) {
    map.set(d.status, (map.get(d.status) || 0) + 1);
  }
  return [...map.entries()]
    .map(([status, quantidade]) => ({ status, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Linha de lançamento (Troca consolidada). */
export type LancamentoRow = {
  dealId: string;
  data: string;
  vendedor: string;
  tipo: string;
  status: string;
  movimentacao: string;
  placaEntrada: string;
  placaSaida: string;
  modeloEntrada: string;
  modeloSaida: string;
  cliente: string;
  negociacaoId: string;
  tipoVenda: string;
};

export function buildLancamentoRows(deals: NegociacaoDeal[]): LancamentoRow[] {
  return deals
    .map((d) => {
      let movimentacao = d.lines[0]?.movimentacao || "";
      if (d.tipo === "Troca") movimentacao = "Troca";
      return {
        dealId: d.dealId,
        data: d.dataEntrada,
        vendedor: d.vendedor,
        tipo: d.tipo,
        status: d.status,
        movimentacao,
        placaEntrada: d.placaEntrada,
        placaSaida: d.placaSaida,
        modeloEntrada: d.modeloEntrada,
        modeloSaida: d.modeloSaida,
        cliente: d.cliente,
        negociacaoId: d.negociacaoId,
        tipoVenda: d.tipoVenda,
      };
    })
    .sort((a, b) => b.data.localeCompare(a.data) || a.negociacaoId.localeCompare(b.negociacaoId));
}

export type RankSlot = {
  vendedor: string;
  qtde: number;
};

export type UnifiedRankRow = {
  pos: number;
  vendasTrocas: RankSlot | null;
  compras: RankSlot | null;
  consignacoes: RankSlot | null;
};

/** Agrega avaliações pelo filtro de mês (e vendedor, se houver). */
export function filterAvaliacoes(
  rows: AvaliacaoConvRow[],
  filters: NegociacoesFilters
): AvaliacaoConvRow[] {
  const filtered = rows.filter((r) => {
    if (filters.month !== "all" && r.monthKey !== filters.month) return false;
    if (filters.vendedor !== "all" && r.vendedor !== filters.vendedor) return false;
    return true;
  });

  if (filters.month !== "all") return filtered;

  // "Todos" os meses: soma por vendedor
  const map = new Map<string, AvaliacaoConvRow>();
  for (const r of filtered) {
    const cur = map.get(r.vendedor) || {
      monthKey: "all",
      vendedor: r.vendedor,
      aprovadas: 0,
      realizadas: 0,
      percentual: 0,
    };
    cur.aprovadas += r.aprovadas;
    cur.realizadas += r.realizadas;
    map.set(r.vendedor, cur);
  }
  return [...map.values()].map((r) => ({
    ...r,
    percentual: r.realizadas
      ? Math.round((r.aprovadas / r.realizadas) * 10000) / 100
      : 0,
  }));
}

function topSlots(
  rows: { vendedor: string; qtde: number }[],
  limit = 10
): RankSlot[] {
  return rows
    .filter((r) => r.qtde > 0)
    .sort((a, b) => b.qtde - a.qtde || a.vendedor.localeCompare(b.vendedor, "pt-BR"))
    .slice(0, limit)
    .map((r) => ({ vendedor: r.vendedor, qtde: r.qtde }));
}

export function buildUnifiedRankings(
  vendedores: VendedorNegociacaoRow[],
  limit = 10
): UnifiedRankRow[] {
  const vt = topSlots(
    vendedores.map((v) => ({ vendedor: v.vendedor, qtde: v.vendasMaisTrocas })),
    limit
  );
  const compras = topSlots(
    vendedores.map((v) => ({ vendedor: v.vendedor, qtde: v.compras })),
    limit
  );
  const consig = topSlots(
    vendedores.map((v) => ({ vendedor: v.vendedor, qtde: v.consignacoes })),
    limit
  );

  const n = Math.max(vt.length, compras.length, consig.length);
  const rows: UnifiedRankRow[] = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      pos: i + 1,
      vendasTrocas: vt[i] || null,
      compras: compras[i] || null,
      consignacoes: consig[i] || null,
    });
  }
  return rows;
}
