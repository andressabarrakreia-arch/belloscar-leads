export type GeneroCliente = "Feminino" | "Masculino" | "Não identificado";

const FEMININOS = new Set(
  `ana maria adriana fernanda juliana patricia aline debora priscila camila alessandra sandra
  daniele caroline flavia julia monica leticia amanda luciana carol carla michele marcia
  rosangela larissa jessica simone viviane mariana daiane thais carolina marina eliane
  roberta janaina cristina laura isabela gisele tayane silvia barbara denise luciane
  vanessa franciele paula rafaela claudia andressa danielle jaqueline yasmin bianca
  angelica andrea silvana leila tatiane andreia angela eliana mayara milena sheila
  giovanna francine ligia suellen karina lilian fabiana elisangela tania silmara clarice
  beatriz isabelle zelia graciele siciane cilmara sibele vivian michelly thallita tamira
  shaiana jane roseris zulmira roseli eva karla maira regiane telma beatrice thayanne
  nadine elisiane franciane tatiana karol nair manoela samara victoria milene joseane
  eduarda bruna suelen dyonatha heloisa lorena nicole brenda gabrielly isabella sofia
  alice helena rafaela luana talita tais taina dayse hallana laisa paola rosana teresa`.split(/\s+/).filter(Boolean)
);

const MASCULINOS = new Set(
  `marcos joao rafael luiz carlos paulo lucas eduardo jose marcelo fernando daniel
  leonardo gustavo andre fabio felipe gabriel guilherme rodrigo ricardo bruno thiago
  pedro daivid henrique anderson leandro emerson marcio roberto edson alexandre sergio
  antonio matheus adriano renato vinicius diego luis marquinhos juliano rogerio ronaldo
  jean marco claudio jorge mario junior david julio wagner cleverson yuri jefferson
  victor willian wilson douglas renan mauricio fabricio fabiano alex alan luciano
  jeferson danilo gilberto kevin caio jairo silvan francisco nicolas tiago sandro
  mauro silvio vitor arthur cristiano milton mateus samuel murilo celio nelson
  alessandro ederson edilson evandro altamir jonathan jonas cleiton giovanni jair
  adilson marlon sidnei sidney hugo everton otavio vagner andrey cesar robson cezar
  flavio gilmar alvaro wesley joanito vanderlei amarildo miguel bernardo alisson
  thomas michel raphael davi gerson leo amauri ivan elias gilson felippe juarez
  romulo dirceu reinaldo lincoln cleber edison cristian giovani celso sidinei artur
  valter roger wellington filipe nilton manoel claudinei raul thales nilson cassio
  ednilso lorenzo letheo eric eliseu marcus helcio valdir deivid william igor
  valdecir israel everaldo pericles marcelino willians helio kainan lauro elvis
  wilian dionisio odair ronuel dagoberto gilnei decio elerton egon vander aldo
  abner enzo cristofer angelo alceu kauan humberto reginaldo chico everson tony
  geovani alysson maykon mauri luan eliel christiano alberto inacio clovis
  adalberto juan osvaldo vilmar jonatas gastao ruan eron pietro welington franco
  frederico ney osmar natan hilton orlando edenilson altair heitor kaua lorenzo
  benjamin samuel vicente sebastiao geraldo alexsandro genisson josenildo michael nicholas patrik romeu`.split(/\s+/).filter(Boolean)
);

const EMPRESA = /\b(ltda|eireli|epp|s\/a|comercio|com[eé]rcio|ve[ií]culos|auto ?pe[cç]as|irm[aã]os|oficina|mecanica|mec[aâ]nica)\b/i;

function semAcento(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Estima o gênero pelo primeiro nome. A planilha não tem essa coluna. */
export function generoDoCliente(nome: string): GeneroCliente {
  const bruto = nome.trim();
  if (!bruto || EMPRESA.test(bruto)) return "Não identificado";
  const primeiro = semAcento(bruto).replace(/[^a-z ]/g, " ").trim().split(/\s+/).filter(Boolean)[0] ?? "";
  if (primeiro.length < 2) return "Não identificado";
  if (FEMININOS.has(primeiro)) return "Feminino";
  if (MASCULINOS.has(primeiro)) return "Masculino";
  return "Não identificado";
}
