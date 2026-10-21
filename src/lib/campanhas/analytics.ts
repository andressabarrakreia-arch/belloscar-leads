import { displaySdrName, round2 } from "../scheduling/metrics";
import type { SchedulingDataset } from "../scheduling/types";
import { META_CANAIS, metaTokensInOrigem, type MetaCanal } from "./metaOrigem";

/**
 * Um ID do LEADS GERAL cuja Origem é Facebook/Instagram.
 * Datas vêm de planilhas diferentes e não se misturam:
 * atendimento = REALIZADOS · Atendido em
 * visita = REALIZADOS · Visita em (Visita = Sim)
 * agendamento = AGENDAMENTOS · Agendado em (vendedor = Agendado para)
 * sucesso = SUCESSOS · Finalizado em
 */
export type CampanhaRecord = {
  id: string;
  origem: string;
  tokens: MetaCanal[];
  sdr: string;
  dataAtendido: string | null;
  teveVisita: boolean;
  dataVisita: string | null;
  dataAgendamento: string | null;
  vendedor: string | null;
  dataSucesso: string | null;
};

export type CampanhaFilters = {
  from?: string;
  to?: string;
  sdr?: string;
  canal?: MetaCanal | "";
};

export type CampanhaKpis = {
  atendimentos: number;
  visitas: number;
  agendamentos: number;
  sucessos: number;
  taxaVisita: number;
  taxaAgendamento: number;
  taxaSucesso: number;
  taxaVisitaParaSucesso: number;
};

export type CampanhaSlice = {
  atendimentos: CampanhaRecord[];
  visitas: CampanhaRecord[];
  agendamentos: CampanhaRecord[];
  sucessos: CampanhaRecord[];
  kpis: CampanhaKpis;
};

function inRange(date: string | null, filters: CampanhaFilters): boolean {
  if (!date) return false;
  if (filters.from && date < filters.from) return false;
  if (filters.to && date > filters.to) return false;
  return true;
}

function passesIdentity(row: CampanhaRecord, filters: CampanhaFilters): boolean {
  if (filters.canal && !row.tokens.includes(filters.canal)) return false;
  if (filters.sdr && row.sdr !== filters.sdr) return false;
  return true;
}

/** IDs Meta do LEADS GERAL, enriquecidos por ID. Quem não é Meta não entra. */
export function indexCampanhas(dataset: SchedulingDataset): CampanhaRecord[] {
  const byId = new Map<string, CampanhaRecord>();

  for (const lead of dataset.leadsAtendimentos || []) {
    const tokens = metaTokensInOrigem(lead.origem);
    if (!tokens.length || !lead.id) continue;
    byId.set(lead.id, {
      id: lead.id,
      origem: lead.origem,
      tokens,
      sdr: "(sem SDR)",
      dataAtendido: null,
      teveVisita: false,
      dataVisita: null,
      dataAgendamento: null,
      vendedor: null,
      dataSucesso: null,
    });
  }

  for (const row of dataset.realizados || []) {
    const rec = byId.get(row.id);
    if (!rec) continue;
    rec.sdr = displaySdrName(row.sdr || rec.sdr);
    rec.dataAtendido = row.dataAtendido || null;
    rec.teveVisita = Boolean(row.teveVisita);
    rec.dataVisita = row.dataVisita;
  }

  for (const item of dataset.items) {
    const rec = byId.get(item.id);
    if (!rec) continue;
    rec.dataAgendamento = item.dataAgendamento || null;
    if (item.vendedor && item.vendedor !== "(sem vendedor)") rec.vendedor = item.vendedor;
    if (rec.sdr === "(sem SDR)" && item.sdr) rec.sdr = displaySdrName(item.sdr);
  }

  for (const sucesso of dataset.sucessosEventos || []) {
    const rec = byId.get(sucesso.id);
    if (!rec) continue;
    rec.dataSucesso = sucesso.dataFinalizado || null;
    if (!rec.vendedor && sucesso.vendedor && sucesso.vendedor !== "(sem vendedor)") {
      rec.vendedor = sucesso.vendedor;
    }
    if (rec.sdr === "(sem SDR)" && sucesso.sdr) rec.sdr = displaySdrName(sucesso.sdr);
  }

  return [...byId.values()];
}

export function kpisOf(
  atendimentos: number,
  visitas: number,
  agendamentos: number,
  sucessos: number
): CampanhaKpis {
  return {
    atendimentos,
    visitas,
    agendamentos,
    sucessos,
    taxaVisita: round2(atendimentos ? (visitas / atendimentos) * 100 : 0),
    taxaAgendamento: round2(atendimentos ? (agendamentos / atendimentos) * 100 : 0),
    taxaSucesso: round2(atendimentos ? (sucessos / atendimentos) * 100 : 0),
    taxaVisitaParaSucesso: round2(visitas ? (sucessos / visitas) * 100 : 0),
  };
}

