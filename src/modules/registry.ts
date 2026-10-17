/**
 * Registro de módulos do BellosCar Analytics.
 * Cada módulo tem rota base própria e link de acesso distinto para a equipe.
 */

export type ModuleNavItem = {
  to: string;
  label: string;
  end?: boolean;
  /** Se true, só aparece no layout de gestão (PIN), não no link da equipe */
  adminOnly?: boolean;
};

export type AppModule = {
  id: string;
  /** Nome exibido (ex.: Análise de Campanhas) */
  name: string;
  /** Prefixo de rota HashRouter, sem # (ex.: /campanhas) */
  basePath: string;
  /** Texto curto sob o título */
  tagline: string;
  /** Link público principal para compartilhar com a equipe */
  publicPath: string;
  nav: ModuleNavItem[];
};

export const MODULES: AppModule[] = [
  {
    id: "campanhas",
    name: "Análise de Campanhas",
    basePath: "/campanhas",
    tagline: "Leads, origens, atendentes e conversão",
    publicPath: "/campanhas",
    nav: [
      { to: "/campanhas", label: "Dashboard", end: true },
      { to: "/campanhas/atendentes", label: "Atendentes" },
      { to: "/campanhas/comparar", label: "Comparar" },
      { to: "/campanhas/admin", label: "Gestão", adminOnly: true },
    ],
  },
  {
    id: "agendamentos",
    name: "Análise de Agendamentos",
    basePath: "/agendamentos",
    tagline: "Pré-venda, recepção, vendedores e motivos de insucesso · Vendas Web",
    publicPath: "/agendamentos",
    nav: [
      { to: "/agendamentos", label: "Dashboard", end: true },
      { to: "/agendamentos/admin", label: "Gestão", adminOnly: true },
    ],
  },
];

export function getModuleById(id: string): AppModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export const CAMPANHAS = getModuleById("campanhas")!;
export const AGENDAMENTOS = getModuleById("agendamentos")!;
