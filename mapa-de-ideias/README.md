# Sociosofia — Mapa de Ideias v2.1

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

## Status em 20/10/2026 — preparar aplicação de 22/10

- Front-end v2.1 publicado no GitHub Pages, com bloqueio de envio vazio pelo navegador, fallback de armazenamento local e controles de limpeza/exclusão condicionados à versão da API.
- Código do Worker v2.1 no GitHub, com rejeição de formulários sem respostas temáticas e rotas autenticadas de limpeza/exclusão. **Deploy no Cloudflare ainda pendente.**
- Não confundir publicação do código no GitHub com implantação efetiva na Cloudflare. Confirmar retorno `{"ok":true,"version":"2.1.0"}` em `/health` antes de usar limpar/excluir.
- Teste local de navegador com respostas vazias e preenchidas aprovado; cenários extremos do quadrante validados. Não foi realizado piloto ponta a ponta na produção.
- Antes da aula, fechar a sessão de teste anterior, testar uma turma fictícia e substituir a chave `ADMIN_KEY` inicial.
- Depois de atualizar o Worker, verificar pelo menos: envio vazio rejeitado, envio preenchido contabilizado, fechamento da turma, limpeza de resultados e exclusão de sessão.

