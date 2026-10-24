import { displaySdrName } from "../scheduling/metrics";
import type {
  AgendamentoItem,
  LeadCampanhaItem,
  RealizadoItem,
  SucessoItem,
} from "../scheduling/types";
import { phoneKey } from "./phoneMatch";

export type FormularioFilters = {
  from?: string;
  to?: string;
  formulario?: string;
};

export type CrossedFormLead = {
  id: string;
  atendente: string;
  agendado: boolean;
  vendedor: string;
  visita: boolean;
  dataVisita: string | null;
  sucesso: boolean;
  anuncio: string;
  /** O Criado em do formulário cai no filtro. */
  leadNoPeriodo: boolean;
};

export type UnmatchedFormLead = {
  data: string;
  nome: string;
  telefone: string;
  campanha: string;
};

export type FormularioScore = {
  formulario: string;
  leads: number;
  cruzados: number;
  agendados: number;
  visitas: number;
  sucessos: number;
};

export type FormularioReport = {
  total: number;
  cruzados: CrossedFormLead[];
  semCruzamento: UnmatchedFormLead[];
  agendados: number;
  visitas: number;
  sucessos: number;
  campanhas: FormularioScore[];
  destaque: FormularioScore | null;
};

type IdSnap = {
  id: string;
  sdr: string;
  agendado: boolean;
  dataAgendamento: string | null;
  vendedor: string;
  visita: boolean;
  dataVisita: string | null;
  sucesso: boolean;
  dataSucesso: string | null;
  dataAtendido: string | null;
};

function blankSnap(id: string): IdSnap {
  return {
    id,
    sdr: "",
    agendado: false,
    dataAgendamento: null,
    vendedor: "",
    visita: false,
    dataVisita: null,
    sucesso: false,
    dataSucesso: null,
    dataAtendido: null,
  };
}

function rememberPhone(index: Map<string, Set<string>>, key: string, id: string) {
  if (!key || !id) return;
  const set = index.get(key) || new Set<string>();
  set.add(id);
  index.set(key, set);
}

function score(snap: IdSnap): number {
  return (snap.sucesso ? 8 : 0) + (snap.visita ? 4 : 0) + (snap.agendado ? 2 : 0) + (snap.dataAtendido ? 1 : 0);
}

function rankDate(snap: IdSnap): string {
  return snap.dataSucesso || snap.dataVisita || snap.dataAgendamento || snap.dataAtendido || "";
}

function pickSnap(ids: Set<string>, byId: Map<string, IdSnap>): IdSnap | null {
  let best: IdSnap | null = null;
  for (const id of ids) {
    const snap = byId.get(id);
    if (!snap) continue;
    if (!best || score(snap) > score(best) || (score(snap) === score(best) && rankDate(snap) > rankDate(best))) {
      best = snap;
    }
  }
  return best;
}

function eventInRange(date: string | null, filters: FormularioFilters): boolean {
  if (!date) return false;
  if (filters.from && date < filters.from) return false;
  if (filters.to && date > filters.to) return false;
  return true;
}

function named(value: string, empty: string): string {
  const text = value.trim();
  if (!text || text === empty) return "—";
  return text;
}

