# Sociosofia — site estático para GitHub Pages

Este pacote contém uma versão inicial do site Sociosofia em HTML, CSS e JavaScript puro. Ele foi pensado para funcionar no GitHub Pages sem WordPress, sem plugins e sem build.

## Arquivos principais

- `index.html`: página inicial com busca, filtros, temas e cards.
- `repertorio.html`: página individual de cada repertório.
- `guia.html`: guia rápido de uso em redação, debate e aula.
- `sobre.html`: apresentação do projeto.
- `style.css`: identidade visual do site.
- `app.js`: busca, filtros e renderização dos cards.
- `repertorio.js`: renderização da página individual.
- `data/repertorios.json`: banco editável de repertórios.

## Como subir no GitHub

1. Entre no repositório `sociosofia.github.io`.
2. Clique em **Add file** > **Upload files**.
3. Arraste todos os arquivos e a pasta `data` deste pacote para o GitHub.
4. Confirme em **Commit changes**.
5. Aguarde alguns minutos e acesse `https://sociosofia.github.io`.

## Como alimentar o site

Edite o arquivo `data/repertorios.json`. Cada repertório é um bloco entre chaves `{ ... }`.

Campos mais importantes:

```json
{
  "id": "SOC-0010",
  "titulo": "Título curto do repertório",
  "tipo": "Pesquisa/dado",
  "categoria": "Trabalho e desigualdade",
  "tema": "Tema específico",
  "resumo": "Resumo curto para estudantes.",
  "ideia": "Dado ou ideia central.",
  "importancia": "Por que isso importa?",
  "conceitos": ["Conceito 1", "Conceito 2"],
  "autores": ["Autor 1", "Autora 2"],
  "uso": "Como usar em redação, debate ou aula.",
  "fonte_nome": "Nome da fonte",
  "fonte_url": "https://link-da-fonte-original.com",
  "ano_data": "2026",
  "confiabilidade": "Alta",
  "tempo_leitura": "3 min",
  "status": "aguardando revisão",
  "destaque": false,
  "tags": ["tag1", "tag2"]
}
```

## Publicação segura

No arquivo `app.js`, há esta configuração:

```js
const CONFIG = {
  mostrarRascunhos: true,
  statusPublicaveis: ["revisado", "publicado"]
};
```

Durante a montagem do site, `mostrarRascunhos: true` permite visualizar fichas em revisão. Antes de divulgar para estudantes, recomenda-se mudar para `false` e deixar visíveis apenas itens com status `revisado` ou `publicado`.

## Diretriz editorial

O Sociosofia deve organizar o conteúdo por temas e problemas, não por separação entre Filosofia e Sociologia. Cada card deve responder rapidamente:

- O que é?
- Por que importa?
- Com quais conceitos conversa?
- Como pode ser usado em redação, debate ou aula?
- Qual é a fonte original?
