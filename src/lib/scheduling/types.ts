export type TipoProposta =
  | "Compra"
  | "Venda"
  | "Troca"
  | "Consignação"
  | "Financiamento"
  | "não informado(celulas em branco)";

export type StatusAgendamento = "Agendado" | "Visita" | "Sucesso" | "Insucesso";

/** Canal de origem do atendimento para o vendedor. */
export type CanalAtendimento = "Pré-Venda" | "Recepção";

export interface AgendamentoItem {
  id: string;
  dataAgendamento: string; // ISO YYYY-MM-DD
  sdr: string;
  vendedor: string;
  tipoProposta: TipoProposta;
  teveVisita: boolean;
  status: StatusAgendamento;
  origem: string;
  motivoInsucesso: string | null;
  cliente: string;
  celular: string;
  email: string;
  canal: CanalAtendimento;
  monthKey: string;
  periodKey: string;
}

export type SchedulingImportMeta = {
  fileName: string;
  label: string;
  kind: "agendamentos" | "insucessos" | "leads" | "desconhecido";
  at: string;
  received: number;
  kept: number;
  removed: number;
  enriched: number;
  notes: string[];
};

export type SchedulingDataset = {
  updatedAt: string;
  imports: SchedulingImportMeta[];
  items: AgendamentoItem[];
};

export type SchedulingFilters = {
  from?: string;
  to?: string;
  sdr?: string;
  tipoProposta?: TipoProposta | "";
  vendedor?: string;
};

export type PropostasBreakdown = Record<TipoProposta, number>;

export type SdrMetrics = {
  sdr: string;
  canal: CanalAtendimento;
  totalAgendamentos: number;
  propostasBreakdown: PropostasBreakdown;
  totalVisitas: number;
  totalSucesso: number;
  totalInsucesso: number;
  taxaConversaoVisita: number;
  taxaConversaoSucesso: number;
};

export type MotivoStats = {
  motivo: string;
  quantidade: number;
  percentual: number;
};

export type OrigemStats = {
  origem: string;
  quantidade: number;
  percentual: number;
  sucessos: number;
  insucessos: number;
};

export type VendedorMetrics = {
  vendedor: string;
  totalRecebidos: number;
  totalVisitas: number;
  totalSucesso: number;
  totalInsucesso: number;
  conversaoGeral: number;
  totalPreVenda: number;
  sucessoPreVenda: number;
  conversaoPreVenda: number;
  totalRecepcao: number;
  sucessoRecepcao: number;
  conversaoRecepcao: number;
  motivosInsucesso: MotivoStats[];
  origens: OrigemStats[];
  propostasBreakdown: PropostasBreakdown;
};

export type SchedulingAdminConfig = {
  autoPublish: boolean;
  lastExportAt?: string;
};
