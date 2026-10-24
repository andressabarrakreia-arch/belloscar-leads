/** Cotações lidas no navegador a cada abertura do Índice Geral. */

import { tendenciaDe, type Tendencia } from "../tendencia";

export type MarketQuote = {
  id: string;
  label: string;
  value: string;
  detail: string;
  source: string;
  tendencia: Tendencia | null;
  /** Subir o número ajuda a loja. Juros, dólar e inflação sobem contra a loja. */
  sobeAjuda: boolean;
  contra: string;
};

type SgsPoint = { data: string; valor: string };

type DollarPayload = {
  USDBRL?: {
    bid?: string;
    pctChange?: string;
    create_date?: string;
  };
};

const SGS = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.";

function brNumber(raw: string, digits: number): string {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return raw;
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function monthLabel(bcbDate: string): string {
  const [day, month, year] = bcbDate.split("/");
  if (!day || !month || !year) return bcbDate;
  const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
  return label.replace(".", "");
}

function dollarWhen(createDate: string): string {
  const [date, time] = createDate.split(" ");
  if (!date) return createDate;
  const [year, month, day] = date.split("-");
  const hm = time ? time.slice(0, 5) : "";
  return `${day}/${month}/${year}${hm ? `, ${hm}` : ""}`;
}

function sgsTempo(data: string): number {
  const [day, month, year] = data.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function valorSgs(raw: string): number {
  return Number(raw.replace(",", "."));
}

async function sgsUltimos(code: number, quantidade: number): Promise<SgsPoint[]> {
  const res = await fetch(`${SGS}${code}/dados/ultimos/${quantidade}?formato=json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Série ${code} indisponível`);
  const rows = ((await res.json()) as SgsPoint[]).filter((row) => row?.valor);
  rows.sort((a, b) => sgsTempo(a.data) - sgsTempo(b.data));
  if (!rows.length) throw new Error(`Série ${code} sem valor`);
  return rows;
}

async function dollarQuote(): Promise<MarketQuote> {
  const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Dólar indisponível");
  const body = (await res.json()) as DollarPayload;
  const usd = body.USDBRL;
  if (!usd?.bid) throw new Error("Dólar sem cotação");
  const change = Number(usd.pctChange);
  const changeText = Number.isFinite(change)
    ? `${change > 0 ? "+" : ""}${change.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
    : "";
  return {
    id: "dolar",
    label: "Dólar",
    value: `R$ ${brNumber(usd.bid, 4)}`,
    detail: [changeText, usd.create_date ? dollarWhen(usd.create_date) : ""].filter(Boolean).join(" · "),
    source: "Dólar comercial em reais",
    tendencia: Number.isFinite(change) ? tendenciaDe(change, 0) : null,
    sobeAjuda: false,
    contra: "no dia",
  };
}

async function selicQuote(): Promise<MarketQuote> {
  const rows = await sgsUltimos(432, 2);
  const point = rows[rows.length - 1];
  const anterior = rows.length > 1 ? rows[rows.length - 2] : point;
  return {
    id: "selic",
    label: "Selic",
    value: `${brNumber(point.valor, 2)}% a.a.`,
    detail: `Meta · ref. ${point.data}`,
    source: "Banco Central",
    tendencia: tendenciaDe(valorSgs(point.valor), valorSgs(anterior.valor)),
    sobeAjuda: false,
    contra: "contra a meta anterior",
  };
}

async function ipcaQuote(): Promise<MarketQuote> {
  const [months, yearRows] = await Promise.all([sgsUltimos(433, 2), sgsUltimos(13522, 1)]);
  const month = months[months.length - 1];
  const anterior = months.length > 1 ? months[months.length - 2] : month;
  const year = yearRows[yearRows.length - 1];
  return {
    id: "ipca",
    label: "Inflação (IPCA)",
    value: `${brNumber(month.valor, 2)}%`,
    detail: `no mês · ${brNumber(year.valor, 2)}% em 12 meses · ${monthLabel(month.data)}`,
    source: "IBGE via Banco Central",
    tendencia: tendenciaDe(valorSgs(month.valor), valorSgs(anterior.valor)),
    sobeAjuda: false,
    contra: "contra o mês anterior",
  };
}

async function vehicleRateQuote(): Promise<MarketQuote> {
  const rows = await sgsUltimos(20749, 2);
  const point = rows[rows.length - 1];
  const anterior = rows.length > 1 ? rows[rows.length - 2] : point;
  return {
    id: "veiculos",
    label: "Juros de veículos",
    value: `${brNumber(point.valor, 2)}% a.a.`,
    detail: `Média oficial · ${monthLabel(point.data)}`,
    source: "Aquisição de veículos, bancos e financeiras",
    tendencia: tendenciaDe(valorSgs(point.valor), valorSgs(anterior.valor)),
    sobeAjuda: false,
    contra: "contra a leitura anterior",
  };
}

export async function loadMarketQuotes(): Promise<MarketQuote[]> {
  const tasks = [dollarQuote(), selicQuote(), ipcaQuote(), vehicleRateQuote()];
  const settled = await Promise.allSettled(tasks);
  return settled.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    const labels = ["Dólar", "Selic", "Inflação (IPCA)", "Juros de veículos"];
    return {
      id: labels[index].toLowerCase(),
      label: labels[index],
      value: "Indisponível",
      detail: "Não foi possível atualizar agora",
      source: "",
      tendencia: null,
      sobeAjuda: false,
      contra: "",
    };
  });
}
