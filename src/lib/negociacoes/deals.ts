import { isCancelado } from "./normalize";
import type { NegociacaoDeal, NegociacaoLine } from "./types";

function platesOf(lines: NegociacaoLine[]): { entrada: string; saida: string } {
  let entrada = "";
  let saida = "";
  for (const line of lines) {
    const mov = line.movimentacao.toLowerCase();
    if (mov.includes("entrada") && line.placa) entrada = line.placa;
    if (mov.includes("saída") || mov.includes("saida")) {
      if (line.placa) saida = line.placa;
    }
  }
  if (!entrada && !saida && lines[0]?.placa) {
    const mov = lines[0].movimentacao.toLowerCase();
    if (mov.includes("entrada")) entrada = lines[0].placa;
    else saida = lines[0].placa;
  }
  return { entrada, saida };
}

function dealFromLines(
  dealId: string,
  negociacaoId: string,
  lines: NegociacaoLine[]
): NegociacaoDeal {
  const head = lines[0]!;
  const { entrada, saida } = platesOf(lines);
  return {
    dealId,
    negociacaoId,
    dataEntrada: head.dataEntrada,
    cliente: head.cliente,
    vendedor: head.vendedor,
    tipo: head.tipo,
    status: head.status,
    tipoVenda: head.tipoVenda,
    monthKey: head.monthKey,
    periodKey: head.periodKey,
    placaEntrada: entrada,
    placaSaida: saida,
    lines,
  };
}

/**
 * Converte linhas → negócios contáveis.
 * - Exclui Cancelado
 * - Troca: 1 negócio por nº de negociação
 * - Demais tipos: 1 negócio por linha
 */
export function linesToDeals(lines: NegociacaoLine[]): NegociacaoDeal[] {
  const eligible = lines.filter((l) => !isCancelado(l.status));
  const byId = new Map<string, NegociacaoLine[]>();
  for (const line of eligible) {
    const list = byId.get(line.negociacaoId) || [];
    list.push(line);
    byId.set(line.negociacaoId, list);
  }

  const deals: NegociacaoDeal[] = [];
  for (const [negociacaoId, group] of byId) {
    const isTroca = group.some((l) => l.tipo === "Troca");
    if (isTroca) {
      deals.push(dealFromLines(`T:${negociacaoId}`, negociacaoId, group));
      continue;
    }
    group.forEach((line, idx) => {
      deals.push(
        dealFromLines(
          `L:${negociacaoId}:${line.placa}:${line.movimentacao}:${idx}`,
          negociacaoId,
          [line]
        )
      );
    });
  }
  return deals;
}
