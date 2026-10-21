const SITE = "https://www.belloscar.com.br";

/** Assinatura e link da BellosCar, iguais em todas as páginas. */
export function SiteCredit() {
  return (
    <div className="site-credit">
      <p>by Andressa Barra - Gestora Web Vendas</p>
      <a href={SITE} target="_blank" rel="noopener noreferrer">
        www.belloscar.com.br
      </a>
    </div>
  );
}
