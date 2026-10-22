import { parseLeadsCampanhaArrayBuffer } from "../campanhas/parseLeadsCampanha";
import { applyLeadsCampanhaImport, applySchedulingImport } from "../scheduling/mergeById";
import { parseSchedulingArrayBuffer } from "../scheduling/parseSchedulingExcel";
import type { SchedulingDataset, SchedulingSheetKind } from "../scheduling/types";
import {
  applyAvaliacoesImport,
  applyNegociacoesImport,
} from "../negociacoes/mergeByNegociacao";
import {
  isAvaliacoesSheet,
  parseAvaliacoesArrayBuffer,
} from "../negociacoes/parseAvaliacoesExcel";
import { parseNegociacoesArrayBuffer } from "../negociacoes/parseNegociacoesExcel";
import type { NegociacoesDataset } from "../negociacoes/types";

export type ImportBase = "agendamentos" | "negociacoes";

export type FileImportResult = {
  fileName: string;
  ok: boolean;
  base: ImportBase | null;
  message: string;
};

const SCHEDULING_LABEL: Record<Exclude<SchedulingSheetKind, "desconhecido">, string> = {
  agendamentos: "Agendamentos",
  insucessos: "Insucessos",
  leads: "LEADS GERAL",
  realizados: "Realizados",
  sucessos: "Sucessos",
  leadsCampanha: "Leads por campanha",
};

/**
 * Lê vários arquivos na ordem escolhida.
 * Agenda, leads, realizados, sucessos e insucessos entram na base de Agendamentos
 * (Campanhas lê essa mesma base). Negociações e avaliações entram na base da loja.
 */
export async function importarPlanilhas(
  files: File[],
  scheduling: SchedulingDataset,
  negociacoes: NegociacoesDataset
): Promise<{
  scheduling: SchedulingDataset;
  negociacoes: NegociacoesDataset;
  schedulingChanged: boolean;
  negociacoesChanged: boolean;
  results: FileImportResult[];
}> {
  let nextScheduling = scheduling;
  let nextNegociacoes = negociacoes;
  let schedulingChanged = false;
  let negociacoesChanged = false;
  const results: FileImportResult[] = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const outcome = applyOne(buffer, file.name, nextScheduling, nextNegociacoes);
    results.push({ fileName: file.name, ok: outcome.ok, base: outcome.base, message: outcome.message });
    if (!outcome.ok) continue;
    if (outcome.scheduling) {
      nextScheduling = outcome.scheduling;
      schedulingChanged = true;
    }
    if (outcome.negociacoes) {
      nextNegociacoes = outcome.negociacoes;
      negociacoesChanged = true;
    }
  }

  return {
    scheduling: nextScheduling,
    negociacoes: nextNegociacoes,
    schedulingChanged,
    negociacoesChanged,
    results,
  };
}

function applyOne(
  buffer: ArrayBuffer,
  fileName: string,
  scheduling: SchedulingDataset,
  negociacoes: NegociacoesDataset
): {
  ok: boolean;
  base: ImportBase | null;
  message: string;
  scheduling?: SchedulingDataset;
  negociacoes?: NegociacoesDataset;
} {
  try {
    if (isAvaliacoesSheet(buffer)) {
      const rows = parseAvaliacoesArrayBuffer(buffer);
      if (rows.length === 0) {
        return {
          ok: false,
          base: null,
          message: "Nenhuma linha de avaliação válida (Vendedor, Aprovadas e Realizadas).",
        };
      }
      const result = applyAvaliacoesImport(negociacoes, rows, fileName, fileName);
      return {
        ok: true,
        base: "negociacoes",
        negociacoes: result.dataset,
        message: `Avaliações: ${result.meta.kept} linhas em ${result.meta.replaced} mês(es). Atualiza Negociações.`,
      };
    }
  } catch {
    /* tenta os outros formatos */
  }

  try {
    const campanha = parseLeadsCampanhaArrayBuffer(buffer);
    if (campanha && campanha.length > 0) {
      const result = applyLeadsCampanhaImport(scheduling, campanha, fileName, fileName);
      return {
        ok: true,
        base: "agendamentos",
        scheduling: result.dataset,
        message: `Leads por campanha: ${result.meta.kept} formulários. Atualiza só a aba Leads por formulário.`,
      };
    }
  } catch {
    /* não é a planilha de formulários */
  }

  try {
    const parsed = parseSchedulingArrayBuffer(buffer);
    if (parsed.kind !== "desconhecido" && parsed.rows.length > 0) {
      const result = applySchedulingImport(scheduling, parsed.rows, parsed.kind, fileName, fileName);
      const label = SCHEDULING_LABEL[parsed.kind];
      return {
        ok: true,
        base: "agendamentos",
        scheduling: result.dataset,
        message: `${label}: ${result.meta.kept} novos e ${result.meta.enriched} atualizados por ID. Atualiza Agendamentos e Campanhas.`,
      };
    }
  } catch {
    /* não é planilha de agendamentos */
  }

  try {
    const rows = parseNegociacoesArrayBuffer(buffer);
    if (rows.length > 0) {
      const result = applyNegociacoesImport(negociacoes, rows, fileName, fileName);
      return {
        ok: true,
        base: "negociacoes",
        negociacoes: result.dataset,
        message: `Negociações: ${result.meta.kept} novos e ${result.meta.replaced} atualizados pelo nº. Atualiza a loja.`,
      };
    }
  } catch {
    /* formato não reconhecido */
  }

  return {
    ok: false,
    base: null,
    message:
      "Não reconheci esta planilha. Use LEADS, agendamentos, realizados, sucessos, insucessos, leads por campanha, negociações ou avaliações.",
  };
}
