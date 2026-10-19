import { PortaisDashboard } from "../../components/scheduling/PortaisDashboard";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Portais — resultados e conversão por origem/portal. */
export function SchedulingPortais() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  return <PortaisDashboard data={analytics.portais} />;
}
