import { useEffect, useMemo, useRef, useState } from "react";
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
  copyBriefingPng,
  downloadBriefingPng,
  drawBriefingCard,
  shareBriefingFiles,
} from "../../lib/apresentacao/whatsappCardImage";
import {
  DEFAULT_SHARE_MESSAGE,
  buildWhatsappCard,
  buildWhatsappPayload,
  whatsappShareUrl,
} from "../../lib/apresentacao/whatsappShare";
import {
  loadSharePrefs,
  saveSharePrefs,
  type ShareDestMode,
  type ShareFormat,
} from "../../lib/apresentacao/whatsappSharePrefs";

type Props = {
  person: ShowPerson;
  periodoLabel: string;
  onClose: () => void;
};

type DestMode = ShareDestMode;

export function ShowSharePanel({ person, periodoLabel, onClose }: Props) {
  const initial = useMemo(() => loadSharePrefs(), []);
  const [includeMessage, setIncludeMessage] = useState(initial.includeMessage);
  const [message, setMessage] = useState(initial.message || DEFAULT_SHARE_MESSAGE);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<ShareFormat>(initial.format);
  const [busy, setBusy] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [quick, setQuick] = useState<QuickContact[]>([]);
  const [personPm, setPersonPm] = useState<string | null>(null);
  const [destMode, setDestMode] = useState<DestMode>(initial.destMode);
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(initial.selectedQuickId);
  const [customPhone, setCustomPhone] = useState(initial.customPhone);
  const [customLabel, setCustomLabel] = useState(initial.customLabel);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const prefsReady = useRef(false);

  function refreshContacts() {
    const store = loadWhatsappContacts();
    setQuick(store.quick);
    const pm = getPersonDefault(person.id);
    setPersonPm(pm);
    setDestMode((mode) => {
      if (mode === "pm" && !pm) return "none";
      if (mode === "quick" && selectedQuickId && !store.quick.some((c) => c.id === selectedQuickId)) {
        return pm ? "pm" : "none";
      }
      if (!prefsReady.current && pm && initial.destMode === "pm") return "pm";
      if (!prefsReady.current && pm && initial.destMode === "none" && !initial.customPhone) return "pm";
      return mode;
    });
  }

  useEffect(() => {
    refreshContacts();
    prefsReady.current = true;
  }, [person.id]);

  useEffect(() => {
    if (!prefsReady.current) return;
    const t = window.setTimeout(() => {
      saveSharePrefs({
        includeMessage,
        message,
        format,
        destMode,
        selectedQuickId,
        customPhone,
        customLabel,
      });
    }, 150);
    return () => window.clearTimeout(t);
  }, [
    includeMessage,
    message,
    format,
    destMode,
    selectedQuickId,
    customPhone,
    customLabel,
  ]);

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

  const fileSlug = useMemo(
    () =>
      `belloscar-briefing-${person.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)}.png`,
    [person.nome]
  );

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

  async function withCard(action: (blob: Blob) => Promise<void>) {
    setBusy(true);
    setStatusNote(null);
    try {
      const blob = await drawBriefingCard(person, periodoLabel);
      await action(blob);
    } catch {
      setStatusNote("Não foi possível gerar o card.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadImage() {
    await withCard(async (blob) => {
      await downloadBriefingPng(blob, fileSlug);
      setStatusNote("PNG baixado.");
    });
  }

  async function copyImage() {
    await withCard(async (blob) => {
      const ok = await copyBriefingPng(blob);
      setStatusNote(ok ? "Imagem copiada." : "Copiar imagem bloqueado neste navegador — use Baixar.");
    });
  }

  async function shareImage() {
    await withCard(async (blob) => {
      const result = await shareBriefingFiles(blob, payload, fileSlug);
      if (result === "fallback") {
        await downloadBriefingPng(blob, fileSlug);
        openWhatsApp(activeDigits);
        setStatusNote("Imagem baixada; WhatsApp aberto com o texto.");
      } else {
        setStatusNote("Compartilhado.");
      }
    });
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
    refreshContacts();
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
    refreshContacts();
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

      <div className="show-share-body">
        <div className="show-share-formats" role="tablist" aria-label="Formato">
          <button
            type="button"
            role="tab"
            aria-selected={format === "text"}
            className={format === "text" ? "is-on" : undefined}
            onClick={() => setFormat("text")}
          >
            Texto (embed)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={format === "image"}
            className={format === "image" ? "is-on" : undefined}
            onClick={() => setFormat("image")}
          >
            Imagem (card)
          </button>
        </div>

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
            rows={2}
            placeholder={DEFAULT_SHARE_MESSAGE}
          />
        </label>

        {format === "text" ? (
          <div className="show-share-preview">
            <span>Prévia do card (texto)</span>
            <pre>{cardPreview}</pre>
          </div>
        ) : (
          <p className="show-share-hint">
            Card PNG no tema BellosCar com avatar, KPIs e marca. Baixe, copie ou compartilhe; no
            WhatsApp o texto do briefing acompanha.
          </p>
        )}

        {statusNote ? <p className="show-share-active">{statusNote}</p> : null}
      </div>

      <footer className="show-share-actions">
        <button type="button" className="show-share-btn show-share-btn--ghost" onClick={onClose}>
          Cancelar
        </button>
        {format === "text" ? (
          <>
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
          </>
        ) : (
          <>
            <button
              type="button"
              className="show-share-btn show-share-btn--ghost"
              disabled={busy}
              onClick={downloadImage}
            >
              Baixar PNG
            </button>
            <button
              type="button"
              className="show-share-btn show-share-btn--ghost"
              disabled={busy}
              onClick={copyImage}
            >
              Copiar imagem
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
              disabled={busy}
              onClick={shareImage}
            >
              {busy ? "Gerando…" : "Compartilhar"}
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
