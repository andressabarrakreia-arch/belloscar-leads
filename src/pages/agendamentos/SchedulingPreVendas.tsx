import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import {
  SdrPreVendaConvPropostaTable,
  SdrPreVendaTopParceirosTable,
  SdrPreVendaUnifiedTable,
} from "../../components/scheduling/SdrPreVendaUnifiedTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";
import { isFeaturedPreVendaSdr } from "../../lib/scheduling/metrics";

/** Aba Performance Pré-Vendas (+ bloco Recepção à parte). */
export function SchedulingPreVendas() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const { sdrPreVendaRows, sdrRecepcao } = analytics;
  const featuredRows = sdrPreVendaRows.filter((r) => isFeaturedPreVendaSdr(r.sdr));

  return (
    <>
      <SdrPreVendaUnifiedTable rows={sdrPreVendaRows} />
      <SdrPreVendaConvPropostaTable rows={featuredRows} />
      <SdrPreVendaTopParceirosTable rows={featuredRows} />

      <SDRPerformanceTable
        rows={[sdrRecepcao]}
        showAtendimentos
        title="Desempenho Recepção (à parte)"
        subtitle="Canal Recepção consolidado. Atendimentos = LEADS GERAL · % Agend. = Agendamentos/Atendimentos."
      />
    </>
  );
}
