import { useState } from "react";
import { CanalKpiGrid } from "../../components/scheduling/CanalKpiGrid";
import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { ProposalDistributionChart } from "../../components/scheduling/ProposalDistributionChart";
import { SchedulingFiltersBar } from "../../components/scheduling/SchedulingFiltersBar";
import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import { SdrVendedorProposalTable } from "../../components/scheduling/SdrVendedorProposalTable";
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
    sdrRecepcao,
    vendedorMetrics,
    comparisonSdrPreVenda,
    comparisonSdrRecepcao,
    comparisonVendedoresPreVenda,
    comparisonVendedoresRecepcao,
    sdrVendedorPairs,
    proposalsPreVenda,
    proposalsRecepcao,
    periodSeriesPreVenda,
    periodSeriesRecepcao,
  } = analytics;

  const heroSrc = `${import.meta.env.BASE_URL}brand/agendamentos-hero.png`;

  return (
    <>
      <div className="agendamentos-hero">
        <img
          src={heroSrc}
          alt="BellosCar — Análise de Agendamentos"
          width={640}
          height={220}
        />
      </div>

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

      <SdrVendedorProposalTable rows={sdrVendedorPairs} />

      <SDRPerformanceTable
        rows={sdrRecepcao}
        title="Desempenho Recepção"
        subtitle="Atendimentos Recepção e Gabriela — totais e taxas próprios, fora do geral da pré-venda."
      />

      <VendedorConversionCards rows={vendedorMetrics} />

      <PerformanceComparisonTable
        rows={comparisonVendedoresPreVenda}
        title="Comparação direta entre vendedores · Pré-Venda"
        subtitle="Somente vendedores no canal Pré-Venda — totais, propostas, visitas, sucessos e taxas."
      />

      <PerformanceComparisonTable
        rows={comparisonVendedoresRecepcao}
        title="Comparação direta entre vendedores · Recepção"
        subtitle="Somente vendedores no canal Recepção (loja) — totais, propostas, visitas, sucessos e taxas."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrPreVenda}
        title="Comparação direta · Pré-Venda"
        subtitle="Somente quem atendeu na Pré-Venda (SDR). Resultados dos vendedores estão nas tabelas acima."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrRecepcao}
        title="Comparação direta · Recepção"
        subtitle="Somente Recepção / Gabriela. Resultados dos vendedores estão na comparação de vendedores · Recepção."
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
