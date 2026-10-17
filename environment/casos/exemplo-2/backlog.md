# Backlog — Pedido de compra

## H1 Abrir requisição
Como requisitante, quero abrir a requisição do material que preciso.
- papel: requisitante
- duracao: 10
- gera: requisição

## H2 Cotar fornecedores
Como compras, quero cotar pelo menos três fornecedores.
- papel: setor de compras
- duracao: 60
- depois de: H1
- usa: requisição
- gera: cotações

## H3 Validar orçamento
Como financeiro, quero validar se o centro de custo tem verba.
- papel: time financeiro
- duracao: 20
- depois de: H1
- usa: requisição
- gera: orçamento validado

## H4 Escolher fornecedor
Como compras, quero escolher o fornecedor com o melhor preço.
- papel: Compras
- duracao: 15
- depois de: H2, H3
- usa: cotações, orçamento validado
- gera: fornecedor escolhido
- se valor a partir de 5000 então H5 senão H6

## H5 Aprovar compra
Como gerente, quero aprovar compras grandes.
- papel: gerente
- duracao: 30
- usa: fornecedor escolhido
- aprova: compra
- gera: compra aprovada

## H6 Emitir pedido ao fornecedor
Como compras, quero emitir o pedido de compra.
- papel: Compras
- duracao: 10
- depois de: H5
- usa: fornecedor escolhido, compra aprovada
- gera: pedido

## H7 Aprovar pagamento
Como gerência, quero aprovar o pagamento antes de o dinheiro sair.
- papel: Gerência
- duracao: 20
- depois de: H6
- usa: pedido
- aprova: compra
- gera: pagamento aprovado

## H8 Receber mercadoria
Como requisitante, quero receber e conferir o material entregue.
- papel: Solicitante
- duracao: 15
- depois de: H6
- usa: pedido
- gera: nota fiscal

## H9 Conferir nota fiscal
Como financeiro, quero conferir a nota contra o pedido.
- papel: Financeiro
- duracao: 15
- depois de: H8
- usa: nota fiscal
- gera: nota conferida
- volta para: H8

## H10 Pagar fornecedor
Como financeiro, quero pagar o fornecedor na data certa.
- papel: time financeiro
- duracao: 10
- depois de: H7, H9
- usa: pagamento aprovado, nota conferida

## H2 Cotar fornecedores (refinada na planning)
Como compras, quero cotar fornecedores pelo catálogo já homologado.
- papel: Compras
- duracao: 5
- depois de: H1
- usa: requisição
- gera: cotações

## Ajustes
- H3 não depende mais de H1
