# Backlog — Reforma residencial (construtora pequena)

## H1 Atender cliente
Como vendedor, quero entender o que o cliente quer reformar.
- papel: vendedor
- duracao: 20
- gera: briefing

## H2 Visitar o imóvel
Como engenheiro, quero medir o imóvel e checar a estrutura.
- papel: engenheiro
- duracao: 60
- depois de: H1
- usa: briefing
- gera: medições

## H3 Fotografar o imóvel
Como vendedor, quero fotografar os cômodos para o orçamento.
- papel: vendedor
- duracao: 15
- depois de: H1
- usa: briefing
- gera: fotos

## H4 Montar orçamento
Como engenharia, quero montar o orçamento de material e mão de obra.
- papel: Engenharia
- duracao: 90
- depois de: H2, H3
- usa: medições, fotos
- gera: orçamento
- se valor acima de 50000 então H5 senão H6

## H5 Aprovar orçamento grande
Como sócio, quero aprovar orçamentos acima do teto.
- papel: sócio
- duracao: 30
- usa: orçamento
- aprova: orçamento
- gera: orçamento aprovado

## H6 Revisar margem
Como comercial, quero conferir a margem antes de mandar a proposta.
- papel: Comercial
- duracao: 20
- depois de: H5
- usa: orçamento, orçamento aprovado
- gera: proposta

## H7 Enviar proposta
Como vendedor, quero mandar a proposta ao cliente.
- papel: vendedor
- duracao: 10
- depois de: H6
- usa: proposta
- gera: proposta enviada

## H8 Assinar contrato
Como diretoria, quero assinar o contrato com o cliente.
- papel: Diretoria
- duracao: 20
- depois de: H7
- usa: proposta enviada
- aprova: orçamento
- gera: contrato
- volta para: H4

## H9 Comprar materiais
Como suprimentos, quero comprar os materiais da lista.
- papel: suprimentos
- duracao: 120
- depois de: H8, H10
- usa: contrato, lista de materiais
- gera: pedido de compra, materiais

## H10 Detalhar lista de materiais
Como engenheiro, quero transformar o orçamento numa lista de compra.
- papel: engenheiro
- duracao: 40
- depois de: H4
- usa: orçamento
- gera: lista de materiais

## H11 Pagar sinal ao fornecedor
Como contas a pagar, quero pagar o sinal do pedido de compra.
- papel: contas a pagar
- duracao: 15
- depois de: H9
- usa: pedido de compra
- gera: sinal pago

## H12 Agendar equipe
Como mestre de obras, quero reservar a equipe para a obra.
- papel: mestre de obras
- duracao: 10
- depois de: H8
- usa: contrato
- gera: cronograma

## H13 Demolir
Como equipe de obra, quero demolir o que sai na reforma.
- papel: equipe de obra
- duracao: 240
- depois de: H12
- usa: cronograma
- gera: área livre

## H14 Executar obra
Como obra, quero executar a reforma.
- papel: Obra
- duracao: 600
- depois de: H13, H11
- usa: área livre, materiais
- gera: obra executada

## H15 Vistoriar obra
Como engenheiro, quero vistoriar a obra antes da entrega.
- papel: engenheiro
- duracao: 60
- depois de: H14
- usa: obra executada
- gera: laudo de vistoria
- se pendencias acima de 0 então H16 senão H17

## H16 Corrigir pendências
Como equipe de obra, quero corrigir o que a vistoria apontou.
- papel: equipe de obra
- duracao: 120
- usa: laudo de vistoria
- gera: pendências corrigidas
- volta para: H15 no máximo 3 vezes

## H17 Entregar obra
Como eng. responsável, quero entregar a obra ao cliente.
- papel: eng. responsável
- duracao: 30
- depois de: H16
- usa: laudo de vistoria, pendências corrigidas
- aprova: obra
- gera: termo de entrega

## H18 Emitir nota fiscal
Como financeiro, quero emitir a nota fiscal da reforma.
- papel: Financeiro
- duracao: 15
- depois de: H17
- usa: termo de entrega
- gera: nota fiscal

## H19 Cobrar parcela final
Como financeiro, quero cobrar a última parcela do cliente.
- papel: Financeiro
- duracao: 10
- depois de: H18
- usa: nota fiscal

## H20 Pesquisa de satisfação
Como vendedor, quero perguntar ao cliente o que achou da obra.
- papel: vendedor
- duracao: 25
- depois de: H17
- usa: termo de entrega

## H13 Demolir (refinada)
Como equipe de obra, quero demolir com a equipe dobrada.
- papel: equipe de obra
- duracao: 180
- depois de: H12
- usa: cronograma
- gera: área livre

## Ajustes
- H3 foi cancelada
- H12 passa a depender de H3
- H14 não depende mais de H11
