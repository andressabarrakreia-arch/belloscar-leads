/** Chave de cruzamento: DDD + número, sem 55 e sem zero à esquerda. */
export function phoneKey(raw: unknown): string {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  if (digits.length > 11) digits = digits.slice(-11);
  return digits.length >= 10 ? digits : "";
}

export function formatPhoneDisplay(raw: unknown): string {
  const digits = phoneKey(raw);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return String(raw ?? "").replace(/\D/g, "");
}
