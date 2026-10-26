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
      </div>
    </>
  );
}
