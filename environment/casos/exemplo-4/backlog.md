# Backlog — Devolução de produto da loja online

## H1 Registrar pedido de devolução
Como SAC, quero registrar o pedido de devolução que o cliente abriu no site.
- papel: SAC
- duracao: 10
- gera: protocolo

## H2 Gerar etiqueta de postagem
Como atendimento, quero gerar a etiqueta para o cliente postar o produto.
- papel: Atendimento
- duracao: 5
- depois de: H1
- usa: protocolo
- gera: etiqueta

## H3 Receber produto
Como almoxarifado, quero receber o pacote devolvido.
- papel: almoxarifado
- duracao: 30
- depois de: H2
- usa: etiqueta
- gera: produto recebido

## H4 Inspecionar produto
Como inspeção, quero verificar se o produto tem defeito ou mau uso.
- papel: inspeção
- duracao: 40
- depois de: H3
- usa: produto recebido
- gera: laudo
- se dias abaixo de 8 então H5 senão H6

## H5 Estornar pagamento
Como contas a receber, quero estornar o cartão do cliente.
- papel: contas a receber
- duracao: 15
- usa: laudo
- gera: estorno

## H6 Enviar para conserto
Como qualidade, quero mandar o produto para a assistência técnica.
- papel: Qualidade
- duracao: 50
- usa: laudo
- gera: produto consertado

## H7 Encerrar protocolo
Como SAC, quero encerrar o protocolo e avisar o cliente.
- papel: SAC
- duracao: 5
- depois de: H5, H6
- usa: estorno, produto consertado

## H8 Repor no estoque
Como estoque, quero devolver à prateleira o que voltou em bom estado.
- papel: Estoque
- duracao: 10
- depois de: H4, H9
- usa: produto recebido, laudo

## H2 Gerar etiqueta de postagem (revisada)
Como atendimento, quero que a transportadora mande a etiqueta direto ao cliente.
- papel: Atendimento
- duracao: 5
- depois de: H1
- usa: protocolo

## Ajustes
- H8 passa a depender de H3
