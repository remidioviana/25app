# Auditoria operacional de UX — agente 03

Escopo: código nativo, console web de desenvolvimento, estados iniciais, procedência dos dados e ligação entre interface e execução. Esta auditoria foi feita em paralelo com a frente de fontes e com a frente do motor de execução. Não houve commit, push, submissão, cadastro, mensagem externa ou publicação pelo agente 03.

## Resultado principal

O estado inicial dos 25 aplicativos nativos e do console web carregava automaticamente o objeto `example` de cada especificação. A conexão/reset também restaurava a amostra. Os dados eram identificados como exemplo, mas ainda ocupavam a superfície operacional com contratos, valores, registros e condições fictícias antes de uma tarefa do usuário.

Esse comportamento foi removido localmente. A inicialização e o reset usam um objeto com a estrutura do schema, strings vazias, listas vazias e valores numéricos/booleanos desconhecidos (`null`). Não se interpreta campo não preenchido como zero ou falso. Os exemplos continuam apenas nas especificações/testes e nos protótipos de design identificados; não são carregados automaticamente no aplicativo operacional.

`hasInputs` significa somente que um rascunho foi explicitamente editado/aplicado. **Não é autenticação, validação de fonte nem prova de que o conteúdo é verdadeiro.** A interface identifica o conteúdo como fornecido e não autenticado. O fluxo futuro orientado a objetivo deve usar seu contrato próprio, sem obrigar o usuário a preencher manualmente todos os campos dos formulários legados.

## Alterações implementadas nesta frente

- `mobile/src/forms.ts`: estado vazio estruturado; números e respostas sim/não desconhecidos; criação de rascunhos independentes, sem amostras.
- `mobile/src/AppState.tsx`: inicialização/reset sem dados fictícios, sem run prévio e sem marcação implícita de demonstração; edição/aplicação de rascunho registrada separadamente da autenticidade.
- Home nativa: estado vazio útil; os calculadores/painéis de domínio não são invocados antes de haver um rascunho fornecido. Nenhum documento é apresentado como analisado nesse estado.
- Missão legada: execução de um rascunho inicial intocado é bloqueada com uma ação clara para abrir o editor. Entradas realmente fornecidas ou propostas explicitamente aplicadas continuam acessíveis.
- `DataForm`: valores numéricos vazios ficam desconhecidos; resposta booleana desconhecida tem indicação escrita e escolhas explícitas, inclusive “Set no” e limpar.
- Console web: início/reset sem amostra; campos desconhecidos não assumem zero/falso; Run e agendamento não aceitam um rascunho intocado; limpar remove o resultado da sessão visual, sem apagar histórico persistido do servidor.
- O estado vazio do console deixa de anunciar que um artefato já está disponível antes de qualquer execução. O catálogo fala em workspaces de domínio, sem tratar sua existência como prova de autonomia.

## Handoff integrado com as outras duas frentes

A frente do motor adicionou o leitor de fontes públicas e os endpoints `GET/POST /api/agents/{id}/sources`. A frente de UX conectou esse contrato à aba Evidence por meio de `PublicSources` e métodos tipados em `AgentAPI`. A leitura funciona sem preencher um formulário de missão, mas exige a conexão existente com o servidor; isso não cria uma conta obrigatória no app.

O catálogo é exibido como **disponível para tentativa**, nunca como conectado ou atualizado só por estar listado. A leitura só começa por ação explícita; carregamento representa uma requisição real. Um recibo recuperado apresenta URL, horário, HTTP, volume e hash; publicação/aplicabilidade continuam não verificadas. Falhas são mostradas quando realmente registradas. “Stop waiting” cancela a espera do cliente e explica que o servidor pode terminar a operação; “Reload source history” permite reconciliar o estado. Respostas antigas não atravessam troca de conexão/app nem cancelamento.

Após sucesso, a lista de documentos é atualizada sem apagar o rascunho de importação. Versões superseded são identificadas como históricas, não atuais; a versão atual armazenada também não é chamada de lei vigente. O console distingue leitura externa de escrita externa e separa `retrieved_at` da data da fonte.

Foi feita leitura independente dos metadados em `project/evidence/public-reader-http.json`: o caminho HTTP local → PDF oficial → armazenamento/busca registrou 201, documento de 44.406 caracteres e seis passagens do snapshot corrente com horário de obtenção. A evidência confirma recuperação de texto público, não auditoria jurídica, aplicabilidade ou execução de modelo. A frente do motor também registrou leituras dos cinco primeiros catálogos; as datas/hashes próprios devem ser lidos nos respectivos recibos, sem generalizar para todas as funções de cada produto.

A missão primária orientada somente a objetivo, a interpretação semântica com modelo real e o fluxo profissional de ponta a ponta continuam incompletos. Nenhuma credencial de modelo foi configurada/verificada nesta rodada. A UI não apresenta esse leitor como prova de 25 agentes completos.

## Inspeção dos 25 domínios

