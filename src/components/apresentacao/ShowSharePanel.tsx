import { useEffect, useMemo, useState } from "react";
import type { ShowPerson } from "../../lib/apresentacao/types";
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

export function ShowSharePanel({ person, periodoLabel, onClose }: Props) {
  const [includeMessage, setIncludeMessage] = useState(false);
  const [message, setMessage] = useState(DEFAULT_SHARE_MESSAGE);
  const [copied, setCopied] = useState(false);

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

  function openWhatsApp() {
    window.open(whatsappShareUrl(payload), "_blank", "noopener,noreferrer");
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
        <button type="button" className="show-share-btn show-share-btn--primary" onClick={openWhatsApp}>
          Abrir WhatsApp
        </button>
      </footer>
    </div>
  );
}
