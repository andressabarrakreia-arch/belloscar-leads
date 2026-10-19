import { useState } from "react";
import type { MotivoStats, OrigemStats, VendedorMetrics } from "../../lib/scheduling/types";

type Props = {
  rows: VendedorMetrics[];
};

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
              <td>{m.motivo}</td>
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
              <td>{o.sucessos}</td>
              <td>{o.insucessos}</td>
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

export function VendedorConversionCards({ rows }: Props) {
  const [openId, setOpenId] = useState<string | null>(rows[0]?.vendedor ?? null);

  return (
    <div className="card">
      <h2>Desempenho por vendedor</h2>
      <p className="muted">
        Totais e conversão geral = apenas Pré-Venda. Recepção (clientes que chegaram direto na
        loja) fica com índices próprios, sem entrar no geral.
      </p>
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {rows.slice(0, 8).map((v) => (
          <button
            key={v.vendedor}
            type="button"
            className={`kpi-card ${openId === v.vendedor ? "accent" : ""}`}
            style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
            onClick={() => setOpenId(v.vendedor)}
          >
            <h3>{v.vendedor}</h3>
            <p>{v.conversaoGeral}%</p>
            <small className="muted">
              Pré-Venda {v.sucessoPreVenda}/{v.totalPreVenda} · Recepção {v.sucessoRecepcao}/
              {v.totalRecepcao} ({v.conversaoRecepcao}%)
            </small>
          </button>
        ))}
      </div>

      {rows.length > 8 && (
        <label style={{ display: "block", marginBottom: 12 }}>
          Ver vendedor
          <select
            value={openId || ""}
            onChange={(e) => setOpenId(e.target.value)}
            style={{ display: "block", marginTop: 6, width: "100%", maxWidth: 420 }}
          >
            {rows.map((v) => (
              <option key={v.vendedor} value={v.vendedor}>
                {v.vendedor} (PV {v.totalPreVenda} · Rec {v.totalRecepcao})
              </option>
            ))}
          </select>
        </label>
      )}

      {rows.map((v) =>
        v.vendedor === openId ? (
          <div key={v.vendedor} className="stack">
            <h3>Pré-Venda (geral do vendedor)</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <h3>Recebidos</h3>
                <p>{v.totalRecebidos}</p>
              </div>
              <div className="kpi-card">
                <h3>Visitas</h3>
                <p>{v.totalVisitas}</p>
              </div>
              <div className="kpi-card success">
                <h3>Sucessos</h3>
                <p>{v.totalSucesso}</p>
              </div>
              <div className="kpi-card accent">
                <h3>Insucessos</h3>
                <p>{v.totalInsucesso}</p>
              </div>
              <div className="kpi-card success">
                <h3>Conv. Pré-Venda</h3>
                <p>{v.conversaoPreVenda}%</p>
                <small className="muted">Su/Recebidos PV</small>
              </div>
              <div className="kpi-card">
                <h3>Fechamento salão</h3>
                <p>
                  {v.totalVisitas
                    ? Math.round((v.totalSucesso / v.totalVisitas) * 1000) / 10
                    : 0}
                  %
                </p>
                <small className="muted">Su/Visitas PV</small>
              </div>
            </div>

            <h3>Motivos de insucesso — Pré-Venda</h3>
            <MotivosTable
              rows={v.motivosInsucesso}
              emptyHint="Sem motivos de Pré-Venda neste filtro."
            />
            <h3>Origem — Pré-Venda</h3>
            <OrigensTable rows={v.origens} />

            <h3>Recepção (à parte — loja / Gabriela)</h3>
            <p className="muted">
              Atendimentos que não passaram pelo pré-atendimento da equipe web.
            </p>
            <div className="kpi-grid">
              <div className="kpi-card accent">
                <h3>Recebidos</h3>
                <p>{v.totalRecepcao}</p>
              </div>
              <div className="kpi-card">
                <h3>Visitas</h3>
                <p>{v.visitasRecepcao}</p>
              </div>
              <div className="kpi-card success">
                <h3>Sucessos</h3>
                <p>{v.sucessoRecepcao}</p>
              </div>
              <div className="kpi-card">
                <h3>Insucessos</h3>
                <p>{v.insucessosRecepcao}</p>
              </div>
              <div className="kpi-card">
                <h3>Show-up Rec</h3>
                <p>{v.taxaVisitaRecepcao}%</p>
                <small className="muted">Vi/Recebidos Rec</small>
              </div>
              <div className="kpi-card success">
                <h3>Conv. Recepção</h3>
                <p>{v.conversaoRecepcao}%</p>
                <small className="muted">Su/Recebidos Rec</small>
              </div>
              <div className="kpi-card">
                <h3>Fechamento salão Rec</h3>
                <p>
                  {v.visitasRecepcao
                    ? Math.round((v.sucessoRecepcao / v.visitasRecepcao) * 1000) / 10
                    : 0}
                  %
                </p>
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
        ) : null
      )}
    </div>
  );
}
