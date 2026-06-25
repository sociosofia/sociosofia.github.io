# Sociosofia Site V1.4, repertórios culturais

Esta versão mantém a arquitetura com duas categorias principais:

1. Notícias, dados e informações
2. Séries, filmes, livros e músicas

O pacote inclui:

- 7 repertórios de notícias, dados e pesquisas, com fonte localizada ou ressalva editorial.
- 26 repertórios culturais em formato de rascunho, com resumo da obra, Leitura Sociosofia, ancoragem teórica, conceitos e tags.
- `app.js` atualizado para busca, filtros e categorias.
- `repertorio.js` atualizado para exibir campos diferentes para fontes de dados e repertórios culturais.
- `data/modelo-repertorio.json` atualizado com os dois formatos.

## Publicação no GitHub Pages

Substitua os arquivos do repositório pelos arquivos deste pacote. O arquivo mais importante para atualizações futuras é:

`data/repertorios.json`

No dia a dia, novas pesquisas, filmes e séries podem ser adicionados apenas nesse JSON.

## Observação editorial

Os repertórios culturais estão como `rascunho`. Antes de divulgar para estudantes, revisar títulos, datas das obras e ancoragens teóricas. Para esconder rascunhos, altere `mostrarRascunhos: true` para `false` em `app.js`.
