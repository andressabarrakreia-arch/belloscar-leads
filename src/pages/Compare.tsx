import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { SeriesChart } from "../components/charts/SeriesChart";
import { CHART_COLORS } from "../components/charts/chartTheme";
import { InteractiveTable } from "../components/InteractiveTable";
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
import { currentMonthKey, monthRange } from "../lib/dates";

function previousMonthKey(date = new Date()): string {
  return currentMonthKey(new Date(date.getFullYear(), date.getMonth() - 1, 1));
}

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
      <div className="charts">
        <SeriesChart
          title="Período A e B"
          tip="Os mesmos quatro números da tabela."
          data={rows.map((row) => ({ nome: row.name, a: row.va, b: row.vb }))}
          xKey="nome"
          kind="bar"
          series={[
            { key: "a", name: "Período A", color: CHART_COLORS.charcoal },
            { key: "b", name: "Período B", color: CHART_COLORS.red },
          ]}
        />
        <SeriesChart
          title="Diferença B − A"
          data={rows.map((row) => ({ nome: row.name, delta: row.vb - row.va }))}
          xKey="nome"
          kind="bar"
          series={[{ key: "delta", name: "Δ", color: CHART_COLORS.blue }]}
        />
      </div>
      <InteractiveTable
        rows={rows}
        rowKey={(row) => row.name}
        columns={[
          { key: "name", label: "Indicador", sortValue: (row) => row.name, render: (row) => <strong>{row.name}</strong> },
          { key: "a", label: "Período A", sortValue: (row) => row.va, render: (row) => row.va.toLocaleString("pt-BR") },
          { key: "b", label: "Período B", sortValue: (row) => row.vb, render: (row) => row.vb.toLocaleString("pt-BR") },
          { key: "d", label: "Δ", sortValue: (row) => row.vb - row.va, render: (row) => delta(row.va, row.vb) },
        ]}
      />
    </div>
  );
}

export function Compare() {
  const { rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>({});
  const mesAnterior = monthRange(previousMonthKey());
  const mesAtual = monthRange(currentMonthKey());
  const [fromA, setFromA] = useState(mesAnterior.from);
  const [toA, setToA] = useState(mesAnterior.to);
  const [fromB, setFromB] = useState(mesAtual.from);
  const [toB, setToB] = useState(mesAtual.to);
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
