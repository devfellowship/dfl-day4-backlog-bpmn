# Task P1: Backlog → BPMN → instâncias → fila → TO-BE

Analistas de negócio de pequenas empresas recebem um backlog solto de histórias de usuário com pequenas regras
(quem faz, quanto demora, depois de quê, decisões por valor, retrabalho) e precisam entregar o processo desenhado
**e** otimizado. O agente faz o pipeline inteiro, em 4 etapas encadeadas (cada uma usa a anterior):

| Etapa | Entrada | Saída (`out/<caso>.json`) |
|---|---|---|
| `processo` | `backlog.md`, `papeis.json` | raias, fluxos, gateways, caminho crítico, insights do catálogo fechado |
| `instancias` | processo + `instancias.json` | por pedido real: tarefas executadas em ordem (com retrabalho e seus limites), esforço e minutos |
| `fila` | execuções + chegada + `fila.json` | simulação FIFO por raia com pessoas e expediente: término de cada pedido, espera e fila máxima por raia, gargalo |
| `to_be` | insights + instâncias | processo otimizado: histórias removidas, novo caminho crítico, minutos e economia por pedido |

| Pasta | O que é |
|---|---|
| `instruction.md` | o prompt que o agente recebe |
| `tests/public/` | 20 testes de **formato**: um por etapa em cada `exemplo-*` (confere campos e tipos, não os valores) |
| `solution/` | solução de referência: **bloqueada até o fim do hackathon** |
| `task.json` | o contrato da task |
| `visual.json` | versão para humanos dos 5 casos públicos (o site renderiza) |



> Esta é a metade pública: 5 casos, sem as respostas. Os testes daqui só conferem o formato de `out/<caso>.json`. A nota final vem de testes ocultos que conferem os valores, nestes 5 casos e em outros 5 dos mesmos níveis.
