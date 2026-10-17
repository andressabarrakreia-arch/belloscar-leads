import { useState } from "react";
import type { VendedorMetrics } from "../../lib/scheduling/types";

type Props = {
  rows: VendedorMetrics[];
};

export function VendedorConversionCards({ rows }: Props) {
  const [openId, setOpenId] = useState<string | null>(rows[0]?.vendedor ?? null);

  return (
    <div className="card">
      <h2>Desempenho por vendedor</h2>
      <p className="muted">
        Conversão geral e por canal (Pré-Venda vs Recepção), motivos de insucesso e origem dos
        atendimentos.
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
              {v.totalSucesso}/{v.totalRecebidos} sucessos · Pré-Venda {v.conversaoPreVenda}% ·
              Recepção {v.conversaoRecepcao}%
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
                {v.vendedor} ({v.totalRecebidos})
              </option>
            ))}
          </select>
        </label>
      )}

      {rows.map((v) =>
        v.vendedor === openId ? (
          <div key={v.vendedor} className="stack">
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
              <div className="kpi-card">
                <h3>Conv. geral</h3>
                <p>{v.conversaoGeral}%</p>
              </div>
              <div className="kpi-card">
                <h3>Conv. Pré-Venda</h3>
                <p>{v.conversaoPreVenda}%</p>
                <small className="muted">
                  {v.sucessoPreVenda}/{v.totalPreVenda}
                </small>
              </div>
              <div className="kpi-card">
                <h3>Conv. Recepção</h3>
                <p>{v.conversaoRecepcao}%</p>
                <small className="muted">
                  {v.sucessoRecepcao}/{v.totalRecepcao}
                </small>
              </div>
            </div>

            <h3>Motivos de insucesso</h3>
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
                  {v.motivosInsucesso.slice(0, 20).map((m) => (
                    <tr key={m.motivo}>
                      <td>{m.motivo}</td>
                      <td>{m.quantidade}</td>
                      <td>{m.percentual}%</td>
                    </tr>
                  ))}
                  {v.motivosInsucesso.length === 0 && (
                    <tr>
                      <td colSpan={3} className="muted">
                        Sem motivos (importe a planilha de insucessos para cruzar por ID).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3>Canais / origem</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Origem</th>
                    <th>Qtd</th>
                    <th>% do vendedor</th>
                    <th>Sucessos</th>
                    <th>Insucessos</th>
                  </tr>
                </thead>
                <tbody>
                  {v.origens.slice(0, 20).map((o) => (
                    <tr key={o.origem}>
                      <td>{o.origem}</td>
                      <td>{o.quantidade}</td>
                      <td>{o.percentual}%</td>
                      <td>{o.sucessos}</td>
                      <td>{o.insucessos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
