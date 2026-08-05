# Fechamento anual — Filosofia do 1º ano — v1

## Decisão

Luiz Jácomo aprovou em 05/08/2026 o fechamento do percurso anual e sua publicação na Área do Estudante.

## Escopo público

- 3 etapas;
- 10 capítulos;
- 56 movimentos de compreensão;
- 1 trilha opcional, vinculada ao Capítulo 1;
- paginação pública do livro do estudante: p. 12–177;
- rota preservada: `alunos/filosofia-1ano/`.

## Decisões editoriais preservadas

- leitura contínua, organizada por etapas, capítulos e movimentos;
- ficha completa na ocorrência principal e retomadas contextuais nas demais;
- fontes identificadas no próprio percurso;
- Inter em toda a interface;
- fundo quente, cores dessaturadas e proibição de roxo;
- nenhuma ativação automática de ficha, REL ou repertório pendente;
- diferenciação entre fonte curricular, mediação Sociosofia e repertório cultural;
- nenhuma alteração no Banco Sociosofia.

## Itens mantidos fora da publicação

- `SOC-0007`;
- `SOC-0008`;
- repertórios e obras citados pelo manual que ainda não receberam leitura autônoma;
- relações autorais ou conceituais ainda não canonizadas.

## Implementação

O HTML anual é comprimido em gzip e distribuído nos oito arquivos `page-01.b64` a `page-08.b64`. O carregador preserva a rota vigente, aplica apenas o patch de acessibilidade e não carrega a antiga camada visual da Área do Estudante.

## Validação

O teste dedicado verifica:

- 3 etapas, 10 capítulos e 56 movimentos;
- uma única trilha;
- unicidade de IDs;
- resolução dos links internos;
- ausência de roxo, Fraunces e linguagem de bastidor;
- integridade da descompressão;
- preservação da paginação 12–177;
- ausência de `SOC-0007` e `SOC-0008` no conteúdo público.
