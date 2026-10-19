import { formatPeriodLabel } from "../dates";
import { round2, buildMotivosStats } from "./metrics";
import {
  parseOrigemRaw,
  portalGroupIdForOrigin,
  PORTAL_GROUPS,
  type PortalGroupId,
} from "./portalOrigin";
import type { AgendamentoItem, MotivoStats, TipoProposta } from "./types";

export type ProposalBreakdownRow = {
  tipo: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaInsucesso: number;
};

export type ChannelBreakdown = {
  canal: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaInsucesso: number;
  propostas: ProposalBreakdownRow[];
};

export type PortalOriginMetrics = {
  origin: string;
  groupId: PortalGroupId;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaInsucesso: number;
  sharePct: number;
  preVenda: number;
  recepcao: number;
  propostas: Record<string, number>;
  channels: ChannelBreakdown[];
  topSdrs: { nome: string; total: number; sucessos: number; taxaSucesso: number }[];
  topVendedores: { nome: string; total: number; sucessos: number; taxaSucesso: number }[];
  topMotivos: MotivoStats[];
  rawLabels: { label: string; total: number }[];
};

export type PortalGroupMetrics = {
  id: PortalGroupId;
  label: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaInsucesso: number;
  sharePct: number;
  origins: PortalOriginMetrics[];
};

export type PortalDashboard = {
  /** Contagem única de agendamentos no filtro (sem multi-contar). */
  uniqueTotal: number;
  /** Soma das atribuições a portais (pode ser > uniqueTotal se multi-origem). */
  attributedTotal: number;
  groups: PortalGroupMetrics[];
  origins: PortalOriginMetrics[];
  topByVolume: PortalOriginMetrics[];
  topByConversion: PortalOriginMetrics[];
  periodSeriesTop: {
    label: string;
    series: { origin: string; total: number; sucessos: number }[];
  }[];
};

type Acc = {
  items: AgendamentoItem[];
  channels: Map<string, AgendamentoItem[]>;
  raw: Map<string, number>;
};

function emptyPropostas(): Record<string, number> {
  return {
    Compra: 0,
    Venda: 0,
    Troca: 0,
    Consignação: 0,
    Financiamento: 0,
    "não informado(celulas em branco)": 0,
  };
}

function personTops(
  items: AgendamentoItem[],
  field: "sdr" | "vendedor",
  limit = 3
) {
  const map = new Map<string, AgendamentoItem[]>();
  for (const item of items) {
    const nome = item[field];
    if (!nome || nome === "(sem vendedor)" || nome === "(sem SDR)") continue;
    const list = map.get(nome) || [];
    list.push(item);
    map.set(nome, list);
  }
  return [...map.entries()]
    .map(([nome, list]) => {
      const total = list.length;
      const sucessos = list.filter((i) => i.status === "Sucesso").length;
      return {
        nome,
        total,
        sucessos,
        taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
      };
    })
    .sort((a, b) => b.total - a.total || b.taxaSucesso - a.taxaSucesso)
    .slice(0, limit);
}

