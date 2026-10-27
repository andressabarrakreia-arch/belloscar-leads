import { fotoEquipe, isLogoEquipe } from "./avatar";
import type { ShowDetalhe, ShowPerson } from "./types";

const W = 1080;
const H = 1350;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  const scale = Math.max(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (size - dw) / 2;
  const dy = y + (size - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function kpiLines(
  ctx: CanvasRenderingContext2D,
  title: string,
  items: { label: string; value: string }[],
  x: number,
  y: number,
  accent: string
): number {
  ctx.fillStyle = accent;
  ctx.font = "600 28px 'Barlow Condensed', 'Arial Narrow', sans-serif";
  ctx.fillText(title.toUpperCase(), x, y);
  let yy = y + 44;
  ctx.font = "400 26px 'IBM Plex Sans', Arial, sans-serif";
  for (const item of items.slice(0, 6)) {
    ctx.fillStyle = "#8f8a82";
    ctx.fillText(item.label, x, yy);
    ctx.fillStyle = "#f3eee6";
    ctx.font = "600 28px 'Barlow Condensed', 'Arial Narrow', sans-serif";
    ctx.fillText(item.value, x + 420, yy);
    ctx.font = "400 26px 'IBM Plex Sans', Arial, sans-serif";
    yy += 40;
  }
  if (items.length === 0) {
    ctx.fillStyle = "#8f8a82";
    ctx.fillText("—", x, yy);
    yy += 40;
  }
  return yy + 16;
}

/** Card BellosCar 1080×1350 → PNG Blob. */
export async function drawBriefingCard(
  person: ShowPerson,
  periodoLabel: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  const detalhe: ShowDetalhe = person.detalhe ?? {
    positivos: person.kpis,
    negativos: [],
    notas: [],
  };

  // Fundo
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#12080a");
  bg.addColorStop(0.45, "#090a0c");
  bg.addColorStop(1, "#0c1014");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent barra
  ctx.fillStyle = "#c02026";
  ctx.fillRect(0, 0, 18, H);

  // Glow
  const glow = ctx.createRadialGradient(W * 0.85, 80, 20, W * 0.85, 80, 420);
  glow.addColorStop(0, "rgba(192, 32, 38, 0.35)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#c02026";
  ctx.font = "600 22px 'IBM Plex Sans', Arial, sans-serif";
  ctx.fillText("BELLOSCAR  ·  SALA DE RESULTADOS", 64, 64);

  const avatarSize = 280;
  const ax = 64;
  const ay = 110;
  const logoLight = isLogoEquipe(person.nome);
  ctx.fillStyle = logoLight ? "#ebe6df" : "#1a1214";
  ctx.fillRect(ax, ay, avatarSize, avatarSize);

  const fotoUrl = fotoEquipe(person.nome);
  if (fotoUrl) {
    const img = await loadImage(fotoUrl);
    if (img) {
      if (logoLight) {
        // contain sobre fundo claro
        const pad = avatarSize * 0.1;
        const box = avatarSize - pad * 2;
        const scale = Math.min(box / img.width, box / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, ax + (avatarSize - dw) / 2, ay + (avatarSize - dh) / 2, dw, dh);
      } else {
        drawCover(ctx, img, ax, ay, avatarSize);
      }
    }
  } else {
    ctx.fillStyle = "#f3eee6";
    ctx.font = "700 96px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initials = person.nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
    ctx.fillText(initials || "?", ax + avatarSize / 2, ay + avatarSize / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // moldura accent
  ctx.strokeStyle = "rgba(192, 32, 38, 0.85)";
  ctx.lineWidth = 4;
  ctx.strokeRect(ax + 2, ay + 2, avatarSize - 4, avatarSize - 4);

  const tx = ax + avatarSize + 48;
  ctx.fillStyle = "#8f8a82";
  ctx.font = "600 22px 'IBM Plex Sans', Arial, sans-serif";
  ctx.fillText((person.cargo || "").toUpperCase(), tx, ay + 48);

  ctx.fillStyle = "#f3eee6";
  ctx.font = "700 64px 'Barlow Condensed', 'Arial Narrow', sans-serif";
  const nameLines = wrapText(ctx, person.nome.toUpperCase(), W - tx - 64, 64);
  let ny = ay + 120;
  for (const line of nameLines.slice(0, 3)) {
    ctx.fillText(line, tx, ny);
    ny += 68;
  }

  ctx.fillStyle = "#d4a35a";
  ctx.font = "500 26px 'IBM Plex Sans', Arial, sans-serif";
  ctx.fillText(`Período: ${periodoLabel}`, tx, Math.max(ny + 12, ay + avatarSize - 24));

  let y = ay + avatarSize + 72;
  ctx.strokeStyle = "rgba(243, 238, 230, 0.12)";
  ctx.beginPath();
  ctx.moveTo(64, y);
  ctx.lineTo(W - 64, y);
  ctx.stroke();
  y += 56;

  y = kpiLines(ctx, "Performance positiva", detalhe.positivos, 64, y, "#5fc39c");
  y = kpiLines(ctx, "Atenção / oportunidades", detalhe.negativos, 64, y, "#e07070");

  ctx.fillStyle = "#8f8a82";
  ctx.font = "italic 24px 'IBM Plex Sans', Arial, sans-serif";
  const cta =
    "Esses números são o espelho do período. Feche as oportunidades e supere o próprio placar.";
  for (const line of wrapText(ctx, cta, W - 128, 24).slice(0, 3)) {
    ctx.fillText(line, 64, y);
    y += 34;
  }

  ctx.fillStyle = "#c02026";
  ctx.font = "600 20px 'IBM Plex Sans', Arial, sans-serif";
  ctx.fillText("BELLOSCAR — RESULTADO QUE SE COMPARTILHA", 64, H - 48);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao gerar PNG"));
    }, "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  _fontSize: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function downloadBriefingPng(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyBriefingPng(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function shareBriefingFiles(
  blob: Blob,
  text: string,
  fileName: string
): Promise<"shared" | "fallback"> {
  const file = new File([blob], fileName, { type: "image/png" });
  const data: ShareData = { files: [file], text, title: "BellosCar · Briefing" };
  if (typeof navigator.share === "function" && navigator.canShare?.(data)) {
    await navigator.share(data);
    return "shared";
  }
  return "fallback";
}
