# Operação v5

## Configuração

| Variável | Efeito |
|---|---|
| `AGENT_DATA_DIR` | Diretório raiz de dados; padrão `data/` |
| `HOST`, `PORT` | Bind do servidor; padrão `127.0.0.1:8000` |
| `APP_HOSTNAME` | Host:porta autorizado quando acessado pela rede |
| `APP_TOKEN` | Token do escopo único `default`, quando não há arquivo de usuários |
| `APP_USERS_FILE` | Arquivo de identidades; quando definido, substitui `APP_TOKEN` |
| `APP_CONNECTORS_FILE` | Endpoints HTTPS JSON e listas explícitas de usuários/agentes autorizados |
| `CONNECTOR_*` | Credenciais específicas dos serviços de leitura |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Provedor de modelo compartilhado pelo operador |
| `OPENAI_EMBEDDING_MODEL` | Modelo de embeddings escolhido pelo operador |
| `AGENT_SEMANTIC_SEARCH=1` | Habilita busca híbrida no modo equipe |

Não exponha o servidor HTTP diretamente à internet. Rede exige token/identidades e Host configurado. HTTPS termina em infraestrutura externa ao pacote. A aplicação não oferece OAuth, quotas de uso/custo por pessoa, criptografia em repouso ou auditoria imutável. O operador do sistema de arquivos pode ler todas as bases. Uma única instância deve operar cada diretório de dados; recuperação de jobs não é coordenada entre vários processos de servidor.

## Identidades

`python3 manage.py add-user rafael --users-file data/users.json` cria um token aleatório e grava apenas seu hash. O token é exibido uma vez. Não salve o arquivo de identidades em diretório servido pela web. O servidor serve somente sua lista fixa de assets; caminhos de dados e código não são servidos.

O arquivo tem formato `{ "rafael": { "token_sha256": "...64 caracteres hexadecimais..." } }`. Nomes seguem letras minúsculas, números, hífen e underscore. `default` é reservado. Tokens duplicados e configuração vazia são rejeitados. Não há endpoint público de criação de identidades.

Os dados da versão anterior continuam em `data/agents-v2.sqlite3`. Ativar identidades inicia bases separadas; não move automaticamente dados legados. Em chamadas administrativas de código, use `with storage.scope("rafael"):`. Em HTTP, apenas o bearer token determina o escopo.

## Conector de leitura

Copie `config/connectors.example.json` para um arquivo de configuração privado, substitua a URL e defina `APP_CONNECTORS_FILE` com seu caminho. O exemplo não é um serviço funcional e não deve ser acionado sem configuração. Defina `CONNECTOR_FINANCE_TOKEN` no ambiente. URLs com credenciais embutidas, fragmentos ou portas alternativas são recusadas.

O serviço precisa retornar JSON com dados compatíveis com o schema do agente. Para Mizan/Manzil, a propriedade `/data` pode conter `currency`, `budgets` e `transactions`. Consulte `examples/mizan.input.json`; um ERP/CRM que use outro formato precisa de uma camada de transformação no seu serviço. O adaptador não presume schemas proprietários.

A implementação resolve DNS, recusa endereços privados/reservados/multicast e conecta a um IP validado, preservando hostname para TLS/SNI. Não segue redirects e só executa GET. O corpo tem limite de 2 MB e timeout de socket de 15 segundos. A resposta é validada antes de gerar um recibo local de leitura com horário, hostname e hash dos dados. O recibo não comprova uma mudança externa.

O acesso é explícito na interface ou via POST ao endpoint `pull`, que dispara uma leitura remota. Não há envio de mensagens, pagamentos ou alterações remotas. Testes usam transporte controlado; nenhuma conta externa foi conectada nesta entrega.

## Extração de documentos

Formatos TXT/MD/CSV são UTF-8. DOCX extrai o corpo principal, incluindo texto de tabelas; notas, cabeçalhos e imagens não são interpretados. PDF textual usa pypdf 6.21.4, até 100 páginas. PDFs protegidos e PDFs sem texto são recusados. Não há OCR.

Uploads são prévias, não ingestões automáticas: o usuário revisa o texto e confirma sua inclusão. Limits: 2 MB de arquivo, 200 mil caracteres, 15 segundos de processo, duas extrações simultâneas. No Linux, o worker também limita CPU a 10 segundos e espaço de endereço a 512 MiB. No Windows, continuam os limites de arquivo, saída, concorrência e timeout; limites `resource` não estão disponíveis. O worker recebe ambiente reduzido, sem chaves OpenAI, tokens de usuário ou credenciais de conectores. Isso reduz exposição, mas não equivale a sandbox formal contra exploits de parser.

## Agendador

Apenas agendamentos criados explicitamente pelo usuário disparam tarefas. Máximo 100 ocorrências por agendamento, 50 ativos por usuário e intervalo mínimo de 60 segundos pela API. Datas precisam de fuso. A interface converte o horário local do navegador para ISO com UTC. Intervalos são em segundos, não calendários de feriados/DST.

Ocorrência e criação do run são atômicas. Os workers preservam o contexto de identidade. O servidor retoma runs enfileirados após falha e usa chaves idempotentes para ocorrências. Períodos perdidos são consolidados, não reproduzidos em massa. Não há consulta automática a conectores ou atualização de campos de data nas entradas armazenadas.

O estado de agendamento pertence ao usuário. Remover esse usuário da configuração impede novas requisições e novas varreduras de seu escopo, mas não mata chamadas já iniciadas. Desative agendamentos e cancele runs antes da revogação quando necessário.

## Evidência de testes

87 testes Python passaram, incluindo casos reais de extração de PDF/DOCX, concorrência de dois tickers, queda entre commit e despacho, isolamento HTTP e contexto de workers. Os 25 fluxos DOM passaram com API HTTP local real, importação de arquivo, criação/desativação de agendamentos, busca e revisão. IA, embeddings e serviço HTTPS externo usam respostas controladas nos testes. Inspeção visual, dispositivos reais e infraestrutura pública não foram validados.