/** Cada métrica usa a própria data. O filtro de SDR/canal vale para as quatro. */
export function sliceCampanhas(
  rows: CampanhaRecord[],
  filters: CampanhaFilters
): CampanhaSlice {
  const base = rows.filter((row) => passesIdentity(row, filters));
  const atendimentos = base.filter((row) => inRange(row.dataAtendido, filters));
  const visitas = base.filter((row) => row.teveVisita && inRange(row.dataVisita, filters));
  const agendamentos = base.filter((row) => inRange(row.dataAgendamento, filters));
  const sucessos = base.filter((row) => inRange(row.dataSucesso, filters));
  return {
    atendimentos,
    visitas,
    agendamentos,
    sucessos,
    kpis: kpisOf(atendimentos.length, visitas.length, agendamentos.length, sucessos.length),
  };
}

export type SdrRow = CampanhaKpis & { sdr: string };
export type CanalRow = CampanhaKpis & { canal: MetaCanal };
export type VendedorRow = {
  vendedor: string;
  agendamentos: number;
  sucessos: number;
  taxaSucesso: number;
};
export type MonthRow = {
  month: string;
  atendimentos: number;
  visitas: number;
  agendamentos: number;
  sucessos: number;
};

function countBy<T extends string>(ids: CampanhaRecord[], key: (row: CampanhaRecord) => T): Map<T, number> {
  const map = new Map<T, number>();
  for (const row of ids) {
    const k = key(row);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

export function buildSdrRows(slice: CampanhaSlice): SdrRow[] {
  const names = new Set<string>([
    ...slice.atendimentos.map((r) => r.sdr),
    ...slice.visitas.map((r) => r.sdr),
    ...slice.agendamentos.map((r) => r.sdr),
    ...slice.sucessos.map((r) => r.sdr),
  ]);
  const atend = countBy(slice.atendimentos, (r) => r.sdr);
  const vis = countBy(slice.visitas, (r) => r.sdr);
  const ag = countBy(slice.agendamentos, (r) => r.sdr);
  const su = countBy(slice.sucessos, (r) => r.sdr);
  return [...names]
    .map((sdr) => ({
      sdr,
      ...kpisOf(atend.get(sdr) || 0, vis.get(sdr) || 0, ag.get(sdr) || 0, su.get(sdr) || 0),
    }))
    .sort((a, b) => b.atendimentos - a.atendimentos || a.sdr.localeCompare(b.sdr, "pt-BR"));
}

/** Um ID com dois tokens entra nos dois canais. O total do KPI não duplica o ID. */
export function buildCanalRows(slice: CampanhaSlice): CanalRow[] {
  return META_CANAIS.map((canal) => {
    const atendimentos = slice.atendimentos.filter((r) => r.tokens.includes(canal)).length;
    const visitas = slice.visitas.filter((r) => r.tokens.includes(canal)).length;
    const agendamentos = slice.agendamentos.filter((r) => r.tokens.includes(canal)).length;
    const sucessos = slice.sucessos.filter((r) => r.tokens.includes(canal)).length;
    return { canal, ...kpisOf(atendimentos, visitas, agendamentos, sucessos) };
  }).filter((row) => row.atendimentos || row.visitas || row.agendamentos || row.sucessos);
}

export function buildVendedorRows(slice: CampanhaSlice): VendedorRow[] {
  const names = new Set<string>();
  const ag = new Map<string, number>();
  const su = new Map<string, number>();
  for (const row of slice.agendamentos) {
    if (!row.vendedor) continue;
    names.add(row.vendedor);
    ag.set(row.vendedor, (ag.get(row.vendedor) || 0) + 1);
  }
  for (const row of slice.sucessos) {
    if (!row.vendedor) continue;
    names.add(row.vendedor);
    su.set(row.vendedor, (su.get(row.vendedor) || 0) + 1);
  }
  return [...names]
    .map((vendedor) => {
      const agendamentos = ag.get(vendedor) || 0;
      const sucessos = su.get(vendedor) || 0;
      return {
        vendedor,
        agendamentos,
        sucessos,
        taxaSucesso: round2(agendamentos ? (sucessos / agendamentos) * 100 : 0),
      };
    })
    .sort((a, b) => b.agendamentos - a.agendamentos || a.vendedor.localeCompare(b.vendedor, "pt-BR"));
}

export function buildMonthRows(slice: CampanhaSlice): MonthRow[] {
  const months = new Set<string>();
  const bucket = (rows: CampanhaRecord[], pick: (r: CampanhaRecord) => string | null) => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const date = pick(row);
      if (!date || date.length < 7) continue;
      const month = date.slice(0, 7);
      months.add(month);
      map.set(month, (map.get(month) || 0) + 1);
    }
    return map;
  };
  const atend = bucket(slice.atendimentos, (r) => r.dataAtendido);
  const vis = bucket(slice.visitas, (r) => r.dataVisita);
  const ag = bucket(slice.agendamentos, (r) => r.dataAgendamento);
  const su = bucket(slice.sucessos, (r) => r.dataSucesso);
  return [...months].sort().map((month) => ({
    month,
    atendimentos: atend.get(month) || 0,
    visitas: vis.get(month) || 0,
    agendamentos: ag.get(month) || 0,
    sucessos: su.get(month) || 0,
  }));
}

export function listSdrOptions(rows: CampanhaRecord[]): string[] {
  return [...new Set(rows.map((r) => r.sdr).filter((s) => s && s !== "(sem SDR)"))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}
