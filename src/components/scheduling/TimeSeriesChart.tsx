import { SeriesChart } from "../charts/SeriesChart";
import { CHART_COLORS } from "../charts/chartTheme";

type Point = {
  date?: string;
  label?: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
};

type Props = {
  data: Point[];
  title?: string;
  xKey?: "date" | "label";
};

export function TimeSeriesChart({ data, title = "Série temporal", xKey = "date" }: Props) {
  return (
    <SeriesChart
      title={title}
      tip="Mesmos números da série. Clique numa série para esconder ou mostrar."
      xKey={xKey}
      kind="area"
      data={data.map((point) => ({
        [xKey]: point[xKey] ?? "",
        total: point.total,
        visitas: point.visitas,
        sucessos: point.sucessos,
        insucessos: point.insucessos,
      }))}
      series={[
        { key: "total", name: "Agendamentos", color: CHART_COLORS.charcoal },
        { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
        { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
        { key: "insucessos", name: "Insucessos", color: CHART_COLORS.red },
      ]}
    />
  );
}
