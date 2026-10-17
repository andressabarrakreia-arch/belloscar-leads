import { formatPeriodLabel } from "../dates";
import { emptyPropostasBreakdown } from "./normalize";
import type {
  AgendamentoItem,
  CanalAtendimento,
  MotivoStats,
  OrigemStats,
  PropostasBreakdown,
  SchedulingFilters,
  SdrMetrics,
  TipoProposta,
  VendedorMetrics,
} from "./types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Clientes da loja (Recepção/Gabriela) ficam fora do geral da pré-venda. */
export function splitByCanal(items: AgendamentoItem[]): {
  preVenda: AgendamentoItem[];
  recepcao: AgendamentoItem[];
} {
  const preVenda: AgendamentoItem[] = [];
  const recepcao: AgendamentoItem[] = [];
  for (const item of items) {
    if (item.canal === "Recepção") recepcao.push(item);
    else preVenda.push(item);
  }
  return { preVenda, recepcao };
}

export function filterAgendamentos(
  items: AgendamentoItem[],
  filters: SchedulingFilters
): AgendamentoItem[] {
  return items.filter((item) => {
    if (filters.sdr && item.sdr !== filters.sdr) return false;
    if (filters.tipoProposta && item.tipoProposta !== filters.tipoProposta) return false;
    if (filters.vendedor && item.vendedor !== filters.vendedor) return false;
    if (filters.from && item.dataAgendamento < filters.from) return false;
    if (filters.to && item.dataAgendamento > filters.to) return false;
    return true;
  });
}

export function getSchedulingFilterOptions(items: AgendamentoItem[]) {
  const sdrs = [...new Set(items.map((i) => i.sdr))].sort();
  const vendedores = [...new Set(items.map((i) => i.vendedor))].sort();
  const tipos = [...new Set(items.map((i) => i.tipoProposta))].sort() as TipoProposta[];
  return { sdrs, vendedores, tipos };
}

function breakdownPropostas(list: AgendamentoItem[]): PropostasBreakdown {
  const b = emptyPropostasBreakdown();
  for (const item of list) {
    b[item.tipoProposta] = (b[item.tipoProposta] || 0) + 1;
  }
  return b;
}

