import { useMemo } from "react";
import { InfoTip } from "../InfoTip";
import { aggregateVendedorMetrics } from "../../lib/scheduling/metrics";
import type { MotivoStats, OrigemStats, VendedorMetrics } from "../../lib/scheduling/types";
import { MotivoLabel } from "./MotivoLabel";

type Props = {
  rows: VendedorMetrics[];
  /** `null` = Todos (resultado geral) */
  selectedVendedor: string | null;
  onSelectVendedor: (vendedor: string | null) => void;
};

const LAIS_KEY = "lais narima ferreira vieira";

function normalizePersonKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isLaisNarima(name: string): boolean {
  const key = normalizePersonKey(name);
  return key === LAIS_KEY || (key.includes("lais") && key.includes("narima"));
}

function MotivosTable({ rows, emptyHint }: { rows: MotivoStats[]; emptyHint: string }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Motivo</th>
            <th>Qtd</th>
            <th>% dos insucessos</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((m) => (
            <tr key={m.motivo}>
              <td>
                <MotivoLabel motivo={m.motivo} ids={m.ids} />
              </td>
              <td>{m.quantidade}</td>
              <td>{m.percentual}%</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="muted">
                {emptyHint}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrigensTable({ rows }: { rows: OrigemStats[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Origem</th>
            <th>Qtd</th>
            <th>%</th>
            <th>Sucessos</th>
            <th>Insucessos</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((o) => (
            <tr key={o.origem}>
              <td>{o.origem}</td>
              <td>{o.quantidade}</td>
              <td>{o.percentual}%</td>
              <td className="num-ok">{o.sucessos}</td>
              <td className="num-bad">{o.insucessos}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Sem origens neste canal.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailBlock({
  v,
  isAll,
}: {
  v: VendedorMetrics;
  isAll: boolean;
}) {
  const pvTitle = isAll
    ? "Pré-Venda (geral de todos os vendedores)"
    : "Pré-Venda (geral do vendedor)";
  const recTitle = "Recepção (à parte)";
  const fechamentoPv = v.totalVisitas
    ? Math.round((v.totalSucesso / v.totalVisitas) * 1000) / 10
    : 0;
  const fechamentoRec = v.visitasRecepcao
    ? Math.round((v.sucessoRecepcao / v.visitasRecepcao) * 1000) / 10
    : 0;

  return (
    <div className="stack">
      <h3>{pvTitle}</h3>
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Agendados</h3>
          <p>{v.totalRecebidos}</p>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{v.totalVisitas}</p>
        </div>
        <div className="kpi-card success num-ok">
          <h3>Sucessos</h3>
          <p>{v.totalSucesso}</p>
        </div>
        <div className="kpi-card num-bad">
          <h3>Insucessos</h3>
          <p>{v.totalInsucesso}</p>
        </div>
        <div className="kpi-card success num-ok">
          <h3>Conversão agendamento/sucesso</h3>
          <p>{v.conversaoPreVenda}%</p>
          <small className="muted">Su/Ag PV</small>
        </div>
        <div className="kpi-card">
          <h3>Conversão visita/sucesso</h3>
          <p>{fechamentoPv}%</p>
          <small className="muted">Su/Visitas PV</small>
        </div>
      </div>

      <h3>Motivos de insucesso — Pré-Venda</h3>
      <MotivosTable rows={v.motivosInsucesso} emptyHint="Sem motivos de Pré-Venda neste filtro." />
      <h3>Origem — Pré-Venda</h3>
      <OrigensTable rows={v.origens} />

      <h3>
        {recTitle}
        <InfoTip>Atendimentos que não passaram pelo pré-atendimento da equipe web.</InfoTip>
      </h3>
      <div className="kpi-grid">
        <div className="kpi-card accent">
          <h3>Agendados</h3>
          <p>{v.totalRecepcao}</p>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{v.visitasRecepcao}</p>
        </div>
        <div className="kpi-card success num-ok">
          <h3>Sucessos</h3>
          <p>{v.sucessoRecepcao}</p>
        </div>
        <div className="kpi-card num-bad">
          <h3>Insucessos</h3>
          <p>{v.insucessosRecepcao}</p>
        </div>
        <div className="kpi-card success num-ok">
          <h3>Conversão agendamento/visita</h3>
          <p>{v.taxaVisitaRecepcao}%</p>
          <small className="muted">Vi/Ag Rec</small>
        </div>
        <div className="kpi-card">
          <h3>Conversão visita/sucesso</h3>
          <p>{fechamentoRec}%</p>
          <small className="muted">Su/Visitas Rec</small>
        </div>
      </div>

      <h3>Motivos de insucesso — Recepção</h3>
      <MotivosTable
        rows={v.motivosInsucessoRecepcao}
        emptyHint="Sem motivos de Recepção neste filtro."
      />
      <h3>Origem — Recepção</h3>
      <OrigensTable rows={v.origensRecepcao} />
    </div>
  );
}

export function VendedorConversionCards({
  rows,
  selectedVendedor,
  onSelectVendedor,
}: Props) {
  const cardRows = useMemo(
    () =>
      [...rows]
        .filter((v) => !isLaisNarima(v.vendedor))
        .filter((v) => v.totalRecebidos + v.totalRecepcao >= 1)
        .sort(
          (a, b) =>
            b.conversaoGeral - a.conversaoGeral ||
            a.vendedor.localeCompare(b.vendedor, "pt-BR")
        ),
    [rows]
  );

  const detail = useMemo(() => {
    if (!selectedVendedor) return aggregateVendedorMetrics(rows);
    return rows.find((r) => r.vendedor === selectedVendedor) ?? aggregateVendedorMetrics(rows);
  }, [rows, selectedVendedor]);

  const isAll = !selectedVendedor;

  return (
    <div className="card">
      <h2>
        Desempenho por vendedor
        <InfoTip>
          Cards com a conversão de cada vendedor (Pré-Venda), do maior para o menor. Só entram
          quem teve pelo menos 1 agendamento. Abaixo: resultado geral de todos, ou só do vendedor
          escolhido em <strong>Ver vendedor</strong>. Recepção fica à parte.
        </InfoTip>
      </h2>
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {cardRows.map((v) => (
          <button
            key={v.vendedor}
            type="button"
            className={`kpi-card kpi-card--vendedor ${selectedVendedor === v.vendedor ? "accent" : ""}`}
            style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
            onClick={() =>
              onSelectVendedor(selectedVendedor === v.vendedor ? null : v.vendedor)
            }
          >
            <h3>{v.vendedor}</h3>
            <p>{v.conversaoGeral}%</p>
            <small className="muted">
              Pré-Venda <span className="num-ok">{v.sucessoPreVenda}</span>/{v.totalPreVenda} ·
              Recepção <span className="num-ok">{v.sucessoRecepcao}</span>/{v.totalRecepcao} (
              {v.conversaoRecepcao}%)
            </small>
          </button>
        ))}
        {cardRows.length === 0 && (
          <p className="muted" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Nenhum vendedor com agendamento no filtro atual.
          </p>
        )}
      </div>

      <label style={{ display: "block", marginBottom: 12 }}>
        Ver vendedor
        <select
          value={selectedVendedor || ""}
          onChange={(e) => onSelectVendedor(e.target.value || null)}
          style={{ display: "block", marginTop: 6, width: "100%", maxWidth: 420 }}
        >
          <option value="">Todos (resultado geral)</option>
          {rows.map((v) => (
            <option key={v.vendedor} value={v.vendedor}>
              {v.vendedor} (PV {v.totalPreVenda} · Rec {v.totalRecepcao})
            </option>
          ))}
        </select>
      </label>

      <DetailBlock v={detail} isAll={isAll} />
    </div>
  );
}
