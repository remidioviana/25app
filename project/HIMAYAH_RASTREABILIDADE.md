# Himayah: rastreabilidade da triagem literal

A ferramenta local `contract` agora vincula a análise ao SHA256 UTF-8 do texto fornecido e informa sua contagem de caracteres. Isso vincula a execução a uma versão do texto; não certifica autenticidade, autoria ou origem do documento.

Cada ocorrência preserva o intervalo da expressão e acrescenta o intervalo exato do trecho mostrado. `text[quote_start:quote_end]` reproduz `quote`. Os índices são pontos de código Unicode Python, explicitados como `unicode_code_points`; um consumidor JavaScript deve converter os índices antes de usá-los como offsets UTF-16. Um trecho limitado que não contém a expressão inteira informa `quote_contains_entire_match: false`.

A saída registra presença independentemente da quantidade de ocorrências retidas. Limites: 100 ocorrências por regra, 1.000 na análise e 600 caracteres por trecho. `matches_truncated` indica ocorrências omitidas; a ferramenta não inventa uma contagem total. Esgotar o limite não transforma uma expressão encontrada em requisito ausente. Frases vazias ou compostas somente de espaço são rejeitadas. Expressões são pesquisadas literalmente, sem interpretação de regex fornecida pelo usuário.

O comportamento continua sendo triagem literal por regras fornecidas, sem interpretação jurídica automática. Não encontrar uma frase não prova ausência de obrigação; encontrar uma expressão não prova infração. O campo `flagged` mantém esse escopo. Trechos importados e regras fornecidas não são automaticamente autênticos ou juridicamente aplicáveis.

Quatro testes novos verificam offsets/aspas com Unicode e emoji, hash do texto, limites e presença após truncamento, expressão longa e rejeição de regras vazias/regex literal. A suíte Python completa passou com **161 testes**. Usou dados controlados; não executou chamadas Groq. A execução live corrigida do Munagasah, [43853517507](https://github.com/remidioviana/25app/actions/runs/43853517507), permanecia `queued`, sem jobs, durante esta entrega; não se atribui sucesso a ela. Os portões de fluxo primário, dispositivo e produção continuam incompletos.
