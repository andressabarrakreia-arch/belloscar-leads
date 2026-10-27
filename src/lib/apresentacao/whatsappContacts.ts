export type QuickContact = {
  id: string;
  label: string;
  phoneDigits: string;
};

export type WhatsappContactsStore = {
  quick: QuickContact[];
  /** person.id → dígitos E.164 sem + */
  personDefaults: Record<string, string>;
};

const STORAGE_KEY = "belloscar-wa-contacts-v1";

const EMPTY: WhatsappContactsStore = { quick: [], personDefaults: {} };

/** Só dígitos; BR 10/11 dígitos → prefixa 55. */
export function normalizePhoneBr(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55") && digits.length >= 12 && digits.length <= 13) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12 && digits.length <= 15) return digits;
  return null;
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.startsWith("55") && digits.length === 13) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.startsWith("55") && digits.length === 12) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return `+${digits}`;
}

function readStore(): WhatsappContactsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, personDefaults: {} };
    const parsed = JSON.parse(raw) as WhatsappContactsStore;
    return {
      quick: Array.isArray(parsed.quick) ? parsed.quick : [],
      personDefaults:
        parsed.personDefaults && typeof parsed.personDefaults === "object"
          ? { ...parsed.personDefaults }
          : {},
    };
  } catch {
    return { quick: [], personDefaults: {} };
  }
}

function writeStore(store: WhatsappContactsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage indisponível */
  }
}

export function loadWhatsappContacts(): WhatsappContactsStore {
  return readStore();
}

export function addQuickContact(label: string, phoneInput: string): QuickContact | null {
  const phoneDigits = normalizePhoneBr(phoneInput);
  if (!phoneDigits) return null;
  const store = readStore();
  const existing = store.quick.find((c) => c.phoneDigits === phoneDigits);
  if (existing) {
    existing.label = label.trim() || existing.label;
    writeStore(store);
    return existing;
  }
  const contact: QuickContact = {
    id: `wa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim() || formatPhoneDisplay(phoneDigits),
    phoneDigits,
  };
  store.quick = [contact, ...store.quick];
  writeStore(store);
  return contact;
}

export function removeQuickContact(id: string): void {
  const store = readStore();
  store.quick = store.quick.filter((c) => c.id !== id);
  writeStore(store);
}

export function setPersonDefault(personId: string, phoneInput: string): string | null {
  const phoneDigits = normalizePhoneBr(phoneInput);
  if (!phoneDigits) return null;
  const store = readStore();
  store.personDefaults[personId] = phoneDigits;
  writeStore(store);
  return phoneDigits;
}

export function clearPersonDefault(personId: string): void {
  const store = readStore();
  delete store.personDefaults[personId];
  writeStore(store);
}

export function getPersonDefault(personId: string): string | null {
  return readStore().personDefaults[personId] ?? null;
}
