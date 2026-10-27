import { DEFAULT_SHARE_MESSAGE } from "./whatsappShare";

export type ShareDestMode = "pm" | "quick" | "custom" | "none";
export type ShareFormat = "text" | "image";

export type WhatsappSharePrefs = {
  includeMessage: boolean;
  message: string;
  format: ShareFormat;
  destMode: ShareDestMode;
  selectedQuickId: string | null;
  customPhone: string;
  customLabel: string;
};

const KEY = "belloscar-wa-share-prefs-v1";

const DEFAULTS: WhatsappSharePrefs = {
  includeMessage: false,
  message: DEFAULT_SHARE_MESSAGE,
  format: "text",
  destMode: "none",
  selectedQuickId: null,
  customPhone: "",
  customLabel: "",
};

export function loadSharePrefs(): WhatsappSharePrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<WhatsappSharePrefs>;
    return {
      includeMessage: Boolean(parsed.includeMessage),
      message: typeof parsed.message === "string" ? parsed.message : DEFAULTS.message,
      format: parsed.format === "image" ? "image" : "text",
      destMode:
        parsed.destMode === "pm" ||
        parsed.destMode === "quick" ||
        parsed.destMode === "custom" ||
        parsed.destMode === "none"
          ? parsed.destMode
          : "none",
      selectedQuickId: typeof parsed.selectedQuickId === "string" ? parsed.selectedQuickId : null,
      customPhone: typeof parsed.customPhone === "string" ? parsed.customPhone : "",
      customLabel: typeof parsed.customLabel === "string" ? parsed.customLabel : "",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSharePrefs(prefs: WhatsappSharePrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage indisponível */
  }
}
