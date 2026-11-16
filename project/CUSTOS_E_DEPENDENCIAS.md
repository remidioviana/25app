# Custos, dependências e decisões abertas

O acesso dos usuários continua gratuito. Os valores abaixo são variáveis de orçamento; não são cotações, financiamento garantido ou contratação de serviços.

## Modelo mensal

Defina:

- `U`: usuários ativos por dia; `T`: tarefas por usuário/dia; `D`: dias.
- `S`: chamadas médias de modelo por tarefa, incluindo revisões previstas.
- `I` e `O`: tokens médios de entrada/saída por chamada.
- `Pi` e `Po`: preços atuais por milhão de tokens do modelo escolhido.
- `E`: custo medido de embeddings/OCR/fontes por tarefa quando utilizado.
- `F`: hospedagem, banco, armazenamento, logs, tráfego e outros custos fixos mensais.
- `R`: reserva explícita para falhas/repetições e picos, baseada em medição.

```text
N = U × T × D
Custo_modelo = N × S × (I × Pi + O × Po) / 1.000.000
Custo_total = Custo_modelo + N × E + F + R
```

Exemplo apenas de volume: 100 usuários × 2 tarefas/dia × 30 dias = 6.000 tarefas. Se cada tarefa usa 3 chamadas, são 18.000 chamadas. Sem preços e tokens medidos, não há valor monetário honesto a informar. Não multiplicar de novo por três quando os tokens já foram somados por tarefa.

As 25 aplicações podem ter custos muito diferentes. Uma leitura local de contas não tem o mesmo perfil de OCR, pesquisa documental, visão ou coordenação de ferramentas externas. Medir por produto e por tipo de tarefa; custo baixo de um exemplo não prova sustentabilidade do portfólio inteiro.

## Dependências e quem as resolve

| Item | Necessário para | Pode ser adiado? | Responsável pela parte externa |
|---|---|---|---|
| GitHub | Histórico e entregas atuais | Já conectado; não determina a execução da IA | Titular do repositório |
| Provedor de IA | Inferência remota real | Sim, durante ferramentas locais/design | Titular da conta/projeto e orçamento |
| Fontes de domínio | Análises atuais e específicas | Não para declarar legalidade/elegibilidade/condição ao vivo | Órgão, fornecedor de dados ou especialista autorizado |
| Hospedagem/TLS | Beta remota/serviço público | Sim, durante desenvolvimento local | Operador do serviço |
| Armazenamento de documentos | Dossiês reais persistentes | Sim, enquanto metadados ficam locais | Operador e responsáveis por dados |
| Aparelho iOS e Android | Validação de experiência nativa | Não para afirmar aceitação nos dispositivos | Responsável pelo produto/testadores |
| Conta/assinatura de distribuição | Instalação assinada e lojas | Sim, até o fluxo nativo estar pronto | Titular das contas de desenvolvedor |
| Integração externa | Operação específica fora do app | Sim, se a alternativa humana estiver claramente identificada | Serviço externo/titular com autoridade |
| Regras da competição | Formato, elegibilidade e prazo de inscrição | Não para prometer submissão/competitividade | Responsável pelo produto |

Não vamos abrir contas, contratar serviços, publicar nas lojas ou gastar crédito sem escopo/autorização aplicáveis. A implementação e os testes que não dependem disso continuam normalmente.

## Limites operacionais a configurar antes da beta

Por tarefa: máximo de chamadas, tokens, anexos, tamanho de documento, tempo e tentativas. Por instalação/app: limites transparentes de frequência/armazenamento. Por operação externa: destino permitido, autoridade, idempotência e recibo. Por modelo: fallback permitido e tratamento de recusa/custo. O runtime já tem alguns limites de rodadas/ferramentas; isso ainda não é um orçamento completo de produção.

Um limite gratuito deve explicar o motivo e a retomada possível, sem inventar um plano premium. Não há compromisso de uso remoto ilimitado. Se a viabilidade financeira falhar, considerar reduzir escopo de inferência, processar partes localmente, obter patrocínio ou limitar uma beta; não mascarar custo com promessas.

## Decisões ainda não resolvidas

Orçamento mensal; modelo/provedor de produção; forma de sustentação gratuita; região e termos de processamento; dados/autorizações de domínio; contas de desenvolvedor; aparelhos e versões mínimas; dia/hora exatos do prazo e critérios detalhados da competição, cuja página oficial já foi identificada. A ausência desses dados não bloqueia design, cálculos, testes locais e documentação, mas bloqueia afirmações sobre operação pública ilimitada, sucesso de integrações ou distribuição final.
