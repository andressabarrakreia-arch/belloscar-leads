import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_PIN, isAdminAuthed, setAdminAuthed } from "../../lib/adminAuth";
import { clientsForExport } from "../../lib/scheduling/metrics";
import {
  downloadClientsCsv,
  loadSchedulingAdminConfig,
  loadSchedulingDataset,
  saveSchedulingAdminConfig,
} from "../../lib/scheduling/storage";
import type { SchedulingDataset } from "../../lib/scheduling/types";

const logo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;

export function SchedulingAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataset, setDataset] = useState<SchedulingDataset | null>(null);
  const [lastExportAt, setLastExportAt] = useState<string | undefined>();

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      setAdminAuthed(true);
    }
    setLastExportAt(loadSchedulingAdminConfig().lastExportAt);
    loadSchedulingDataset().then(setDataset);
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

  function onExport() {
    if (!dataset) return;
    const clients = clientsForExport(dataset.items);
    downloadClientsCsv(clients, "clientes-agendamentos.csv");
    const at = new Date().toISOString();
    const config = loadSchedulingAdminConfig();
    saveSchedulingAdminConfig({ ...config, lastExportAt: at });
    setLastExportAt(at);
    setSuccess(`Exportados ${clients.length} clientes (nome, e-mail e telefone).`);
  }

  if (!authed) {
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Andressa Car Metrics" />
          <h1>Gestão · Agendamentos</h1>
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
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>Clientes de Agendamentos</h2>
        <p className="muted">
          Nome, e-mail e telefone da agenda. As planilhas sobem só no{" "}
          <Link to="/indice/gestao">Painel de Gestão do Índice</Link>.
        </p>
        <button className="btn" type="button" onClick={onExport} disabled={!dataset}>
          Baixar CSV de clientes
        </button>
        {lastExportAt && (
          <p className="muted">Última exportação: {new Date(lastExportAt).toLocaleString("pt-BR")}</p>
        )}
        {success && <div className="success-box">{success}</div>}
      </div>
    </div>
  );
}
