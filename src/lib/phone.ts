export function normalizePhone(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return "";
  return String(raw).replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  return phone.length >= 10 && phone.length <= 13;
}
