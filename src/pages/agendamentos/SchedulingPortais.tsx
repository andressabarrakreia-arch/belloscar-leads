import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { PortaisDashboard } from "../../components/scheduling/PortaisDashboard";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Portais — resultados e conversão por origem/portal. */
export function SchedulingPortais() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const { groups, topByVolume } = analytics.portais;

  return (
    <>
      <div className="charts">
        <SeriesChart
          title="Grupos de portal"
          tip="Atendimentos, visitas e sucessos já somados por grupo."
          data={groups}
          xKey="label"
          kind="bar"
          series={[
            { key: "atendimentos", name: "Atendimentos", color: CHART_COLORS.charcoal },
            { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
            { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
          ]}
        />
        <ShareDonut
          title="Volume das origens"
          tip="As origens com mais agendamentos no filtro."
          data={topByVolume.map((item) => ({ label: item.origin, value: item.total }))}
        />
      </div>
      <PortaisDashboard data={analytics.portais} />
    </>
  );
}
