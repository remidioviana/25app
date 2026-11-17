# Expo/EAS e Render: configuração fornecida

## Expo existente

O código está em `mobile/`. Não executar `create-expo-app`: isso criaria outro app, sem a implementação atual.

- Owner: `remidiovianas-team`.
- Slug/projeto: `25app`.
- Project ID: `b2d48b85-5e43-4a6f-8cdb-826487e7b03e`.

`mobile/app.config.ts` mantém esses campos para todas as variantes, com nomes, esquemas, packages Android e bundle identifiers iOS distintos. Os perfis `<app>-preview` herdam distribuição interna e `android.buildType: apk`. Compartilhar o projeto EAS não instala os cinco apps como um único app; cada perfil usa seu AGENT_ID e package próprio.

Na sua máquina ou sessão autenticada autorizada:

```sh
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init --id b2d48b85-5e43-4a6f-8cdb-826487e7b03e
node scripts/variant.cjs himayah build --platform android
node scripts/variant.cjs iqamah build --platform android
node scripts/variant.cjs istithmar build --platform android
node scripts/variant.cjs munagasah build --platform android
node scripts/variant.cjs sahil build --platform android
```

O vínculo na configuração está salvo; o CLI pode informar que já está vinculado. A conta autenticada precisa ter acesso ao projeto. A primeira compilação pode pedir criação/seleção de keystore Android no EAS. Esses passos não publicam em lojas. O resultado esperado de cada build concluído é um link de APK individual; nenhuma compilação remota ou instalação é presumida por este documento. Filas e cotas do EAS dependem da conta.

Não colocar chaves Groq no Expo ou no app. A tela de conexão recebe a origem HTTPS do backend e o token de workspace. Opcionalmente, a origem pública pode ser definida como `EXPO_PUBLIC_API_URL`; o token fica fora dessa variável.

## Render gratuito: preview com dados efêmeros

1. No Render, escolher **New → Blueprint**, conectar `remidioviana/25app` e selecionar `main` com o `render.yaml` da raiz. Alternativamente, criar Web Service Docker com Dockerfile/contexto da raiz e reproduzir as variáveis do arquivo.
2. Preencher os campos protegidos solicitados: `OPENAI_API_KEY`, `OPENAI_BASE_URL` (`https://api.groq.com/openai/v1`) e `APP_TOKEN` (token de workspace escolhido por você, diferente da chave Groq). Nenhum valor secreto está no YAML.
3. O Blueprint usa `plan: free`, porta 10000, `/api/config` como healthcheck e deploy automático após checks passarem. Não cria banco externo, disco pago ou outro recurso pago.
4. O hostname público é reconhecido por `RENDER_EXTERNAL_HOSTNAME`, fornecido pelo Render. Para domínio próprio, configurar também `APP_HOSTNAME`. A origem deve usar HTTPS; a configuração não precisa adivinhar o subdomínio antes de o serviço existir.
5. Depois do deploy, abrir `https://<host-real>/api/config`, verificar a configuração sem concluir que a inferência foi validada, e testar `/api/me`: sem token deve retornar 401, com Bearer do workspace deve retornar a identidade. Conectar o mesmo host e token na tela do app.

**O plano Free não tem disco persistente.** `AGENT_DATA_DIR=/tmp/25app-data` permite escrita pelo usuário não root, mas SQLite, documentos, tarefas, memória e checkpoints locais se perdem em restart, redeploy ou suspensão. O serviço dorme após inatividade e pode demorar cerca de um minuto para voltar. Exportar resultados necessários e manter os originais fora do serviço. Não há garantia de execução de agendamentos enquanto estiver suspenso.

A persistência demonstrada pelo teste Docker usa volume local; isso não se transfere para o Render Free. Dados duráveis exigem uma solução de armazenamento compatível ou outro plano; nenhuma migração de SQLite para banco externo está implementada. Este Blueprint prepara preview gratuito, não resolve esse portão de produção.

O perfil informado no Render é 20B → Qwen Preview → 120B, com opt-in de Preview e três identidades exigidas. Catálogo, quota e inferência no destino precisam ser verificados após o serviço existir; os diagnósticos históricos do GitHub não provam implantação no Render.

Referências: [Blueprint](https://render.com/docs/blueprint-spec), [limites Free](https://render.com/docs/free), [variantes EAS](https://docs.expo.dev/build-reference/variants/).


## Expo Web origins

For a separately hosted Expo Web frontend, set `APP_ALLOWED_WEB_ORIGINS` on the backend to its exact HTTPS origin (comma-separated for multiple frontends). Leave it unset for same-origin clients. Never use `*`, paths, embedded credentials or provider keys. Local HTTP localhost, loopback and private-network origins are accepted for development only. Approved preflights do not bypass authentication: API requests still require the workspace access token. Native clients do not need browser CORS. Public intelligence has its separate existing public policy.