Tabela do comportamento presente no código inspecionado, não uma alegação de que os objetivos agênticos completos funcionam. Os painéis nativos abaixo usam dados fornecidos e lógica local; os passos de execução apresentados em `RunView` vêm da resposta/eventos do servidor, não de um relógio fictício.

| App | Interface/lógica atual identificada | Lacuna operacional/UX prioritária |
|---|---|---|
| Himayah AI | Busca de expressões no texto e seleção de frase | Não equivale a análise de aplicabilidade, extração semântica de cláusulas ou auditoria jurídica ligada a leis atuais |
| Iqamah AI | Índice de documentos, vencimento e estado não verificado no novo componente | Rota/critério oficial e autenticidade não são comprovados; fluxo nativo completo pendente |
| Istithmar AI | Comparação aritmética, decomposição e cenário tributário com premissas explícitas | Falta ligar atividade, taxas e tratamento tributário a fontes atuais; ranking não é recomendação jurídica |
| Munagasah AI | Correspondência literal de requisitos/capacidades e outline de seções | Sem descoberta de editais, certificados validados, emendas/cutoff oficial ou submissão |
| Sahil AI | Passos de checklist fornecido com ação manual “reviewed” | “Reviewed” é anotação local; não é etapa governamental concluída ou protocolo confirmado |
| Tawteen AI | Composição informada da equipe e simulador de alvo com efetivo constante | Percentual fornecido não prova obrigação, exceções, multa ou prazo aplicável |
| Adl AI | Cronologia de eventos e comparação de valores informados | Não recupera índice oficial nem comprova direito, decisão judicial ou procedimento executado |
| Tawassul B2B | Montagem de texto a partir de fatos aprovados e prompts de ensaio | Não pesquisa parceiros/mercado ao vivo nem executa negociação ou outreach; exercício deve continuar identificado |
| Adab AI | Busca de termos, limite de caracteres e escolha de texto fornecido | Não valida tradução, política cultural/legal atual ou publicação; preferências não podem ser chamadas de lei |
| Khidmah AI | Valor/motivo contra política fornecida e rascunho de resposta | Não autentica pedido, consulta transportadora nem emite reembolso; alguns critérios só são calculados no servidor |
| Jomrok AI | Campos de remessa e cenário de imposto informado | Sem classificação tarifária/direito verificados, certificação autenticada ou despacho |
| Khibrat AI | Presença de evidência por critério e guia de revisão | Barras 0/100 são presença de referência, não competência medida; sem qualificação autenticada ou decisão de contratação |
| Majlis AI | Orientação genérica de reuniões e tarefas marcadas pelo usuário | Não é inteligência regional pesquisada nem confirmação da empresa; conclusão manual precisa manter sua procedência |
| Rafiq | Agenda/blocos e buffers informados | Sem tráfego, oração, calendário autorizado ou alteração de compromisso ao vivo no painel atual |
| Sawm AI | Preferências de rotina e contador de check-ins manual | Não mede biometria, ingestão real ou condição clínica; cronograma/fonte de horários ainda não conectado |
| Mizan AI | Soma de transações fornecidas e cenários/checklists manuais | Cenários e taxa interna existente não demonstram metodologia/autoridade verificada; não há saldo bancário ou certificação religiosa |
| Thawg AI | Filtro sobre restaurantes/capacidade fornecidos | Sem disponibilidade/reserva ou certificação; a copy legada sobre “examples” precisa tornar-se específica da procedência real do registro |
| Manzil AI | IDs duplicados e cenário local de divisão tributária | Sem captura/OCR/revisão de recibo nativa ou validação de alíquota por item |
| Gurbah AI | Marcos fixos e dependências de tarefas fornecidas | Revisão manual não confirma vaga escolar, reserva, conta ativada ou órgão; marcos fixos precisam ser contextualizados |
| Amanah Eco | Comparação normalizada de consumo e fator de emissão digitado | Resultado depende de conta, período e fator autênticos; não há recompensa ou desconto confirmado |
| Nafas AI | Respiração temporizada e reflexão transitória local | Pode ser apoio autoguiado; não é diagnóstico, medida emocional ou decisão clínica; acesso a exercícios deve evoluir sem exigir dados desnecessários |
| Tadweer AI | Material declarado e filtro de operadores/rotas fornecidos | Sem visão sobre foto, regra municipal ou rota/aceitação atual verificada |
| Turath AI | Exibição de trechos/fontes fornecidos e pergunta de exploração | Referência não autentica história; copy de demonstração e fontes precisam refletir a procedência de cada registro |
| Himam AI | Segmentos de acessibilidade declarada e escolha local de rota | Nenhum elevador/entrada/condição ao vivo comprovado; “step-free” é relato, nunca garantia física |
| Hisad AI | Lote/validade declarados e correspondência de capacidade/alergênicos | Sem inventário autenticado, aceitação do parceiro, confirmação de coleta/custódia ou impacto real |

