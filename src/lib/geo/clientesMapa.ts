import { phoneKey } from "../campanhas/phoneMatch";
import type { NegociacaoLine } from "../negociacoes/types";
import type { SchedulingDataset } from "../scheduling/types";
import { DDD_POR_CODIGO, REGIAO_POR_UF } from "./ddd";

export type MapaOrigem = { nome: string; qtd: number };

export type MapaPonto = {
  ddd: string;
  uf: string;
  cidade: string;
  lat: number;
  lon: number;
  clientes: number;
  agendamentos: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  origens: MapaOrigem[];
  vendedores: MapaOrigem[];
};

export type MapaUf = { uf: string; clientes: number; agendamentos: number; visitas: number; sucessos: number };

export type MapaClientes = {
  pontos: MapaPonto[];
  ufs: MapaUf[];
  clientes: number;
  semTelefone: number;
  semDdd: number;
  semVeiculo: number;
};

/** Recorte do mapa. Vazio em from/to significa o período inteiro importado. */
export type FiltroMapa = {
  from: string;
  to: string;
  regiao: string;
  uf: string;
  origem: string;
  canal: string;
  situacao: string;
  proposta: string;
  tipoVeiculo: string;
  marca: string;
  vendedor: string;
};

export const FILTRO_MAPA_INICIAL: FiltroMapa = {
  from: "",
  to: "",
  regiao: "all",
  uf: "all",
  origem: "all",
  canal: "all",
  situacao: "all",
  proposta: "all",
  tipoVeiculo: "all",
  marca: "all",
  vendedor: "all",
};

export type OpcoesMapa = {
  inicio: string;
  fim: string;
  origens: string[];
  canais: string[];
  propostas: string[];
  vendedores: string[];
  tiposVeiculo: string[];
  marcas: string[];
};

export type IndiceVeiculo = Map<string, { tipos: Set<string>; marcas: Set<string> }>;

export function nomeChave(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Negociação não tem telefone. O tipo e a marca acompanham o nome do cliente. */
export function indiceVeiculos(lines: Pick<NegociacaoLine, "cliente" | "tipoVeiculo" | "marca">[]): IndiceVeiculo {
  const map: IndiceVeiculo = new Map();
  for (const line of lines) {
    const chave = nomeChave(line.cliente);
    if (!chave) continue;
    const atual = map.get(chave) || { tipos: new Set<string>(), marcas: new Set<string>() };
    const tipo = line.tipoVeiculo.trim();
    const marca = line.marca.trim();
    if (tipo) atual.tipos.add(tipo);
    if (marca) atual.marcas.add(marca);
    map.set(chave, atual);
  }
  return map;
}

type Balde = {
  phones: Set<string>;
  agendamentos: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  origens: Map<string, number>;
  vendedores: Map<string, number>;
};

function balde(): Balde {
  return {
    phones: new Set(),
    agendamentos: 0,
    visitas: 0,
    sucessos: 0,
    insucessos: 0,
    origens: new Map(),
    vendedores: new Map(),
  };
}

function soma(map: Map<string, number>, nome: string) {
  const texto = nome.trim();
  if (!texto || texto === "Não informado") return;
  map.set(texto, (map.get(texto) || 0) + 1);
}

function top(map: Map<string, number>): MapaOrigem[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, 3)
    .map(([nome, qtd]) => ({ nome, qtd }));
}

function noPeriodo(data: string, filtro: FiltroMapa): boolean {
  if (!filtro.from && !filtro.to) return true;
  if (!data) return false;
  if (filtro.from && data < filtro.from) return false;
  if (filtro.to && data > filtro.to) return false;
  return true;
}

function veiculoCombina(nome: string, filtro: FiltroMapa, veiculos: IndiceVeiculo): boolean {
  if (filtro.tipoVeiculo === "all" && filtro.marca === "all") return true;
  const info = veiculos.get(nomeChave(nome));
  if (!info) return false;
  if (filtro.tipoVeiculo !== "all" && !info.tipos.has(filtro.tipoVeiculo)) return false;
  if (filtro.marca !== "all" && !info.marcas.has(filtro.marca)) return false;
  return true;
}

