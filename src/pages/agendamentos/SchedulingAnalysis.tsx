import { useState } from "react";
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

  const { kpis, options, sdrMetrics, vendedorMetrics, comparison, proposals, periodSeries } =
    analytics;

  return (
    <>
      <div className="card report-signature">
        <p>
          <strong>Setor:</strong> Vendas Web · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Painel de Análise de Agendamentos · {dataset.items.length} registros · atualizado{" "}
          {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <SchedulingFiltersBar options={options} filters={filters} onChange={setFilters} />

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Agendamentos</h3>
          <p>{kpis.total}</p>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{kpis.visitas}</p>
        </div>
        <div className="kpi-card">
          <h3>Taxa visita</h3>
          <p>{kpis.taxaVisita}%</p>
        </div>
        <div className="kpi-card accent">
          <h3>Sucessos</h3>
          <p>{kpis.sucessos}</p>
        </div>
        <div className="kpi-card success">
          <h3>Taxa sucesso</h3>
          <p>{kpis.taxaSucesso}%</p>
        </div>
        <div className="kpi-card">
          <h3>Insucessos</h3>
          <p>{kpis.insucessos}</p>
        </div>
        <div className="kpi-card">
          <h3>Pré-Venda</h3>
          <p>{kpis.preVenda}</p>
        </div>
        <div className="kpi-card">
          <h3>Recepção</h3>
          <p>{kpis.recepcao}</p>
        </div>
      </div>

      {dataset.items.length === 0 && (
        <div className="card">
          <h2>Sem dados ainda</h2>
          <p className="muted">
            Acesse <strong>Gestão</strong> e importe a planilha de agendamentos (e, em seguida,
            insucessos / leads geral para cruzar origem e motivos).
          </p>
        </div>
      )}

      <SDRPerformanceTable rows={sdrMetrics} />
      <VendedorConversionCards rows={vendedorMetrics} />
      <PerformanceComparisonTable rows={comparison} />

      <div className="charts">
        <ProposalDistributionChart data={proposals} />
        <TimeSeriesChart
          data={periodSeries.map((p) => ({
            label: p.label,
            total: p.total,
            visitas: p.visitas,
            sucessos: p.sucessos,
            insucessos: p.insucessos,
          }))}
          title="Série por quinzena"
          xKey="label"
        />
      </div>
    </>
  );
}
