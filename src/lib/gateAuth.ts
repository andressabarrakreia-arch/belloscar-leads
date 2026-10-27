/** PIN compartilhado entre Erros e Mapa do Site (separado da Gestão). */
export const GATE_PIN = import.meta.env.VITE_GATE_PIN || "2640";
export const GATE_AUTH_KEY = "belloscar_gate_ok";

export function isGateAuthed(): boolean {
  try {
    return (
      localStorage.getItem(GATE_AUTH_KEY) === "1" ||
      sessionStorage.getItem(GATE_AUTH_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function setGateAuthed(ok: boolean) {
  try {
    if (ok) {
      localStorage.setItem(GATE_AUTH_KEY, "1");
      sessionStorage.setItem(GATE_AUTH_KEY, "1");
    } else {
      localStorage.removeItem(GATE_AUTH_KEY);
      sessionStorage.removeItem(GATE_AUTH_KEY);
    }
  } catch {
    /* storage indisponível */
  }
}
