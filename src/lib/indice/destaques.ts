import { buildSdrRows, sliceCampanhas } from "../campanhas/analytics";
import { buildVendedorRows, dealsFromLines, filterDeals } from "../negociacoes/metrics";
import type { NegociacaoLine } from "../negociacoes/types";
import { isFeaturedPreVendaSdr } from "../scheduling/metrics";
import { isRecepcaoName } from "../scheduling/normalize";
import type { AgendamentoItem } from "../scheduling/types";

export type PersonSpot = {
  name: string;
  headline: string;
  detail: string;
};

export type SectorPeople = {
  positive: PersonSpot | null;
  negative: PersonSpot | null;
};

function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthTitle(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function pct(part: number, total: number): string {
  const value = total ? (part / total) * 100 : 0;
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function num(value: number): string {
  return value.toLocaleString("pt-BR");
}

function usable(name: string): boolean {
  const key = name.trim().toLowerCase();
  if (!key) return false;
  if (
    key === "(sem sdr)" ||
    key === "(sem vendedor)" ||
    key === "recepção" ||
    key === "recepcao" ||
    key.includes("sem interesse") ||
    key.includes("não informado") ||
    key.includes("nao informado")
  ) {
    return false;
  }
  return !key.startsWith("espaço bellos") && !key.startsWith("espaco bellos") && !key.startsWith("lead ");
}

export function campanhaPeople(rows: Parameters<typeof sliceCampanhas>[0]): SectorPeople {
  const ym = monthKey();
  const today = new Date();
  const to = `${ym}-${String(today.getDate()).padStart(2, "0")}`;
  const monthRows = buildSdrRows(sliceCampanhas(rows, { from: `${ym}-01`, to })).filter(
    (row) => usable(row.sdr) && isFeaturedPreVendaSdr(row.sdr)
  );
  const history = new Map(
    buildSdrRows(sliceCampanhas(rows, {}))
      .filter((row) => usable(row.sdr) && isFeaturedPreVendaSdr(row.sdr))
      .map((row) => [row.sdr, row])
  );
  const pool = monthRows.filter((row) => row.atendimentos > 0);
  if (pool.length === 0) return { positive: null, negative: null };
  const ranked = [...pool].sort(
    (a, b) => b.taxaSucesso - a.taxaSucesso || b.sucessos - a.sucessos
  );
  const high = ranked[0];
  const low = [...ranked].reverse().find((row) => row.sdr !== high.sdr) ?? null;
  const title = monthTitle(ym);
  const spot = (row: (typeof ranked)[number]): PersonSpot => {
    const past = history.get(row.sdr);
    return {
      name: row.sdr,
      headline: pct(row.sucessos, row.atendimentos),
      detail: past
        ? `${title}: ${num(row.sucessos)} sucessos em ${num(row.atendimentos)} atendimentos (${pct(row.sucessos, row.atendimentos)}). Histórico: ${num(past.sucessos)} sucessos em ${num(past.atendimentos)} atendimentos (${pct(past.sucessos, past.atendimentos)}).`
        : `${title}: ${num(row.sucessos)} sucessos em ${num(row.atendimentos)} atendimentos.`,
    };
  };
  return { positive: spot(high), negative: low ? spot(low) : null };
}

export function agendaPeople(items: AgendamentoItem[]): SectorPeople {
  const ym = monthKey();
  const pre = items.filter(
    (item) =>
      item.canal !== "Recepção" &&
      !isRecepcaoName(item.sdr) &&
      usable(item.sdr) &&
      isFeaturedPreVendaSdr(item.sdr)
  );
  const tally = (list: AgendamentoItem[]) => {
    const map = new Map<string, { sucessos: number; insucessos: number; total: number }>();
    for (const item of list) {
      const cur = map.get(item.sdr) ?? { sucessos: 0, insucessos: 0, total: 0 };
      cur.total += 1;
      if (item.status === "Sucesso") cur.sucessos += 1;
      if (item.status === "Insucesso") cur.insucessos += 1;
      map.set(item.sdr, cur);
    }
    return map;
  };
  const month = tally(pre.filter((item) => item.monthKey === ym));
  const history = tally(pre);
  const rows = [...month.entries()].filter(([, row]) => row.total > 0);
  if (rows.length === 0) return { positive: null, negative: null };
  const high = [...rows].sort((a, b) => b[1].sucessos - a[1].sucessos || a[1].insucessos - b[1].insucessos)[0];
  const low = [...rows].sort((a, b) => b[1].insucessos - a[1].insucessos || a[1].sucessos - b[1].sucessos).find(
    ([name]) => name !== high[0]
  );
  const title = monthTitle(ym);
  const spot = (name: string, row: { sucessos: number; insucessos: number; total: number }, kind: "up" | "down"): PersonSpot => {
    const past = history.get(name);
    const now =
      kind === "up"
        ? `${num(row.sucessos)} sucessos em ${num(row.total)} agendamentos`
        : `${num(row.insucessos)} insucessos em ${num(row.total)} agendamentos`;
    const then = past
      ? ` Histórico: ${num(past.sucessos)} sucessos e ${num(past.insucessos)} insucessos em ${num(past.total)} agendamentos.`
      : "";
    return {
      name,
      headline: kind === "up" ? `${num(row.sucessos)} sucessos` : `${num(row.insucessos)} insucessos`,
      detail: `${title}: ${now}.${then}`,
    };
  };
  return {
    positive: spot(high[0], high[1], "up"),
    negative: low ? spot(low[0], low[1], "down") : null,
  };
}

export function lojaPeople(lines: NegociacaoLine[]): SectorPeople {
  const ym = monthKey();
  const all = dealsFromLines(lines);
  const month = buildVendedorRows(filterDeals(all, { month: ym, period: "all", vendedor: "all", tipo: "all", status: "all", tipoVenda: "all" })).filter(
    (row) => usable(row.vendedor) && row.total > 0
  );
  const history = new Map(
    buildVendedorRows(all)
      .filter((row) => usable(row.vendedor))
      .map((row) => [row.vendedor, row])
  );
  if (month.length === 0) return { positive: null, negative: null };
  const high = [...month].sort((a, b) => b.vendas - a.vendas || b.total - a.total)[0];
  const low = [...month].sort((a, b) => a.vendas - b.vendas || b.total - a.total).find((row) => row.vendedor !== high.vendedor);
  const title = monthTitle(ym);
  const spot = (row: (typeof month)[number]): PersonSpot => {
    const past = history.get(row.vendedor);
    return {
      name: row.vendedor,
      headline: `${num(row.vendas)} vendas`,
      detail: past
        ? `${title}: ${num(row.vendas)} vendas em ${num(row.total)} negócios. Histórico: ${num(past.vendas)} vendas em ${num(past.total)} negócios.`
        : `${title}: ${num(row.vendas)} vendas em ${num(row.total)} negócios.`,
    };
  };
  return { positive: spot(high), negative: low ? spot(low) : null };
}

export type RevenueSpot = {
  place: string;
  name: string;
  value: string;
  detail: string;
};

export type RevenueBoard = {
  people: RevenueSpot[];
  web: RevenueSpot | null;
};

const EMPTY_BOARD: RevenueBoard = { people: [], web: null };

/** Pré-venda da equipe, ou o nome na negociação marca Vendas / Prospecção. */
function isWebVendas(name: string): boolean {
  if (isFeaturedPreVendaSdr(name)) return true;
  const key = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  return key.includes("vendas") || key.includes("prospec");
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/** Valor da venda que saiu. Na troca, só a linha de saída entra no total. */
function saleValue(lines: NegociacaoLine[]): number {
  const saidas = lines.filter((line) => line.movimentacao.toLowerCase().includes("sa"));
  const pool = saidas.length > 0 ? saidas : lines;
  return pool.reduce((sum, line) => sum + (line.valorVenda ?? 0), 0);
}

/** Faturamento do mês, todos os colaboradores, mais o total do setor Web Vendas. */
export function topFaturamento(lines: NegociacaoLine[]): RevenueBoard {
  const ym = monthKey();
  const deals = filterDeals(dealsFromLines(lines), {
    month: ym,
    period: "all",
    vendedor: "all",
    tipo: "all",
    status: "all",
    tipoVenda: "all",
  });
  const totals = new Map<string, { total: number; deals: number }>();
  for (const deal of deals) {
    if (!usable(deal.vendedor)) continue;
    const value = saleValue(deal.lines);
    if (value <= 0) continue;
    const current = totals.get(deal.vendedor) ?? { total: 0, deals: 0 };
    current.total += value;
    current.deals += 1;
    totals.set(deal.vendedor, current);
  }
  const ranked = [...totals.entries()].sort((a, b) => b[1].total - a[1].total || b[1].deals - a[1].deals);
  if (ranked.length === 0) return EMPTY_BOARD;
  const title = monthTitle(ym);
  const faturamento = ranked.reduce((sum, [, row]) => sum + row.total, 0);
  const spot = (name: string, row: { total: number; deals: number }, place: string, detail: string): RevenueSpot => ({
    place,
    name,
    value: pct(row.total, faturamento),
    detail,
  });
  const people = ranked.map(([name, row], index) =>
    spot(
      name,
      row,
      `${index + 1}º`,
      `${money(row.total)} · ${title}, ${num(row.deals)} ${row.deals === 1 ? "negócio" : "negócios"}.`
    )
  );
  const webRows = ranked.filter(([name]) => isWebVendas(name));
  const webTotal = webRows.reduce((sum, [, row]) => sum + row.total, 0);
  const webDeals = webRows.reduce((sum, [, row]) => sum + row.deals, 0);
  const web =
    webTotal > 0
      ? spot(
          "Web Vendas",
          { total: webTotal, deals: webDeals },
          "Total",
          `${money(webTotal)} · ${title}, soma de ${joinNames(webRows.map(([name]) => name))}, ${num(webDeals)} ${webDeals === 1 ? "negócio" : "negócios"}.`
        )
      : null;
  return { people, web };
}
