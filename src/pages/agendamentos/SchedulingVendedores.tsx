import { useMemo, useState } from "react";
import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { VendedorConversionCards } from "../../components/scheduling/VendedorConversionCards";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Performance Vendedores. */
export function SchedulingVendedores() {
  const { analytics } = useSchedulingAnalyticsContext();
  const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);

  const filteredComparisons = useMemo(() => {
    if (!analytics) {
      return { preVenda: [], recepcao: [] };
    }
    const { comparisonVendedoresPreVenda, comparisonVendedoresRecepcao } = analytics;
    if (!selectedVendedor) {
      return {
        preVenda: comparisonVendedoresPreVenda,
        recepcao: comparisonVendedoresRecepcao,
      };
    }
    return {
      preVenda: comparisonVendedoresPreVenda.filter((r) => r.nome === selectedVendedor),
      recepcao: comparisonVendedoresRecepcao.filter((r) => r.nome === selectedVendedor),
    };
  }, [analytics, selectedVendedor]);

  if (!analytics) return null;

  const scopeHint = selectedVendedor
    ? `Filtrado: ${selectedVendedor}.`
    : "Resultado geral de todos os vendedores.";

  return (
    <>
      <VendedorConversionCards
        rows={analytics.vendedorMetrics}
        selectedVendedor={selectedVendedor}
        onSelectVendedor={setSelectedVendedor}
      />

      <PerformanceComparisonTable
        rows={filteredComparisons.preVenda}
        title="Comparação direta entre vendedores · Pré-Venda"
        subtitle={`${scopeHint} Somente canal Pré-Venda — totais, propostas, visitas, sucessos e taxas (Su/Ag e Vi/Ag).`}
      />

      <PerformanceComparisonTable
        rows={filteredComparisons.recepcao}
        title="Comparação direta entre vendedores · Recepção"
        subtitle={`${scopeHint} Somente canal Recepção (loja) — totais e taxas próprios.`}
      />
    </>
  );
}
