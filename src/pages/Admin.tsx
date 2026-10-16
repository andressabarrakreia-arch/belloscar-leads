import { useEffect, useState } from "react";
import { applyImport, downloadDataset, loadDataset } from "../lib/dataset";
import { parseExcelArrayBuffer } from "../lib/parseExcel";
import type { Dataset, ImportMeta } from "../lib/types";

const PIN = import.meta.env.VITE_ADMIN_PIN || "belloscar";
const AUTH_KEY = "belloscar_admin_ok";

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<Dataset | null>(null);
  const [meta, setMeta] = useState<ImportMeta | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    loadDataset().then(setDataset);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pin === PIN) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setError(null);
    } else {
      setError("PIN incorreto");
    }
  }

  async function onFile(file: File | null) {
    if (!file || !dataset) return;
    setBusy(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelArrayBuffer(buffer);
      const result = applyImport(dataset, parsed, file.name, label || file.name);
      setPreview(result.dataset);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar planilha");
      setPreview(null);
      setMeta(null);
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <h1>Gestão Belloscar</h1>
          <p>Área restrita para importar planilhas e atualizar o dataset publicado.</p>
          <form onSubmit={login}>
            <input
              type="password"
              placeholder="PIN de gestão"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button className="btn" type="submit">
              Entrar
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>Importar planilha (.xlsx)</h2>
        <p className="muted">
          O processamento acontece no seu navegador — sem servidor. Depois baixe o{" "}
          <code>dataset.json</code>, substitua em <code>public/data/dataset.json</code>, faça
          commit e push. O GitHub Pages atualiza sozinho.
        </p>
        <div className="stack">
          <label>
            Rótulo do lote (opcional)
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Quinzena 08–15/10"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
          <div className="dropzone">
            <input
              type="file"
              accept=".xlsx,.xls"
              disabled={busy}
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            <p className="muted">Selecione a planilha de leads da campanha</p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {meta && preview && (
        <div className="card">
          <h2>Resultado do processamento</h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Recebidos</h3>
              <p>{meta.received}</p>
            </div>
            <div className="kpi-card success">
              <h3>Mantidos (lote)</h3>
              <p>{meta.kept}</p>
            </div>
            <div className="kpi-card accent">
              <h3>Removidos (dedupe)</h3>
              <p>{meta.removed}</p>
            </div>
            <div className="kpi-card">
              <h3>Total no dataset</h3>
              <p>{preview.leads.length}</p>
            </div>
          </div>
          {meta.notes.length > 0 && (
            <div className="muted">
              <strong>Amostra de dedupe:</strong>
              <ul>
                {meta.notes.slice(0, 8).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="row">
            <button className="btn" type="button" onClick={() => downloadDataset(preview)}>
              Baixar dataset.json
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setDataset(preview);
                setPreview(null);
                setMeta(null);
              }}
            >
              Usar como base nesta sessão
            </button>
          </div>
          <div className="success-box" style={{ marginTop: 12 }}>
            1) Salve o arquivo em <code>public/data/dataset.json</code>
            <br />
            2) Commit + push no GitHub
            <br />
            3) Aguarde o Actions publicar no GitHub Pages
          </div>
        </div>
      )}

      {dataset && (
        <div className="card">
          <h2>Dataset atual publicado</h2>
          <p>
            {dataset.leads.length} leads · atualizado em{" "}
            {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
          </p>
          <h3>Últimos imports</h3>
          <ul className="muted">
            {dataset.imports.slice(0, 5).map((imp) => (
              <li key={imp.at + imp.fileName}>
                {imp.label} — recebidos {imp.received}, mantidos {imp.kept}, removidos{" "}
                {imp.removed}
              </li>
            ))}
            {dataset.imports.length === 0 && <li>Nenhum import registrado ainda.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
