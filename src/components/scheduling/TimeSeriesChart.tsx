import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export function TimeSeriesChart({
  data,
  title = "Série temporal",
  xKey = "date",
}: Props) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="muted">Evolução preservando datas ISO para filtros coerentes.</p>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e5e8" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Agendamentos" stroke="#404041" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="visitas" name="Visitas" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sucessos" name="Sucessos" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="insucessos" name="Insucessos" stroke="#c02026" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
