# Backlog — Liberação de crédito para cliente novo

## H1 Cadastrar cliente
Como vendedor, quero cadastrar o cliente novo no sistema.
- papel: vendedor
- duracao: 15
- gera: cadastro

## H2 Consultar birô de crédito
Como analista de crédito, quero consultar o score do CNPJ.
- papel: analista de crédito
- duracao: 10
- depois de: H1
- usa: cadastro
- gera: score

## H3 Coletar documentos
Como comercial, quero pedir contrato social e balanço ao cliente.
- papel: comercial
- duracao: 20
- depois de: H1
- usa: cadastro
- gera: documentos

## H4 Analisar crédito
Como crédito, quero analisar score e documentos e propor um limite.
- papel: Crédito
- duracao: 25
- depois de: H2, H3
- usa: score, documentos
- gera: parecer
- se limite até 20000 então H5 senão H6
- volta para: H3 no máximo 2 vezes

## H5 Aprovar limite
Como analista de crédito, quero aprovar limites pequenos sozinho.
- papel: analista de crédito
- duracao: 10
- usa: parecer
- aprova: limite
- gera: limite aprovado

## H6 Aprovar limite em comitê
Como crédito, quero levar limites grandes ao comitê de crédito.
- papel: Crédito
- duracao: 75
- usa: parecer
- aprova: limite
- gera: limite aprovado

## H7 Liberar limite no sistema
Como crédito, quero liberar o limite aprovado no ERP.
- papel: Crédito
- duracao: 5
- depois de: H5, H6
- usa: limite aprovado
- gera: limite liberado

## H8 Assinar contrato
Como diretor, quero assinar o contrato de fornecimento a prazo.
- papel: diretor
- duracao: 20
- depois de: H7
- usa: limite liberado
- aprova: contrato
- gera: contrato assinado

## H9 Validar contrato com o cliente
Como vendedor, quero que o cliente dê o aceite no contrato.
- papel: Vendas
- duracao: 10
- depois de: H8
- usa: contrato assinado
- aprova: contrato
- gera: contrato aceito

## H10 Enviar boas-vindas
Como vendedor, quero mandar o kit de boas-vindas ao cliente.
- papel: vendedor
- duracao: 5
- depois de: H7
- usa: cadastro

## H11 Entregar primeiro pedido
Como expedição, quero entregar o primeiro pedido a prazo.
- papel: expedição
- duracao: 40
- depois de: H9
- usa: contrato aceito
