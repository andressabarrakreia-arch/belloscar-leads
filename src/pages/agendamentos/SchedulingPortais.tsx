import { ShareDonut } from "../../components/charts/ShareDonut";
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
        <ShareDonut
          title="Sucessos por grupo de origens"
          tip="Sucessos já somados por grupo (Meta, Classificados, Site, etc.)."
          data={groups.map((g) => ({ label: g.label, value: g.sucessos }))}
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
