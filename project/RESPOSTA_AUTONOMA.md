# Resposta final com GPT-OSS120B

Sequência solicitada no perfil `three-model-evaluation`: GPT-OSS20B planeja, Qwen3.8-27B redige a análise inicial e GPT-OSS120B audita. Qwen permanece Preview, com opt-in. Os defaults de produção continuam com dois IDs; configurar o servidor protegido conforme `config/provider.env.example` para ativar a sequência de três. O workflow foi atualizado nas duas etapas; isso não altera um servidor já hospedado.

Quando o 120B aceita o rascunho, esse é o resultado revisado pelo modelo. Se as três tentativas do especialista não resolverem a revisão ou a validação final, uma chamada final adicional ao 120B recebe entrada, cálculo, trechos, rascunho e problemas. Ele corrige o texto e retorna `answered`, `needs_information` com perguntas concretas, ou `inconclusive` com limitações explícitas. Os dois últimos não recebem aprovação. A resposta limitada substitui o rascunho pendente, com perguntas/limitações visíveis na síntese e no Markdown exportado.

O runtime novo não produz `requires_human_review` como saída genérica. Registros históricos conservam seus estados. Nenhum status resolve autenticação, quota, indisponibilidade, JSON inválido ou citação inventada: essas falhas permanecem técnicas. O papel crítico e a resolução final não usam fallback para outro modelo; isso preserva a decisão final designada. Os demais papéis mantêm contingência. Não há nova inferência após quota.

Citações são validadas contra trechos recuperados; isso não certifica suporte factual ou autenticidade. A revisão do modelo não é certificação jurídica. Autorizações para ações externas continuam separadas: o motor não submete documentos nem executa escritas governamentais. Esta mudança não é implantação permanente, aceite primário ou release. Provas live anteriores usavam a ordem antiga e não validam esta sequência nova.

## Verificação da alteração

216 testes Python, 48 testes mobile, typecheck, lint e 25 variantes passaram localmente. O [CI 44007410424](https://github.com/remidioviana/25app/actions/runs/44007410424) aprovou o commit 8e5efec. O [run live 44007434045](https://github.com/remidioviana/25app/actions/runs/44007434045) confirmou o catálogo com somente três modelos gerais de texto elegíveis, mas a inferência do Munagasah falhou antes de concluir o planner, com status 401 e 400 (`json_validate_failed`). Não houve 429 e não foi repetida a inferência. Esta tentativa não valida a ordem nova ao vivo. [Catálogo](evidence/groq-120b-last-catalogue.json) e [tentativa](evidence/groq-120b-last-munagasah-attempt.json) foram preservados; o portfólio mantém o sucesso sintético histórico e registra a última tentativa como falha.

## Nova ordem verificada no Munagasah

O [run 44007989450](https://github.com/remidioviana/25app/actions/runs/44007989450), commit 2ccd295, concluiu o diagnóstico sintético com planner GPT-OSS20B, specialist Qwen3.8-27B Preview e critic GPT-OSS120B, todos identificados pelo provedor. Foram três chamadas, 6.304 tokens reportados, quatro passagens recuperadas e uma citada; cálculo recomputado e nenhuma escrita externa. O resultado foi `reviewed_by_model`, sem `requires_human_review`. [Evidência](evidence/groq-120b-last-munagasah-verified.json).

A resposta foi aceita pelo 120B na primeira auditoria; o ramo adicional de resolução de pendências foi testado com transporte/modelos controlados, não exercitado neste run live. Os outros quatro apps ainda têm evidências da ordem anterior. O caso é sintético e usa a página informativa eSupply, sem demonstrar aceite de edital autêntico, dispositivo, implantação ou release. A tentativa 44007434045 com 401/400 continua preservada como falha anterior.

Se o auditor declarar `answered` mas incluir perguntas ou limitações, o runtime preserva o conteúdo e o resultado original e classifica conservadoramente como `needs_information` ou `inconclusive`. Isso não aprova a resposta nem gera outra inferência. Citações inválidas e erros estruturais continuam sendo rejeitados.

O feedback `revise` agora vai diretamente ao finalizador 120B, que corrige o conteúdo. `needs_evidence` permite uma busca adicional antes da resolução final. O limite de três tentativas do especialista continua valendo para reparo de citações, sem criar três rodadas adicionais de reescrita. A alteração reduz o caminho comum de revisão para quatro chamadas de papel e não altera estados históricos. Foi verificada com modelos controlados; nenhuma inferência foi repetida após a quota do lote 2.
