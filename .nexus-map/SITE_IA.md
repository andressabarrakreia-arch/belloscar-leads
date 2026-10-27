# Site IA — BellosCar Análise de Resultados

Modo `site-ia` (codebase-learner). Hierarquia **do produto** como está (HashRouter).

## Audiência

- Equipe (somente leitura): links públicos dos módulos
- Andressa / gestão: PIN admin + gate Erros/Mapa

## Árvore

```
/ (Índice Geral)
├── campanhas/
│   ├── (dashboard)
│   ├── atendentes
│   ├── comparar
│   ├── formularios
│   └── admin          [PIN gestão]
├── agendamentos/
│   ├── (visão geral)
│   ├── pre-vendas
│   ├── vendedores
│   ├── detalhe
│   ├── portais
│   ├── insucessos
│   └── admin          [PIN gestão]
├── negociacoes/
│   ├── (visão geral)
│   ├── lancamentos
│   ├── vendedores
│   └── admin          [PIN gestão]
├── perfil/
├── erros/             [PIN gate 2640]
├── mapa/              [PIN gate 2640]  ← Mapa do Site (atlas + grafo)
├── apresentacao/      [PIN gate 2640]  ← sala de resultados + WhatsApp (texto/PNG)
└── indice/gestao/     [PIN gestão]
```

## Nav do hub (portas)

Campanhas · Agendamentos · Negociações · Perfil · Erros · Mapa do Site · Apresentação  
(Gestão no rodapé, não na grade de portas.)

## URL pattern

`https://andressacarmetrics.com.br/#/<rota>`
