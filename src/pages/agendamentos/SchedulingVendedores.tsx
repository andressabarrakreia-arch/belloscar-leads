import { useMemo, useState } from "react";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { PerformanceComparisonTable } from "../../components/scheduling/PerformanceComparisonTable";
import { VendedorConversionCards } from "../../components/scheduling/VendedorConversionCards";
import { VegaBarras } from "../../components/viz/VegaBarras";
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
      <div className="charts">
        <SeriesChart
          title="Recebidos, visitas e sucessos"
          tip="Totais de pré-venda já usados nos cards."
          data={analytics.vendedorMetrics}
          xKey="vendedor"
          kind="bar"
          series={[
            { key: "totalRecebidos", name: "Recebidos", color: CHART_COLORS.charcoal },
            { key: "totalVisitas", name: "Visitas", color: CHART_COLORS.blue },
            { key: "totalSucesso", name: "Sucessos", color: CHART_COLORS.green },
          ]}
        />
        <ShareDonut
          title="Sucessos por vendedor"
          data={analytics.vendedorMetrics.map((row) => ({ label: row.vendedor, value: row.totalSucesso }))}
        />
      </div>
      <VegaBarras
        titulo="Sucessos por vendedor"
        dica="O mesmo sucesso da rosca, em barra, para comparar a altura."
        dados={analytics.vendedorMetrics.map((row) => ({ nome: row.vendedor, sucessos: row.totalSucesso }))}
        nome="nome"
        valor="sucessos"
      />
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
        subtitle={`${scopeHint} Somente canal Recepção — totais e taxas próprios.`}
      />
    </>
  );
}
