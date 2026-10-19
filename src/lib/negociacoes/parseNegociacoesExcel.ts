import * as XLSX from "xlsx";
import { isoToMonthKey, isoToPeriodKey, toIsoDate } from "../scheduling/dates";
import {
  cellNumber,
  cellStr,
  isCompraDeConsignado,
  normalizeTipoNegociacao,
} from "./normalize";
import type { NegociacaoLine } from "./types";

function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
  );
  for (const key of keys) {
    const hit = lower[key.toLowerCase()];
    if (hit !== undefined && hit !== null && hit !== "") return hit;
  }
  return "";
}

function rowToLine(row: Record<string, unknown>): NegociacaoLine | null {
  const negociacaoId = cellStr(pick(row, "Negociação", "Negociacao", "Nº Negociação"));
  if (!negociacaoId) return null;

  const tipoRaw = cellStr(pick(row, "Tipo Negociação", "Tipo de Negociação", "Tipo"));
  if (isCompraDeConsignado(tipoRaw)) return null;

  const dataIso =
    toIsoDate(pick(row, "Data Entrada", "Data")) || "1970-01-01";

  return {
    negociacaoId,
    dataEntrada: dataIso,
    cliente: cellStr(pick(row, "Cliente Negociação", "Cliente")),
    vendedor: cellStr(pick(row, "Vendedor Negociação", "Vendedor")) || "(sem vendedor)",
    tipo: normalizeTipoNegociacao(tipoRaw),
    tipoRaw: tipoRaw || "Não informado",
    status: cellStr(pick(row, "Status Negociação", "Status")) || "Não informado",
    placa: cellStr(pick(row, "Placa")),
    tipoVeiculo: cellStr(pick(row, "Tipo Veículo", "Tipo Veiculo")),
    marca: cellStr(pick(row, "Marca")),
    modelo: cellStr(pick(row, "Modelo")),
    versao: cellStr(pick(row, "Versão", "Versao")),
    estoque: cellStr(pick(row, "Estoque")),
    tipoVenda: cellStr(pick(row, "Tipo Venda")) || "Não informado",
    movimentacao: cellStr(pick(row, "Movimentação", "Movimentacao", "movimentação")),
    valorCompra: cellNumber(pick(row, "Valor Compra")),
    valorVenda: cellNumber(pick(row, "Valor Venda")),
    monthKey: isoToMonthKey(dataIso),
    periodKey: isoToPeriodKey(dataIso),
    solicitante: cellStr(pick(row, "Solicitante")),
    avaliador: cellStr(pick(row, "Avaliador")),
  };
}

/** Prefer sheet Página1; senão a primeira com coluna Negociação. */
function pickSheet(wb: XLSX.WorkBook): XLSX.WorkSheet {
  if (wb.Sheets["Página1"]) return wb.Sheets["Página1"]!;
  if (wb.Sheets["Pagina1"]) return wb.Sheets["Pagina1"]!;
  for (const name of wb.SheetNames) {
    const sh = wb.Sheets[name]!;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sh, { defval: "" });
    if (rows.some((r) => "Negociação" in r || "Negociacao" in r)) return sh;
  }
  return wb.Sheets[wb.SheetNames[0]!]!;
}

export function parseNegociacoesArrayBuffer(buffer: ArrayBuffer): NegociacaoLine[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = pickSheet(wb);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const lines: NegociacaoLine[] = [];
  for (const row of rows) {
    const line = rowToLine(row);
    if (line) lines.push(line);
  }
  return lines;
}
