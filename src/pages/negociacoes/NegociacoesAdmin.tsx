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
import {
  applyAvaliacoesImport,
  applyNegociacoesImport,
} from "../../lib/negociacoes/mergeByNegociacao";
import {
  isAvaliacoesSheet,
  parseAvaliacoesArrayBuffer,
} from "../../lib/negociacoes/parseAvaliacoesExcel";
import { parseNegociacoesArrayBuffer } from "../../lib/negociacoes/parseNegociacoesExcel";
import {
  downloadNegociacoesDataset,
  loadNegociacoesAdminConfig,
  loadNegociacoesDataset,
  NEGOCIACOES_GITHUB_PATH,
  saveLocalNegociacoesDataset,
  saveNegociacoesAdminConfig,
} from "../../lib/negociacoes/storage";
import type {
  NegociacoesAdminConfig,
  NegociacoesDataset,
  NegociacoesImportMeta,
} from "../../lib/negociacoes/types";

export function NegociacoesAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [masked, setMasked] = useState("");
  const [dataset, setDataset] = useState<NegociacoesDataset | null>(null);
  const [preview, setPreview] = useState<NegociacoesDataset | null>(null);
  const [meta, setMeta] = useState<NegociacoesImportMeta | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showReplaceToken, setShowReplaceToken] = useState(false);
  const [config, setConfig] = useState<NegociacoesAdminConfig>(() =>
    loadNegociacoesAdminConfig()
  );

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
    loadNegociacoesDataset().then(setDataset);
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

  function updateConfig(next: NegociacoesAdminConfig) {
    setConfig(next);
    saveNegociacoesAdminConfig(next);
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

  async function publish(next: NegociacoesDataset, importLabel: string) {
    const pat = getStoredToken();
    if (!pat) {
      throw new Error("Salve o token GitHub uma vez neste computador para publicar.");
    }
    const result = await publishJsonToGitHub(next, pat, {
      path: NEGOCIACOES_GITHUB_PATH,
      message: `Agrega negociações: ${importLabel} (${next.lines.length} linhas, ${next.avaliacoes?.length || 0} aval.)`,
    });
    setCommitUrl(result.commitUrl);
    setDataset(next);
    saveLocalNegociacoesDataset(next);
    setSuccess(
      "Publicado no GitHub (dataset de negociações). O site atualiza em 1–2 minutos."
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
      const asAvaliacoes = isAvaliacoesSheet(buffer);
      const result = asAvaliacoes
        ? (() => {
            const rows = parseAvaliacoesArrayBuffer(buffer);
            if (rows.length === 0) {
              throw new Error(
                "Nenhuma linha de avaliação válida (esperado: Vendedor / Aprovadas / Realizadas por mês)."
              );
            }
            return applyAvaliacoesImport(dataset, rows, file.name, label || file.name);
          })()
        : (() => {
            const rows = parseNegociacoesArrayBuffer(buffer);
            if (rows.length === 0) {
              throw new Error(
                "Nenhuma linha válida. Use Página1 com coluna Negociação, ou a planilha de conversão de avaliações."
              );
            }
            return applyNegociacoesImport(dataset, rows, file.name, label || file.name);
          })();
      setPreview(result.dataset);
      setMeta(result.meta);
      saveLocalNegociacoesDataset(result.dataset);
      setDataset(result.dataset);

      if (config.autoPublish) {
        await publish(result.dataset, result.meta.label);
        setPreview(result.dataset);
      } else {
        setSuccess(
          asAvaliacoes
            ? `Importação local OK (avaliações): ${result.meta.kept} linhas em ${result.meta.replaced} mês(es).`
            : `Importação local OK: +${result.meta.kept} novos nº, ${result.meta.replaced} atualizados.`
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

  if (!authed) {
    const logo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Andressa Car Metrics" />
          <h1>Gestão · Negociações</h1>
          <p>Mesmo PIN do admin unificado.</p>
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
          <strong>Módulo:</strong> Negociações · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Storage isolado: <code>negociacoes_dataset</code> / <code>negociacoes_admin_config</code>.
        </p>
      </div>

      <div className="card">
        <h2>Token GitHub (salvo neste computador)</h2>
        <p className="muted">
          Publica em <code>{NEGOCIACOES_GITHUB_PATH}</code> — não altera Campanhas nem
          Agendamentos.
        </p>

        {tokenSaved && !showReplaceToken ? (
          <div className="stack">
            <div className="success-box">
              Token configurado: <code>{masked}</code>
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
        <h2>Importar planilha (.xlsx)</h2>
        <p className="muted">
          Aceita (1) export com coluna <strong>Negociação</strong> — merge por nº; ou (2)
          planilha de <strong>conversão de avaliações</strong> (Aprovadas/Realizadas por mês) —
          substitui os meses do arquivo. Compra de Consignado é ignorada. Cancelado não conta
          nos KPIs.
        </p>
        <div className="stack">
          <label>
            Rótulo do lote (opcional)
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Negociações até 15/10"
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
                : "Envie a planilha de negociações (.xlsx). Merge acumulativo por nº."
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
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Linhas recebidas</h3>
              <p>{meta.received}</p>
            </div>
            <div className="kpi-card success">
              <h3>Novos nº</h3>
              <p>{meta.kept}</p>
            </div>
            <div className="kpi-card">
              <h3>Nº atualizados</h3>
              <p>{meta.replaced}</p>
            </div>
            <div className="kpi-card accent">
              <h3>Linhas na base</h3>
              <p>{preview.lines.length}</p>
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
              onClick={() => downloadNegociacoesDataset(preview)}
            >
              Baixar backup JSON
            </button>
          </div>
        </div>
      )}

      {dataset && (
        <div className="card">
          <h2>Dataset atual (negociações)</h2>
          <p>
            {dataset.lines.length} linhas de negócio · {(dataset.avaliacoes || []).length}{" "}
            linhas de avaliação · atualizado em{" "}
            {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
          </p>
          <h3>Últimos imports</h3>
          <ul className="muted">
            {dataset.imports.slice(0, 5).map((imp) => (
              <li key={imp.at + imp.fileName}>
                {imp.label} — linhas {imp.received}, novos nº {imp.kept}, atualizados{" "}
                {imp.replaced}
              </li>
            ))}
            {dataset.imports.length === 0 && <li>Nenhum import registrado ainda.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
