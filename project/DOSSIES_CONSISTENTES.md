# Iqamah e Sahil: consistência de dossiê

O backend agora acompanha as distinções já presentes no helper nativo: documentos ausentes, vencidos e presentes sem verificação. Não usa um registro posterior com o mesmo nome para substituir silenciosamente um anterior. Nomes de requisitos/documentos duplicados ou vazios são rejeitados. Os nomes continuam correspondência exata, sem normalização silenciosa.

`missing` agora contém somente requisitos sem documento; `expired` contém somente requisitos com vencimento registrado anterior à data de revisão; `requires_attention` reúne ambos. Essa mudança corrige a semântica do campo legado `missing`, que também agrupava vencidos. Consumidores externos que dependiam desse agrupamento devem usar `requires_attention`. A saída inclui contagens e vencimento por linha. Vencimento em branco continua desconhecido e não se torna data válida ou validade verificada. Vencimento igual à data de revisão continua presente sem verificação, conforme o helper nativo.

Datas de calendário exigem `YYYY-MM-DD`, incluindo dia real e ano válido. Datas básicas, de semana ISO, timestamps, dias normalizados ou anos bissextos inválidos são recusados. O helper de data é compartilhado pelos demais cálculos locais; os exemplos dos 25 agentes passaram pelas regressões.

No runtime, a checagem de ambiguidades do dossiê ocorre antes de chamar planner/especialista. Se falhar, o run registra erro e não faz chamada ao provedor. Essa checagem também se aplica a execuções retomadas/agendadas que passam pelo runtime. Não houve alteração no design, schema de entrada nativo, armazenamento de credenciais ou inferência de elegibilidade.

Verificações: **167 testes Python e 48 testes mobile aprovados**. Os testes mobile incluem o cliente nativo chamando o backend HTTP real nos 25 domínios com dados controlados e modo local. Os seis testes novos do backend cobrem separação de estados, nomes duplicados, checklist vazio, datas, correspondência exata/imutabilidade e bloqueio pré-provedor. Isso não comprova elegibilidade de visto, autenticidade documental ou submissão governamental.

A execução antiga 43853517507 permanecia na fila, sem jobs iniciados. O workflow passa a fixar `ubuntu-24.04` para reprodução, em vez de depender da migração de `ubuntu-latest`; isso não prova que a imagem era a causa da fila. O estado público de GitHub Actions estava operacional quando consultado. A nova execução deve registrar seu próprio resultado antes de qualquer aceite do grafo.
