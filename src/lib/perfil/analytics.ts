import type { NegociacaoDeal, NegociacaoLine } from "../negociacoes/types";
import { MOTIVO_NAO_INFORMADO } from "../scheduling/metrics";
import type { AgendamentoItem } from "../scheduling/types";
import { generoDoCliente, type GeneroCliente } from "./genero";

export type Contagem = {
  nome: string;
  quantidade: number;
  percentual: number;
};

export type ModeloContagem = Contagem & {
  marca: string;
};

export type PerfilRecorte = {
  negocios: number;
  clientes: number;
  insucessos: number;
  marcas: Contagem[];
  modelos: ModeloContagem[];
  genero: Contagem[];
  motivos: Contagem[];
};

const MARCAS: Record<string, string> = {
  volkswagen: "Volkswagen",
  volkswagem: "Volkswagen",
  vw: "Volkswagen",
  bmw: "BMW",
  byd: "BYD",
  gm: "Chevrolet",
  gmc: "GMC",
  gwm: "GWM",
  jac: "JAC",
  ram: "RAM",
  mercedes: "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  "mercedes-benz": "Mercedes-Benz",
  jaecoo: "Jaecoo",
  chery: "CAOA Chery",
  "caoa chery": "CAOA Chery",
  "kia motors": "Kia",
  kia: "Kia",
  ssangyong: "SsangYong",
  zeekr: "Zeekr",
};

function chave(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function titulo(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((parte) => (parte ? parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase() : parte))
    .join(" ");
}

function marcaNome(raw: string): string {
  const bruto = raw.split("/")[0] ?? raw;
  const key = chave(bruto);
  if (!key) return "Sem marca";
  return MARCAS[key] ?? titulo(bruto);
}

function modeloNome(raw: string): string {
  const texto = raw.trim().replace(/\s+/g, " ");
  if (!texto) return "Sem modelo";
  if (texto === texto.toUpperCase() && /[A-ZÁÉÍÓÚÃÕÂÊÔÇ]/.test(texto)) return titulo(texto);
  return texto;
}

function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function ranking(map: Map<string, number>, total: number): Contagem[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .map(([nome, quantidade]) => ({ nome, quantidade, percentual: pct(quantidade, total) }));
}

/** Veículo que saiu. Na troca, a entrada não entra na marca. */
function veiculo(lines: NegociacaoLine[]): { marca: string; modelo: string } | null {
  const saidas = lines.filter((line) => line.movimentacao.toLowerCase().includes("sa"));
  const pool = saidas.length > 0 ? saidas : lines;
  const line = pool.find((item) => item.marca.trim() || item.modelo.trim()) ?? pool[0];
  if (!line) return null;
  const marca = marcaNome(line.marca);
  if (marca === "Sem marca" && !line.modelo.trim()) return null;
  return { marca, modelo: modeloNome(line.modelo) };
}

function clienteChave(nome: string): string {
  return chave(nome);
}

const ORDEM_GENERO: GeneroCliente[] = ["Feminino", "Masculino", "Não identificado"];

export function perfilDoMes(deals: NegociacaoDeal[], itens: AgendamentoItem[], month: string): PerfilRecorte {
  const negocios = deals.filter((deal) => month === "all" || deal.monthKey === month);
  const marcasMap = new Map<string, number>();
  const modelosMap = new Map<string, { marca: string; quantidade: number }>();
  const clientes = new Map<string, GeneroCliente>();

  for (const deal of negocios) {
    const carro = veiculo(deal.lines);
    if (carro) {
      marcasMap.set(carro.marca, (marcasMap.get(carro.marca) ?? 0) + 1);
      const modeloChave = `${carro.marca}\u0000${carro.modelo}`;
      const atual = modelosMap.get(modeloChave) ?? { marca: carro.marca, quantidade: 0 };
      atual.quantidade += 1;
      modelosMap.set(modeloChave, atual);
    }
    const nome = deal.cliente.trim();
    if (!nome) continue;
    const key = clienteChave(nome);
    if (!clientes.has(key)) clientes.set(key, generoDoCliente(nome));
  }

  const generoMap = new Map<GeneroCliente, number>();
  for (const genero of clientes.values()) generoMap.set(genero, (generoMap.get(genero) ?? 0) + 1);

  const insucessos = itens.filter(
    (item) => item.status === "Insucesso" && (month === "all" || item.monthKey === month)
  );
  const motivosMap = new Map<string, number>();
  for (const item of insucessos) {
    const motivo = item.motivoInsucesso?.trim() || MOTIVO_NAO_INFORMADO;
    motivosMap.set(motivo, (motivosMap.get(motivo) ?? 0) + 1);
  }

  const comMarca = [...marcasMap.values()].reduce((sum, value) => sum + value, 0);
  const modelos = [...modelosMap.entries()]
    .map(([key, row]) => {
      const modelo = key.split("\u0000")[1] || "Sem modelo";
      return {
        marca: row.marca,
        nome: `${row.marca} ${modelo}`,
        quantidade: row.quantidade,
        percentual: pct(row.quantidade, comMarca),
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, "pt-BR"));

  return {
    negocios: negocios.length,
    clientes: clientes.size,
    insucessos: insucessos.length,
    marcas: ranking(marcasMap, comMarca),
    modelos,
    genero: ORDEM_GENERO.filter((nome) => (generoMap.get(nome) ?? 0) > 0).map((nome) => ({
      nome,
      quantidade: generoMap.get(nome) ?? 0,
      percentual: pct(generoMap.get(nome) ?? 0, clientes.size),
    })),
    motivos: ranking(motivosMap, insucessos.length),
  };
}

export function mesesDisponiveis(deals: NegociacaoDeal[], itens: AgendamentoItem[]): string[] {
  const meses = new Set<string>();
  for (const deal of deals) if (deal.monthKey) meses.add(deal.monthKey);
  for (const item of itens) if (item.monthKey) meses.add(item.monthKey);
  return [...meses].sort((a, b) => b.localeCompare(a));
}
