import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import {
  SdrPreVendaConvPropostaTable,
  SdrPreVendaTopParceirosTable,
  SdrPreVendaUnifiedTable,
} from "../../components/scheduling/SdrPreVendaUnifiedTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";
import { downloadPreVendaExport } from "../../lib/scheduling/exportPreVenda";
import {
  displaySdrName,
  isFeaturedPreVendaSdr,
} from "../../lib/scheduling/metrics";

/** Aba Performance Pré-Vendas (+ bloco Recepção à parte). */
export function SchedulingPreVendas() {
  const { analytics, filters, dataset } = useSchedulingAnalyticsContext();
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

  const exportar = () => {
    if (!dataset) return;
    downloadPreVendaExport(
      {
        sdrs: deskRows.map((row) => row.sdr),
        atendimentos: analytics.filteredRealizados,
        agendamentos: analytics.preVenda,
        visitas: analytics.filteredVisitas,
        sucessos: analytics.filteredSucessos,
        agenda: dataset.items,
        realizados: dataset.realizados || [],
      },
      filters.from,
      filters.to
    );
  };

  return (
    <>
      <SdrPreVendaUnifiedTable rows={deskRows} onExport={exportar} />
      <div className="charts">
        <SeriesChart
          title="Agenda e visita por SDR"
          tip="Números já mostrados na tabela de pré-venda."
          data={deskRows.map((row) => ({
            sdr: displaySdrName(row.sdr),
            agenda: row.totalAgendamentos,
            visitas: row.totalVisitas,
          }))}
          xKey="sdr"
          kind="bar"
          namesAside
          series={[
            { key: "agenda", name: "Agendamentos", color: CHART_COLORS.charcoal },
            { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
          ]}
        />
        <ShareDonut
          title="Sucessos da pré-venda"
          data={deskRows.map((row) => ({ label: displaySdrName(row.sdr), value: row.totalSucesso }))}
        />
      </div>
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
