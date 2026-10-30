import { phoneKey } from "../campanhas/phoneMatch";
import { linesToDeals } from "../negociacoes/deals";
import type { NegociacaoDeal, NegociacaoLine } from "../negociacoes/types";
import { nomeChave } from "../geo/clientesMapa";
import { displaySdrName } from "./metrics";
import type {
  AgendamentoItem,
  LeadAtendimentoItem,
  RealizadoItem,
  SucessoItem,
} from "./types";

export type SucessoListaRow = {
  id: string;
  dataInicio: string | null;
  responsavel: string;
  vendedor: string;
  proposta: string;
  origem: string;
  veiculoEntrada: string;
  veiculoSaida: string;
  dataSucesso: string;
  /** Dias corridos do início ao Finalizado em; null se não houver início. */
  dias: number | null;
  cliente: string;
  celular: string;
  negociacaoId: string | null;
};

function formatVeiculo(modelo: string, placa: string): string {
  const m = modelo.trim();
  const p = placa.trim();
  if (m && p) return `${m} (${p})`;
  return m || p || "";
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T12:00:00`);
  const b = Date.parse(`${toIso}T12:00:00`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

function resolveDataInicio(
  id: string,
  realizadosById: Map<string, RealizadoItem>,
  leadsById: Map<string, LeadAtendimentoItem>,
  agendaById: Map<string, AgendamentoItem>
): string | null {
  const realizado = realizadosById.get(id);
  if (realizado?.dataAtendido) return realizado.dataAtendido;
  const lead = leadsById.get(id);
  if (lead?.data && lead.data !== "1970-01-01") return lead.data;
  const agenda = agendaById.get(id);
  if (agenda?.dataAgendamento) return agenda.dataAgendamento;
  return null;
}

/** Telefone → nomes de cliente vistos na operação (agenda / realizados / sucessos). */
function buildPhoneToNames(
  items: AgendamentoItem[],
  realizados: RealizadoItem[],
  sucessos: SucessoItem[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const remember = (celular: string, cliente: string) => {
    const phone = phoneKey(celular);
    const nome = nomeChave(cliente);
    if (!phone || !nome) return;
    const set = map.get(phone) || new Set<string>();
    set.add(nome);
    map.set(phone, set);
  };
  for (const item of items) remember(item.celular, item.cliente);
  for (const row of realizados) remember(row.celular, row.cliente);
  for (const row of sucessos) remember(row.celular, row.cliente);
  return map;
}

function buildDealsByCliente(lines: NegociacaoLine[]): Map<string, NegociacaoDeal[]> {
  const map = new Map<string, NegociacaoDeal[]>();
  for (const deal of linesToDeals(lines)) {
    const key = nomeChave(deal.cliente);
    if (!key) continue;
    const list = map.get(key) || [];
    list.push(deal);
    map.set(key, list);
  }
  return map;
}

function pickDeal(
  candidates: NegociacaoDeal[],
  dataSucesso: string
): NegociacaoDeal | null {
  if (candidates.length === 0) return null;
  const scored = candidates.map((deal) => {
    const delta = Math.abs(daysBetween(deal.dataEntrada || dataSucesso, dataSucesso));
    const finalizada = /finaliz/i.test(deal.status) ? 0 : 1;
    return { deal, delta, finalizada };
  });
  scored.sort((a, b) => a.finalizada - b.finalizada || a.delta - b.delta);
  return scored[0]?.deal ?? null;
}

/**
 * Lista de sucessos do recorte, com veículos da loja cruzados pelo telefone:
 * telefone do sucesso → nomes na base de agendamentos → cliente nas negociações.
 * (A planilha da loja não traz telefone.)
 */
export function buildSucessosListaRows(
  sucessos: SucessoItem[],
  opts: {
    items: AgendamentoItem[];
    realizados: RealizadoItem[];
    leads: LeadAtendimentoItem[];
    negociacaoLines: NegociacaoLine[];
  }
): SucessoListaRow[] {
  const realizadosById = new Map(opts.realizados.map((r) => [r.id, r]));
  const leadsById = new Map(opts.leads.map((l) => [l.id, l]));
  const agendaById = new Map(opts.items.map((i) => [i.id, i]));
  const phoneNames = buildPhoneToNames(opts.items, opts.realizados, sucessos);
  const dealsByCliente = buildDealsByCliente(opts.negociacaoLines);

  return sucessos.map((s) => {
    const dataInicio = resolveDataInicio(s.id, realizadosById, leadsById, agendaById);
    const names = new Set<string>();
    const ownName = nomeChave(s.cliente);
    if (ownName) names.add(ownName);
    const phone = phoneKey(s.celular);
    for (const n of phoneNames.get(phone) || []) names.add(n);

    const candidates: NegociacaoDeal[] = [];
    const seen = new Set<string>();
    for (const name of names) {
      for (const deal of dealsByCliente.get(name) || []) {
        if (seen.has(deal.dealId)) continue;
        seen.add(deal.dealId);
        candidates.push(deal);
      }
    }
    const deal = pickDeal(candidates, s.dataFinalizado);
    const veiculoEntrada = deal
      ? formatVeiculo(deal.modeloEntrada, deal.placaEntrada)
      : "";
    const veiculoSaida = deal
      ? formatVeiculo(deal.modeloSaida, deal.placaSaida)
      : "";

    return {
      id: s.id,
      dataInicio,
      responsavel: displaySdrName(s.sdr),
      vendedor: s.vendedor || "(sem vendedor)",
      proposta: s.tipoProposta,
      origem: s.origem || "Não informado",
      veiculoEntrada,
      veiculoSaida,
      dataSucesso: s.dataFinalizado,
      dias: dataInicio ? daysBetween(dataInicio, s.dataFinalizado) : null,
      cliente: s.cliente || "",
      celular: s.celular || "",
      negociacaoId: deal?.negociacaoId ?? null,
    };
  });
}
