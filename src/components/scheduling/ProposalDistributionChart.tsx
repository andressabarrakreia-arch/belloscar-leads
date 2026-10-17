import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#c02026", "#2563eb", "#16a34a", "#404041", "#e21e26", "#929497", "#1e3a8a"];

type Props = {
  data: { label: string; value: number }[];
};

export function ProposalDistributionChart({ data }: Props) {
  return (
    <div className="card">
      <h2>Distribuição de propostas</h2>
      <p className="muted">Compra, Venda, Troca, Consignação, Financiamento e não informado.</p>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
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
    </div>
  );
}
