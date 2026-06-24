# Sociosofia — GitHub Pages

Site estático do Sociosofia, uma revista digital de repertórios de Sociologia e Filosofia para estudantes do ensino médio.

## Arquivos principais

- `index.html`: página inicial com busca, temas, curadoria e cards.
- `repertorio.html`: página individual de cada repertório.
- `sobre.html`: apresentação do projeto e política de curadoria.
- `style.css`: identidade visual do site.
- `app.js`: busca, filtros e renderização dos cards.
- `repertorio.js`: renderização da página individual.
- `data/repertorios.json`: banco editável de repertórios.

## Como alimentar o site

Edite `data/repertorios.json`. Cada repertório é um bloco entre chaves `{ ... }`.

Modelo:

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
  "questao": "Pergunta que o repertório ajuda a abrir.",
  "conexoes": "Relações possíveis com temas, conceitos, autores ou problemas sociais.",
  "conceitos": ["Conceito 1", "Conceito 2"],
  "autores": ["Autor 1", "Autora 2"],
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

Durante a montagem, `mostrarRascunhos: true` permite visualizar fichas em revisão. Antes de divulgar para estudantes, recomenda-se mudar para `false` e deixar visíveis apenas itens com status `revisado` ou `publicado`.

## Diretriz editorial

O Sociosofia deve organizar o conteúdo por temas e problemas, não por separação entre Filosofia e Sociologia. Cada card deve responder rapidamente:

- O que é?
- Por que importa?
- Que questão abre?
- Com quais conceitos conversa?
- Qual é a fonte original?
