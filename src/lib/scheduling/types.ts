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

export type SchedulingSheetKind =
  | "agendamentos"
  | "insucessos"
  | "leads"
  | "realizados"
  | "sucessos"
  | "leadsCampanha"
  | "desconhecido";

export type SchedulingImportMeta = {
  fileName: string;
  label: string;
  kind: SchedulingSheetKind;
  at: string;
  received: number;
  kept: number;
  removed: number;
  enriched: number;
  notes: string[];
};

/** Atendimento (lead) da planilha LEADS GERAL — enriquecimento (origem etc.). */
export type LeadAtendimentoItem = {
  id: string;
  /** Data do lead (criado em), ISO YYYY-MM-DD */
  data: string;
  sdr: string;
  origem: string;
  tipoProposta: TipoProposta;
};

/**
 * LEADS REALIZADOS — fonte de Atendimentos (Atendido em) e Visitas (Visita + Visita em).
 */
export type RealizadoItem = {
  id: string;
  /** Atendido em — ISO YYYY-MM-DD */
  dataAtendido: string;
  /** Visita em — ISO YYYY-MM-DD ou null */
  dataVisita: string | null;
  teveVisita: boolean;
  sdr: string;
  origem: string;
  tipoProposta: TipoProposta;
  cliente: string;
  celular: string;
};

/**
 * Export do Meta "LEADS POR CAMPANHA".
 * A campanha é a coluna Formulário. O cruzamento com a operação é pelo telefone.
 */
export type LeadCampanhaItem = {
  /** Criado em — ISO YYYY-MM-DD */
  criadoEm: string;
  nome: string;
  /** Telefone principal formatado, para exibição */
  telefone: string;
  /** Coluna Formulário — nome da campanha / anúncio */
  formulario: string;
  /** Primeiro telefone válido. Mantido para a base já gravada. */
  phoneKey: string;
  /** Telefone, WhatsApp e secundário, na ordem da planilha */
  phoneKeys: string[];
};

/** Planilha SUCESSOS — Finalizado em. */
export type SucessoItem = {
  id: string;
  /** Finalizado em — ISO YYYY-MM-DD */
  dataFinalizado: string;
  sdr: string;
  vendedor: string;
  tipoProposta: TipoProposta;
  origem: string;
  cliente: string;
  celular: string;
};

export type SchedulingDataset = {
  updatedAt: string;
  imports: SchedulingImportMeta[];
  items: AgendamentoItem[];
  /** LEADS GERAL (enrich); legado para Portais se realizados vazio. */
  leadsAtendimentos?: LeadAtendimentoItem[];
  /** LEADS REALIZADOS — atendimentos e visitas por data própria. */
  realizados?: RealizadoItem[];
  /** Planilha SUCESSOS — sucessos por Finalizado em. */
  sucessosEventos?: SucessoItem[];
  /** LEADS POR CAMPANHA — formulários do Meta. Não entra nas outras abas. */
  leadsCampanha?: LeadCampanhaItem[];
};

export type SchedulingFilters = {
  from?: string;
  to?: string;
  sdr?: string;
  tipoProposta?: TipoProposta | "";
  vendedor?: string;
  origem?: string;
  /** Busca rápida: id, nome do cliente ou telefone */
  q?: string;
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

/** Conv. ag→sucesso dentro de um tipo de proposta (Su do tipo / Ag do tipo). */
export type PropostaConversao = {
  tipo: TipoProposta;
  agendamentos: number;
  sucessos: number;
  taxa: number;
};

/** Par SDR × Vendedor resumido (top parceiros). */
export type SdrVendedorTop = {
  vendedor: string;
  total: number;
  sucessos: number;
  taxaSucesso: number;
};

/** Linha unificada da aba Pré-Vendas (desempenho + extras). */
export type SdrPreVendaRow = SdrMetrics & {
  /** Atendimentos do SDR (REALIZADOS · Atendido em). */
  totalAtendimentos: number;
  /** Agendamentos / Atendimentos × 100 (0 se sem atendimentos). */
  taxaAgendamento: number;
  taxaInsucesso: number;
  conversaoPorProposta: PropostaConversao[];
  topParceiros: SdrVendedorTop[];
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
  /** Totais "gerais" = apenas Pré-Venda (Recepção fica à parte). */
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
  visitasRecepcao: number;
  insucessosRecepcao: number;
  conversaoRecepcao: number;
  taxaVisitaRecepcao: number;
  motivosInsucesso: MotivoStats[];
  motivosInsucessoRecepcao: MotivoStats[];
  origens: OrigemStats[];
  origensRecepcao: OrigemStats[];
  propostasBreakdown: PropostasBreakdown;
  propostasBreakdownRecepcao: PropostasBreakdown;
};

export type SchedulingAdminConfig = {
  autoPublish: boolean;
  lastExportAt?: string;
};
