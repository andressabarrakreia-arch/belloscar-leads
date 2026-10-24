import type { SchedulingDataset, SchedulingImportMeta } from "./types";

export type ErroCategoria =
  | "insucesso-sem-motivo"
  | "insucesso-sem-agenda"
  | "agenda-sem-leads"
  | "agenda-sem-realizados"
  | "sucesso-sem-agenda"
  | "sucesso-sem-leads"
  | "sucesso-sem-realizados"
  | "realizado-sem-leads"
  | "visita-divergente"
  | "origem-vazia"
  | "tipo-vazio";

export type ErroCruzamento = {
  id: string;
  categoria: ErroCategoria;
  categoriaLabel: string;
  baseConsultada: string;
  detalhe: string;
  data: string;
  responsavel: string;
};

/** Está na planilha, falta que é o erro, ou ausência que não é o erro deste ID. */
export type PresencaPlanilha = "esta" | "nao" | "nao-erro";

export type ErroIdLinha = {
  id: string;
  leads: PresencaPlanilha;
  realizados: PresencaPlanilha;
  agenda: PresencaPlanilha;
  sucessos: PresencaPlanilha;
  insucessos: PresencaPlanilha;
  estaEm: string;
  faltaEm: string;
  observacao: string;
  categorias: ErroCategoria[];
  data: string;
  responsavel: string;
  cliente: string;
};

export type ErrosCruzamentoReport = {
  rows: ErroCruzamento[];
  /** Um ID por linha, com a presença em cada planilha. */
  linhas: ErroIdLinha[];
  /** IDs da última planilha de insucessos que ficaram fora da agenda. */
  insucessosForaDaAgendaTotal: number | null;
  /** Quantos desses IDs o log de importação ainda guarda. */
  insucessosForaDaAgendaAmostra: number;
  checagensLimpas: string[];
};

export const ERRO_CATEGORIAS: { id: ErroCategoria; label: string }[] = [
  { id: "insucesso-sem-motivo", label: "Insucesso sem motivo" },
  { id: "insucesso-sem-agenda", label: "Insucesso fora da agenda" },
  { id: "agenda-sem-leads", label: "Agenda sem Leads Geral" },
  { id: "agenda-sem-realizados", label: "Agenda sem Realizados" },
  { id: "sucesso-sem-agenda", label: "Sucesso fora da agenda" },
  { id: "sucesso-sem-leads", label: "Sucesso sem Leads Geral" },
  { id: "sucesso-sem-realizados", label: "Sucesso sem Realizados" },
  { id: "realizado-sem-leads", label: "Realizado sem Leads Geral" },
  { id: "visita-divergente", label: "Visita divergente" },
  { id: "origem-vazia", label: "Origem não informada" },
  { id: "tipo-vazio", label: "Tipo de proposta em branco" },
];

const LABEL = new Map(ERRO_CATEGORIAS.map((item) => [item.id, item.label]));

function labelOf(categoria: ErroCategoria): string {
  return LABEL.get(categoria) || categoria;
}

function latestImport(
  dataset: SchedulingDataset,
  kind: SchedulingImportMeta["kind"]
): SchedulingImportMeta | undefined {
  return (dataset.imports || []).find((item) => item.kind === kind);
}

function idsFromInsucessoNotes(meta: SchedulingImportMeta | undefined): {
  total: number | null;
  ids: string[];
} {
  if (!meta) return { total: null, ids: [] };
  let total: number | null = null;
  const ids: string[] = [];
  for (const note of meta.notes || []) {
    const count = note.match(/^(\d+)\s+IDs sem agendamento/i);
    if (count) total = Number(count[1]);
    const id = note.match(/\bID\s+(\d+)\b/i);
    if (id) ids.push(id[1]);
  }
  return { total, ids: [...new Set(ids)] };
}

function clienteDe(nome: string | undefined): string {
  const text = (nome || "").trim();
  return text ? ` Cliente: ${text}.` : "";
}

/**
 * Falhas de cruzamento na base publicada.
 * Lead ou atendimento que simplesmente não virou agendamento fica de fora:
 * esse volume pertence ao funil, e a lista abaixo é de cadastro quebrado.
 */
