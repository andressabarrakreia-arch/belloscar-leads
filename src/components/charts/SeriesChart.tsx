import { useState, type SVGProps } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  useYAxisDomain,
  useYAxisScale,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "../InfoTip";
import { chartCursor, chartTooltipStyle } from "./chartTheme";

function NameTick({
  x = 0,
  y = 0,
  payload,
  axisWidth = 0,
  emphasis = false,
}: SVGProps<SVGTextElement> & {
  payload?: { value?: string };
  axisWidth?: number;
  emphasis?: boolean;
}) {
  const words = String(payload?.value ?? "").split(" ");
  const lines: string[] = [];
  let current = "";
  const maxChars = emphasis ? 18 : 16;
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  const lineHeight = emphasis ? 16 : 13;
  const start = -((lines.length - 1) * lineHeight) / 2;
  const anchorX = emphasis ? Number(x) - axisWidth / 2 : Number(x);
  return (
    <text
      x={anchorX}
      y={y}
      textAnchor={emphasis ? "middle" : "end"}
      dominantBaseline="middle"
      fill="var(--chart-ink)"
      fontSize={emphasis ? 14 : 11}
      fontWeight={emphasis ? 700 : 400}
    >
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={anchorX} dy={index === 0 ? start : lineHeight}>
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
  /** Primeira linha no topo. A lista já vem do maior para o menor. */
  leadersFirst?: boolean;
  /** Quantidade na ponta de cada barra. */
  showValues?: boolean;
  /** Linha entre cada nome do eixo lateral. */
  rowDividers?: boolean;
};

function SellerDividers() {
  const domain = useYAxisDomain();
  const scale = useYAxisScale();
  const plot = usePlotArea();
  const coords = (Array.isArray(domain) ? domain : [])
    .map((name) => scale?.(name))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);
  if (!plot || coords.length === 0) return null;
  const step = coords.length > 1 ? coords[1] - coords[0] : plot.height;
  // A escala devolve o topo de cada faixa. A linha fica nesse topo e depois da última faixa.
  const boundaries = [...coords, coords[coords.length - 1] + step];
  return (
    <g className="seller-dividers" pointerEvents="none">
      {boundaries.map((y, index) => (
        <line
          key={index}
          x1={0}
          x2={plot.x + plot.width + 40}
          y1={y}
          y2={y}
          stroke="var(--chart-ink)"
          strokeOpacity={0.4}
        />
      ))}
    </g>
  );
}

function BarValue({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number | string;
}) {
  const amount = Number(value);
  if (!amount) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      fill="var(--chart-ink)"
      fontSize={12}
      fontWeight={700}
      dominantBaseline="middle"
    >
      {amount.toLocaleString("pt-BR")}
    </text>
  );
}

export function SeriesChart({
  title,
  tip,
  data,
  xKey,
  series,
  kind = "area",
  namesAside = false,
  leadersFirst = false,
  showValues = false,
  rowDividers = false,
}: Props) {
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
  const nameWidth = Math.min(
    rowDividers ? 210 : 168,
    Math.max(rowDividers ? 156 : 120, Math.round(Math.min(longestName, rowDividers ? 18 : 16) * (rowDividers ? 8 : 7)) + 16)
  );
  const frameHeight = aside ? Math.max(280, data.length * (rowDividers ? 88 : 58) + 36) : 280;

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--chart-ink)" }} />
      <YAxis tick={{ fontSize: 11, fill: "var(--chart-ink)" }} allowDecimals={false} width={36} />
      <Tooltip contentStyle={chartTooltipStyle} cursor={chartCursor} />
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
              <BarChart
                data={data}
                layout="vertical"
                barCategoryGap={rowDividers ? "0%" : "10%"}
                barGap={rowDividers ? 3 : 4}
                barSize={rowDividers ? 14 : undefined}
                margin={{ left: 4, right: showValues ? 42 : 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} vertical={!rowDividers} />
                {rowDividers ? <SellerDividers /> : null}
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-ink)" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  width={nameWidth}
                  interval={0}
                  tickLine={!rowDividers}
                  reversed={leadersFirst ? false : undefined}
                  tick={(props) => (
                    <NameTick {...props} axisWidth={nameWidth} emphasis={rowDividers} />
                  )}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  cursor={chartCursor}
                  itemSorter={(item) => {
                    const key = String(item.dataKey ?? "");
                    const index = visible.findIndex((entry) => entry.key === key);
                    return index < 0 ? key : index;
                  }}
                />
                {visible.map((item) => (
                  <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[0, 6, 6, 0]}>
                    {showValues ? <LabelList dataKey={item.key} content={BarValue} /> : null}
                  </Bar>
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
