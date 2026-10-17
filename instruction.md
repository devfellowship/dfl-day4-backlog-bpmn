Você é o analista de negócio: desenhe o processo BPMN de cada backlog em `casos/`, rode os casos reais, simule a fila e meça o processo otimizado.

Para cada pasta `casos/<caso>/`, leia `backlog.md`, `papeis.json`, `instancias.json` e `fila.json` e escreva `out/<caso>.json` com as 4 chaves `processo`, `instancias`, `fila` e `to_be`.
As regras e o formato exato estão no `README.md`. Siga as regras à risca: última versão da história vale por inteiro, ajustes em ordem (inclusive cancelamento), apelidos de papel, limites da decisão (acima de / a partir de / abaixo de / até), retrabalho com seu limite, fila FIFO por raia dentro do expediente, e as mudanças do TO-BE na ordem dos insights. Cada etapa usa a anterior: vale a pena escrever um script.
Escreva só em `out/`. Não edite `tests/`, `casos/`, `README.md` nem `package*.json`.
