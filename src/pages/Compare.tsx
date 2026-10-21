import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  listSdrOptions,
  sliceCampanhas,
  type CampanhaFilters,
  type CampanhaKpis,
} from "../lib/campanhas/analytics";

function delta(a: number, b: number) {
  const n = b - a;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}`;
}

function KpiCompare({
  label,
  a,
  b,
}: {
  label: string;
  a: CampanhaKpis;
  b: CampanhaKpis;
}) {
  const rows: { name: string; va: number; vb: number }[] = [
    { name: "Atendimentos", va: a.atendimentos, vb: b.atendimentos },
    { name: "Visitas", va: a.visitas, vb: b.visitas },
    { name: "Agendamentos", va: a.agendamentos, vb: b.agendamentos },
    { name: "Sucessos", va: a.sucessos, vb: b.sucessos },
  ];
  return (
    <div className="card">
      <h2>{label}</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Período A</th>
              <th>Período B</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>{row.va.toLocaleString("pt-BR")}</td>
                <td>{row.vb.toLocaleString("pt-BR")}</td>
                <td className={row.vb - row.va > 0 ? "positive" : row.vb - row.va < 0 ? "delta-neg" : "zero"}>
                  {delta(row.va, row.vb)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Compare() {
  const { rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>({});
  const [fromA, setFromA] = useState("");
  const [toA, setToA] = useState("");
  const [fromB, setFromB] = useState("");
  const [toB, setToB] = useState("");
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);

  const result = useMemo(() => {
    if (!fromA || !toA || !fromB || !toB) return null;
    const identity = { sdr: filters.sdr, canal: filters.canal };
    return {
      a: sliceCampanhas(rows, { ...identity, from: fromA, to: toA }).kpis,
      b: sliceCampanhas(rows, { ...identity, from: fromB, to: toB }).kpis,
    };
  }, [rows, filters.sdr, filters.canal, fromA, toA, fromB, toB]);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <CampanhasFilters
        filters={{ sdr: filters.sdr, canal: filters.canal }}
        sdrs={sdrs}
        onChange={(next) => setFilters({ sdr: next.sdr, canal: next.canal })}
      />

      <div className="filters">
        <label>
          A · de
          <input type="date" value={fromA} onChange={(e) => setFromA(e.target.value)} />
        </label>
        <label>
          A · até
          <input type="date" value={toA} onChange={(e) => setToA(e.target.value)} />
        </label>
        <label>
          B · de
          <input type="date" value={fromB} onChange={(e) => setFromB(e.target.value)} />
        </label>
        <label>
          B · até
          <input type="date" value={toB} onChange={(e) => setToB(e.target.value)} />
        </label>
      </div>

      {!result && <p className="muted">Escolha as duas datas de cada período.</p>}
      {result && <KpiCompare label="Período A × período B" a={result.a} b={result.b} />}
    </>
  );
}
