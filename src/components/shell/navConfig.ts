import { AGENDAMENTOS, CAMPANHAS, NEGOCIACOES, PERFIL } from "../../modules/registry";

export type ShellNavLeaf = {
  kind: "leaf";
  id: string;
  label: string;
  to: string;
  end?: boolean;
};

export type ShellNavGroup = {
  kind: "group";
  id: string;
  label: string;
  basePath: string;
  children: { to: string; label: string; end?: boolean }[];
};

export type ShellNavItem = ShellNavLeaf | ShellNavGroup;

export type ShellMode = "unified" | "campanhas";

/** Abas extras do hub (sem Erros). */
export const EXTRA_NAV: ShellNavLeaf[] = [
  {
    kind: "leaf",
    id: "apresentacao",
    label: "Apresentação",
    to: "/apresentacao",
    end: true,
  },
  {
    kind: "leaf",
    id: "mapa",
    label: "Mapa do Site",
    to: "/mapa",
    end: true,
  },
];

/** Agendamentos + Negociações (expansíveis), Perfil, Apresentação e Mapa. */
export const UNIFIED_NAV: ShellNavItem[] = [
  {
    kind: "group",
    id: AGENDAMENTOS.id,
    label: AGENDAMENTOS.name,
    basePath: AGENDAMENTOS.basePath,
    children: AGENDAMENTOS.nav.map(({ to, label, end }) => ({ to, label, end })),
  },
  {
    kind: "group",
    id: NEGOCIACOES.id,
    label: NEGOCIACOES.name,
    basePath: NEGOCIACOES.basePath,
    children: NEGOCIACOES.nav.map(({ to, label, end }) => ({ to, label, end })),
  },
  {
    kind: "leaf",
    id: PERFIL.id,
    label: PERFIL.name,
    to: PERFIL.basePath,
    end: true,
  },
  ...EXTRA_NAV,
];

/** Campanhas permanece em rota separada, com as guias + abas extras na sidebar. */
export const CAMPANHAS_NAV: ShellNavItem[] = [
  ...CAMPANHAS.nav.map((item) => ({
    kind: "leaf" as const,
    id: item.to,
    label: item.label,
    to: item.to,
    end: item.end,
  })),
  ...EXTRA_NAV,
];

export type PageChrome = {
  eyebrow: string;
  title: string;
  moduleId: string;
};

const UNIFIED_TITLES: { match: (path: string) => boolean; chrome: PageChrome }[] = [
  {
    match: (p) => p === "/agendamentos" || p === "/agendamentos/",
    chrome: { eyebrow: "Agendamentos", title: "Visão Geral", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/pre-vendas"),
    chrome: { eyebrow: "Agendamentos", title: "Pré-Vendas", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/vendedores"),
    chrome: { eyebrow: "Agendamentos", title: "Vendedores", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/detalhe"),
    chrome: { eyebrow: "Agendamentos", title: "Agendamentos", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/portais"),
    chrome: { eyebrow: "Agendamentos", title: "Portais", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/sucessos"),
    chrome: { eyebrow: "Agendamentos", title: "Sucessos", moduleId: "agendamentos" },
  },
  {
    match: (p) => p.startsWith("/agendamentos/insucessos"),
    chrome: { eyebrow: "Agendamentos", title: "Insucessos", moduleId: "agendamentos" },
  },
  {
    match: (p) => p === "/negociacoes" || p === "/negociacoes/",
    chrome: { eyebrow: "Negociações", title: "Visão Geral", moduleId: "negociacoes" },
  },
  {
    match: (p) => p.startsWith("/negociacoes/lancamentos"),
    chrome: { eyebrow: "Negociações", title: "Lançamentos", moduleId: "negociacoes" },
  },
  {
    match: (p) => p.startsWith("/negociacoes/vendedores"),
    chrome: { eyebrow: "Negociações", title: "Vendedores", moduleId: "negociacoes" },
  },
  {
    match: (p) => p.startsWith("/negociacoes/comparativo"),
    chrome: { eyebrow: "Negociações", title: "Comparativo", moduleId: "negociacoes" },
  },
  {
    match: (p) => p.startsWith("/perfil"),
    chrome: { eyebrow: "Perfil", title: "Visão Geral", moduleId: "perfil" },
  },
  {
    match: (p) => p.startsWith("/apresentacao"),
    chrome: { eyebrow: "Apresentação", title: "Resultados", moduleId: "apresentacao" },
  },
  {
    match: (p) => p.startsWith("/mapa"),
    chrome: { eyebrow: "Orientação", title: "Mapa do Site", moduleId: "mapa" },
  },
];

const CAMPANHAS_TITLES: { match: (path: string) => boolean; chrome: PageChrome }[] = [
  {
    match: (p) => p === "/campanhas" || p === "/campanhas/",
    chrome: { eyebrow: "Campanhas", title: "Dashboard", moduleId: "campanhas" },
  },
  {
    match: (p) => p.startsWith("/campanhas/atendentes"),
    chrome: { eyebrow: "Campanhas", title: "Atendentes", moduleId: "campanhas" },
  },
  {
    match: (p) => p.startsWith("/campanhas/comparar"),
    chrome: { eyebrow: "Campanhas", title: "Comparar", moduleId: "campanhas" },
  },
  {
    match: (p) => p.startsWith("/campanhas/formularios"),
    chrome: { eyebrow: "Campanhas", title: "Leads por formulário", moduleId: "campanhas" },
  },
];

export function resolvePageChrome(pathname: string, mode: ShellMode): PageChrome {
  const list = mode === "campanhas" ? CAMPANHAS_TITLES : UNIFIED_TITLES;
  for (const entry of list) {
    if (entry.match(pathname)) return entry.chrome;
  }
  if (mode === "campanhas") {
    return { eyebrow: "Campanhas", title: "Análise de Campanhas", moduleId: "campanhas" };
  }
  return { eyebrow: "BellosCar", title: "Painel", moduleId: "agendamentos" };
}

export function navForMode(mode: ShellMode): ShellNavItem[] {
  return mode === "campanhas" ? CAMPANHAS_NAV : UNIFIED_NAV;
}
