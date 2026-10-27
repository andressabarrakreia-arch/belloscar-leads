import type { SetorId } from "./avatar";

export type ShowKpi = { label: string; value: string };

export type ShowPerson = {
  id: string;
  nome: string;
  cargo: string;
  setor: SetorId;
  kpis: ShowKpi[];
};

export type ShowSection = {
  id: SetorId;
  title: string;
  blurb: string;
  people: ShowPerson[];
};
