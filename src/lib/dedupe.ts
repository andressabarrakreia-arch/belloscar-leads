import type { Lead, ParsedLead } from "./types";

export type DedupeMergeResult = {
  leads: Lead[];
  removedCount: number;
  keptIncoming: number;
  notes: string[];
};

function newId(): string {
  return crypto.randomUUID();
}

function toLead(p: ParsedLead): Lead {
  return {
    id: newId(),
    externalId: p.externalId,
    createdAtLead: p.createdAtLead.toISOString(),
    monthKey: p.monthKey,
    periodKey: p.periodKey,
    responsavel: p.responsavel,
    status: p.status,
    visita: p.visita,
    dataVisita: p.dataVisita ? p.dataVisita.toISOString() : null,
    origem: p.origem,
    tipoProposta: p.tipoProposta,
    cliente: p.cliente,
    celular: p.celular,
    phoneNormalized: p.phoneNormalized,
    hasVisit: p.hasVisit,
    isSuccess: p.isSuccess,
    isScheduled: p.isScheduled,
  };
}

type Entry =
  | {
      kind: "new";
      lead: ParsedLead;
      createdAtLead: Date;
      phone: string;
      monthKey: string;
      isSuccess: boolean;
      priority: boolean;
    }
  | {
      kind: "existing";
      lead: Lead;
      createdAtLead: Date;
      phone: string;
      monthKey: string;
      isSuccess: boolean;
      priority: boolean;
    };

/**
 * Merge + dedupe por (telefone, mês).
 * Sucesso sempre permanece. Demais: visita/agendamento > mais recente.
 */
export function mergeAndDedupe(existing: Lead[], incoming: ParsedLead[]): DedupeMergeResult {
  const otherMonths = existing.filter((e) => {
    const months = new Set(incoming.map((i) => i.monthKey));
    return !months.has(e.monthKey);
  });

  const sameMonthExisting = existing.filter((e) =>
    incoming.some((i) => i.monthKey === e.monthKey)
  );

  const withPhone: Entry[] = [];
  const kept: Lead[] = [...otherMonths];
  const notes: string[] = [];
  let removedCount = 0;
  let keptIncoming = 0;

  for (const lead of incoming) {
    if (!lead.phoneNormalized) {
      kept.push(toLead(lead));
      keptIncoming += 1;
      continue;
    }
    withPhone.push({
      kind: "new",
      lead,
      createdAtLead: lead.createdAtLead,
      phone: lead.phoneNormalized,
      monthKey: lead.monthKey,
      isSuccess: lead.isSuccess,
      priority: lead.hasPriority,
    });
  }

  for (const lead of sameMonthExisting) {
    if (!lead.phoneNormalized) {
      kept.push(lead);
      continue;
    }
    withPhone.push({
      kind: "existing",
      lead,
      createdAtLead: new Date(lead.createdAtLead),
      phone: lead.phoneNormalized,
      monthKey: lead.monthKey,
      isSuccess: lead.isSuccess,
      priority: lead.hasVisit || lead.isScheduled,
    });
  }

  const groups = new Map<string, Entry[]>();
  for (const e of withPhone) {
    const key = `${e.phone}::${e.monthKey}`;
    const list = groups.get(key) || [];
    list.push(e);
    groups.set(key, list);
  }

  for (const [key, group] of groups) {
    const successes = group.filter((g) => g.isSuccess);
    const others = group.filter((g) => !g.isSuccess);

    for (const s of successes) {
      if (s.kind === "new") {
        kept.push(toLead(s.lead));
        keptIncoming += 1;
      } else {
        kept.push(s.lead);
      }
    }

    if (others.length === 0) continue;

    const priorityOnes = others.filter((o) => o.priority);
    const pool = priorityOnes.length > 0 ? priorityOnes : others;
    pool.sort((a, b) => b.createdAtLead.getTime() - a.createdAtLead.getTime());
    const winner = pool[0];

    for (const o of others) {
      if (o === winner) {
        if (o.kind === "new") {
          kept.push(toLead(o.lead));
          keptIncoming += 1;
        } else {
          kept.push(o.lead);
        }
        continue;
      }
      removedCount += 1;
      if (notes.length < 25) {
        const reason = winner.priority ? "visita/agendamento" : "mais recente";
        const [phone, month] = key.split("::");
        notes.push(`Duplicado ${phone} (${month}): mantido por ${reason}`);
      }
    }
  }

  return { leads: kept, removedCount, keptIncoming, notes };
}
