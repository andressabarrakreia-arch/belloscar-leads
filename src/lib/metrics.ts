import { formatPeriodLabel } from "./dates";
import type { AnalyticsFilters, Kpis, Lead } from "./types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcMetrics(rows: Lead[]): Kpis {
  const leads = rows.length;
  const visitas = rows.filter((r) => r.hasVisit).length;
  const sucessos = rows.filter((r) => r.isSuccess).length;
  return {
    leads,
    visitas,
    sucessos,
    taxaVisita: round2(leads ? (visitas / leads) * 100 : 0),
    taxaSucesso: round2(leads ? (sucessos / leads) * 100 : 0),
    taxaVisitaParaSucesso: round2(visitas ? (sucessos / visitas) * 100 : 0),
  };
}

export function filterLeads(leads: Lead[], filters: AnalyticsFilters): Lead[] {
  return leads.filter((l) => {
    if (filters.origem && l.origem !== filters.origem) return false;
    if (filters.responsavel && l.responsavel !== filters.responsavel) return false;
    if (filters.periodKeys?.length && !filters.periodKeys.includes(l.periodKey)) return false;
    if (filters.monthKeys?.length && !filters.monthKeys.includes(l.monthKey)) return false;
    if (filters.from) {
      if (new Date(l.createdAtLead) < new Date(filters.from)) return false;
    }
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      if (new Date(l.createdAtLead) > end) return false;
    }
    return true;
  });
}

function groupBy(leads: Lead[], keyFn: (l: Lead) => string) {
  const map = new Map<string, Lead[]>();
  for (const l of leads) {
    const k = keyFn(l);
    const list = map.get(k) || [];
    list.push(l);
    map.set(k, list);
  }
  return map;
}

