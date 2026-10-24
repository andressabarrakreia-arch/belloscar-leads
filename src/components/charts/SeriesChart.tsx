import { useState, type SVGProps } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "../InfoTip";
import { chartTooltipStyle } from "./chartTheme";

function NameTick({
  x = 0,
  y = 0,
  payload,
}: SVGProps<SVGTextElement> & { payload?: { value?: string } }) {
  const words = String(payload?.value ?? "").split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 16 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  const lineHeight = 13;
  const start = -((lines.length - 1) * lineHeight) / 2;
  return (
    <text x={x} y={y} textAnchor="end" fill="#404041" fontSize={11}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? start : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export type ChartSeries = {
  key: string;
  name: string;
  color: string;
};

type Props = {
  title: string;
  tip?: string;
  data: object[];
  xKey: string;
  series: ChartSeries[];
  kind?: "area" | "bar" | "line";
  /** Nomes longos no eixo lateral, um por linha, todos visíveis. */
  namesAside?: boolean;
};

export function SeriesChart({ title, tip, data, xKey, series, kind = "area", namesAside = false }: Props) {
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = series.filter((item) => !hidden.includes(item.key));

  function toggle(key: string) {
    setHidden((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  const aside = namesAside && kind === "bar";
  const longestName = aside
    ? data.reduce((max, row) => {
        const label = String((row as Record<string, unknown>)[xKey] ?? "");
        return Math.max(max, label.length);
      }, 0)
    : 0;
  const nameWidth = Math.min(168, Math.max(120, Math.round(Math.min(longestName, 16) * 7) + 16));
  const frameHeight = aside ? Math.max(280, data.length * 58 + 36) : 280;

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e4e5e8" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#404041" }} />
      <YAxis tick={{ fontSize: 11, fill: "#404041" }} allowDecimals={false} width={36} />
      <Tooltip contentStyle={chartTooltipStyle} />
    </>
  );

  return (
    <div className="card chart-card">
      <h2>
        {title}
        {tip ? <InfoTip>{tip}</InfoTip> : null}
      </h2>
      <div className="chart-legend" role="group" aria-label="Séries do gráfico">
        {series.map((item) => {
          const off = hidden.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              className={`chart-legend__btn${off ? " is-off" : ""}`}
              aria-pressed={!off}
              onClick={() => toggle(item.key)}
            >
              <span style={{ background: item.color }} />
              {item.name}
            </button>
          );
        })}
      </div>
      {data.length === 0 || visible.length === 0 ? (
        <p className="muted">Sem pontos neste recorte.</p>
      ) : (
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={frameHeight}>
            {kind === "bar" && aside ? (
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e5e8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#404041" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  width={nameWidth}
                  interval={0}
                  tick={NameTick}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {visible.map((item) => (
                  <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[0, 6, 6, 0]} />
                ))}
              </BarChart>
            ) : kind === "bar" ? (
              <BarChart data={data}>
                {axes}
                {visible.map((item) => (
                  <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            ) : kind === "line" ? (
              <LineChart data={data}>
                {axes}
                {visible.map((item) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.name}
                    stroke={item.color}
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={data}>
                {axes}
                {visible.map((item) => (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.name}
                    stroke={item.color}
                    fill={item.color}
                    fillOpacity={0.16}
                    strokeWidth={2.2}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
