import { useEffect, useMemo, useState } from "react";
import type { ShowPerson } from "../../lib/apresentacao/types";
import {
  addQuickContact,
  clearPersonDefault,
  formatPhoneDisplay,
  getPersonDefault,
  loadWhatsappContacts,
  normalizePhoneBr,
  removeQuickContact,
  setPersonDefault,
  type QuickContact,
} from "../../lib/apresentacao/whatsappContacts";
import {
  DEFAULT_SHARE_MESSAGE,
  buildWhatsappCard,
  buildWhatsappPayload,
  whatsappShareUrl,
} from "../../lib/apresentacao/whatsappShare";

type Props = {
  person: ShowPerson;
  periodoLabel: string;
  onClose: () => void;
};

type DestMode = "pm" | "quick" | "custom" | "none";

export function ShowSharePanel({ person, periodoLabel, onClose }: Props) {
  const [includeMessage, setIncludeMessage] = useState(false);
  const [message, setMessage] = useState(DEFAULT_SHARE_MESSAGE);
  const [copied, setCopied] = useState(false);
  const [quick, setQuick] = useState<QuickContact[]>([]);
  const [personPm, setPersonPm] = useState<string | null>(null);
  const [destMode, setDestMode] = useState<DestMode>("none");
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function refreshStore() {
    const store = loadWhatsappContacts();
    setQuick(store.quick);
    const pm = getPersonDefault(person.id);
    setPersonPm(pm);
    if (pm) {
      setDestMode("pm");
      setSelectedQuickId(null);
    }
  }

  useEffect(() => {
    refreshStore();
  }, [person.id]);

  const cardPreview = useMemo(
    () => buildWhatsappCard(person, periodoLabel),
    [person, periodoLabel]
  );

  const payload = useMemo(
    () =>
      buildWhatsappPayload(person, periodoLabel, {
        includeMessage,
        message,
      }),
    [person, periodoLabel, includeMessage, message]
  );

  const activeDigits = useMemo(() => {
    if (destMode === "pm" && personPm) return personPm;
    if (destMode === "quick" && selectedQuickId) {
      return quick.find((c) => c.id === selectedQuickId)?.phoneDigits ?? null;
    }
    if (destMode === "custom") return normalizePhoneBr(customPhone);
    return null;
  }, [destMode, personPm, selectedQuickId, quick, customPhone]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function openWhatsApp(phone?: string | null) {
    window.open(whatsappShareUrl(payload, phone), "_blank", "noopener,noreferrer");
  }

  function selectQuick(contact: QuickContact) {
    setDestMode("quick");
    setSelectedQuickId(contact.id);
    setPhoneError(null);
  }

  function useCustomNumber() {
    const digits = normalizePhoneBr(customPhone);
    if (!digits) {
      setPhoneError("Número inválido. Use DDD + celular (ex. 41999999999).");
      return;
    }
    setPhoneError(null);
    setDestMode("custom");
  }

  function saveToList() {
    const contact = addQuickContact(customLabel || person.nome, customPhone);
    if (!contact) {
      setPhoneError("Número inválido para salvar.");
      return;
    }
    setPhoneError(null);
    refreshStore();
    setDestMode("quick");
    setSelectedQuickId(contact.id);
  }

  function pinToPerson() {
    const source = customPhone.trim() || activeDigits || "";
    const digits = setPersonDefault(person.id, source);
    if (!digits) {
      setPhoneError("Informe um número válido para fixar neste colaborador.");
      return;
    }
    setPersonPm(digits);
    setDestMode("pm");
    setSelectedQuickId(null);
    setPhoneError(null);
  }

  function unlinkPm() {
    clearPersonDefault(person.id);
    setPersonPm(null);
    setDestMode("none");
  }

  function dropQuick(id: string) {
    removeQuickContact(id);
    if (selectedQuickId === id) {
      setSelectedQuickId(null);
      setDestMode(personPm ? "pm" : "none");
    }
    refreshStore();
  }

  return (
    <div
      className="show-share"
      role="dialog"
      aria-modal="true"
      aria-labelledby="show-share-title"
      onClick={(e) => e.stopPropagation()}
    >
      <header className="show-share-head">
        <div>
          <p className="show-share-kicker">WhatsApp</p>
          <h3 id="show-share-title">Compartilhar briefing</h3>
        </div>
        <button type="button" className="show-share-x" onClick={onClose} aria-label="Fechar painel">
          Fechar
        </button>
      </header>

      <section className="show-share-dest" aria-label="Destino">
        <header className="show-share-dest-head">
          <span>Destino</span>
          <button
            type="button"
            className={`show-share-chip${destMode === "none" ? " is-on" : ""}`}
            onClick={() => {
              setDestMode("none");
              setSelectedQuickId(null);
            }}
          >
            Sem número
          </button>
        </header>

        {personPm ? (
          <div className="show-share-pm">
            <button
              type="button"
              className={`show-share-chip show-share-chip--pm${destMode === "pm" ? " is-on" : ""}`}
              onClick={() => {
                setDestMode("pm");
                setSelectedQuickId(null);
              }}
            >
              PM · {person.nome.split(/\s+/)[0]} · {formatPhoneDisplay(personPm)}
            </button>
            <button type="button" className="show-share-linkish" onClick={unlinkPm}>
              Desvincular PM
            </button>
          </div>
        ) : (
          <p className="show-share-hint">Nenhum PM fixo neste colaborador.</p>
        )}

        {quick.length > 0 ? (
          <div className="show-share-chips" aria-label="Lista rápida">
            {quick.map((contact) => (
              <div key={contact.id} className="show-share-chip-row">
                <button
                  type="button"
                  className={`show-share-chip${destMode === "quick" && selectedQuickId === contact.id ? " is-on" : ""}`}
                  onClick={() => selectQuick(contact)}
                >
                  {contact.label}
                </button>
                <button
                  type="button"
                  className="show-share-chip-x"
                  aria-label={`Remover ${contact.label}`}
                  onClick={() => dropQuick(contact.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="show-share-new">
          <label>
            Número agora
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="41 99999-9999"
              value={customPhone}
              onChange={(event) => {
                setCustomPhone(event.target.value);
                setPhoneError(null);
              }}
            />
          </label>
          <label>
            Apelido (lista)
            <input
              type="text"
              placeholder={person.nome.split(/\s+/)[0]}
              value={customLabel}
              onChange={(event) => setCustomLabel(event.target.value)}
            />
          </label>
          <div className="show-share-new-actions">
            <button type="button" className="show-share-btn show-share-btn--ghost" onClick={useCustomNumber}>
              Usar este
            </button>
            <button type="button" className="show-share-btn show-share-btn--ghost" onClick={saveToList}>
              Salvar na lista
            </button>
            <button type="button" className="show-share-btn show-share-btn--ghost" onClick={pinToPerson}>
              Fixar neste colaborador
            </button>
          </div>
          {phoneError ? <p className="show-share-err">{phoneError}</p> : null}
          {activeDigits ? (
            <p className="show-share-active">
              Enviando para <strong>{formatPhoneDisplay(activeDigits)}</strong>
            </p>
          ) : (
            <p className="show-share-active">WhatsApp pedirá o contato na hora.</p>
          )}
        </div>
      </section>

      <label className="show-share-toggle">
        <input
          type="checkbox"
          checked={includeMessage}
          onChange={(event) => setIncludeMessage(event.target.checked)}
        />
        <span>Incluir mensagem à parte</span>
      </label>

      <label className={`show-share-msg${includeMessage ? "" : " is-disabled"}`}>
        <span>Mensagem</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={!includeMessage}
          rows={3}
          placeholder={DEFAULT_SHARE_MESSAGE}
        />
      </label>

      <div className="show-share-preview">
        <span>Prévia do card</span>
        <pre>{cardPreview}</pre>
      </div>

      <footer className="show-share-actions">
        <button type="button" className="show-share-btn show-share-btn--ghost" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="show-share-btn show-share-btn--ghost" onClick={copyText}>
          {copied ? "Copiado" : "Copiar texto"}
        </button>
        <button
          type="button"
          className="show-share-btn show-share-btn--ghost"
          onClick={() => openWhatsApp(activeDigits)}
        >
          Abrir WhatsApp
        </button>
        <button
          type="button"
          className="show-share-btn show-share-btn--primary"
          disabled={!activeDigits}
          onClick={() => openWhatsApp(activeDigits)}
        >
          Enviar PM
        </button>
      </footer>
    </div>
  );
}
