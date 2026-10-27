import { fotoEquipe } from "./avatar";
import type { ShowDetalhe, ShowKpi, ShowPerson } from "./types";

const DIVIDER = "────────────────";

function linesKpi(kpis: ShowKpi[]): string[] {
  if (kpis.length === 0) return ["• _Sem itens neste bloco_"];
  return kpis.map((kpi) => `• ${kpi.label}: *${kpi.value}*`);
}

/** Card premium formatado para WhatsApp (*negrito*, _itálico_). STEPPS: valor prático + status. */
export function buildWhatsappCard(person: ShowPerson, periodoLabel: string): string {
  const detalhe: ShowDetalhe = person.detalhe ?? {
    positivos: person.kpis,
    negativos: [],
    notas: [],
  };

  const foto = fotoEquipe(person.nome);
  const lines: string[] = [
    "*BellosCar · Sala de resultados*",
    `*${person.nome}* — ${person.cargo}`,
    `Período: ${periodoLabel}`,
    foto ? `_Avatar:_ ${foto}` : "_Avatar: iniciais no painel da sala_",
    DIVIDER,
    "*Performance positiva*",
    ...linesKpi(detalhe.positivos),
    "",
    "*Atenção / oportunidades*",
    ...linesKpi(detalhe.negativos),
  ];

  if (detalhe.notas && detalhe.notas.length > 0) {
    lines.push("", "*Notas*", ...detalhe.notas.map((n) => `• ${n}`));
  }

  lines.push(
    DIVIDER,
    "_Esses números são o espelho do período. O próximo passo é fechar as oportunidades e superar o próprio placar._",
    "_BellosCar — resultado que se compartilha._"
  );

  return lines.join("\n");
}

/** Mensagem opcional + card. Sem mensagem → só o card. */
export function buildWhatsappPayload(
  person: ShowPerson,
  periodoLabel: string,
  options: { includeMessage: boolean; message: string }
): string {
  const card = buildWhatsappCard(person, periodoLabel);
  if (!options.includeMessage) return card;
  const msg = options.message.trim();
  if (!msg) return card;
  return `${msg}\n\n${card}`;
}

/** Com phoneDigits → chat direto; sem → escolhe contato no app. */
export function whatsappShareUrl(text: string, phoneDigits?: string | null): string {
  const q = encodeURIComponent(text);
  const digits = phoneDigits?.replace(/\D/g, "") || "";
  if (digits) return `https://wa.me/${digits}?text=${q}`;
  return `https://wa.me/?text=${q}`;
}

export const DEFAULT_SHARE_MESSAGE =
  "Segue o briefing da sala de resultados. Vamos usar esses números para subir o nível no próximo ciclo.";