function finalizeOrigin(
  origin: string,
  acc: Acc,
  uniqueTotal: number
): PortalOriginMetrics {
  const items = acc.items;
  const total = items.length;
  const visitas = items.filter((i) => i.teveVisita).length;
  const sucessos = items.filter((i) => i.status === "Sucesso").length;
  const insucessos = items.filter((i) => i.status === "Insucesso").length;
  const propostas = emptyPropostas();
  for (const item of items) {
    const t = item.tipoProposta as TipoProposta;
    propostas[t] = (propostas[t] || 0) + 1;
  }

  const channels: ChannelBreakdown[] = [...acc.channels.entries()]
    .map(([canal, list]) => {
      const t = list.length;
      const v = list.filter((i) => i.teveVisita).length;
      const s = list.filter((i) => i.status === "Sucesso").length;
      const ins = list.filter((i) => i.status === "Insucesso").length;
      const byTipo = new Map<string, AgendamentoItem[]>();
      for (const item of list) {
        const tipo = item.tipoProposta;
        const cur = byTipo.get(tipo) || [];
        cur.push(item);
        byTipo.set(tipo, cur);
      }
      const propostas: ProposalBreakdownRow[] = [...byTipo.entries()]
        .map(([tipo, rows]) => {
          const pt = rows.length;
          const pv = rows.filter((i) => i.teveVisita).length;
          const ps = rows.filter((i) => i.status === "Sucesso").length;
          const pi = rows.filter((i) => i.status === "Insucesso").length;
          return {
            tipo,
            total: pt,
            visitas: pv,
            sucessos: ps,
            insucessos: pi,
            taxaVisita: round2(pt ? (pv / pt) * 100 : 0),
            taxaSucesso: round2(pt ? (ps / pt) * 100 : 0),
            taxaInsucesso: round2(pt ? (pi / pt) * 100 : 0),
          };
        })
        .sort((a, b) => b.total - a.total);
      return {
        canal,
        total: t,
        visitas: v,
        sucessos: s,
        insucessos: ins,
        taxaVisita: round2(t ? (v / t) * 100 : 0),
        taxaSucesso: round2(t ? (s / t) * 100 : 0),
        taxaInsucesso: round2(t ? (ins / t) * 100 : 0),
        propostas,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    origin,
    groupId: portalGroupIdForOrigin(origin),
    total,
    visitas,
    sucessos,
    insucessos,
    taxaVisita: round2(total ? (visitas / total) * 100 : 0),
    taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
    taxaInsucesso: round2(total ? (insucessos / total) * 100 : 0),
    sharePct: round2(uniqueTotal ? (total / uniqueTotal) * 100 : 0),
    preVenda: items.filter((i) => i.canal === "Pré-Venda").length,
    recepcao: items.filter((i) => i.canal === "Recepção").length,
    propostas,
    channels,
    topSdrs: personTops(items, "sdr"),
    topVendedores: personTops(items, "vendedor"),
    topMotivos: buildMotivosStats(items).slice(0, 5),
    rawLabels: [...acc.raw.entries()]
      .map(([label, n]) => ({ label, total: n }))
      .sort((a, b) => b.total - a.total),
  };
}

export function buildPortalDashboard(items: AgendamentoItem[]): PortalDashboard {
  const byOrigin = new Map<string, Acc>();

  for (const item of items) {
    const parsed = parseOrigemRaw(item.origem);
    for (const origin of parsed.origins) {
      let acc = byOrigin.get(origin);
      if (!acc) {
        acc = { items: [], channels: new Map(), raw: new Map() };
        byOrigin.set(origin, acc);
      }
      acc.items.push(item);
      acc.raw.set(parsed.raw, (acc.raw.get(parsed.raw) || 0) + 1);
      const channelList =
        parsed.channels.length > 0 ? parsed.channels : ["(não informado)"];
      for (const ch of channelList) {
        const list = acc.channels.get(ch) || [];
        list.push(item);
        acc.channels.set(ch, list);
      }
    }
  }

  const uniqueTotal = items.length;
  const origins = [...byOrigin.entries()]
    .map(([origin, acc]) => finalizeOrigin(origin, acc, uniqueTotal))
    .sort((a, b) => b.total - a.total || a.origin.localeCompare(b.origin, "pt-BR"));

  const attributedTotal = origins.reduce((s, o) => s + o.total, 0);

  const groups: PortalGroupMetrics[] = PORTAL_GROUPS.map((g) => {
    const gOrigins = origins.filter((o) => o.groupId === g.id);
    const total = gOrigins.reduce((s, o) => s + o.total, 0);
    const visitas = gOrigins.reduce((s, o) => s + o.visitas, 0);
    const sucessos = gOrigins.reduce((s, o) => s + o.sucessos, 0);
    const insucessos = gOrigins.reduce((s, o) => s + o.insucessos, 0);
    return {
      id: g.id,
      label: g.label,
      total,
      visitas,
      sucessos,
      insucessos,
      taxaVisita: round2(total ? (visitas / total) * 100 : 0),
      taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
      taxaInsucesso: round2(total ? (insucessos / total) * 100 : 0),
      sharePct: round2(uniqueTotal ? (total / uniqueTotal) * 100 : 0),
      origins: gOrigins,
    };
  }).filter((g) => g.total > 0);

  const topByVolume = origins.slice(0, 5);
  const topByConversion = [...origins]
    .filter((o) => o.total >= 20)
    .sort((a, b) => b.taxaSucesso - a.taxaSucesso || b.total - a.total)
    .slice(0, 5);

  // Série por quinzena dos top 5 portais por volume
  const topNames = new Set(topByVolume.map((o) => o.origin));
  const periodMap = new Map<
    string,
    Map<string, { total: number; sucessos: number }>
  >();
  for (const item of items) {
    const parsed = parseOrigemRaw(item.origem);
    for (const origin of parsed.origins) {
      if (!topNames.has(origin)) continue;
      const pk = item.periodKey || item.monthKey;
      if (!periodMap.has(pk)) periodMap.set(pk, new Map());
      const m = periodMap.get(pk)!;
      const cur = m.get(origin) || { total: 0, sucessos: 0 };
      cur.total += 1;
      if (item.status === "Sucesso") cur.sucessos += 1;
      m.set(origin, cur);
    }
  }
  const periodSeriesTop = [...periodMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, m]) => ({
      label: formatPeriodLabel(periodKey),
      series: [...m.entries()].map(([origin, v]) => ({
        origin,
        total: v.total,
        sucessos: v.sucessos,
      })),
    }));

  return {
    uniqueTotal,
    attributedTotal,
    groups,
    origins,
    topByVolume,
    topByConversion,
    periodSeriesTop,
  };
}
