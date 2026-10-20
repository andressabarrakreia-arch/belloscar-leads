import { formatPeriodLabel } from "../dates";
import { round2, buildMotivosStats } from "./metrics";
import {
  parseOrigemRaw,
  portalGroupIdForOrigin,
  PORTAL_GROUPS,
  type PortalGroupId,
} from "./portalOrigin";
import type {
  AgendamentoItem,
  LeadAtendimentoItem,
  MotivoStats,
  RealizadoItem,
  SucessoItem,
  TipoProposta,
} from "./types";

export type PortalExtraCounts = {
  visitas?: RealizadoItem[];
  sucessos?: SucessoItem[];
};

export type ProposalBreakdownRow = {
  tipo: string;
  atendimentos: number;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
};

export type ChannelBreakdown = {
  canal: string;
  atendimentos: number;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  propostas: ProposalBreakdownRow[];
};

export type PortalOriginMetrics = {
  origin: string;
  groupId: PortalGroupId;
  atendimentos: number;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaAgendamento: number;
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
  atendimentos: number;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaAgendamento: number;
  origins: PortalOriginMetrics[];
};

export type PortalDashboard = {
  uniqueTotal: number;
  uniqueLeads: number;
  attributedTotal: number;
  attributedLeads: number;
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
  leads: LeadAtendimentoItem[];
  visitas: RealizadoItem[];
  sucessos: SucessoItem[];
  channels: Map<string, AgendamentoItem[]>;
  leadChannels: Map<string, LeadAtendimentoItem[]>;
  visitaChannels: Map<string, RealizadoItem[]>;
  sucessoChannels: Map<string, SucessoItem[]>;
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

function ensureAcc(map: Map<string, Acc>, origin: string): Acc {
  let acc = map.get(origin);
  if (!acc) {
    acc = {
      items: [],
      leads: [],
      visitas: [],
      sucessos: [],
      channels: new Map(),
      leadChannels: new Map(),
      visitaChannels: new Map(),
      sucessoChannels: new Map(),
      raw: new Map(),
    };
    map.set(origin, acc);
  }
  return acc;
}

function pushChannel<T>(map: Map<string, T[]>, canal: string, row: T) {
  const list = map.get(canal) || [];
  list.push(row);
  map.set(canal, list);
}

/** Origem efetiva: prioriza a da linha; fallback por ID (agenda / leads). */
function resolveOrigemRaw(
  id: string,
  primary: string | undefined,
  origemById: Map<string, string>
): string {
  const p = (primary || "").trim();
  if (p && p !== "Não informado") return p;
  return origemById.get(id) || p || "Não informado";
}

function attributeByOrigemChannels<T extends { id: string; origem: string }>(
  byOrigin: Map<string, Acc>,
  row: T,
  origemRaw: string,
  bucket: "visitas" | "sucessos"
) {
  const parsed = parseOrigemRaw(origemRaw);
  const channelList =
    parsed.channels.length > 0 ? parsed.channels : ["(não informado)"];

  for (const origin of parsed.origins) {
    const acc = ensureAcc(byOrigin, origin);
    if (bucket === "visitas") {
      acc.visitas.push(row as unknown as RealizadoItem);
      for (const ch of channelList) {
        pushChannel(acc.visitaChannels, ch, row as unknown as RealizadoItem);
      }
    } else {
      acc.sucessos.push(row as unknown as SucessoItem);
      for (const ch of channelList) {
        pushChannel(acc.sucessoChannels, ch, row as unknown as SucessoItem);
      }
    }
  }
}

function finalizeOrigin(origin: string, acc: Acc, useExtra: boolean): PortalOriginMetrics {
  const items = acc.items;
  const leads = acc.leads;
  const total = items.length;
  const atendimentos = leads.length;
  const visitas = useExtra
    ? acc.visitas.length
    : items.filter((i) => i.teveVisita).length;
  const sucessos = useExtra
    ? acc.sucessos.length
    : items.filter((i) => i.status === "Sucesso").length;
  const insucessos = items.filter((i) => i.status === "Insucesso").length;
  const propostas = emptyPropostas();
  for (const item of items) {
    const t = item.tipoProposta as TipoProposta;
    propostas[t] = (propostas[t] || 0) + 1;
  }

  const channelNames = new Set([
    ...acc.channels.keys(),
    ...acc.leadChannels.keys(),
    ...acc.visitaChannels.keys(),
    ...acc.sucessoChannels.keys(),
  ]);

  const channels: ChannelBreakdown[] = [...channelNames]
    .map((canal) => {
      const list = acc.channels.get(canal) || [];
      const leadList = acc.leadChannels.get(canal) || [];
      const t = list.length;
      const atend = leadList.length;
      const visitaList = acc.visitaChannels.get(canal) || [];
      const sucessoList = acc.sucessoChannels.get(canal) || [];
      const v = useExtra
        ? visitaList.length
        : list.filter((i) => i.teveVisita).length;
      const s = useExtra
        ? sucessoList.length
        : list.filter((i) => i.status === "Sucesso").length;
      const ins = list.filter((i) => i.status === "Insucesso").length;

      const tipos = new Set([
        ...list.map((i) => i.tipoProposta),
        ...leadList.map((i) => i.tipoProposta),
        ...(useExtra ? sucessoList.map((i) => i.tipoProposta) : []),
      ]);

      const propostasRows: ProposalBreakdownRow[] = [...tipos]
        .map((tipo) => {
          const rows = list.filter((i) => i.tipoProposta === tipo);
          const leadRows = leadList.filter((i) => i.tipoProposta === tipo);
          const pt = rows.length;
          const pa = leadRows.length;
          const pv = useExtra
            ? visitaList.filter((i) => i.tipoProposta === tipo).length
            : rows.filter((i) => i.teveVisita).length;
          const ps = useExtra
            ? sucessoList.filter((i) => i.tipoProposta === tipo).length
            : rows.filter((i) => i.status === "Sucesso").length;
          const pi = rows.filter((i) => i.status === "Insucesso").length;
          return {
            tipo,
            atendimentos: pa,
            total: pt,
            visitas: pv,
            sucessos: ps,
            insucessos: pi,
            taxaVisita: round2(pt ? (pv / pt) * 100 : 0),
            taxaSucesso: round2(pv ? (ps / pv) * 100 : pt ? (ps / pt) * 100 : 0),
          };
        })
        .filter((p) => p.atendimentos > 0 || p.total > 0 || p.visitas > 0 || p.sucessos > 0)
        .sort((a, b) => b.total - a.total || b.atendimentos - a.atendimentos);

      return {
        canal,
        atendimentos: atend,
        total: t,
        visitas: v,
        sucessos: s,
        insucessos: ins,
        taxaVisita: round2(t ? (v / t) * 100 : 0),
        // Mesma regra da origem: Suc/Vis quando há visitas
        taxaSucesso: round2(v ? (s / v) * 100 : t ? (s / t) * 100 : 0),
        propostas: propostasRows,
      };
    })
    .sort((a, b) => b.total - a.total || b.atendimentos - a.atendimentos);

  return {
    origin,
    groupId: portalGroupIdForOrigin(origin),
    atendimentos,
    total,
    visitas,
    sucessos,
    insucessos,
    taxaVisita: round2(total ? (visitas / total) * 100 : 0),
    taxaSucesso: round2(visitas ? (sucessos / visitas) * 100 : 0),
    taxaAgendamento: round2(atendimentos ? (total / atendimentos) * 100 : 0),
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

export function buildPortalDashboard(
  items: AgendamentoItem[],
  leads: LeadAtendimentoItem[] = [],
  extra: PortalExtraCounts = {}
): PortalDashboard {
  const byOrigin = new Map<string, Acc>();
  const useExtra = Boolean(extra.visitas?.length || extra.sucessos?.length);

  // Fallback de origem por ID (agenda e leads/realizados)
  const origemById = new Map<string, string>();
  for (const item of items) {
    if (item.origem && item.origem !== "Não informado") {
      origemById.set(item.id, item.origem);
    }
  }
  for (const lead of leads) {
    if (lead.origem && lead.origem !== "Não informado" && !origemById.has(lead.id)) {
      origemById.set(lead.id, lead.origem);
    }
  }

  for (const item of items) {
    const parsed = parseOrigemRaw(item.origem);
    for (const origin of parsed.origins) {
      const acc = ensureAcc(byOrigin, origin);
      acc.items.push(item);
      acc.raw.set(parsed.raw, (acc.raw.get(parsed.raw) || 0) + 1);
      const channelList =
        parsed.channels.length > 0 ? parsed.channels : ["(não informado)"];
      for (const ch of channelList) {
        pushChannel(acc.channels, ch, item);
      }
    }
  }

  for (const lead of leads) {
    const parsed = parseOrigemRaw(lead.origem);
    for (const origin of parsed.origins) {
      const acc = ensureAcc(byOrigin, origin);
      acc.leads.push(lead);
      acc.raw.set(parsed.raw, (acc.raw.get(parsed.raw) || 0) + 1);
      const channelList =
        parsed.channels.length > 0 ? parsed.channels : ["(não informado)"];
      for (const ch of channelList) {
        pushChannel(acc.leadChannels, ch, lead);
      }
    }
  }

  for (const v of extra.visitas || []) {
    const origemRaw = resolveOrigemRaw(v.id, v.origem, origemById);
    attributeByOrigemChannels(byOrigin, { ...v, origem: origemRaw }, origemRaw, "visitas");
  }

  for (const s of extra.sucessos || []) {
    const origemRaw = resolveOrigemRaw(s.id, s.origem, origemById);
    attributeByOrigemChannels(byOrigin, { ...s, origem: origemRaw }, origemRaw, "sucessos");
  }

  const origins = [...byOrigin.entries()]
    .map(([origin, acc]) => finalizeOrigin(origin, acc, useExtra))
    .sort(
      (a, b) =>
        b.atendimentos - a.atendimentos ||
        b.total - a.total ||
        a.origin.localeCompare(b.origin, "pt-BR")
    );

  const uniqueTotal = items.length;
  const uniqueLeads = leads.length;
  const attributedTotal = origins.reduce((s, o) => s + o.total, 0);
  const attributedLeads = origins.reduce((s, o) => s + o.atendimentos, 0);

  const groups: PortalGroupMetrics[] = PORTAL_GROUPS.map((g) => {
    const gOrigins = origins.filter((o) => o.groupId === g.id);
    const total = gOrigins.reduce((s, o) => s + o.total, 0);
    const atendimentos = gOrigins.reduce((s, o) => s + o.atendimentos, 0);
    const visitas = gOrigins.reduce((s, o) => s + o.visitas, 0);
    const sucessos = gOrigins.reduce((s, o) => s + o.sucessos, 0);
    const insucessos = gOrigins.reduce((s, o) => s + o.insucessos, 0);
    return {
      id: g.id,
      label: g.label,
      atendimentos,
      total,
      visitas,
      sucessos,
      insucessos,
      taxaVisita: round2(total ? (visitas / total) * 100 : 0),
      taxaSucesso: round2(visitas ? (sucessos / visitas) * 100 : 0),
      taxaAgendamento: round2(atendimentos ? (total / atendimentos) * 100 : 0),
      origins: gOrigins,
    };
  }).filter((g) => g.total > 0 || g.atendimentos > 0 || g.visitas > 0 || g.sucessos > 0);

  const topByVolume = [...origins]
    .sort((a, b) => b.atendimentos - a.atendimentos || b.total - a.total)
    .slice(0, 5);
  const topByConversion = [...origins]
    .filter((o) => o.total >= 20 || o.visitas >= 10)
    .sort((a, b) => b.taxaSucesso - a.taxaSucesso || b.total - a.total)
    .slice(0, 5);

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
      // Sem SUCESSOS extra: mantém status da agenda
      if (!useExtra && item.status === "Sucesso") cur.sucessos += 1;
      m.set(origin, cur);
    }
  }
  // Com SUCESSOS: Finalizado em (mês) — não mistura com status da agenda
  if (useExtra) {
    for (const s of extra.sucessos || []) {
      const origemRaw = resolveOrigemRaw(s.id, s.origem, origemById);
      const parsed = parseOrigemRaw(origemRaw);
      const pk = s.dataFinalizado.slice(0, 7);
      for (const origin of parsed.origins) {
        if (!topNames.has(origin)) continue;
        if (!periodMap.has(pk)) periodMap.set(pk, new Map());
        const m = periodMap.get(pk)!;
        const cur = m.get(origin) || { total: 0, sucessos: 0 };
        cur.sucessos += 1;
        m.set(origin, cur);
      }
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
    uniqueLeads,
    attributedTotal,
    attributedLeads,
    groups,
    origins,
    topByVolume,
    topByConversion,
    periodSeriesTop,
  };
}
