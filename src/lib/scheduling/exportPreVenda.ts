import * as XLSX from "xlsx";
import { displaySdrName } from "./metrics";
import { isRecepcaoName } from "./normalize";
import type {
  AgendamentoItem,
  RealizadoItem,
  SucessoItem,
} from "./types";

export type PreVendaExportSources = {
  /** Nomes exibidos na tabela Desempenho Pré-Vendas. */
  sdrs: string[];
  atendimentos: RealizadoItem[];
  agendamentos: AgendamentoItem[];
  visitas: RealizadoItem[];
  sucessos: SucessoItem[];
  /** Base inteira, para status e visita do ID mesmo fora do filtro. */
  agenda: AgendamentoItem[];
  realizados: RealizadoItem[];
};

type Linha = {
  ID: string;
  Data: string;
  Atendente: string;
  "Teve visita": string;
  "Data da visita": string;
  Cliente: string;
  Status: string;
};

function brDate(iso: string | null | undefined): string {
  if (!iso || iso.length < 10) return "";
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

function counted(sdr: string, allowed: Set<string>): boolean {
  if (isRecepcaoName(sdr)) return false;
  return allowed.has(displaySdrName(sdr));
}

/** Uma linha por ID que entrou em atendimento, agendamento, visita, sucesso ou insucesso. */
export function buildPreVendaExportRows(sources: PreVendaExportSources): Linha[] {
  const allowed = new Set(sources.sdrs);
  const agendaById = new Map(sources.agenda.map((row) => [row.id, row]));
  const realizadoById = new Map(sources.realizados.map((row) => [row.id, row]));

  type Hit = {
    id: string;
    data: string;
    atendente: string;
    cliente: string;
    rank: number;
  };
  const hits = new Map<string, Hit>();

  const keep = (hit: Hit) => {
    const prev = hits.get(hit.id);
    if (!prev || hit.rank < prev.rank) hits.set(hit.id, hit);
  };

  for (const row of sources.atendimentos) {
    if (!counted(row.sdr, allowed)) continue;
    keep({
      id: row.id,
      data: row.dataAtendido,
      atendente: displaySdrName(row.sdr),
      cliente: row.cliente,
      rank: 1,
    });
  }
  for (const row of sources.agendamentos) {
    if (!counted(row.sdr, allowed)) continue;
    keep({
      id: row.id,
      data: row.dataAgendamento,
      atendente: displaySdrName(row.sdr),
      cliente: row.cliente,
      rank: 2,
    });
  }
  for (const row of sources.visitas) {
    if (!counted(row.sdr, allowed) || !row.dataVisita) continue;
    keep({
      id: row.id,
      data: row.dataVisita,
      atendente: displaySdrName(row.sdr),
      cliente: row.cliente,
      rank: 3,
    });
  }
  for (const row of sources.sucessos) {
    if (!counted(row.sdr, allowed)) continue;
    keep({
      id: row.id,
      data: row.dataFinalizado,
      atendente: displaySdrName(row.sdr),
      cliente: row.cliente,
      rank: 4,
    });
  }

  const sucessoIds = new Set(
    sources.sucessos.filter((row) => counted(row.sdr, allowed)).map((row) => row.id)
  );

  return [...hits.values()]
    .sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id))
    .map((hit) => {
      const agenda = agendaById.get(hit.id);
      const realizado = realizadoById.get(hit.id);
      const teveVisita = realizado ? Boolean(realizado.teveVisita) : Boolean(agenda?.teveVisita);
      const dataVisita = realizado?.dataVisita || "";
      const cliente = hit.cliente || realizado?.cliente || agenda?.cliente || "";
      const status = agenda?.status || (sucessoIds.has(hit.id) ? "Sucesso" : "");
      return {
        ID: hit.id,
        Data: brDate(hit.data),
        Atendente: hit.atendente,
        "Teve visita": teveVisita ? "Sim" : "Não",
        "Data da visita": teveVisita ? brDate(dataVisita) : "",
        Cliente: cliente,
        Status: status,
      };
    });
}

export function downloadPreVendaExport(sources: PreVendaExportSources, from?: string, to?: string) {
  const rows = buildPreVendaExportRows(sources);
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 34 },
    { wch: 14 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Pre-vendas");
  const inicio = from || "periodo";
  const fim = to || "atual";
  const fileName = `desempenho-pre-vendas_${inicio}_${fim}.xlsx`;
  const bytes = XLSX.write(book, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
