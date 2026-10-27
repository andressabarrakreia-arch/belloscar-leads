import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { GATE_PIN, setGateAuthed } from "../lib/gateAuth";

const logo = `${import.meta.env.BASE_URL}brand/bc-icon.png`;

type GateLoginProps = {
  title: string;
  blurb?: string;
  onSuccess: () => void;
};

export function GateLogin({
  title,
  blurb = "Digite o PIN para abrir esta página.",
  onSuccess,
}: GateLoginProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function login(event: FormEvent) {
    event.preventDefault();
    if (pin.trim() !== String(GATE_PIN)) {
      setError("PIN incorreto.");
      return;
    }
    setGateAuthed(true);
    setError(null);
    onSuccess();
  }

  return (
    <div className="login-page" style={{ minHeight: "70vh" }}>
      <div className="login-card">
        <img className="login-logo" src={logo} alt="BellosCar" />
        <h1>{title}</h1>
        <p>{blurb}</p>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            autoComplete="current-password"
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
