/** PIN e sessão admin unificados entre módulos (login compartilhado). */
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "belloscar864275@";
export const ADMIN_AUTH_KEY = "belloscar_admin_ok";

export function isAdminAuthed(): boolean {
  try {
    return (
      localStorage.getItem(ADMIN_AUTH_KEY) === "1" ||
      sessionStorage.getItem(ADMIN_AUTH_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function setAdminAuthed(ok: boolean) {
  try {
    if (ok) {
      localStorage.setItem(ADMIN_AUTH_KEY, "1");
      sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    /* storage indisponível */
  }
}
