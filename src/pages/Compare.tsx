import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { ClearFiltersButton, filterActiveClass } from "../components/ClearFiltersButton";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  formatMonthLabel,
  listMonthOptions,
  listSdrOptions,
  monthBounds,
  monthKeyFromRange,
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
  const months = useMemo(() => listMonthOptions(rows), [rows]);

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
        showPeriod={false}
        onChange={(next) => setFilters({ sdr: next.sdr, canal: next.canal })}
      />

      <div className="filters filters--compare" role="search" aria-label="Filtros do período">
        <label>
          Mês A
          <select
            className={filterActiveClass(Boolean(monthKeyFromRange(fromA, toA)))}
            value={monthKeyFromRange(fromA, toA)}
            aria-label="Mês do período A"
            onChange={(e) => {
              const ym = e.target.value;
              if (!ym) {
                setFromA("");
                setToA("");
                return;
              }
              const range = monthBounds(ym);
              setFromA(range.from);
              setToA(range.to);
            }}
          >
            <option value="">Escolher mês</option>
            {months.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </label>
        <label>
          A · de
          <input
            className={filterActiveClass(Boolean(fromA))}
            type="date"
            value={fromA}
            onChange={(e) => setFromA(e.target.value)}
          />
        </label>
        <label>
          A · até
          <input
            className={filterActiveClass(Boolean(toA))}
            type="date"
            value={toA}
            onChange={(e) => setToA(e.target.value)}
          />
        </label>
        <label>
          Mês B
          <select
            className={filterActiveClass(Boolean(monthKeyFromRange(fromB, toB)))}
            value={monthKeyFromRange(fromB, toB)}
            aria-label="Mês do período B"
            onChange={(e) => {
              const ym = e.target.value;
              if (!ym) {
                setFromB("");
                setToB("");
                return;
              }
              const range = monthBounds(ym);
              setFromB(range.from);
              setToB(range.to);
            }}
          >
            <option value="">Escolher mês</option>
            {months.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </label>
        <label>
          B · de
          <input
            className={filterActiveClass(Boolean(fromB))}
            type="date"
            value={fromB}
            onChange={(e) => setFromB(e.target.value)}
          />
        </label>
        <label>
          B · até
          <input
            className={filterActiveClass(Boolean(toB))}
            type="date"
            value={toB}
            onChange={(e) => setToB(e.target.value)}
          />
        </label>
        <ClearFiltersButton
          onClick={() => {
            setFromA("");
            setToA("");
            setFromB("");
            setToB("");
          }}
        />
      </div>

      {!result && <p className="muted">Escolha o mês ou as datas de cada período.</p>}
      {result && <KpiCompare label="Período A × período B" a={result.a} b={result.b} />}
    </>
  );
}
