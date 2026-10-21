/** Cotações lidas no navegador a cada abertura do Índice Geral. */

export type MarketQuote = {
  id: string;
  label: string;
  value: string;
  detail: string;
  source: string;
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

async function sgsLast(code: number): Promise<SgsPoint> {
  const res = await fetch(`${SGS}${code}/dados/ultimos/1?formato=json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Série ${code} indisponível`);
  const rows = (await res.json()) as SgsPoint[];
  const point = rows[0];
  if (!point?.valor) throw new Error(`Série ${code} sem valor`);
  return point;
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
  };
}

async function selicQuote(): Promise<MarketQuote> {
  const point = await sgsLast(432);
  return {
    id: "selic",
    label: "Selic",
    value: `${brNumber(point.valor, 2)}% a.a.`,
    detail: `Meta · ref. ${point.data}`,
    source: "Banco Central",
  };
}

async function ipcaQuote(): Promise<MarketQuote> {
  const [month, year] = await Promise.all([sgsLast(433), sgsLast(13522)]);
  return {
    id: "ipca",
    label: "Inflação (IPCA)",
    value: `${brNumber(month.valor, 2)}%`,
    detail: `no mês · ${brNumber(year.valor, 2)}% em 12 meses · ${monthLabel(month.data)}`,
    source: "IBGE via Banco Central",
  };
}

async function vehicleRateQuote(): Promise<MarketQuote> {
  const point = await sgsLast(20749);
  return {
    id: "veiculos",
    label: "Juros de veículos",
    value: `${brNumber(point.valor, 2)}% a.a.`,
    detail: `Média oficial · ${monthLabel(point.data)}`,
    source: "Aquisição de veículos, bancos e financeiras",
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
    };
  });
}
