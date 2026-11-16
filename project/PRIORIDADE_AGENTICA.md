# Mudança de prioridade — execução real antes de ampliar demonstrações

Os dois documentos mais recentes do responsável substituem a prioridade de produzir telas pela prioridade de auditar os 25 produtos, conectar fontes reais e comprovar a cadeia objetivo→ferramentas→evidências→resultado. Preservar o design não significa apresentar protótipos como agentes prontos.

## Critérios operacionais

- Um aplicativo começa vazio, sem exemplos fictícios carregados como registros operacionais. Número não informado é desconhecido, não zero; booleano não informado não é uma afirmação falsa.
- Dados editados/importados são **fornecidos**, não automaticamente autênticos, atuais ou verificados.
- Fixtures controladas continuam possíveis em testes e protótipos explicitamente identificados, fora da experiência operacional. Não são prova de execução real.
- Disponibilidade de URL não significa leitura bem-sucedida; HTTP 200 não garante conteúdo útil; leitura de página oficial não comprova análise de elegibilidade, taxa, certificação ou transação.
- Uma resposta do modelo não é recibo. Um recibo de leitura não é recibo de escrita, aprovação ou aceitação do órgão.
- RAG inclui uma base de recuperação, mas geração com um provedor real deve ser demonstrada separadamente. Busca local BM25, embeddings e geração são capacidades diferentes.

## O que existe nos modelos atualmente

`model_provider.ROLE_MODELS` define três papéis: planner e specialist com `openai/gpt-oss-20b`, critic com `openai/gpt-oss-120b`. Portanto são três papéis e dois identificadores distintos no padrão atual. Rotação de chaves também não cria modelos ou agentes adicionais.

Neste ambiente não foram encontradas credenciais de provedor ativas durante a verificação. Os testes controlados confirmam orquestração, seleção de ferramentas, persistência e roteamento; não comprovam três modelos distintos conectados nem chamadas reais. Não alterar isso no relatório só porque a arquitetura foi planejada assim. Preservar os papéis e registrar o modelo efetivamente observado em cada futura chamada autorizada.

## Trabalho paralelo efetivamente realizado

Foram criadas duas frentes delegadas reais e mantido o agente principal no motor, formando a equipe de três solicitada:

1. **Fontes e integrações:** verificações de fontes/APIs e acessos reais, matriz dos 25 e revisão independente do leitor de fontes.
2. **Motor e integração (agente principal):** registro de ferramentas, ingestão de fonte pública real, recibos, escopo, recuperação, versionamento e testes.
3. **UX/mobile/QA:** remoção de dados operacionais inventados, estado desconhecido, guardas de entrada, painel de fontes e testes de interação.

As frentes usam as ferramentas disponíveis no ambiente. Não são três contas de API adicionais, três instâncias de produção ou prova automática de três modelos conectados a cada aplicativo.

## Leitor público real e limites do piloto

O novo `source_tools.py` lê um catálogo fixo de PDFs/HTML oficiais, respeita HTTPS, bloqueia redirecionamentos/URLs arbitrárias e registra hashes, tempo e conteúdo efetivamente recebido. O transporte respeita o proxy de saída do ambiente; quando ele resolve o destino, isso fica explícito no recibo. Erros não geram documentos ou sucesso fictício.

O conteúdo é armazenado no escopo de usuário/app, indexado com citações e ligado a uma versão. Leituras anteriores permanecem no histórico, mas versões substituídas não entram na busca lexical/semântica atual. O horário da leitura não é gravado como data de publicação da lei. A atualização é sob demanda, não monitoramento contínuo.

Model mode pode listar/selecionar uma fonte permitida; o planejador do grafo pode solicitar IDs de fonte dentro do catálogo. Entrada original da tarefa continua imutável. Testes com modelo controlado verificam esse encadeamento; a leitura real de fontes é documentada separadamente. Não há novo conector de escrita externa.

Os cinco primeiros leitores foram executados com conteúdo real: PDPL, guia ICP, tabela de cobranças DMCC, página eSupply e procedimento DEWA Move-in. Isso comprova leitura/ingestão dessas páginas, **não** auditoria jurídica autônoma completa, elegibilidade de visto, custos finais verificados, descoberta completa de editais ou transação de serviço público.

## Portão de conclusão, para cada um dos 25

Objetivo autêntico; entrada real suficiente; fontes adequadas; decisão/coordenação de ferramentas; execução observada; tratamento de informação ausente/falha; permissões; resultado ligado à evidência; interação compreensível no mobile; limites explícitos. Se faltar um componente exigido pela função principal, classificar o fluxo como incompleto.

A meta de cinco por dia continua organização de trabalho, não autorização para declarar cinco produtos prontos sem esse portão. O alvo de 25 vem do programa do responsável; a página oficial da competição permite múltiplas soluções, mas não exige que cada participante entregue 25.

## Publicação

Os envios foram pausados para ler e incorporar os novos requisitos. A revisão em três frentes e os relatórios de teste antecedem a retomada da publicação incremental pelo coordenador. O commit-base anterior a esta rodada é `d69ec381e13bb36073d10801936964ff6773d9f7`; o envio atual deve ser confirmado pelo hash remoto, não presumido por este documento.

Nenhum dos 25 produtos é declarado pronto para produção. Publicar código-fonte e evidências parciais não converte testes controlados em inferência real ou leitores públicos em fluxos primários concluídos.