function geoCombina(uf: string, filtro: FiltroMapa): boolean {
  if (filtro.uf !== "all" && uf !== filtro.uf) return false;
  if (filtro.regiao !== "all" && REGIAO_POR_UF[uf] !== filtro.regiao) return false;
  return true;
}

function lista(valores: Set<string>): string[] {
  return [...valores].filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function guardaData(atual: { inicio: string; fim: string }, data: string) {
  if (data.length < 10 || data.startsWith("1970")) return;
  if (!atual.inicio || data < atual.inicio) atual.inicio = data;
  if (!atual.fim || data > atual.fim) atual.fim = data;
}

/** Valores que existem nas planilhas, para os seletores do mapa. */
export function opcoesMapa(dataset: SchedulingDataset | null, lines: NegociacaoLine[]): OpcoesMapa {
  const origens = new Set<string>();
  const canais = new Set<string>();
  const propostas = new Set<string>();
  const vendedores = new Set<string>();
  const tipos = new Set<string>();
  const marcas = new Set<string>();
  const datas = { inicio: "", fim: "" };
  if (dataset) {
    for (const item of dataset.items) {
      origens.add(item.origem);
      canais.add(item.canal);
      propostas.add(item.tipoProposta);
      vendedores.add(item.vendedor);
      guardaData(datas, item.dataAgendamento);
    }
    for (const row of dataset.realizados || []) {
      origens.add(row.origem);
      propostas.add(row.tipoProposta);
      guardaData(datas, row.dataAtendido);
    }
    for (const row of dataset.sucessosEventos || []) {
      origens.add(row.origem);
      propostas.add(row.tipoProposta);
      vendedores.add(row.vendedor);
      guardaData(datas, row.dataFinalizado);
    }
    for (const row of dataset.leadsCampanha || []) guardaData(datas, row.criadoEm);
  }
  for (const line of lines) {
    if (line.tipoVeiculo.trim()) tipos.add(line.tipoVeiculo.trim());
    if (line.marca.trim()) marcas.add(line.marca.trim());
    guardaData(datas, line.dataEntrada);
  }
  return {
    inicio: datas.inicio,
    fim: datas.fim,
    origens: lista(origens),
    canais: lista(canais),
    propostas: lista(propostas),
    vendedores: lista(vendedores),
    tiposVeiculo: lista(tipos),
    marcas: lista(marcas),
  };
}

/** Clientes únicos pelo telefone, desenhados no DDD. O padrão é o período inteiro. */
export function buildMapaClientes(
  dataset: SchedulingDataset,
  filtro: FiltroMapa = FILTRO_MAPA_INICIAL,
  veiculos: IndiceVeiculo = new Map()
): MapaClientes {
  const grupos = new Map<string, Balde>();
  let semTelefone = 0;
  let semDdd = 0;
  let semVeiculo = 0;
  const pedeVeiculo = filtro.tipoVeiculo !== "all" || filtro.marca !== "all";
  const bloqueiaRealizados =
    filtro.canal !== "all" ||
    filtro.vendedor !== "all" ||
    filtro.situacao === "Agendado" ||
    filtro.situacao === "Insucesso" ||
    filtro.situacao === "Sucesso";
  const bloqueiaSucessos =
    filtro.canal !== "all" ||
    filtro.situacao === "Agendado" ||
    filtro.situacao === "Insucesso" ||
    filtro.situacao === "Visita";

  const grupoDe = (raw: string): Balde | null => {
    const key = phoneKey(raw);
    if (!key) return null;
    const ddd = key.slice(0, 2);
    const info = DDD_POR_CODIGO.get(ddd);
    if (!info) {
      semDdd += 1;
      return null;
    }
    if (!geoCombina(info.uf, filtro)) return null;
    const atual = grupos.get(ddd) || balde();
    grupos.set(ddd, atual);
    atual.phones.add(key);
    return atual;
  };

  const aceitaNome = (nome: string): boolean => {
    if (veiculoCombina(nome, filtro, veiculos)) return true;
    if (pedeVeiculo) semVeiculo += 1;
    return false;
  };

  for (const item of dataset.items) {
    if (!noPeriodo(item.dataAgendamento, filtro)) continue;
    if (filtro.canal !== "all" && item.canal !== filtro.canal) continue;
    if (filtro.situacao !== "all" && item.status !== filtro.situacao) continue;
    if (filtro.proposta !== "all" && item.tipoProposta !== filtro.proposta) continue;
    if (filtro.origem !== "all" && item.origem !== filtro.origem) continue;
    if (filtro.vendedor !== "all" && item.vendedor !== filtro.vendedor) continue;
    if (!aceitaNome(item.cliente)) continue;
    const grupo = grupoDe(item.celular);
    if (!grupo) {
      if (!phoneKey(item.celular)) semTelefone += 1;
      continue;
    }
    grupo.agendamentos += 1;
    if (item.status === "Insucesso") grupo.insucessos += 1;
    soma(grupo.origens, item.origem);
    soma(grupo.vendedores, item.vendedor);
  }

  if (!bloqueiaRealizados) {
    for (const row of dataset.realizados || []) {
      if (!noPeriodo(row.dataAtendido, filtro)) continue;
      if (filtro.situacao === "Visita" && !row.teveVisita) continue;
      if (filtro.proposta !== "all" && row.tipoProposta !== filtro.proposta) continue;
      if (filtro.origem !== "all" && row.origem !== filtro.origem) continue;
      if (!aceitaNome(row.cliente)) continue;
      const grupo = grupoDe(row.celular);
      if (!grupo) continue;
      if (row.teveVisita) grupo.visitas += 1;
      soma(grupo.origens, row.origem);
    }
  }

  if (!bloqueiaSucessos) {
    for (const row of dataset.sucessosEventos || []) {
      if (!noPeriodo(row.dataFinalizado, filtro)) continue;
      if (filtro.proposta !== "all" && row.tipoProposta !== filtro.proposta) continue;
      if (filtro.origem !== "all" && row.origem !== filtro.origem) continue;
      if (filtro.vendedor !== "all" && row.vendedor !== filtro.vendedor) continue;
      if (!aceitaNome(row.cliente)) continue;
      const grupo = grupoDe(row.celular);
      if (!grupo) continue;
      grupo.sucessos += 1;
      soma(grupo.vendedores, row.vendedor);
    }
  }

  const campanhaLivre =
    filtro.canal === "all" &&
    filtro.situacao === "all" &&
    filtro.proposta === "all" &&
    filtro.origem === "all" &&
    filtro.vendedor === "all";
  if (campanhaLivre) {
    for (const row of dataset.leadsCampanha || []) {
      if (!noPeriodo(row.criadoEm, filtro)) continue;
      if (!aceitaNome(row.nome)) continue;
      const chaves = row.phoneKeys?.length ? row.phoneKeys : [row.phoneKey || row.telefone];
      if (!chaves.some((chave) => phoneKey(chave))) semTelefone += 1;
      for (const chave of chaves) grupoDe(chave);
    }
  }

  const pontos = [...grupos.entries()]
    .map(([ddd, grupo]) => {
      const info = DDD_POR_CODIGO.get(ddd)!;
      return {
        ddd,
        uf: info.uf,
        cidade: info.cidade,
        lat: info.lat,
        lon: info.lon,
        clientes: grupo.phones.size,
        agendamentos: grupo.agendamentos,
        visitas: grupo.visitas,
        sucessos: grupo.sucessos,
        insucessos: grupo.insucessos,
        origens: top(grupo.origens),
        vendedores: top(grupo.vendedores),
      };
    })
    .sort((a, b) => b.clientes - a.clientes || a.ddd.localeCompare(b.ddd));

  const porUf = new Map<string, MapaUf>();
  for (const ponto of pontos) {
    const atual = porUf.get(ponto.uf) || { uf: ponto.uf, clientes: 0, agendamentos: 0, visitas: 0, sucessos: 0 };
    atual.clientes += ponto.clientes;
    atual.agendamentos += ponto.agendamentos;
    atual.visitas += ponto.visitas;
    atual.sucessos += ponto.sucessos;
    porUf.set(ponto.uf, atual);
  }

  return {
    pontos,
    ufs: [...porUf.values()].sort((a, b) => b.clientes - a.clientes),
    clientes: pontos.reduce((total, ponto) => total + ponto.clientes, 0),
    semTelefone,
    semDdd,
    semVeiculo,
  };
}
