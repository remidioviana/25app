# Preparação da implantação permanente

Estado: roteiro operacional revisado contra o código; nenhum serviço público provisionado. GitHub Actions valida o código e o provedor, mas não hospeda a API. Falta definir servidor/domínio, armazenamento persistente, orçamento e responsável operacional.

## Processo e configuração

Usar Python 3.12 e instalar `requirements-agentic.txt` e `requirements-documents.txt` em ambiente virtual. Iniciar `python server.py` com diretório de trabalho na raiz do repositório. O servidor atual usa `ThreadingHTTPServer`; esta preparação não demonstra capacidade de produção ou alta disponibilidade.

Configurar no ambiente protegido do processo, antes de iniciar:

| Variável | Configuração e efeito |
|---|---|
| `HOST` | `127.0.0.1` para proxy no mesmo servidor; manter a API fora da interface pública direta. |
| `PORT` | Porta interna, por exemplo `8000`. |
| `APP_HOSTNAME` | Host público exato recebido no header Host, incluindo porta quando presente. O proxy deve preservar esse valor. |
| `APP_TOKEN` | Token de acesso ao workspace; não é a chave Groq. O modo legado compartilha um único escopo de dados. |
| `APP_USERS_FILE` | Alternativa para identidades provisionadas; JSON com IDs e `token_sha256`, conforme `identity.py`. Cada identidade recebe banco separado. |
| `AGENT_DATA_DIR` | Diretório persistente, com permissão de escrita somente para o serviço. |
| `OPENAI_API_KEY` | Segredo Groq provisionado no servidor; nunca incluir no cliente, imagem ou repositório. |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1`. |

Os arquivos `.env` não são carregados automaticamente. Usar o gerenciador de segredos/serviço escolhido para injetar o ambiente. Segredos do GitHub Actions não configuram o servidor automaticamente. Manter os papéis de `config/provider.env.example`; o padrão tem dois IDs de produção para três papéis. Qwen é Preview com opt-in; não ativar o perfil de avaliação por omissão.

Terminar TLS no proxy, preservar Host e permitir as requisições da mesma origem. O servidor rejeita Origin diferente do Host e `Sec-Fetch-Site: cross-site`. O cliente nativo aceita uma origem HTTPS sem caminho; `EXPO_PUBLIC_API_URL` pode conter essa origem pública, nunca credenciais. Confirmar o fluxo real no dispositivo, pois o teste local não prova acesso móvel ou TLS.

## Dados e recuperação

Persistir o diretório inteiro de `AGENT_DATA_DIR`: banco principal `agents-v2.sqlite3`, diretórios `tenants/` e checkpoints LangGraph por escopo. SQLite usa WAL: não copiar apenas o arquivo principal enquanto o processo escreve. Para o primeiro procedimento de backup, parar o serviço, copiar o diretório inteiro para armazenamento protegido e reiniciar; ensaiar restauração em ambiente isolado antes de dados reais. Não executar duas réplicas independentes sobre os mesmos arquivos sem validar coordenação, leases e agendamentos. O executor atual tem dois workers por processo, sem garantia de limite global entre réplicas.

## Aceite antes de conectar usuários

1. Verificar `/api/config`: HTTP 200 significa configuração acessível; `model_configured` indica presença de configuração, sem provar inferência. Não há endpoint dedicado de readiness.
2. Confirmar `/api/me` sem token retorna 401 e com token retorna apenas a identidade esperada; validar isolamento entre duas identidades quando usado `APP_USERS_FILE`.
3. Confirmar HTTPS, Host, origem e conexão nativa no destino real.
4. Ensaiar backup/restauração, reinício e recuperação de tarefas; observar filas, erros e orçamento sem registrar credenciais ou documentos pessoais em logs públicos.
5. Usar os diagnósticos existentes como histórico. Repetir uma verificação live somente após mudança relevante ou falha nova; não repetir inferência após quota. Listagem de catálogo não prova autorização de inferência.
6. Executar um fluxo primário de cada app com documento autêntico e permissão de uso, registrando versão, trechos, limitações e resultado. Não transformar entrada sintética em aceite primário.

Só registrar implantação após URL acessível e verificações do destino. Só registrar release após distribuição efetivamente confirmada. Nenhuma submissão governamental ou ação externa é autorizada pelo simples término de uma análise.

## Contêiner executável

O `Dockerfile` usa imagem Python 3.12 fixada por digest, dependências declaradas, usuário 10001 e volume `/data`. O contexto de build usa lista permitida: não inclui `.env`, bancos locais, `.git` ou o cliente mobile. Nenhuma chave é inserida na imagem.

```sh
docker build -t 25app-backend:local .
docker volume create 25app-data
docker run -d --name 25app-backend --restart unless-stopped --env-file /secure/backend.env -v 25app-data:/data -p 127.0.0.1:8000:8000 25app-backend:local
```

O arquivo protegido de ambiente precisa definir `APP_HOSTNAME` e `APP_TOKEN` (ou arquivo de identidades montado), além da configuração de provedor quando necessário. O bind local serve ao proxy TLS no mesmo host; não cria um domínio ou servidor externo. O healthcheck usa `/api/config` e não comprova inferência. Em rede com CA corporativa, o build aceita `--secret id=build_ca,src=/path/to/organization-ca-bundle.pem`, sem desativar a validação TLS ou gravar o certificado de build na imagem. A confiança de rede do runtime é configuração separada.

Depois do build, `python scripts/check_container.py` verifica cinco análises locais com entradas controladas, autenticação, usuário sem root e persistência após substituir o contêiner. Cria e remove somente seu volume temporário e seus contêineres. [Resultado local](evidence/backend-container-check.json). Isso é preparação de implantação, sem alegação de backend público ativo.

## Destino informado: Render Free

O destino escolhido para o preview é o Render, com `render.yaml` na raiz e variáveis preenchidas no painel. A API reconhece `RENDER_EXTERNAL_HOSTNAME` automaticamente. Esse plano não tem disco persistente e perde os bancos locais em restart, redeploy e suspensão; o teste de volume Docker local não comprova durabilidade no Render Free. [Passos e limitações](EXPO_RENDER_CONFIGURACAO.md). Nenhum serviço foi criado por esta configuração.
