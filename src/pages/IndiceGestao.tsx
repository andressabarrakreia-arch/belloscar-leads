import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_PIN, isAdminAuthed, setAdminAuthed } from "../lib/adminAuth";
import {
  clearStoredToken,
  getStoredToken,
  maskToken,
  publishJsonToGitHub,
  setStoredToken,
} from "../lib/githubPublish";
import { importarPlanilhas, type FileImportResult } from "../lib/indice/importarPlanilhas";
import {
  loadNegociacoesDataset,
  NEGOCIACOES_GITHUB_PATH,
  saveLocalNegociacoesDataset,
} from "../lib/negociacoes/storage";
import type { NegociacoesDataset } from "../lib/negociacoes/types";
import {
  loadSchedulingDataset,
  saveLocalSchedulingDataset,
  SCHEDULING_GITHUB_PATH,
} from "../lib/scheduling/storage";
import type { SchedulingDataset } from "../lib/scheduling/types";

const logo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;

export function IndiceGestao() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [masked, setMasked] = useState("");
  const [showReplaceToken, setShowReplaceToken] = useState(false);
  const [scheduling, setScheduling] = useState<SchedulingDataset | null>(null);
  const [negociacoes, setNegociacoes] = useState<NegociacoesDataset | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<FileImportResult[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [commitUrls, setCommitUrls] = useState<string[]>([]);

  function refreshToken() {
    const stored = getStoredToken();
    setTokenSaved(Boolean(stored));
    setMasked(stored ? maskToken(stored) : "");
  }

  useEffect(() => {
    document.title = "BellosCar · Gestão";
    if (isAdminAuthed()) {
      setAuthed(true);
      setAdminAuthed(true);
    }
    refreshToken();
    loadSchedulingDataset().then(setScheduling);
    loadNegociacoesDataset().then(setNegociacoes);
    return () => {
      document.title = "BellosCar · Análise de Resultados";
    };
  }, []);

  function login(event: React.FormEvent) {
    event.preventDefault();
    if (pin === ADMIN_PIN) {
      setAdminAuthed(true);
      setAuthed(true);
      setError(null);
      return;
    }
    setError("PIN incorreto.");
  }

  function saveToken() {
    const value = tokenInput.trim();
    if (!value) return;
    setStoredToken(value);
    setTokenInput("");
    setShowReplaceToken(false);
    refreshToken();
    setError(null);
    setSummary("Token salvo neste computador.");
  }

  async function onFiles(list: FileList | null) {
    if (!list || list.length === 0 || !scheduling || !negociacoes) return;
    const token = getStoredToken();
    if (!token) {
      setError("Salve o token do GitHub neste computador antes de enviar as planilhas.");
      return;
    }
    setBusy(true);
    setError(null);
    setSummary(null);
    setCommitUrls([]);
    setResults([]);
    try {
      const imported = await importarPlanilhas([...list], scheduling, negociacoes);
      setResults(imported.results);
      const urls: string[] = [];
      if (imported.schedulingChanged) {
        const published = await publishJsonToGitHub(imported.scheduling, token, {
          path: SCHEDULING_GITHUB_PATH,
          message: `Agrega base de agendamentos pelo Índice (${imported.scheduling.items.length} agendamentos)`,
        });
        saveLocalSchedulingDataset(imported.scheduling);
        setScheduling(imported.scheduling);
        urls.push(published.commitUrl);
      }
      if (imported.negociacoesChanged) {
        const published = await publishJsonToGitHub(imported.negociacoes, token, {
          path: NEGOCIACOES_GITHUB_PATH,
          message: `Agrega base de negociações pelo Índice (${imported.negociacoes.lines.length} linhas)`,
        });
        saveLocalNegociacoesDataset(imported.negociacoes);
        setNegociacoes(imported.negociacoes);
        urls.push(published.commitUrl);
      }
      setCommitUrls(urls);
      const recognized = imported.results.filter((item) => item.ok).length;
      if (recognized === 0) {
        setError("Nenhuma planilha foi reconhecida. As bases continuam como estavam.");
      } else if (!imported.schedulingChanged && !imported.negociacoesChanged) {
        setError("Nada novo para publicar.");
      } else {
        const parts = [];
        if (imported.schedulingChanged) {
          parts.push("Campanhas e Agendamentos foram atualizados.");
        }
        if (imported.negociacoesChanged) {
          parts.push("Negociações e o ranking do Índice foram atualizados.");
        }
        setSummary(`${parts.join(" ")} O site no ar leva cerca de 1 a 2 minutos para mostrar os números novos.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar ou publicar.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="login-page" style={{ minHeight: "70vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Andressa Car Metrics" />
          <h1>Gestão · Índice</h1>
          <p>Mesma senha dos outros painéis de gestão.</p>
          <form onSubmit={login}>
            <input
              type="password"
              placeholder="PIN de gestão"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
            <button className="btn" type="submit">
              Entrar
            </button>
            {error && <div className="error">{error}</div>}
          </form>
          <p className="muted">
            <Link to="/indice">Voltar ao Índice</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={logo} alt="Andressa Car Metrics" />
          <div className="brand-text">
            <h1>
              Bellos<span className="car">Car</span>
            </h1>
            <span>Gestão</span>
          </div>
        </div>
        <Link className="btn secondary" to="/indice">
          Índice
        </Link>
      </header>

      <div className="stack">
        <div className="card">
          <h2>Token GitHub</h2>
          <p className="muted">
            O token fica neste navegador, no endereço que está aberto. O caminho da página não apaga
            ele. Se esta tela pedir de novo, cole o mesmo token uma vez. No site no ar ele continua
            salvo, porque aquele endereço é outro.
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
                    refreshToken();
                    setSummary("Token removido deste navegador.");
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
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="github_pat_… ou ghp_…"
                  style={{ width: "100%", marginTop: 6 }}
                  autoComplete="off"
                />
              </label>
              <div className="row">
                <button className="btn" type="button" onClick={saveToken}>
                  Salvar neste computador
                </button>
                {showReplaceToken && (
                  <button className="btn secondary" type="button" onClick={() => setShowReplaceToken(false)}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Enviar planilhas</h2>
          <p className="muted">
            Escolha um ou vários arquivos de uma vez. LEADS, agendamentos, realizados, sucessos e
            insucessos atualizam Campanhas e Agendamentos. Negociações e avaliações atualizam a loja.
            O que repetir entra pelo ID, ou pelo número da negociação, e o arquivo novo fica no lugar
            do antigo.
          </p>
          <div className="dropzone">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              disabled={busy || !tokenSaved || !scheduling || !negociacoes}
              onChange={(event) => {
                const files = event.target.files;
                void onFiles(files);
                event.target.value = "";
              }}
            />
            <p className="muted">
              {busy
                ? "Lendo as planilhas e publicando…"
                : !tokenSaved
                  ? "Salve o token acima antes de enviar."
                  : "Solte aqui as planilhas do mês."}
            </p>
          </div>
          {error && <div className="error">{error}</div>}
          {summary && <div className="success-box">{summary}</div>}
          {commitUrls.length > 0 && (
            <ul>
              {commitUrls.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    Ver publicação no GitHub
                  </a>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <ul className="muted">
              {results.map((item) => (
                <li key={item.fileName}>
                  <strong>{item.fileName}.</strong> {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