export function distribution(leads: Lead[], field: "status" | "tipoProposta" | "origem") {
  const counts = new Map<string, number>();
  for (const r of leads) {
    const key = r[field] || "Não informado";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getFilterOptions(leads: Lead[]) {
  const origens = [...new Set(leads.map((l) => l.origem))].sort();
  const responsaveis = [...new Set(leads.map((l) => l.responsavel))].sort();
  const periodKeys = [...new Set(leads.map((l) => l.periodKey))].sort();
  const months = [...new Set(leads.map((l) => l.monthKey))].sort();
  return {
    origens,
    responsaveis,
    periods: periodKeys.map((key) => ({ key, label: formatPeriodLabel(key) })),
    months,
  };
}

export function buildSummary(leads: Lead[]) {
  const kpis = calcMetrics(leads);
  const byOrigin = [...groupBy(leads, (r) => r.origem).entries()]
    .map(([canal, list]) => ({ canal, ...calcMetrics(list) }))
    .sort((a, b) => b.leads - a.leads);

  const sucessoByProposal = distribution(
    leads.filter((r) => r.isSuccess),
    "tipoProposta"
  );

  const canais = [...new Set(leads.map((r) => r.origem))].sort();
  const tipos = [...new Set(leads.map((r) => r.tipoProposta))].sort();
  const propostaByOrigin = {
    canais,
    datasets: tipos.map((tipo) => ({
      label: tipo,
      data: canais.map(
        (canal) => leads.filter((r) => r.origem === canal && r.tipoProposta === tipo).length
      ),
    })),
  };

  const byMonth = [...groupBy(leads, (r) => r.monthKey).entries()]
    .map(([month, list]) => ({ month, ...calcMetrics(list) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const byPeriod = [...groupBy(leads, (r) => r.periodKey).entries()]
    .map(([periodKey, list]) => ({
      periodKey,
      label: formatPeriodLabel(periodKey),
      ...calcMetrics(list),
    }))
    .sort((a, b) => a.periodKey.localeCompare(b.periodKey));

  return {
    kpis,
    byOrigin,
    sucessoByProposal,
    propostaByOrigin,
    byMonth,
    byPeriod,
    statusDistribution: distribution(leads, "status"),
  };
}

export function buildAttendantStats(leads: Lead[]) {
  const attendants = [...groupBy(leads, (r) => r.responsavel).entries()]
    .map(([responsavel, list]) => ({ responsavel, ...calcMetrics(list) }))
    .sort((a, b) => b.leads - a.leads);

  const origens = [...new Set(leads.map((r) => r.origem))].sort();
  const matrix = attendants.map((a) => {
    const subset = leads.filter((r) => r.responsavel === a.responsavel);
    const byOrigem: Record<string, Kpis> = {};
    for (const origem of origens) {
      byOrigem[origem] = calcMetrics(subset.filter((r) => r.origem === origem));
    }
    return { responsavel: a.responsavel, totals: a, byOrigem };
  });

  return { attendants, origens, matrix };
}

const DAY_MS = 86400000;

const FUNNEL_ORDER = [
  "Pendente",
  "Em atendimento",
  "Recontato",
  "Agendado",
  "Visita",
  "Sucesso",
  "Insucesso",
  "Descartado",
];

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? round2((sorted[mid - 1]! + sorted[mid]!) / 2)
    : round2(sorted[mid]!);
}

/** Insights extras para o Dashboard de Campanhas */
export function buildDashboardInsights(leads: Lead[]) {
  const summary = buildSummary(leads);
  const attendants = buildAttendantStats(leads);

  const statusMap = new Map(summary.statusDistribution.map((s) => [s.label, s.value]));
  const funnel = FUNNEL_ORDER.map((label) => ({
    label,
    value: statusMap.get(label) || 0,
  })).filter((s) => s.value > 0);

  // status fora da ordem padrão
  for (const s of summary.statusDistribution) {
    if (!FUNNEL_ORDER.includes(s.label)) funnel.push(s);
  }

  const periods = summary.byPeriod;
  const prev = periods.length >= 2 ? periods[periods.length - 2]! : null;
  const curr = periods.length >= 1 ? periods[periods.length - 1]! : null;
  const periodDelta =
    prev && curr
      ? {
          prevLabel: prev.label,
          currLabel: curr.label,
          leads: curr.leads - prev.leads,
          visitas: curr.visitas - prev.visitas,
          sucessos: curr.sucessos - prev.sucessos,
          taxaVisita: round2(curr.taxaVisita - prev.taxaVisita),
          taxaSucesso: round2(curr.taxaSucesso - prev.taxaSucesso),
          prev,
          curr,
        }
      : null;

  const withVisitTiming = leads
    .filter((l) => l.hasVisit && l.dataVisita)
    .map((l) => {
      const days =
        (new Date(l.dataVisita!).getTime() - new Date(l.createdAtLead).getTime()) / DAY_MS;
      return days;
    })
    .filter((d) => Number.isFinite(d) && d >= 0 && d < 365);

  const visitTiming = {
    count: withVisitTiming.length,
    avgDays: withVisitTiming.length
      ? round2(withVisitTiming.reduce((a, b) => a + b, 0) / withVisitTiming.length)
      : 0,
    medianDays: median(withVisitTiming),
  };

  const minLeadsForRate = 10;
  const eligibleOrigins = summary.byOrigin.filter((o) => o.leads >= minLeadsForRate);
  const bestVisitRate = [...eligibleOrigins].sort((a, b) => b.taxaVisita - a.taxaVisita)[0] || null;
  const bestSuccessRate =
    [...eligibleOrigins].sort((a, b) => b.taxaSucesso - a.taxaSucesso)[0] || null;
  const bestVisitToSuccess =
    [...eligibleOrigins]
      .filter((o) => o.visitas >= 3)
      .sort((a, b) => b.taxaVisitaParaSucesso - a.taxaVisitaParaSucesso)[0] || null;

  const propostaAll = distribution(leads, "tipoProposta");

  const agendadosAbertos = leads.filter(
    (l) =>
      (l.status || "").trim().toLowerCase() === "agendado" && !l.hasVisit && !l.isSuccess
  ).length;

  const emAtendimento = leads.filter((l) => {
    const s = (l.status || "").trim().toLowerCase();
    return s === "em atendimento" || s === "pendente" || s === "recontato";
  }).length;

  const topAttendantsByLeads = attendants.attendants.slice(0, 5);
  const topAttendantsBySuccess = [...attendants.attendants]
    .filter((a) => a.leads >= 5)
    .sort((a, b) => b.taxaSucesso - a.taxaSucesso || b.sucessos - a.sucessos)
    .slice(0, 5);

  const byOriginShare = summary.byOrigin.map((o) => ({
    ...o,
    shareLeads: summary.kpis.leads
      ? round2((o.leads / summary.kpis.leads) * 100)
      : 0,
  }));

  return {
    funnel,
    periodDelta,
    visitTiming,
    bestVisitRate,
    bestSuccessRate,
    bestVisitToSuccess,
    propostaAll,
    agendadosAbertos,
    emAtendimento,
    topAttendantsByLeads,
    topAttendantsBySuccess,
    byOriginShare,
    byPeriod: periods,
  };
}

export function comparePeriods(leads: Lead[], periodA: string, periodB: string) {
  const aRows = leads.filter((l) => l.periodKey === periodA);
  const bRows = leads.filter((l) => l.periodKey === periodB);
  const a = buildSummary(aRows);
  const b = buildSummary(bRows);
  const delta = {
    leads: b.kpis.leads - a.kpis.leads,
    visitas: b.kpis.visitas - a.kpis.visitas,
    sucessos: b.kpis.sucessos - a.kpis.sucessos,
    taxaVisita: round2(b.kpis.taxaVisita - a.kpis.taxaVisita),
    taxaSucesso: round2(b.kpis.taxaSucesso - a.kpis.taxaSucesso),
    taxaVisitaParaSucesso: round2(b.kpis.taxaVisitaParaSucesso - a.kpis.taxaVisitaParaSucesso),
  };

  const origins = [
    ...new Set([...a.byOrigin.map((o) => o.canal), ...b.byOrigin.map((o) => o.canal)]),
  ];
  const byOrigin = origins.map((canal) => {
    const oa = a.byOrigin.find((o) => o.canal === canal);
    const ob = b.byOrigin.find((o) => o.canal === canal);
    return {
      canal,
      periodA: oa || { leads: 0, visitas: 0, sucessos: 0, taxaVisita: 0, taxaSucesso: 0 },
      periodB: ob || { leads: 0, visitas: 0, sucessos: 0, taxaVisita: 0, taxaSucesso: 0 },
      deltaLeads: (ob?.leads || 0) - (oa?.leads || 0),
      deltaTaxaSucesso: round2((ob?.taxaSucesso || 0) - (oa?.taxaSucesso || 0)),
    };
  });

  return {
    periodA: { key: periodA, label: formatPeriodLabel(periodA), ...a },
    periodB: { key: periodB, label: formatPeriodLabel(periodB), ...b },
    delta,
    byOrigin,
  };
}
