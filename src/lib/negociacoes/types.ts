export type TipoNegociacao = "Venda" | "Troca" | "Compra" | "Consignação" | "Outro";

/** Linha bruta da planilha (1 veículo / movimentação). */
export type NegociacaoLine = {
  negociacaoId: string;
  dataEntrada: string;
  cliente: string;
  vendedor: string;
  tipo: TipoNegociacao;
  /** Tipo original da planilha (antes do normalize). */
  tipoRaw: string;
  status: string;
  placa: string;
  tipoVeiculo: string;
  marca: string;
  modelo: string;
  versao: string;
  estoque: string;
  tipoVenda: string;
  movimentacao: string;
  valorCompra: number | null;
  valorVenda: number | null;
  monthKey: string;
  periodKey: string;
  solicitante: string;
  avaliador: string;
};

/**
 * Unidade de negócio para métricas.
 * Troca = 1 deal por nº (várias linhas).
 * Venda/Compra/Consignação = 1 deal por linha.
 */
export type NegociacaoDeal = {
  /** Chave estável do negócio (não confundir com nº da planilha). */
  dealId: string;
  negociacaoId: string;
  dataEntrada: string;
  cliente: string;
  vendedor: string;
  tipo: TipoNegociacao;
  status: string;
  tipoVenda: string;
  monthKey: string;
  periodKey: string;
  placaEntrada: string;
  placaSaida: string;
  modeloEntrada: string;
  modeloSaida: string;
  lines: NegociacaoLine[];
};

export type NegociacoesImportMeta = {
  fileName: string;
  label: string;
  at: string;
  received: number;
  kept: number;
  replaced: number;
  removed: number;
  notes: string[];
};

/** Linha de conversão de avaliações (planilha mensal por vendedor). */
export type AvaliacaoConvRow = {
  monthKey: string;
  vendedor: string;
  aprovadas: number;
  realizadas: number;
  percentual: number;
};

export type NegociacoesDataset = {
  updatedAt: string;
  imports: NegociacoesImportMeta[];
  lines: NegociacaoLine[];
  /** Conversão Aval→aprovada por vendedor/mês. */
  avaliacoes: AvaliacaoConvRow[];
};

export type NegociacoesFilters = {
  month: string;
  period: string;
  vendedor: string;
  tipo: string;
  status: string;
  tipoVenda: string;
};

export type NegociacoesAdminConfig = {
  autoPublish: boolean;
};

export type NegociacoesKpis = {
  total: number;
  vendas: number;
  trocas: number;
  compras: number;
  consignacoes: number;
  outros: number;
};

export type VendedorNegociacaoRow = {
  vendedor: string;
  vendasMaisTrocas: number;
  consignacoes: number;
  compras: number;
  total: number;
  vendas: number;
  trocas: number;
};
