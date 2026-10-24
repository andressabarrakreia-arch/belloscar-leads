import { ShareDonut } from "../charts/ShareDonut";

type Props = {
  data: { label: string; value: number }[];
  title?: string;
  subtitle?: string;
};

export function ProposalDistributionChart({
  data,
  title = "Distribuição de propostas",
  subtitle = "Compra, Venda, Troca, Consignação, Financiamento e não informado.",
}: Props) {
  return <ShareDonut title={title} tip={subtitle} data={data} />;
}
