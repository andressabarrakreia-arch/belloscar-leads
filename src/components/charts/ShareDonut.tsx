import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { InfoTip } from "../InfoTip";
import { CHART_PALETTE, chartTooltipStyle } from "./chartTheme";

type Slice = { label: string; value: number };

type Props = {
  title: string;
  tip?: string;
  data: Slice[];
};

export function ShareDonut({ title, tip, data }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const slices = data.filter((item) => item.value > 0);
  const total = slices.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card chart-card">
      <h2>
        {title}
        {tip ? <InfoTip>{tip}</InfoTip> : null}
      </h2>
      {slices.length === 0 ? (
        <p className="muted">Sem pontos neste recorte.</p>
      ) : (
        <div className="chart-frame chart-frame--donut">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius={68}
                outerRadius={104}
                paddingAngle={2}
                onClick={(_, index) => {
                  const label = slices[index]?.label ?? "";
                  setActive((current) => (current === label ? null : label));
                }}
              >
                {slices.map((item, index) => (
                  <Cell
                    key={item.label}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                    opacity={active && active !== item.label ? 0.35 : 1}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="chart-donut-list">
            {slices.map((item, index) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={active === item.label ? "is-on" : ""}
                  onClick={() => setActive((current) => (current === item.label ? null : item.label))}
                >
                  <span style={{ background: CHART_PALETTE[index % CHART_PALETTE.length] }} />
                  {item.label}
                  <strong>
                    {item.value.toLocaleString("pt-BR")}
                    {total ? ` · ${Math.round((item.value / total) * 100)}%` : ""}
                  </strong>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
