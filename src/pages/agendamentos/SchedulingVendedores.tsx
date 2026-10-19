import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { VendedorConversionCards } from "../../components/scheduling/VendedorConversionCards";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Performance Vendedores. */
export function SchedulingVendedores() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const {
    vendedorMetrics,
    comparisonVendedoresPreVenda,
    comparisonVendedoresRecepcao,
  } = analytics;

  return (
    <>
      <VendedorConversionCards rows={vendedorMetrics} />

      <PerformanceComparisonTable
        rows={comparisonVendedoresPreVenda}
        title="Comparação direta entre vendedores · Pré-Venda"
        subtitle="Somente canal Pré-Venda — totais, propostas, visitas, sucessos e taxas (Su/Ag e Vi/Ag)."
      />

      <PerformanceComparisonTable
        rows={comparisonVendedoresRecepcao}
        title="Comparação direta entre vendedores · Recepção"
        subtitle="Somente canal Recepção (loja) — totais e taxas próprios."
      />
    </>
  );
}
