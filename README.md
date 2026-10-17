# Task P1: Backlog → BPMN com insights de otimização

Analistas de negócio de pequenas empresas têm um backlog solto de histórias de usuário com pequenas regras
(quem faz, quanto demora, depois de quê, decisões por valor, retrabalho). O agente desenha o processo
(raias, fluxos, gateways), acha o caminho crítico e aponta otimizações de um catálogo fechado.

| Pasta | O que é |
|---|---|
| `instruction.md` | o prompt que o agente recebe |
| `tests/public/` | 5 testes, um por `exemplo-*` |
| `solution/` | solução de referência (`solution.patch`) e o gerador (`ref.mjs`). **Não leia antes de tentar** |
| `task.json` | o contrato da task |
| `visual.json` | versão para humanos dos 5 casos públicos (o site renderiza) |

Regerar os esperados: `node solution/ref.mjs environment/casos`.

Armadilhas do `exemplo-2` (pedido de compra): apelido de papel (`gerente` = `Gerência` = raia `gerencia`),
história `H2` reescrita mais abaixo (vale só a de baixo: 5 min, muda o caminho crítico), ajuste
`H3 não depende mais de H1` (H3 passa a sair do INICIO, que vira gateway paralelo), decisão `a partir de 5000`
(`>=` e o contrário `<`), `H6` com `depois de: H5` e também alvo do `senão` (junção), `volta para` sem limite
(`loop_sem_limite`, fora do caminho crítico) e duas aprovações da `compra` na mesma raia em sequência
(`aprovacao_redundante`).

> Esta é a metade pública: 5 casos. A avaliação final usa também 5 casos ocultos, nos mesmos níveis, que não estão neste repo. `tests/hidden/` aqui é a cópia dos públicos.
