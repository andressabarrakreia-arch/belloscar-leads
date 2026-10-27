import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "../InfoTip";
import { chartCursor, chartTooltipStyle } from "../charts/chartTheme";
import { MOTIVO_NAO_INFORMADO } from "../../lib/scheduling/metrics";

const BAR_COLOR = "var(--chart-red)";

function MotivoTick({
  x = 0,
  y = 0,
  payload,
  ids,
}: {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
  ids?: string[];
}) {
  const px = Number(x) || 0;
  const py = Number(y) || 0;
  const label = String(payload?.value ?? "");
  if (label === MOTIVO_NAO_INFORMADO && ids?.length) {
    return (
      <g transform={`translate(${px},${py})`}>
        <foreignObject x={-214} y={-12} width={210} height={24}>
          <div className="motivo-label motivo-axis">
            <span>Motivo não informado</span>
            <InfoTip label="Ver IDs sem motivo">{ids.join(", ")}</InfoTip>
          </div>
        </foreignObject>
      </g>
    );
  }
  return (
    <text x={px} y={py} dy={4} textAnchor="end" fill="var(--chart-ink)" fontSize={11}>
      {label}
    </text>
  );
}

type Props = {
  data: { label: string; value: number; ids?: string[] }[];
  title?: string;
  subtitle?: string;
};

/** Barras horizontais de motivos de insucesso (% = qtd / total de insucessos do recorte). */
export function MotivoDistributionChart({
  data,
  title = "Motivos de insucesso",
  subtitle = "Percentual sobre o total de insucessos do filtro atual.",
}: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.map((d) => ({
    ...d,
    percentual: total ? Math.round((d.value / total) * 1000) / 10 : 0,
  }));
  const height = Math.max(280, chartData.length * 36 + 48);

  const missing = chartData.find((row) => row.label === MOTIVO_NAO_INFORMADO);

  return (
    <div className="card">
      <h2>
        {title}
        {subtitle ? <InfoTip>{subtitle}</InfoTip> : null}
      </h2>
      {chartData.length === 0 ? (
        <p className="muted">Nenhum insucesso no filtro atual.</p>
      ) : (
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--chart-ink)" }} />
              <YAxis
                type="category"
                dataKey="label"
                width={220}
                interval={0}
                tick={(props) => (
                  <MotivoTick
                    x={props.x}
                    y={props.y}
                    payload={{ value: String(props.payload?.value ?? "") }}
                    ids={missing?.ids}
                  />
                )}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                cursor={chartCursor}
                formatter={(value: number, _name, item) => {
                  const pct = (item?.payload as { percentual?: number } | undefined)?.percentual;
                  return [`${value} (${pct ?? 0}%)`, "Qtd"];
                }}
              />
              <Bar dataKey="value" fill={BAR_COLOR} radius={[0, 4, 4, 0]} name="Qtd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
