import { isCancelado } from "./normalize";
import type { NegociacaoDeal, NegociacaoLine } from "./types";

function platesAndModelsOf(lines: NegociacaoLine[]): {
  placaEntrada: string;
  placaSaida: string;
  modeloEntrada: string;
  modeloSaida: string;
} {
  let placaEntrada = "";
  let placaSaida = "";
  let modeloEntrada = "";
  let modeloSaida = "";
  for (const line of lines) {
    const mov = line.movimentacao.toLowerCase();
    if (mov.includes("entrada") && line.placa) {
      placaEntrada = line.placa;
      modeloEntrada = line.modelo.trim();
    }
    if (mov.includes("saída") || mov.includes("saida")) {
      if (line.placa) {
        placaSaida = line.placa;
        modeloSaida = line.modelo.trim();
      }
    }
  }
  if (!placaEntrada && !placaSaida && lines[0]?.placa) {
    const line = lines[0];
    const mov = line.movimentacao.toLowerCase();
    if (mov.includes("entrada")) {
      placaEntrada = line.placa;
      modeloEntrada = line.modelo.trim();
    } else {
      placaSaida = line.placa;
      modeloSaida = line.modelo.trim();
    }
  }
  return { placaEntrada, placaSaida, modeloEntrada, modeloSaida };
}

function dealFromLines(
  dealId: string,
  negociacaoId: string,
  lines: NegociacaoLine[]
): NegociacaoDeal {
  const head = lines[0]!;
  const plates = platesAndModelsOf(lines);
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
    placaEntrada: plates.placaEntrada,
    placaSaida: plates.placaSaida,
    modeloEntrada: plates.modeloEntrada,
    modeloSaida: plates.modeloSaida,
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
