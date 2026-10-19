import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#c02026", "#2563eb", "#16a34a", "#404041", "#e21e26", "#929497", "#1e3a8a", "#b45309"];

type Props = {
  data: { label: string; value: number }[];
  title?: string;
  subtitle?: string;
};

/** Donut de motivos de insucesso (% = qtd / total de insucessos do recorte). */
export function MotivoDistributionChart({
  data,
  title = "Motivos de insucesso",
  subtitle = "Percentual sobre o total de insucessos do filtro atual.",
}: Props) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      {data.length === 0 ? (
        <p className="muted">Nenhum insucesso no filtro atual.</p>
      ) : (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={110}
                label={({ name, percent }) =>
                  `${name} ${((percent as number) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
