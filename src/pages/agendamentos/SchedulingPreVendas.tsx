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
        subtitle="Ordem: Allan Junior Dos Santos Ramos → Thayna PRE-VENDAS → Lais Narimã Ferreira Vieira → Matheus Imbroinise → demais. Show-up = Visitas/Agendamentos · Conv. = Sucessos/Agendamentos. Recepção não entra neste bloco."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrPreVenda}
        title="Comparação direta · Pré-Venda"
        subtitle="Somente quem atendeu na Pré-Venda (SDR). Ordem fixa da equipe web, depois os demais. Show-up (Vi/Ag) · Conv. ag→sucesso (Su/Ag)."
      />

      <SDRPerformanceTable
        rows={sdrRecepcao}
        title="Desempenho Recepção (à parte)"
        subtitle="Canal Recepção consolidado (inclui todos os atendimentos desse canal em uma única linha)."
      />

      <PerformanceComparisonTable
        rows={comparisonSdrRecepcao}
        title="Comparação direta · Recepção"
        subtitle="Uma linha consolidada do canal Recepção. Resultados dos vendedores estão na aba Vendedores."
      />
    </>
  );
}