/** Uma linha da planilha de formulário. Vários IDs no mesmo telefone ficam no de maior resultado. */
export function buildFormularioReport(
  leads: LeadCampanhaItem[],
  items: AgendamentoItem[],
  realizados: RealizadoItem[],
  sucessos: SucessoItem[],
  filters: FormularioFilters
): FormularioReport {
  const byId = new Map<string, IdSnap>();
  const phones = new Map<string, Set<string>>();
  const snapOf = (id: string) => {
    const prev = byId.get(id);
    if (prev) return prev;
    const created = blankSnap(id);
    byId.set(id, created);
    return created;
  };

  for (const row of realizados) {
    if (!row.id) continue;
    const snap = snapOf(row.id);
    if (row.sdr) snap.sdr = displaySdrName(row.sdr);
    snap.dataAtendido = row.dataAtendido || snap.dataAtendido;
    snap.visita = Boolean(row.teveVisita);
    snap.dataVisita = row.dataVisita;
    rememberPhone(phones, phoneKey(row.celular), row.id);
  }
  for (const item of items) {
    if (!item.id) continue;
    const snap = snapOf(item.id);
    if (item.dataAgendamento) {
      snap.agendado = true;
      snap.dataAgendamento = item.dataAgendamento;
    }
    if (item.vendedor && item.vendedor !== "(sem vendedor)") snap.vendedor = item.vendedor;
    if (!snap.sdr && item.sdr) snap.sdr = displaySdrName(item.sdr);
    rememberPhone(phones, phoneKey(item.celular), item.id);
  }
  for (const sucesso of sucessos) {
    if (!sucesso.id) continue;
    const snap = snapOf(sucesso.id);
    snap.sucesso = true;
    snap.dataSucesso = sucesso.dataFinalizado || null;
    if (!snap.vendedor && sucesso.vendedor && sucesso.vendedor !== "(sem vendedor)") {
      snap.vendedor = sucesso.vendedor;
    }
    if (!snap.sdr && sucesso.sdr) snap.sdr = displaySdrName(sucesso.sdr);
    rememberPhone(phones, phoneKey(sucesso.celular), sucesso.id);
  }

  const pool = leads.filter((lead) => !filters.formulario || lead.formulario === filters.formulario);

  const cruzados: CrossedFormLead[] = [];
  const semCruzamento: UnmatchedFormLead[] = [];
  const campanhas = new Map<string, FormularioScore>();
  let total = 0;
  const countedEvent = new Set<string>();
  const extraShown = new Set<string>();

  const scoreOf = (formulario: string) => {
    const prev = campanhas.get(formulario);
    if (prev) return prev;
    const created: FormularioScore = {
      formulario,
      leads: 0,
      cruzados: 0,
      agendados: 0,
      visitas: 0,
      sucessos: 0,
    };
    campanhas.set(formulario, created);
    return created;
  };

  for (const lead of pool) {
    const criadoAqui = eventInRange(lead.criadoEm, filters);
    const keys = lead.phoneKeys?.length ? lead.phoneKeys : lead.phoneKey ? [lead.phoneKey] : [];
    let snap: IdSnap | null = null;
    for (const key of keys) {
      const found = pickSnap(phones.get(key) || new Set(), byId);
      if (!found) continue;
      if (!snap || score(found) > score(snap) || (score(found) === score(snap) && rankDate(found) > rankDate(snap))) {
        snap = found;
      }
    }
    if (criadoAqui) {
      total += 1;
      const bucket = scoreOf(lead.formulario);
      bucket.leads += 1;
      if (!snap) {
        semCruzamento.push({
          data: lead.criadoEm,
          nome: lead.nome || "—",
          telefone: lead.telefone || "—",
          campanha: lead.formulario,
        });
        continue;
      }
      bucket.cruzados += 1;
    }
    if (!snap) continue;
    const agendado = eventInRange(snap.dataAgendamento, filters);
    const visita = Boolean(snap.visita && eventInRange(snap.dataVisita, filters));
    const sucesso = eventInRange(snap.dataSucesso, filters);
    if (!criadoAqui && !agendado && !visita && !sucesso) continue;
    if (!criadoAqui) {
      const extraKey = `${lead.formulario}|${snap.id}`;
      if (extraShown.has(extraKey)) continue;
      extraShown.add(extraKey);
    }
    const countEvent = (kind: string) => {
      const key = `${lead.formulario}|${snap!.id}|${kind}`;
      if (countedEvent.has(key)) return false;
      countedEvent.add(key);
      return true;
    };
    if (agendado && countEvent("agendado")) scoreOf(lead.formulario).agendados += 1;
    if (visita && countEvent("visita")) scoreOf(lead.formulario).visitas += 1;
    if (sucesso && countEvent("sucesso")) scoreOf(lead.formulario).sucessos += 1;
    cruzados.push({
      id: snap.id,
      atendente: named(snap.sdr, "(sem SDR)"),
      agendado,
      vendedor: named(snap.vendedor, "(sem vendedor)"),
      visita,
      dataVisita: visita ? snap.dataVisita : null,
      sucesso,
      anuncio: lead.formulario,
      leadNoPeriodo: criadoAqui,
    });
  }

  cruzados.sort((a, b) => {
    return (
      Number(b.sucesso) - Number(a.sucesso) ||
      Number(b.visita) - Number(a.visita) ||
      Number(b.agendado) - Number(a.agendado) ||
      a.anuncio.localeCompare(b.anuncio, "pt-BR") ||
      a.id.localeCompare(b.id, "pt-BR")
    );
  });
  semCruzamento.sort((a, b) => b.data.localeCompare(a.data) || a.nome.localeCompare(b.nome, "pt-BR"));

  const ranked = [...campanhas.values()].sort(compareCampanhas);
  const soma = (key: "agendados" | "visitas" | "sucessos") =>
    ranked.reduce((sum, row) => sum + row[key], 0);
  return {
    total,
    cruzados,
    semCruzamento,
    agendados: soma("agendados"),
    visitas: soma("visitas"),
    sucessos: soma("sucessos"),
    campanhas: ranked,
    destaque: ranked[0] || null,
  };
}

export function compareCampanhas(a: FormularioScore, b: FormularioScore): number {
  return (
    b.sucessos - a.sucessos ||
    b.visitas - a.visitas ||
    b.agendados - a.agendados ||
    b.cruzados - a.cruzados ||
    b.leads - a.leads ||
    a.formulario.localeCompare(b.formulario, "pt-BR")
  );
}

export function listFormularioOptions(leads: LeadCampanhaItem[]): string[] {
  return [...new Set(leads.map((lead) => lead.formulario).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

export function listFormularioMonths(leads: LeadCampanhaItem[]): string[] {
  const set = new Set<string>();
  for (const lead of leads) {
    if (lead.criadoEm.length >= 7) set.add(lead.criadoEm.slice(0, 7));
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}
