/** Entry para o gerador offline da base de agendamentos. */
export { parseLeadsCampanhaArrayBuffer } from "../campanhas/parseLeadsCampanha";
export { parseSchedulingArrayBuffer } from "./parseSchedulingExcel";
export {
  applyLeadsCampanhaImport,
  applySchedulingImport,
  emptySchedulingDataset,
  reconcileSchedulingDataset,
} from "./mergeById";