As fontes externas e seus estados de acesso devem ser lidos na matriz da frente 01. O simples fato de uma página poder ser consultada por uma ferramenta de desenvolvimento não torna o aplicativo conectado a ela.

## Estados, permissões e resultados

- Nenhum run é criado no estado inicial/reset. O componente de resultado só recebe uma tarefa quando a API retorna uma tarefa real do servidor ou um histórico existente é aberto.
- Os eventos da UI de execução são os eventos retornados pelo servidor. Testes com transporte/modelo controlado continuam testes, não prova de execução externa real.
- Aceitar um artefato alimenta a memória local/servidor conforme o runtime; não autoriza submissão governamental, reembolso, reserva ou envio a terceiros.
- “Share report” abre compartilhamento do sistema após produzir o artefato; não é confirmação de entrega ao destinatário.
- O console web mantém controle de token de operador. Isso é uma ferramenta de desenvolvimento, não uma solução pronta de sessão sem cadastro para consumidores.
- A arquitetura nativa ainda tem um shell e navegação muito compartilhados. As diferenças de calculadores/cores não comprovam 25 experiências independentes de excelência. Os protótipos específicos não foram automaticamente instalados nessa navegação.

## Verificações executadas nesta frente

| Verificação | Resultado e limite |
|---|---|
| TypeScript (`npm run typecheck`) | Passou no estado compartilhado após estas alterações |
| ESLint (`npm run lint`) | Passou, sem erros/avisos reportados na execução |
| `npm test` mobile | 46 testes passaram, incluindo os dois testes de estado vazio dos 25 schemas e dois testes do cliente de fontes públicas; inclui teste de cliente/API local dos 25 domínios com fixtures explícitas |
| `mobile/scripts/check-session.cjs` | Passou: início/reset vazios, edição rastreada, troca de conexão limpa dados/run e corridas de credenciais; API/storage controlados |
| `mobile/scripts/check-empty-overview.cjs` | Passou: 25 variantes não renderizam calculador antes de rascunho fornecido; ramo de rascunho não o chama autenticado; adaptadores DOM |
| `tests/empty-operational-ui.cjs` | Passou: 25 entradas/clear, campos desconhecidos, execução inicial bloqueada e fixtures explicitamente marcadas como demo; transporte controlado |
| `mobile/scripts/check-public-sources.cjs` | Passou: catálogo/desconectado/vazio/falha, leitura só por clique, recibos conforme o contrato, cancelamento/reconciliação, resposta antiga e mudança de escopo; API controlada/adaptadores DOM |
| `mobile/scripts/check-documents.cjs` | Passou: troca de conexão, importação/save e respostas antigas; atualização de fontes preserva rascunho e identifica versões superseded; adaptadores DOM |
| `npm run check:variants` | Passou: 25 identidades/ativos/configurações isoladas; não equivale a instalar os 25 apps |
| Export Himayah Android/iOS | Bundles dos dois sistemas gerados; código compartilhado compila, sem assinatura/aparelho |
| `tests/dom-smoke.cjs` | Passou com HTTP local real: fixtures são agora aplicadas explicitamente pelo teste e marcadas como demonstração; não há feed externo/modelo real nessa verificação |

Os checks que usam jsdom foram executados com a dependência de teste em diretório de trabalho externo ao repositório (`/workspace/work/ui-qa-deps`). Não foi adicionada dependência de runtime ao aplicativo. O comando de reprodução pode usar uma instalação de desenvolvimento de jsdom via `NODE_PATH`.

Não foram executados nesta frente testes em aparelhos físicos, leitor de tela nativo, desempenho/frame rate, assinatura/lojas, chamada de modelo externo, submissão ou resultado profissional. Leituras externas de documentos públicos foram executadas pela frente do motor e seus metadados foram revisados aqui; os testes do painel permanecem controlados e não são prova de uso em um celular. `tests/ui-smoke.cjs` é um roteiro histórico que ainda pressupõe amostras iniciais; não foi usado como evidência de passagem nesta rodada. Relatórios antigos precisam manter sua data/escopo e não substituir estes limites.

## Próximas correções conjuntas

1. A frente 01 precisa fornecer fonte/versão/frescor/acesso comprováveis para as telas operacionais.
2. A frente 02 precisa ligar objetivo e ferramentas reais, produzir eventos/artefato verificáveis e falhar honestamente quando faltam dados/permissão.
3. A frente 03 deve apresentar esses estados no fluxo específico do domínio, reduzir formulário manual desnecessário e separar relato do usuário, inferência, referência e confirmação do serviço.
4. Reavaliar cenários hardcoded, linguagem de “score” e marcas manuais de revisão antes de chamá-los de conformidade/qualificação/etapa oficial.
5. Completar caminho nativo e testes de dispositivos/acessibilidade por app, sem contar arquivo de design ou bundle como conclusão funcional.

Um teste local passando não transforma um dos 25 objetivos completos em funcionalidade agêntica comprovada. A conclusão conjunta exige fonte, execução, interação e resultado trabalhando juntos.
