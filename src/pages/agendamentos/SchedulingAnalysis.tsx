import { useState } from "react";
import { CanalKpiGrid } from "../../components/scheduling/CanalKpiGrid";
import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { ProposalDistributionChart } from "../../components/scheduling/ProposalDistributionChart";
import { SchedulingFiltersBar } from "../../components/scheduling/SchedulingFiltersBar";
import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import { TimeSeriesChart } from "../../components/scheduling/TimeSeriesChart";
import { VendedorConversionCards } from "../../components/scheduling/VendedorConversionCards";
import { useSchedulingAnalytics, useSchedulingStore } from "../../hooks/useSchedulingStore";
import type { SchedulingFilters } from "../../lib/scheduling/types";

export function SchedulingAnalysis() {
  const { dataset, loading, error } = useSchedulingStore();
  const [filters, setFilters] = useState<SchedulingFilters>({});
  const analytics = useSchedulingAnalytics(dataset, filters);

  if (loading) return <p className="muted">Carregando agendamentos…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  const {
    options,
    kpisPreVenda,
    kpisRecepcao,
    sdrPreVenda,
    sdrRecepcao,
    vendedorMetrics,
    comparisonPreVenda,
    comparisonRecepcao,
    proposalsPreVenda,
    proposalsRecepcao,
    periodSeriesPreVenda,
    periodSeriesRecepcao,
  } = analytics;

  return (
    <>
      <div className="card report-signature">
        <p>
          <strong>Setor:</strong> Vendas Web · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Painel de Análise de Agendamentos · {dataset.items.length} registros no filtro base ·
          Pré-Venda e Recepção com totais separados · atualizado{" "}
          {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <SchedulingFiltersBar options={options} filters={filters} onChange={setFilters} />

      <CanalKpiGrid
        kpis={kpisPreVenda}
        title="Pré-Venda · total e geral"
        subtitle="Clientes que passaram pelo pré-atendimento da equipe web. Recepção não entra nestes números."
      />

      <CanalKpiGrid
        kpis={kpisRecepcao}
        title="Recepção · total e geral (à parte)"
        subtitle="Braço do setor Web: clientes que chegaram direto na loja (Recepção e Gabriela), sem pré-atendimento da equipe."
        accent
      />

      {dataset.items.length === 0 && (
        <div className="card">
          <h2>Sem dados ainda</h2>
          <p className="muted">
            A base publicada ainda não carregou. Atualize a página ou verifique o deploy do
            GitHub Pages. Novas planilhas entram pela <strong>Gestão</strong>.
          </p>
        </div>
      )}

      <SDRPerformanceTable
        rows={sdrPreVenda}
        title="Desempenho Pré-Venda (SDR)"
        subtitle="Agendamentos gerados pela equipe de pré-venda — índices e % só deste canal."
      />

      <SDRPerformanceTable
        rows={sdrRecepcao}
        title="Desempenho Recepção"
        subtitle="Atendimentos Recepção e Gabriela — totais e taxas próprios, fora do geral da pré-venda."
      />

      <VendedorConversionCards rows={vendedorMetrics} />

      <PerformanceComparisonTable
        rows={comparisonPreVenda}
        title="Comparação direta · Pré-Venda"
        subtitle="Visão analítica da pré-venda (sem misturar Recepção)."
      />

      <PerformanceComparisonTable
        rows={comparisonRecepcao}
        title="Comparação direta · Recepção"
        subtitle="Visão analítica só da Recepção / loja."
      />

      <div className="charts">
        <ProposalDistributionChart
          data={proposalsPreVenda}
          title="Propostas · Pré-Venda"
          subtitle="Mix só do canal Pré-Venda (sem Recepção)."
        />
        <TimeSeriesChart
          data={periodSeriesPreVenda.map((p) => ({
            label: p.label,
            total: p.total,
            visitas: p.visitas,
            sucessos: p.sucessos,
            insucessos: p.insucessos,
          }))}
          title="Série por quinzena · Pré-Venda"
          xKey="label"
        />
      </div>

      <div className="charts">
        <ProposalDistributionChart
          data={proposalsRecepcao}
          title="Propostas · Recepção"
          subtitle="Mix só da Recepção / loja."
        />
        <TimeSeriesChart
          data={periodSeriesRecepcao.map((p) => ({
            label: p.label,
            total: p.total,
            visitas: p.visitas,
            sucessos: p.sucessos,
            insucessos: p.insucessos,
          }))}
          title="Série por quinzena · Recepção"
          xKey="label"
        />
      </div>
    </>
  );
}
