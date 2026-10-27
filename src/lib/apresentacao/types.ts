import type { SetorId } from "./avatar";

export type ShowKpi = { label: string; value: string };

export type ShowDetalhe = {
  positivos: ShowKpi[];
  negativos: ShowKpi[];
  notas?: string[];
};

export type ShowPerson = {
  id: string;
  nome: string;
  cargo: string;
  setor: SetorId;
  kpis: ShowKpi[];
  detalhe?: ShowDetalhe;
};

export type ShowSection = {
  id: SetorId;
  title: string;
  blurb: string;
  people: ShowPerson[];
};

export type ShowPeriod = { from: string; to: string };
