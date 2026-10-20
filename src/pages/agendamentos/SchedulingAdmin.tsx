import { useEffect, useState } from "react";
import { SchedulingUploader } from "../../components/scheduling/SchedulingUploader";
import { ADMIN_PIN, isAdminAuthed, setAdminAuthed } from "../../lib/adminAuth";
import {
  clearStoredToken,
  getStoredToken,
  maskToken,
  publishJsonToGitHub,
  setStoredToken,
} from "../../lib/githubPublish";
import { applySchedulingImport } from "../../lib/scheduling/mergeById";
import { clientsForExport } from "../../lib/scheduling/metrics";
import { parseSchedulingArrayBuffer } from "../../lib/scheduling/parseSchedulingExcel";
import {
  downloadClientsCsv,
  downloadSchedulingDataset,
  loadSchedulingAdminConfig,
  loadSchedulingDataset,
  saveLocalSchedulingDataset,
  saveSchedulingAdminConfig,
  SCHEDULING_GITHUB_PATH,
} from "../../lib/scheduling/storage";
import type {
  SchedulingAdminConfig,
  SchedulingDataset,
  SchedulingImportMeta,
} from "../../lib/scheduling/types";

export function SchedulingAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [masked, setMasked] = useState("");
  const [dataset, setDataset] = useState<SchedulingDataset | null>(null);
  const [preview, setPreview] = useState<SchedulingDataset | null>(null);
  const [meta, setMeta] = useState<SchedulingImportMeta | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showReplaceToken, setShowReplaceToken] = useState(false);
  const [config, setConfig] = useState<SchedulingAdminConfig>(() => loadSchedulingAdminConfig());

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
    loadSchedulingDataset().then(setDataset);
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

  function updateConfig(next: SchedulingAdminConfig) {
    setConfig(next);
    saveSchedulingAdminConfig(next);
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
    setSuccess("Token salvo neste computador (localStorage).");
    setError(null);
  }

  async function publish(next: SchedulingDataset, importLabel: string) {
    const pat = getStoredToken();
    if (!pat) {
      throw new Error("Salve o token GitHub uma vez neste computador para publicar.");
    }
    const result = await publishJsonToGitHub(next, pat, {
      path: SCHEDULING_GITHUB_PATH,
      message: `Agrega agendamentos: ${importLabel} (${next.items.length} total)`,
    });
    setCommitUrl(result.commitUrl);
    setDataset(next);
    saveLocalSchedulingDataset(next);
    setSuccess(
      "Publicado no GitHub (dataset de agendamentos). O site atualiza em 1–2 minutos."
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
      const { kind, rows } = parseSchedulingArrayBuffer(buffer);
      const result = applySchedulingImport(
        dataset,
        rows,
        kind,
        file.name,
        label || file.name
      );
      setPreview(result.dataset);
      setMeta(result.meta);
      saveLocalSchedulingDataset(result.dataset);
      setDataset(result.dataset);

      if (config.autoPublish) {
        await publish(result.dataset, result.meta.label);
        setPreview(result.dataset);
      } else {
        setSuccess(
          `Importação local OK (${kind}): +${result.meta.kept} novos, ${result.meta.enriched} enriquecidos.`
        );
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

  function onExportClients() {
    const source = preview || dataset;
    if (!source) return;
    const clients = clientsForExport(source.items);
    downloadClientsCsv(clients);
    updateConfig({ ...config, lastExportAt: new Date().toISOString() });
    setSuccess(`Exportados ${clients.length} clientes (nome, email, telefone).`);
  }

  if (!authed) {
    const logo = `${import.meta.env.BASE_URL}brand/bc-icon.png`;
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="BellosCar" width={64} height={64} />
          <h1>
            Gestão · Agendamentos
          </h1>
          <p>Vendas Web · Andressa Barra — mesmo PIN do admin unificado.</p>
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
      <div className="card report-signature">
        <p>
          <strong>Setor:</strong> Vendas Web · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Configurações isoladas em <code>agendamentos_admin_config</code> /{" "}
          <code>agendamentos_dataset</code>.
        </p>
      </div>

      <div className="card">
        <h2>Token GitHub (salvo neste computador)</h2>
        <p className="muted">
          Mesmo token do admin unificado. Publica em <code>{SCHEDULING_GITHUB_PATH}</code> — não
          altera o dataset de Campanhas.
        </p>

        {tokenSaved && !showReplaceToken ? (
          <div className="stack">
            <div className="success-box">
              Token configurado: <code>{masked}</code>
            </div>
            <div className="row">
              <button className="btn secondary" type="button" onClick={() => setShowReplaceToken(true)}>
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
            checked={config.autoPublish}
            onChange={(e) => updateConfig({ ...config, autoPublish: e.target.checked })}
          />
          Publicar automaticamente ao enviar a planilha
        </label>
      </div>

      <div className="card">
        <h2>Importar planilha (.xlsx / .csv)</h2>
        <p className="muted">
          Dedupe <strong>somente por ID</strong>. Após cada upload a base{" "}
          <strong>recruza automaticamente</strong> origem/tipo entre LEADS ↔ REALIZADOS ↔
          agenda ↔ SUCESSOS (não precisa reenviar tudo). Fontes:{" "}
          <strong>AGENDAMENTOS</strong> (Agendado em) · <strong>REALIZADOS</strong> (Atendido
          em + Visita) · <strong>SUCESSOS</strong> (Finalizado em) ·{" "}
          <strong>LEADS GERAL</strong> (origem/volume) · INSUCESSOS enriquecem agenda.
        </p>
        <div className="stack">
          <label>
            Rótulo do lote (opcional)
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Agendamentos até 15/10"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
          <SchedulingUploader
            busy={busy}
            disabled={config.autoPublish && !tokenSaved}
            onFile={onFile}
            hint={
              config.autoPublish && !tokenSaved
                ? "Salve o token acima antes de enviar"
                : undefined
            }
          />
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
          <p className="muted">Tipo detectado: {meta.kind}</p>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Recebidos</h3>
              <p>{meta.received}</p>
            </div>
            <div className="kpi-card success">
              <h3>Novos (id)</h3>
              <p>{meta.kept}</p>
            </div>
            <div className="kpi-card">
              <h3>Enriquecidos</h3>
              <p>{meta.enriched}</p>
            </div>
            <div className="kpi-card accent">
              <h3>Ignorados/dup</h3>
              <p>{meta.removed}</p>
            </div>
            <div className="kpi-card">
              <h3>Total</h3>
              <p>{preview.items.length}</p>
            </div>
          </div>
          <div className="row">
            <button
              className="btn"
              type="button"
              disabled={busy || !tokenSaved}
              onClick={onPublishClick}
            >
              Publicar no GitHub agora
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => downloadSchedulingDataset(preview)}
            >
              Baixar backup JSON
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Exportar clientes</h2>
        <p className="muted">Lista com nome, email e telefone (dedupe local da exportação).</p>
        <button className="btn" type="button" onClick={onExportClients} disabled={!dataset}>
          Exportar CSV de clientes
        </button>
        {config.lastExportAt && (
          <p className="muted">Última exportação: {new Date(config.lastExportAt).toLocaleString("pt-BR")}</p>
        )}
      </div>

      {dataset && (
        <div className="card">
          <h2>Dataset atual (agendamentos)</h2>
          <p>
            {dataset.items.length} agendamentos · {(dataset.realizados || []).length}{" "}
            realizados · {(dataset.sucessosEventos || []).length} sucessos · atualizado{" "}
            {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
          </p>
          <h3>Últimos imports</h3>
          <ul className="muted">
            {dataset.imports.slice(0, 5).map((imp) => (
              <li key={imp.at + imp.fileName}>
                [{imp.kind}] {imp.label} — recebidos {imp.received}, novos {imp.kept},
                enriquecidos {imp.enriched}
              </li>
            ))}
            {dataset.imports.length === 0 && <li>Nenhum import registrado ainda.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
