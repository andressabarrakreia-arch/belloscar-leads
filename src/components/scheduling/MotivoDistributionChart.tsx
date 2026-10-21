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

const BAR_COLOR = "#c02026";

type Props = {
  data: { label: string; value: number }[];
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
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={180}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip
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
