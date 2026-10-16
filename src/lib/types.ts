export type Lead = {
  id: string;
  externalId: string | null;
  createdAtLead: string;
  monthKey: string;
  periodKey: string;
  responsavel: string;
  status: string;
  visita: string;
  dataVisita: string | null;
  origem: string;
  tipoProposta: string;
  cliente: string;
  celular: string;
  phoneNormalized: string;
  hasVisit: boolean;
  isSuccess: boolean;
  isScheduled: boolean;
};

export type ImportMeta = {
  fileName: string;
  label: string;
  at: string;
  received: number;
  kept: number;
  removed: number;
  notes: string[];
};

export type Dataset = {
  updatedAt: string;
  imports: ImportMeta[];
  leads: Lead[];
};

export type ParsedLead = Omit<Lead, "id" | "createdAtLead" | "dataVisita"> & {
  createdAtLead: Date;
  dataVisita: Date | null;
  hasPriority: boolean;
};

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  origem?: string;
  responsavel?: string;
  periodKeys?: string[];
  monthKeys?: string[];
};

export type Kpis = {
  leads: number;
  visitas: number;
  sucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  taxaVisitaParaSucesso: number;
};
