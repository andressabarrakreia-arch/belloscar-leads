import { useEffect, useState } from "react";
import { ADMIN_PIN, isAdminAuthed, setAdminAuthed } from "../lib/adminAuth";
import { applyImport, downloadDataset, loadDataset } from "../lib/dataset";
import {
  GITHUB_DEFAULTS,
  clearStoredToken,
  getStoredToken,
  hasStoredToken,
  maskToken,
  publishDatasetToGitHub,
  setStoredToken,
} from "../lib/githubPublish";
import { parseExcelArrayBuffer } from "../lib/parseExcel";
import type { Dataset, ImportMeta } from "../lib/types";

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [masked, setMasked] = useState("");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<Dataset | null>(null);
  const [meta, setMeta] = useState<ImportMeta | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [showReplaceToken, setShowReplaceToken] = useState(false);

  function refreshTokenState() {
    const stored = getStoredToken();
    setTokenSaved(Boolean(stored));
    setMasked(stored ? maskToken(stored) : "");
  }

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      setAdminAuthed(true);
    }
    refreshTokenState();
    loadDataset().then(setDataset);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAdminAuthed(true);
      setAuthed(true);
      setError(null);
    } else {
      setError("PIN incorreto");
    }
  }

  function saveTokenFromInput() {
    if (!tokenInput.trim()) {
      setError("Cole o token antes de salvar.");
      return;
    }
    setStoredToken(tokenInput);
    setTokenInput("");
    setShowReplaceToken(false);
    refreshTokenState();
    setSuccess("Token salvo neste computador (localStorage). Não será pedido de novo neste navegador.");
    setError(null);
  }

  async function publish(next: Dataset, importLabel: string) {
    const pat = getStoredToken();
    if (!pat) {
      throw new Error("Salve o token GitHub uma vez neste computador (abaixo) para publicar.");
    }
    const result = await publishDatasetToGitHub(
      next,
      pat,
      `Agrega leads: ${importLabel} (${next.leads.length} total)`
    );
    setCommitUrl(result.commitUrl);
    setDataset(next);
    setSuccess(
      "Publicado no GitHub. O site da equipe atualiza em 1–2 minutos (GitHub Actions)."
    );
  }

  async function onFile(file: File | null) {
    if (!file || !dataset) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    setCommitUrl(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelArrayBuffer(buffer);
      const result = applyImport(dataset, parsed, file.name, label || file.name);
      setPreview(result.dataset);
      setMeta(result.meta);

      if (autoPublish) {
        await publish(result.dataset, result.meta.label);
        setPreview(result.dataset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar/publicar");
    } finally {
      setBusy(false);
    }
  }

  async function onPublishClick() {
    if (!preview) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await publish(preview, meta?.label || "import");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao publicar");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    const logo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Andressa Car Metrics" />
          <h1>
            Gestão Bellos<span className="car" style={{ color: "var(--brand-red)", fontWeight: 800 }}>Car</span>
          </h1>
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
        <h2>Token GitHub (salvo neste computador)</h2>
        <p className="muted">
          O token fica no <strong>localStorage</strong> deste navegador — não vai para o repositório
          público. Repo:{" "}
          <code>
            {GITHUB_DEFAULTS.owner}/{GITHUB_DEFAULTS.repo}
          </code>
          . Permissão necessária: <strong>Contents: Read and write</strong>.
        </p>

        {tokenSaved && !showReplaceToken ? (
          <div className="stack">
            <div className="success-box">
              Token configurado: <code>{masked}</code>
              <br />
              Próximos uploads publicam automaticamente neste navegador.
            </div>
            <div className="row">
              <button
                className="btn secondary"
                type="button"
                onClick={() => setShowReplaceToken(true)}
              >
                Substituir token
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  clearStoredToken();
                  refreshTokenState();
                  setSuccess("Token removido deste navegador.");
                }}
              >
                Remover token
              </button>
            </div>
          </div>
        ) : (
          <div className="stack">
            {!hasStoredToken() && (
              <p className="muted">
                Cole o token <strong>uma única vez</strong>. Depois não será necessário informar de
                novo neste computador.
              </p>
            )}
            <label>
              Personal Access Token
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="github_pat_… ou ghp_…"
                style={{ width: "100%", marginTop: 6 }}
                autoComplete="off"
              />
            </label>
            <div className="row">
              <button className="btn" type="button" onClick={saveTokenFromInput}>
                Salvar neste computador
              </button>
              {showReplaceToken && (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setShowReplaceToken(false)}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        <label className="row" style={{ gap: 8, marginTop: 12 }}>
          <input
            type="checkbox"
            checked={autoPublish}
            onChange={(e) => setAutoPublish(e.target.checked)}
          />
          Publicar automaticamente ao enviar a planilha
        </label>
      </div>

      <div className="card">
        <h2>Importar planilha (.xlsx)</h2>
        <p className="muted">
          A página da equipe em Campanhas não usa mais este arquivo. Ela lê a base de
          Agendamentos e fica só com os IDs de Facebook e Instagram do LEADS GERAL. Para mudar
          esses números, publique em Gestão de Agendamentos.
        </p>
        <p className="muted">
          O envio abaixo ainda agrega o histórico antigo deste módulo (dedupe mensal por
          telefone) em <strong>dataset.json</strong>.
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
              disabled={busy || (autoPublish && !tokenSaved)}
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            <p className="muted">
              {busy
                ? "Processando e publicando…"
                : autoPublish && !tokenSaved
                  ? "Salve o token acima antes de enviar a planilha"
                  : "Selecione a planilha de leads da campanha"}
            </p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success-box">
            {success}
            {commitUrl && (
              <>
                <br />
                <a href={commitUrl} target="_blank" rel="noreferrer">
                  Ver commit no GitHub
                </a>
              </>
            )}
          </div>
        )}
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
            <button className="btn" type="button" disabled={busy || !tokenSaved} onClick={onPublishClick}>
              Publicar no GitHub agora
            </button>
            <button className="btn secondary" type="button" onClick={() => downloadDataset(preview)}>
              Baixar backup dataset.json
            </button>
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
