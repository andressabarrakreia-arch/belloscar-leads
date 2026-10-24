import { SeriesChart } from "../../components/charts/SeriesChart";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { ProposalDistributionChart } from "../../components/scheduling/ProposalDistributionChart";
import { SdrVendedorProposalTable } from "../../components/scheduling/SdrVendedorProposalTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Análise de Agendamentos — cruzamentos SDR × Vendedor e propostas. */
export function SchedulingDetalhe() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const { sdrVendedorPairs, proposalsPreVenda, proposalsRecepcao } = analytics;

  return (
    <>
      <SdrVendedorProposalTable rows={sdrVendedorPairs} />

      <div className="charts">
        <ProposalDistributionChart
          data={proposalsPreVenda}
          title="Tipos de proposta · Pré-Venda"
          subtitle="Rosca do mix de propostas no canal Pré-Venda (filtro atual)."
        />
        <ProposalDistributionChart
          data={proposalsRecepcao}
          title="Tipos de proposta · Recepção"
          subtitle="Rosca do mix de propostas no canal Recepção (filtro atual)."
        />
        <SeriesChart
          title="Barras · Pré-Venda"
          tip="O mesmo mix da rosca de pré-venda."
          data={proposalsPreVenda.map((item) => ({ tipo: item.label, valor: item.value }))}
          xKey="tipo"
          kind="bar"
          namesAside
          series={[{ key: "valor", name: "Quantidade", color: CHART_COLORS.red }]}
        />
        <SeriesChart
          title="Barras · Recepção"
          tip="O mesmo mix da rosca de recepção."
          data={proposalsRecepcao.map((item) => ({ tipo: item.label, valor: item.value }))}
          xKey="tipo"
          kind="bar"
          namesAside
          series={[{ key: "valor", name: "Quantidade", color: CHART_COLORS.charcoal }]}
        />
      </div>
    </>
  );
}
