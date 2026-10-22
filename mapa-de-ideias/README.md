# Sociosofia — Mapa de Ideias · Questionário v2 / API v2.2

Aplicativo para trabalho didático com opiniões políticas, sem identificação nominal, em sessões separadas por turma.

## Endereços
- Alunos e painel docente: https://sociosofia.github.io/mapa-de-ideias/
- API independente: https://sociosofia-mapa-ideias-api.luizvjj.workers.dev
- Banco independente Cloudflare D1: sociosofia-mapa-ideias

## Arquitetura
- `index.html`: formulário público, gráfico e PDF local, painel protegido do professor.
- `deploy/worker.js`: Worker que recebe respostas e registra SOMENTE contagens, grade 9×9 e somatórios de momentos. Sem fichas de alunos persistidas.
- `deploy/schema.sql`: estrutura SQL do D1.
- `MATRIZ_E_FONTE.md`: fontes, variáveis, pontuação e limitações acadêmicas.
- Segredo `ADMIN_KEY` está exclusivamente nas configurações Cloudflare Workers e NUNCA neste repositório.

## Uso
1. Acesse o site, clique em "Painel do professor" e insira a chave fornecida em canal privado.
2. Crie uma sessão com código e nome da turma: por padrão nasce FECHADA.
3. Abra-a para permitir envio. Convide os alunos a selecionar a sessão no questionário.
4. Feche o recebimento, consulte a distribuição e os gráficos e exporte contagens em CSV.

## Privacidade e limites
- O conjunto das respostas transita em memória pelo Worker na submissão e não é persistido por participante. A geração de PDF acontece no aparelho do estudante.
- Pontos visuais usam contagens agregadas por célula, com jitter, não coordenadas individuais exatas. Modo pontos condicionado ao mínimo de 20 posições válidas.
- Não há autenticação por aluno nem prevenção absoluta de respostas duplicadas. Não aplicar como pesquisa representativa.
- Opinião política é dado sensível, em especial entre estudantes menores de idade. Uso escolar exige práticas institucionais adequadas e participação voluntária.
- As questões e escalas de pesquisa foram adaptadas; o indicador é didático, não uma escala psicométrica validada.
- Comparações nacionais requerem questões e populações compatíveis.

## Situação em 22/10/2026
- Questionário revisado: `/mapa-de-ideias/` — instrumento v2 equilibrado.
- Questionário original arquivado: `/mapa-de-ideias/legado/` — instrumento v1.
- API v2.2 implantada no Worker existente, mantendo o D1 `DB` e segredo `ADMIN_KEY`.
- `instrument_version` distingue as sessões antigas (valor padrão 1) das novas (valor 2). Envio entre versões incompatíveis é rejeitado pelo Worker.
- Novas sessões criadas na interface v2 nascem `instrument_version = 2` e fechadas. Não continuar o recolhimento de uma sessão v1 com questionário v2.
- As 23 participações da sessão `sesi123` foram preservadas como versão 1.
- A escala continua de 1 a 7, com 4 = nem concordo nem discordo; o aluno pode não responder a perguntas sensíveis.
- Mudanças de redação: E2 e E4 inverteram direção para mercado; E6, S5 e T11 foram especificadas. A pontuação foi ajustada no frontend e no Worker para v2.
- Para testar: criar sessão v2 de teste; enviar respostas; conferir contagens e médias; fechar e limpar. O teste da sintaxe do JavaScript foi realizado; não há confirmação de teste completo de submissão ponta a ponta na produção.
