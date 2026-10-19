import { formatPeriodLabel } from "../dates";
import { emptyPropostasBreakdown, isRecepcaoName } from "./normalize";
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

/**
 * Ordem exata dos SDRs de Pré-Venda nas comparações/desempenho.
 * Chaves normalizadas (sem acento, pontuação → espaço).
 */
const PRE_VENDA_SDR_PRIORITY_KEYS = [
  "allan junior dos santos ramos",
  "thayna pre vendas",
  "lais narima ferreira vieira",
  "matheus imbroinise",
] as const;

function normalizePersonKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Nome exibido: Gabriela (e similares) → Recepção. */
export function displaySdrName(sdr: string): string {
  return isRecepcaoName(sdr) ? "Recepção" : sdr;
}

/** Índice de prioridade (0…n-1); quem não está na lista vai para o fim. */
export function preVendaSdrPriority(name: string): number {
  const key = normalizePersonKey(name);
  const idx = PRE_VENDA_SDR_PRIORITY_KEYS.findIndex((k) => k === key);
  return idx === -1 ? PRE_VENDA_SDR_PRIORITY_KEYS.length : idx;
}

/** Ordena SDRs pela lista fixa de Pré-Venda, depois critério secundário. */
export function comparePreVendaSdrNames(
  a: string,
  b: string,
  secondary: (a: string, b: string) => number = (x, y) => x.localeCompare(y, "pt-BR")
): number {
  const byPriority = preVendaSdrPriority(a) - preVendaSdrPriority(b);
  if (byPriority !== 0) return byPriority;
  return secondary(a, b);
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

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function filterAgendamentos(
  items: AgendamentoItem[],
  filters: SchedulingFilters
): AgendamentoItem[] {
  const q = filters.q?.trim().toLowerCase();
  const qDigits = q ? digitsOnly(q) : "";

  return items.filter((item) => {
    if (filters.sdr) {
      if (filters.sdr === "Recepção") {
        if (!isRecepcaoName(item.sdr)) return false;
      } else if (item.sdr !== filters.sdr) {
        return false;
      }
    }
    if (filters.tipoProposta && item.tipoProposta !== filters.tipoProposta) return false;
    if (filters.vendedor && item.vendedor !== filters.vendedor) return false;
    if (filters.origem && item.origem !== filters.origem) return false;
    if (filters.from && item.dataAgendamento < filters.from) return false;
    if (filters.to && item.dataAgendamento > filters.to) return false;
    if (q) {
      const idHit = item.id.toLowerCase().includes(q);
      const nomeHit = item.cliente.toLowerCase().includes(q);
      const phoneHit = qDigits.length > 0 && digitsOnly(item.celular).includes(qDigits);
      if (!idHit && !nomeHit && !phoneHit) return false;
    }
    return true;
  });
}

export function getSchedulingFilterOptions(items: AgendamentoItem[]) {
  const sdrs = [
    ...new Set(items.map((i) => displaySdrName(i.sdr))),
  ].sort((a, b) => comparePreVendaSdrNames(a, b));
  const vendedores = [...new Set(items.map((i) => i.vendedor))].sort();
  const tipos = [...new Set(items.map((i) => i.tipoProposta))].sort() as TipoProposta[];
  const origens = [...new Set(items.map((i) => i.origem).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  return { sdrs, vendedores, tipos, origens };
}

function breakdownPropostas(list: AgendamentoItem[]): PropostasBreakdown {
  const b = emptyPropostasBreakdown();
  for (const item of list) {
    b[item.tipoProposta] = (b[item.tipoProposta] || 0) + 1;
  }
  return b;
}

/** Motivos de insucesso; % = qtd / total de insucessos do recorte. */
export function buildMotivosStats(list: AgendamentoItem[]): MotivoStats[] {
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

function motivosFrom(list: AgendamentoItem[]): MotivoStats[] {
  return buildMotivosStats(list);
}

export type MotivoByPersonRow = {
  nome: string;
  totalInsucessos: number;
  motivos: MotivoStats[];
};

/** Insucessos agrupados por SDR (Atendido por). Recepção+Gabriela → "Recepção". */
export function buildMotivosBySdr(items: AgendamentoItem[]): MotivoByPersonRow[] {
  const closed = items.filter((i) => i.status === "Insucesso");
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of closed) {
    const nome = displaySdrName(item.sdr);
    const list = groups.get(nome) || [];
    list.push(item);
    groups.set(nome, list);
  }
  return [...groups.entries()]
    .map(([nome, list]) => ({
      nome,
      totalInsucessos: list.length,
      motivos: buildMotivosStats(list),
    }))
    .sort((a, b) =>
      comparePreVendaSdrNames(a.nome, b.nome, () => b.totalInsucessos - a.totalInsucessos)
    );
}

/** Insucessos agrupados por vendedor. */
export function buildMotivosByVendedor(items: AgendamentoItem[]): MotivoByPersonRow[] {
  const closed = items.filter((i) => i.status === "Insucesso");
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of closed) {
    const nome = item.vendedor || "(sem vendedor)";
    const list = groups.get(nome) || [];
    list.push(item);
    groups.set(nome, list);
  }
  return [...groups.entries()]
    .map(([nome, list]) => ({
      nome,
      totalInsucessos: list.length,
      motivos: buildMotivosStats(list),
    }))
    .sort((a, b) => b.totalInsucessos - a.totalInsucessos);
}

export type InsucessoKpis = {
  agendamentos: number;
  insucessos: number;
  percentualInsucesso: number;
  comMotivo: number;
};

export function buildInsucessoKpis(items: AgendamentoItem[]): InsucessoKpis {
  const agendamentos = items.length;
  const closed = items.filter((i) => i.status === "Insucesso");
  const comMotivo = closed.filter((i) => i.motivoInsucesso?.trim()).length;
  return {
    agendamentos,
    insucessos: closed.length,
    percentualInsucesso: round2(agendamentos ? (closed.length / agendamentos) * 100 : 0),
    comMotivo,
  };
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

function metricsFromSdrGroup(
  sdr: string,
  list: AgendamentoItem[],
  canal: CanalAtendimento
): SdrMetrics {
  const totalAgendamentos = list.length;
  const totalVisitas = list.filter((i) => i.teveVisita).length;
  const totalSucesso = list.filter((i) => i.status === "Sucesso").length;
  const totalInsucesso = list.filter((i) => i.status === "Insucesso").length;
  return {
    sdr,
    canal,
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
}

/** Métricas por SDR (Pré-Venda): uma linha por atendente, ordem fixa da equipe. */
export function buildSdrMetrics(items: AgendamentoItem[]): SdrMetrics[] {
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    const list = groups.get(item.sdr) || [];
    list.push(item);
    groups.set(item.sdr, list);
  }

  return [...groups.entries()]
    .map(([sdr, list]) =>
      metricsFromSdrGroup(sdr, list, list[0]?.canal || "Pré-Venda")
    )
    .sort((a, b) =>
      comparePreVendaSdrNames(a.sdr, b.sdr, () => b.totalAgendamentos - a.totalAgendamentos)
    );
}

/**
 * Desempenho/comparação Recepção: soma Recepção + Gabriela (e equivalentes)
 * e apresenta uma única linha "Recepção".
 */
export function buildRecepcaoConsolidatedMetrics(items: AgendamentoItem[]): SdrMetrics[] {
  if (items.length === 0) return [];
  return [metricsFromSdrGroup("Recepção", items, "Recepção")];
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

function mergeMotivoStats(lists: MotivoStats[][]): MotivoStats[] {
  const map = new Map<string, number>();
  for (const list of lists) {
    for (const m of list) {
      map.set(m.motivo, (map.get(m.motivo) || 0) + m.quantidade);
    }
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()]
    .map(([motivo, quantidade]) => ({
      motivo,
      quantidade,
      percentual: round2((quantidade / total) * 100),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

function mergeOrigemStats(lists: OrigemStats[][]): OrigemStats[] {
  const map = new Map<string, { quantidade: number; sucessos: number; insucessos: number }>();
  for (const list of lists) {
    for (const o of list) {
      const cur = map.get(o.origem) || { quantidade: 0, sucessos: 0, insucessos: 0 };
      cur.quantidade += o.quantidade;
      cur.sucessos += o.sucessos;
      cur.insucessos += o.insucessos;
      map.set(o.origem, cur);
    }
  }
  const total = [...map.values()].reduce((a, b) => a + b.quantidade, 0) || 1;
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

function sumPropostas(lists: PropostasBreakdown[]): PropostasBreakdown {
  const b = emptyPropostasBreakdown();
  for (const list of lists) {
    for (const key of Object.keys(b) as (keyof PropostasBreakdown)[]) {
      b[key] += list[key] || 0;
    }
  }
  return b;
}

/** Soma métricas de todos os vendedores (visão geral da aba). */
export function aggregateVendedorMetrics(rows: VendedorMetrics[]): VendedorMetrics {
  const totalRecebidos = rows.reduce((s, r) => s + r.totalRecebidos, 0);
  const totalVisitas = rows.reduce((s, r) => s + r.totalVisitas, 0);
  const totalSucesso = rows.reduce((s, r) => s + r.totalSucesso, 0);
  const totalInsucesso = rows.reduce((s, r) => s + r.totalInsucesso, 0);
  const totalPreVenda = rows.reduce((s, r) => s + r.totalPreVenda, 0);
  const sucessoPreVenda = rows.reduce((s, r) => s + r.sucessoPreVenda, 0);
  const totalRecepcao = rows.reduce((s, r) => s + r.totalRecepcao, 0);
  const sucessoRecepcao = rows.reduce((s, r) => s + r.sucessoRecepcao, 0);
  const visitasRecepcao = rows.reduce((s, r) => s + r.visitasRecepcao, 0);
  const insucessosRecepcao = rows.reduce((s, r) => s + r.insucessosRecepcao, 0);

  return {
    vendedor: "Todos",
    totalRecebidos,
    totalVisitas,
    totalSucesso,
    totalInsucesso,
    conversaoGeral: round2(totalRecebidos ? (totalSucesso / totalRecebidos) * 100 : 0),
    totalPreVenda,
    sucessoPreVenda,
    conversaoPreVenda: round2(totalPreVenda ? (sucessoPreVenda / totalPreVenda) * 100 : 0),
    totalRecepcao,
    sucessoRecepcao,
    visitasRecepcao,
    insucessosRecepcao,
    conversaoRecepcao: round2(totalRecepcao ? (sucessoRecepcao / totalRecepcao) * 100 : 0),
    taxaVisitaRecepcao: round2(totalRecepcao ? (visitasRecepcao / totalRecepcao) * 100 : 0),
    motivosInsucesso: mergeMotivoStats(rows.map((r) => r.motivosInsucesso)),
    motivosInsucessoRecepcao: mergeMotivoStats(rows.map((r) => r.motivosInsucessoRecepcao)),
    origens: mergeOrigemStats(rows.map((r) => r.origens)),
    origensRecepcao: mergeOrigemStats(rows.map((r) => r.origensRecepcao)),
    propostasBreakdown: sumPropostas(rows.map((r) => r.propostasBreakdown)),
    propostasBreakdownRecepcao: sumPropostas(rows.map((r) => r.propostasBreakdownRecepcao)),
  };
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

/** Comparação direta só de quem atendeu (SDR / Recepção) — sem vendedores. */
export function buildSdrComparisonRows(sdrs: SdrMetrics[]): ComparisonRow[] {
  return sdrs
    .map((s) => ({
      nome: s.sdr,
      papel: "SDR" as const,
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
    }))
    .sort((a, b) => comparePreVendaSdrNames(a.nome, b.nome, () => b.total - a.total));
}

/** Comparação direta só entre vendedores (um canal por tabela). */
export function buildVendedorComparisonRows(
  vendedores: VendedorMetrics[],
  canal: CanalAtendimento
): ComparisonRow[] {
  const rows: ComparisonRow[] = [];
  for (const v of vendedores) {
    if (canal === "Recepção") {
      if (!v.totalRecepcao) continue;
      const b = v.propostasBreakdownRecepcao;
      rows.push({
        nome: v.vendedor,
        papel: "Vendedor",
        canal: "Recepção",
        total: v.totalRecepcao,
        visitas: v.visitasRecepcao,
        sucessos: v.sucessoRecepcao,
        insucessos: v.insucessosRecepcao,
        taxaVisita: v.taxaVisitaRecepcao,
        taxaSucesso: v.conversaoRecepcao,
        compra: b.Compra,
        venda: b.Venda,
        troca: b.Troca,
        consignacao: b.Consignação,
        financiamento: b.Financiamento,
        naoInformado: b["não informado(celulas em branco)"],
      });
      continue;
    }
    if (!v.totalPreVenda) continue;
    const b = v.propostasBreakdown;
    rows.push({
      nome: v.vendedor,
      papel: "Vendedor",
      canal: "Pré-Venda",
      total: v.totalRecebidos,
      visitas: v.totalVisitas,
      sucessos: v.totalSucesso,
      insucessos: v.totalInsucesso,
      taxaVisita: round2(v.totalRecebidos ? (v.totalVisitas / v.totalRecebidos) * 100 : 0),
      taxaSucesso: v.conversaoGeral,
      compra: b.Compra,
      venda: b.Venda,
      troca: b.Troca,
      consignacao: b.Consignação,
      financiamento: b.Financiamento,
      naoInformado: b["não informado(celulas em branco)"],
    });
  }
  return rows.sort((a, b) => b.total - a.total);
}

export type SdrVendedorPairRow = {
  sdr: string;
  vendedor: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  compra: number;
  venda: number;
  troca: number;
  consignacao: number;
  financiamento: number;
  naoInformado: number;
};

/**
 * Uma linha por par SDR × Vendedor (Pré-Venda).
 * Omite pares com 0 agendamentos; ordena por SDR (pré-venda) em sequência, depois vendedor.
 */
export function buildSdrVendedorProposalRows(items: AgendamentoItem[]): SdrVendedorPairRow[] {
  const groups = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    if (!item.vendedor || item.vendedor === "(sem vendedor)") continue;
    if (!item.sdr || item.sdr === "(sem SDR)") continue;
    const key = `${item.sdr}::${item.vendedor}`;
    const list = groups.get(key) || [];
    list.push(item);
    groups.set(key, list);
  }

  const rows: SdrVendedorPairRow[] = [];
  for (const [key, list] of groups) {
    if (list.length === 0) continue;
    const [sdr, vendedor] = key.split("::");
    const total = list.length;
    const visitas = list.filter((i) => i.teveVisita).length;
    const sucessos = list.filter((i) => i.status === "Sucesso").length;
    const insucessos = list.filter((i) => i.status === "Insucesso").length;
    const b = breakdownPropostas(list);
    rows.push({
      sdr: sdr || "",
      vendedor: vendedor || "",
      total,
      visitas,
      sucessos,
      insucessos,
      taxaVisita: round2(total ? (visitas / total) * 100 : 0),
      taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
      compra: b.Compra,
      venda: b.Venda,
      troca: b.Troca,
      consignacao: b.Consignação,
      financiamento: b.Financiamento,
      naoInformado: b["não informado(celulas em branco)"],
    });
  }

  return rows.sort(
    (a, b) =>
      comparePreVendaSdrNames(a.sdr, b.sdr) ||
      a.vendedor.localeCompare(b.vendedor, "pt-BR")
  );
}

/** @deprecated Preferir buildSdrComparisonRows / buildVendedorComparisonRows */
export function buildComparisonRows(
  sdrs: SdrMetrics[],
  vendedores: VendedorMetrics[],
  canal: CanalAtendimento | "todos" = "todos"
): ComparisonRow[] {
  const sdrFiltered =
    canal === "todos" ? sdrs : sdrs.filter((s) => s.canal === canal);
  if (canal === "todos") {
    return [
      ...buildSdrComparisonRows(sdrFiltered),
      ...buildVendedorComparisonRows(vendedores, "Pré-Venda"),
      ...buildVendedorComparisonRows(vendedores, "Recepção"),
    ];
  }
  return [
    ...buildSdrComparisonRows(sdrFiltered),
    ...buildVendedorComparisonRows(vendedores, canal),
  ];
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
