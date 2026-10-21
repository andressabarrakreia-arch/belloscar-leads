import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_PIN, isAdminAuthed, setAdminAuthed } from "../../lib/adminAuth";
import { negociacoesClientsForExport } from "../../lib/negociacoes/clients";
import { loadNegociacoesDataset } from "../../lib/negociacoes/storage";
import { downloadClientsCsv } from "../../lib/scheduling/storage";
import type { NegociacoesDataset } from "../../lib/negociacoes/types";

const logo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;

export function NegociacoesAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataset, setDataset] = useState<NegociacoesDataset | null>(null);

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      setAdminAuthed(true);
    }
    loadNegociacoesDataset().then(setDataset);
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
    const clients = negociacoesClientsForExport(dataset.lines);
    downloadClientsCsv(clients, "clientes-negociacoes.csv");
    setSuccess(`Exportados ${clients.length} clientes (nome). A planilha da loja não traz e-mail nem telefone.`);
  }

  if (!authed) {
    return (
      <div className="login-page" style={{ minHeight: "60vh" }}>
        <div className="login-card">
          <img className="login-logo" src={logo} alt="Andressa Car Metrics" />
          <h1>Gestão · Negociações</h1>
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
        <h2>Clientes de Negociações</h2>
        <p className="muted">
          Nome de quem aparece na planilha da loja. As planilhas sobem só no{" "}
          <Link to="/indice/gestao">Painel de Gestão do Índice</Link>.
        </p>
        <button className="btn" type="button" onClick={onExport} disabled={!dataset}>
          Baixar CSV de clientes
        </button>
        {success && <div className="success-box">{success}</div>}
      </div>
    </div>
  );
}
