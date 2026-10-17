# Backlog — Reembolso de despesas

## H1 Registrar pedido de reembolso
Como colaborador, quero registrar o pedido de reembolso para receber o que gastei.
- papel: Colaborador
- duracao: 10
- gera: pedido

## H2 Anexar comprovantes
Como colaborador, quero anexar as notas para comprovar a despesa.
- papel: Colaborador
- duracao: 15
- depois de: H1
- usa: pedido
- gera: comprovantes

## H3 Conferir comprovantes
Como financeiro, quero conferir as notas para evitar pagamento indevido.
- papel: Financeiro
- duracao: 20
- depois de: H2
- usa: comprovantes
- gera: pedido conferido
- se valor acima de 1000 então H4 senão H5

## H4 Aprovar reembolso alto
Como gestor, quero aprovar reembolsos altos para controlar o orçamento.
- papel: Gestor
- duracao: 30
- usa: pedido conferido
- aprova: reembolso
- gera: reembolso aprovado

## H5 Pagar reembolso
Como financeiro, quero pagar o reembolso para encerrar o pedido.
- papel: Financeiro
- duracao: 10
- depois de: H4
- usa: pedido conferido, reembolso aprovado
- gera: pagamento

## H6 Lançar na planilha de despesas
Como financeiro, quero lançar o reembolso na planilha do mês.
- papel: Financeiro
- duracao: 5
- depois de: H5
- usa: pedido conferido

## H7 Arquivar comprovantes
Como financeiro, quero arquivar as notas para a contabilidade.
- papel: Financeiro
- duracao: 5
- depois de: H2
- usa: comprovantes
