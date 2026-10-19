import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { SDRPerformanceTable } from "../../components/scheduling/SDRPerformanceTable";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Performance Pré-Vendas (+ bloco Recepção à parte). */
export function SchedulingPreVendas() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const {
    sdrPreVenda,
    sdrRecepcao,
    comparisonSdrPreVenda,
    comparisonSdrRecepcao,
  } = analytics;

  return (
    <>
      <SDRPerformanceTable
        rows={sdrPreVenda}
        title="Desempenho Pré-Vendas"
        subtitle="Por SDR — ordenado por volume. Show-up = Visitas/Agendamentos · Conv. = Sucessos/Agendamentos. Recepção não entra neste bloco."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrPreVenda}
        title="Comparação direta · Pré-Venda"
        subtitle="Somente quem atendeu na Pré-Venda (SDR). % Visita = show-up (Vi/Ag) · % Sucesso = conv. ag→sucesso (Su/Ag)."
      />

      <SDRPerformanceTable
        rows={sdrRecepcao}
        title="Desempenho Recepção (à parte)"
        subtitle="Atendimentos Recepção e Gabriela — totais e taxas próprios, fora do geral da pré-venda."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrRecepcao}
        title="Comparação direta · Recepção"
        subtitle="Somente Recepção / Gabriela. Resultados dos vendedores estão na aba Vendedores."
      />
    </>
  );
}
