import { InfoTip } from "../InfoTip";
import { MOTIVO_NAO_INFORMADO } from "../../lib/scheduling/metrics";

type Props = {
  motivo: string;
  ids?: string[];
};

/** Nome do motivo. Em "Motivo não informado", o ícone lista os IDs daquele recorte. */
export function MotivoLabel({ motivo, ids }: Props) {
  const show = motivo === MOTIVO_NAO_INFORMADO && Boolean(ids?.length);
  return (
    <span className="motivo-label">
      {motivo}
      {show ? <InfoTip label="Ver IDs sem motivo">{ids!.join(", ")}</InfoTip> : null}
    </span>
  );
}