function motivosFrom(list: AgendamentoItem[]): MotivoStats[] {
  const closed = list.filter((i) => i.status === "Insucesso");
  const total = closed.length || 1;
  const map = new Map<string, number>();
  for (const item of closed) {
    const m = item.motivoInsucesso?.trim() || "Motivo não informado";
    map.set(m, (map.get(m) || 0) + 1);
  }
  return [...map.entries()]
    .map(([motivo, quantidade]) => ({
      motivo,
      quantidade,
      percentual: round2((quantidade / total) * 100),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

function origensFrom(list: AgendamentoItem[]): OrigemStats[] {
  const total = list.length || 1;
  const map = new Map<string, { quantidade: number; sucessos: number; insucessos: number }>();
  for (const item of list) {
    const o = item.origem || "Não informado";
    const cur = map.get(o) || { quantidade: 0, sucessos: 0, insucessos: 0 };
    cur.quantidade += 1;
    if (item.status === "Sucesso") cur.sucessos += 1;
    if (item.status === "Insucesso") cur.insucessos += 1;
    map.set(o, cur);
  }
  return [...map.entries()]
    .map(([origem, v]) => ({
      origem,
      quantidade: v.quantidade,
      percentual: round2((v.quantidade / total) * 100),
      sucessos: v.sucessos,
      insucessos: v.insucessos,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export function buildSdrMetrics(items: AgendamentoItem[]): SdrMetrics[] {
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    const list = groups.get(item.sdr) || [];
    list.push(item);
    groups.set(item.sdr, list);
  }

  return [...groups.entries()]
    .map(([sdr, list]) => {
      const totalAgendamentos = list.length;
      const totalVisitas = list.filter((i) => i.teveVisita).length;
      const totalSucesso = list.filter((i) => i.status === "Sucesso").length;
      const totalInsucesso = list.filter((i) => i.status === "Insucesso").length;
      return {
        sdr,
        canal: list[0]?.canal || "Pré-Venda",
        totalAgendamentos,
        propostasBreakdown: breakdownPropostas(list),
        totalVisitas,
        totalSucesso,
        totalInsucesso,
        taxaConversaoVisita: round2(
          totalAgendamentos ? (totalVisitas / totalAgendamentos) * 100 : 0
        ),
        taxaConversaoSucesso: round2(
          totalAgendamentos ? (totalSucesso / totalAgendamentos) * 100 : 0
        ),
      };
    })
    .sort((a, b) => b.totalAgendamentos - a.totalAgendamentos);
}

export function buildVendedorMetrics(items: AgendamentoItem[]): VendedorMetrics[] {
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    if (!item.vendedor || item.vendedor === "(sem vendedor)") continue;
    const list = groups.get(item.vendedor) || [];
    list.push(item);
    groups.set(item.vendedor, list);
  }

  return [...groups.entries()]
    .map(([vendedor, list]) => {
      const pre = list.filter((i) => i.canal === "Pré-Venda");
      const rec = list.filter((i) => i.canal === "Recepção");
      // "Geral" do vendedor = só Pré-Venda (Recepção é braço à parte)
      const totalRecebidos = pre.length;
      const totalVisitas = pre.filter((i) => i.teveVisita).length;
      const totalSucesso = pre.filter((i) => i.status === "Sucesso").length;
      const totalInsucesso = pre.filter((i) => i.status === "Insucesso").length;
      const sucessoPreVenda = totalSucesso;
      const sucessoRecepcao = rec.filter((i) => i.status === "Sucesso").length;
      const visitasRecepcao = rec.filter((i) => i.teveVisita).length;
      const insucessosRecepcao = rec.filter((i) => i.status === "Insucesso").length;
      return {
        vendedor,
        totalRecebidos,
        totalVisitas,
        totalSucesso,
        totalInsucesso,
        conversaoGeral: round2(totalRecebidos ? (totalSucesso / totalRecebidos) * 100 : 0),
        totalPreVenda: pre.length,
        sucessoPreVenda,
        conversaoPreVenda: round2(pre.length ? (sucessoPreVenda / pre.length) * 100 : 0),
        totalRecepcao: rec.length,
        sucessoRecepcao,
        visitasRecepcao,
        insucessosRecepcao,
        conversaoRecepcao: round2(rec.length ? (sucessoRecepcao / rec.length) * 100 : 0),
        taxaVisitaRecepcao: round2(rec.length ? (visitasRecepcao / rec.length) * 100 : 0),
        motivosInsucesso: motivosFrom(pre),
        motivosInsucessoRecepcao: motivosFrom(rec),
        origens: origensFrom(pre),
        origensRecepcao: origensFrom(rec),
        propostasBreakdown: breakdownPropostas(pre),
        propostasBreakdownRecepcao: breakdownPropostas(rec),
      };
    })
    .sort((a, b) => b.totalRecebidos - a.totalRecebidos);
}

export type ComparisonRow = {
  nome: string;
  papel: "SDR" | "Vendedor";
  canal: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  convPreVenda?: number;
  convRecepcao?: number;
  compra: number;
  venda: number;
  troca: number;
  consignacao: number;
  financiamento: number;
  naoInformado: number;
};

export function buildComparisonRows(
  sdrs: SdrMetrics[],
  vendedores: VendedorMetrics[],
  canal: CanalAtendimento | "todos" = "todos"
): ComparisonRow[] {
  const sdrFiltered =
    canal === "todos" ? sdrs : sdrs.filter((s) => s.canal === canal);

  const sdrRows: ComparisonRow[] = sdrFiltered.map((s) => ({
    nome: s.sdr,
    papel: "SDR",
    canal: s.canal,
    total: s.totalAgendamentos,
    visitas: s.totalVisitas,
    sucessos: s.totalSucesso,
    insucessos: s.totalInsucesso,
    taxaVisita: s.taxaConversaoVisita,
    taxaSucesso: s.taxaConversaoSucesso,
    compra: s.propostasBreakdown.Compra,
    venda: s.propostasBreakdown.Venda,
    troca: s.propostasBreakdown.Troca,
    consignacao: s.propostasBreakdown.Consignação,
    financiamento: s.propostasBreakdown.Financiamento,
    naoInformado: s.propostasBreakdown["não informado(celulas em branco)"],
  }));

  const vendRows: ComparisonRow[] = [];
  for (const v of vendedores) {
    if (canal === "Recepção") {
      if (!v.totalRecepcao) continue;
      const b = v.propostasBreakdownRecepcao;
      vendRows.push({
        nome: v.vendedor,
        papel: "Vendedor",
        canal: "Recepção",
        total: v.totalRecepcao,
        visitas: v.visitasRecepcao,
        sucessos: v.sucessoRecepcao,
        insucessos: v.insucessosRecepcao,
        taxaVisita: v.taxaVisitaRecepcao,
        taxaSucesso: v.conversaoRecepcao,
        convRecepcao: v.conversaoRecepcao,
        compra: b.Compra,
        venda: b.Venda,
        troca: b.Troca,
        consignacao: b.Consignação,
        financiamento: b.Financiamento,
        naoInformado: b["não informado(celulas em branco)"],
      });
      continue;
    }
    // Pré-Venda (ou padrão): totais sem misturar Recepção
    if (canal === "Pré-Venda" && !v.totalPreVenda) continue;
    const b = v.propostasBreakdown;
    vendRows.push({
      nome: v.vendedor,
      papel: "Vendedor",
      canal: "Pré-Venda",
      total: v.totalRecebidos,
      visitas: v.totalVisitas,
      sucessos: v.totalSucesso,
      insucessos: v.totalInsucesso,
      taxaVisita: round2(v.totalRecebidos ? (v.totalVisitas / v.totalRecebidos) * 100 : 0),
      taxaSucesso: v.conversaoGeral,
      convPreVenda: v.conversaoPreVenda,
      compra: b.Compra,
      venda: b.Venda,
      troca: b.Troca,
      consignacao: b.Consignação,
      financiamento: b.Financiamento,
      naoInformado: b["não informado(celulas em branco)"],
    });
  }

  return [...sdrRows, ...vendRows];
}

export function buildProposalDistribution(items: AgendamentoItem[]) {
  const b = breakdownPropostas(items);
  return (Object.entries(b) as [TipoProposta, number][])
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildTimeSeries(items: AgendamentoItem[]) {
  const byDay = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    const list = byDay.get(item.dataAgendamento) || [];
    list.push(item);
    byDay.set(item.dataAgendamento, list);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      total: list.length,
      visitas: list.filter((i) => i.teveVisita).length,
      sucessos: list.filter((i) => i.status === "Sucesso").length,
      insucessos: list.filter((i) => i.status === "Insucesso").length,
    }));
}

export function buildPeriodSeries(items: AgendamentoItem[]) {
  const byPeriod = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    const list = byPeriod.get(item.periodKey) || [];
    list.push(item);
    byPeriod.set(item.periodKey, list);
  }
  return [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, list]) => ({
      periodKey,
      label: formatPeriodLabel(periodKey),
      total: list.length,
      visitas: list.filter((i) => i.teveVisita).length,
      sucessos: list.filter((i) => i.status === "Sucesso").length,
      insucessos: list.filter((i) => i.status === "Insucesso").length,
    }));
}

export type CanalKpis = {
  canal: CanalAtendimento;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
};

/** KPIs de um único canal (Pré-Venda ou Recepção) — sem misturar. */
export function buildCanalKpis(
  items: AgendamentoItem[],
  canal: CanalAtendimento
): CanalKpis {
  const total = items.length;
  const visitas = items.filter((i) => i.teveVisita).length;
  const sucessos = items.filter((i) => i.status === "Sucesso").length;
  const insucessos = items.filter((i) => i.status === "Insucesso").length;
  return {
    canal,
    total,
    visitas,
    sucessos,
    insucessos,
    taxaVisita: round2(total ? (visitas / total) * 100 : 0),
    taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
  };
}

/** @deprecated Preferir buildCanalKpis + splitByCanal */
export function buildGlobalKpis(items: AgendamentoItem[]) {
  const { preVenda, recepcao } = splitByCanal(items);
  const pre = buildCanalKpis(preVenda, "Pré-Venda");
  const rec = buildCanalKpis(recepcao, "Recepção");
  return {
    total: pre.total,
    visitas: pre.visitas,
    sucessos: pre.sucessos,
    insucessos: pre.insucessos,
    preVenda: pre.total,
    recepcao: rec.total,
    taxaVisita: pre.taxaVisita,
    taxaSucesso: pre.taxaSucesso,
    kpisPreVenda: pre,
    kpisRecepcao: rec,
  };
}

export function clientsForExport(items: AgendamentoItem[]) {
  const map = new Map<string, { nome: string; email: string; telefone: string }>();
  for (const item of items) {
    const key = `${item.cliente}|${item.celular}|${item.email}`.toLowerCase();
    if (!item.cliente && !item.celular && !item.email) continue;
    if (!map.has(key)) {
      map.set(key, {
        nome: item.cliente || "",
        email: item.email || "",
        telefone: item.celular || "",
      });
    }
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
