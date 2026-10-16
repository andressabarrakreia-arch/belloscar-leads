export function isSuccessStatus(status: string): boolean {
  return (status || "").trim().toLowerCase() === "sucesso";
}

export function isVisitFlag(visita: string, status: string): boolean {
  const v = (visita || "").trim().toLowerCase();
  const s = (status || "").trim().toLowerCase();
  return v === "sim" || v === "s" || v === "yes" || v === "1" || s === "visita";
}

export function isScheduledStatus(status: string): boolean {
  return (status || "").trim().toLowerCase() === "agendado";
}

export function hasPriorityKeep(visita: string, status: string): boolean {
  return isVisitFlag(visita, status) || isScheduledStatus(status);
}