export function buildErrosCruzamento(dataset: SchedulingDataset): ErrosCruzamentoReport {
  const items = dataset.items || [];
  const leads = dataset.leadsAtendimentos || [];
  const realizados = dataset.realizados || [];
  const sucessos = dataset.sucessosEventos || [];

  const agenda = new Set(items.map((item) => item.id));
  const leadsIds = new Set(leads.map((item) => item.id));
  const realizadosIds = new Set(realizados.map((item) => item.id));
  const sucessoIds = new Set(sucessos.map((item) => item.id));
  const realizadoById = new Map(realizados.map((item) => [item.id, item]));

  const rows: ErroCruzamento[] = [];
  const push = (row: Omit<ErroCruzamento, "categoriaLabel"> & { categoria: ErroCategoria }) => {
    rows.push({ ...row, categoriaLabel: labelOf(row.categoria) });
  };

  const ondeMais = (id: string, exceto: string): string => {
    const partes: string[] = [];
    if (exceto !== "agenda" && agenda.has(id)) partes.push("Agenda");
    if (exceto !== "leads" && leadsIds.has(id)) partes.push("Leads Geral");
    if (exceto !== "realizados" && realizadosIds.has(id)) partes.push("Realizados");
    if (exceto !== "sucessos" && sucessoIds.has(id)) partes.push("Sucessos");
    return partes.length ? ` Também está em ${partes.join(", ")}.` : "";
  };

  for (const item of items) {
    if (item.status === "Insucesso" && !item.motivoInsucesso?.trim()) {
      push({
        id: item.id,
        categoria: "insucesso-sem-motivo",
        baseConsultada: "Agenda de agendamentos",
        detalhe: `Status Insucesso na agenda, motivo vazio. O motivo só entra quando o ID está na planilha de insucessos com texto.${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
    if (!leadsIds.has(item.id)) {
      push({
        id: item.id,
        categoria: "agenda-sem-leads",
        baseConsultada: "Agenda de agendamentos · ausente em Leads Geral",
        detalhe: `ID ${item.id} está na agenda (${item.status}) e não está em Leads Geral.${ondeMais(item.id, "agenda")}${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
    if (!realizadosIds.has(item.id)) {
      push({
        id: item.id,
        categoria: "agenda-sem-realizados",
        baseConsultada: "Agenda de agendamentos · ausente em Realizados",
        detalhe: `ID ${item.id} está na agenda (${item.status}) e não está em Realizados.${ondeMais(item.id, "agenda")}${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
    const realizado = realizadoById.get(item.id);
    if (realizado && Boolean(item.teveVisita) !== Boolean(realizado.teveVisita)) {
      push({
        id: item.id,
        categoria: "visita-divergente",
        baseConsultada: "Agenda de agendamentos × Realizados",
        detalhe: item.teveVisita
          ? `ID ${item.id}: a agenda marca visita e Realizados não marca.${clienteDe(item.cliente)}`
          : `ID ${item.id}: Realizados marca visita e a agenda não marca.${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
    if (!item.origem?.trim() || item.origem.trim() === "Não informado") {
      push({
        id: item.id,
        categoria: "origem-vazia",
        baseConsultada: "Agenda de agendamentos",
        detalhe: `ID ${item.id} está na agenda sem origem.${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
    if (!item.tipoProposta || item.tipoProposta === "não informado(celulas em branco)") {
      push({
        id: item.id,
        categoria: "tipo-vazio",
        baseConsultada: "Agenda de agendamentos",
        detalhe: `ID ${item.id} está na agenda sem tipo de proposta.${clienteDe(item.cliente)}`,
        data: item.dataAgendamento,
        responsavel: item.sdr,
      });
    }
  }

  for (const sucesso of sucessos) {
    if (!agenda.has(sucesso.id)) {
      push({
        id: sucesso.id,
        categoria: "sucesso-sem-agenda",
        baseConsultada: "Planilha de sucessos · ausente na agenda",
        detalhe: `ID ${sucesso.id} está em Sucessos e não está na agenda.${ondeMais(sucesso.id, "sucessos")}${clienteDe(sucesso.cliente)}`,
        data: sucesso.dataFinalizado,
        responsavel: sucesso.vendedor || sucesso.sdr,
      });
    }
    if (!leadsIds.has(sucesso.id)) {
      push({
        id: sucesso.id,
        categoria: "sucesso-sem-leads",
        baseConsultada: "Planilha de sucessos · ausente em Leads Geral",
        detalhe: `ID ${sucesso.id} está em Sucessos e não está em Leads Geral.${ondeMais(sucesso.id, "sucessos")}${clienteDe(sucesso.cliente)}`,
        data: sucesso.dataFinalizado,
        responsavel: sucesso.vendedor || sucesso.sdr,
      });
    }
    if (!realizadosIds.has(sucesso.id)) {
      push({
        id: sucesso.id,
        categoria: "sucesso-sem-realizados",
        baseConsultada: "Planilha de sucessos · ausente em Realizados",
        detalhe: `ID ${sucesso.id} está em Sucessos e não está em Realizados.${ondeMais(sucesso.id, "sucessos")}${clienteDe(sucesso.cliente)}`,
        data: sucesso.dataFinalizado,
        responsavel: sucesso.vendedor || sucesso.sdr,
      });
    }
  }

  for (const realizado of realizados) {
    if (leadsIds.has(realizado.id)) continue;
    push({
      id: realizado.id,
      categoria: "realizado-sem-leads",
      baseConsultada: "Realizados · ausente em Leads Geral",
      detalhe: `ID ${realizado.id} está em Realizados e não está em Leads Geral.${ondeMais(realizado.id, "realizados")}${clienteDe(realizado.cliente)}`,
      data: realizado.dataAtendido,
      responsavel: realizado.sdr,
    });
  }

  const insucessoLog = idsFromInsucessoNotes(latestImport(dataset, "insucessos"));
  const amostraFora = insucessoLog.ids.filter((id) => !agenda.has(id));
  for (const id of amostraFora) {
    const lead = leads.find((item) => item.id === id);
    const realizado = realizadoById.get(id);
    push({
      id,
      categoria: "insucesso-sem-agenda",
      baseConsultada: "Planilha de insucessos · ausente na agenda",
      detalhe: `ID ${id} entrou na planilha de insucessos e não está na agenda.${ondeMais(id, "agenda")}${clienteDe(realizado?.cliente)}`,
      data: realizado?.dataAtendido || lead?.data || "",
      responsavel: realizado?.sdr || lead?.sdr || "",
    });
  }

  const sucessoNaAgendaSemPlanilha = items.filter(
    (item) => item.status === "Sucesso" && !sucessoIds.has(item.id)
  ).length;
  const insucessoTambemSucesso = items.filter(
    (item) => item.status === "Insucesso" && sucessoIds.has(item.id)
  ).length;
  const dataInvalida = items.filter((item) => item.dataAgendamento === "1970-01-01").length;

  const checagensLimpas: string[] = [];
  if (sucessoNaAgendaSemPlanilha === 0) {
    checagensLimpas.push("Sucesso na agenda tem registro na planilha de sucessos");
  }
  if (insucessoTambemSucesso === 0) {
    checagensLimpas.push("Nenhum ID está ao mesmo tempo em insucesso e em sucessos");
  }
  if (dataInvalida === 0) {
    checagensLimpas.push("Nenhum agendamento ficou com data inválida");
  }

  const order = new Map(ERRO_CATEGORIAS.map((item, index) => [item.id, index]));
  rows.sort(
    (a, b) =>
      (order.get(a.categoria) ?? 0) - (order.get(b.categoria) ?? 0) ||
      a.data.localeCompare(b.data) ||
      a.id.localeCompare(b.id, "pt-BR")
  );

  const linhas = linhasPorId({
    rows,
    items,
    leads,
    realizados,
    sucessos,
    realizadoById,
  });

  return {
    rows,
    linhas,
    insucessosForaDaAgendaTotal: insucessoLog.total,
    insucessosForaDaAgendaAmostra: amostraFora.length,
    checagensLimpas,
  };
}

const PLANILHAS = [
  ["leads", "Leads Geral"],
  ["realizados", "Realizados"],
  ["agenda", "Agenda"],
  ["sucessos", "Sucessos"],
  ["insucessos", "Insucessos"],
] as const;

function celula(presente: boolean, faltaEhErro: boolean): PresencaPlanilha {
  if (presente) return "esta";
  return faltaEhErro ? "nao" : "nao-erro";
}

function linhasPorId(input: {
  rows: ErroCruzamento[];
  items: SchedulingDataset["items"];
  leads: NonNullable<SchedulingDataset["leadsAtendimentos"]>;
  realizados: NonNullable<SchedulingDataset["realizados"]>;
  sucessos: NonNullable<SchedulingDataset["sucessosEventos"]>;
  realizadoById: Map<string, NonNullable<SchedulingDataset["realizados"]>[number]>;
}): ErroIdLinha[] {
  const itemById = new Map(input.items.map((item) => [item.id, item]));
  const leadById = new Map(input.leads.map((item) => [item.id, item]));
  const sucessoById = new Map(input.sucessos.map((item) => [item.id, item]));
  const groups = new Map<string, ErroCruzamento[]>();
  for (const row of input.rows) {
    const list = groups.get(row.id) || [];
    list.push(row);
    groups.set(row.id, list);
  }

  const linhas: ErroIdLinha[] = [];
  for (const [id, group] of groups) {
    const categorias = [...new Set(group.map((row) => row.categoria))];
    const has = (categoria: ErroCategoria) => categorias.includes(categoria);
    const item = itemById.get(id);
    const realizado = input.realizadoById.get(id);
    const sucesso = sucessoById.get(id);
    const lead = leadById.get(id);
    const naPlanilhaInsucessos =
      has("insucesso-sem-agenda") ||
      Boolean(item?.status === "Insucesso" && item.motivoInsucesso?.trim());

    const presenca = {
      leads: celula(
        Boolean(lead),
        has("agenda-sem-leads") || has("sucesso-sem-leads") || has("realizado-sem-leads")
      ),
      realizados: celula(
        Boolean(realizado),
        has("agenda-sem-realizados") || has("sucesso-sem-realizados")
      ),
      agenda: celula(Boolean(item), has("sucesso-sem-agenda") || has("insucesso-sem-agenda")),
      sucessos: celula(Boolean(sucesso), false),
      insucessos: celula(naPlanilhaInsucessos, has("insucesso-sem-motivo")),
    };

    const estaEm = PLANILHAS.filter(([key]) => presenca[key] === "esta")
      .map(([, nome]) => nome)
      .join(", ");
    const faltaEm = PLANILHAS.filter(([key]) => presenca[key] === "nao")
      .map(([, nome]) => nome)
      .join(", ");
    const observacao = [
      has("insucesso-sem-motivo") ? "Insucesso na agenda sem motivo" : "",
      has("visita-divergente") ? "Visita diverge entre agenda e realizados" : "",
      has("origem-vazia") ? "Origem vazia na agenda" : "",
      has("tipo-vazio") ? "Tipo de proposta em branco" : "",
    ]
      .filter(Boolean)
      .join(" · ");

    linhas.push({
      id,
      ...presenca,
      estaEm: estaEm || "—",
      faltaEm: faltaEm || "—",
      observacao,
      categorias,
      data: item?.dataAgendamento || realizado?.dataAtendido || sucesso?.dataFinalizado || lead?.data || group[0]?.data || "",
      responsavel: item?.sdr || realizado?.sdr || sucesso?.vendedor || sucesso?.sdr || lead?.sdr || group[0]?.responsavel || "",
      cliente: item?.cliente || realizado?.cliente || sucesso?.cliente || "",
    });
  }

  linhas.sort(
    (a, b) =>
      b.faltaEm.split(",").filter((parte) => parte.trim() && parte !== "—").length -
        a.faltaEm.split(",").filter((parte) => parte.trim() && parte !== "—").length ||
      a.id.localeCompare(b.id, "pt-BR")
  );
  return linhas;
}
