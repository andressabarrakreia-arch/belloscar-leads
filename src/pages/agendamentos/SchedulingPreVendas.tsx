import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import {
  SdrPreVendaConvPropostaTable,
  SdrPreVendaTopParceirosTable,
  SdrPreVendaUnifiedTable,
} from "../../components/scheduling/SdrPreVendaUnifiedTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";
import {
  displaySdrName,
  isFeaturedPreVendaSdr,
} from "../../lib/scheduling/metrics";

/** Aba Performance Pré-Vendas (+ bloco Recepção à parte). */
export function SchedulingPreVendas() {
  const { analytics, filters } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const { sdrPreVendaRows, sdrRecepcao } = analytics;

  // Equipe web fixa; outro SDR só aparece se escolhido no filtro.
  const filterSdr = filters.sdr?.trim();
  const deskRows = filterSdr
    ? sdrPreVendaRows.filter(
        (r) =>
          r.sdr === filterSdr ||
          displaySdrName(r.sdr) === filterSdr ||
          r.sdr === displaySdrName(filterSdr)
      )
    : sdrPreVendaRows.filter((r) => isFeaturedPreVendaSdr(r.sdr));

  const featuredRows = deskRows.filter((r) => isFeaturedPreVendaSdr(r.sdr));
  const convRows = filterSdr ? deskRows : featuredRows;

  return (
    <>
      <SdrPreVendaUnifiedTable rows={deskRows} />
      <SdrPreVendaConvPropostaTable rows={convRows} />
      <SdrPreVendaTopParceirosTable rows={convRows} />

      <SDRPerformanceTable
        rows={[sdrRecepcao]}
        showAtendimentos
        title="Desempenho Recepção (à parte)"
        subtitle="Canal Recepção consolidado. Atendimentos = REALIZADOS · % Agend. = Agendamentos/Atendimentos."
      />
    </>
  );
}
