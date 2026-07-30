# Editoria 2 — Área do Estudante comparativa

Ambiente de desenvolvimento e comparação da nova arquitetura editorial da Área do Estudante do Sociosofia.

## Regra principal

A Área do Estudante atual, em `/alunos/`, permanece intacta e funciona como referência obrigatória. A Editoria 2 não é uma substituição automática.

## Objetivo

Comparar a área atual com uma nova versão baseada em:

- correspondência explícita com o material didático e suas páginas;
- movimentos de compreensão do capítulo;
- entidades canônicas reutilizáveis;
- navegação anual, por etapa, capítulo e movimento;
- busca entre capítulos, perguntas, conceitos e autores;
- retomada do último movimento visitado;
- trilhas adicionadas apenas posteriormente, quando houver autor ou autora, repertório e dado ou evidência verificável.

## Unidade de produção

Após a validação dos protótipos, a unidade de produção passa a ser:

```text
um componente completo de um ano
```

O lote deve ser revisto como conjunto antes do início do componente seguinte.

## Fluxo de trabalho

```text
conteúdo atual + material didático
→ reconstrução dos movimentos
→ implementação anual na Editoria 2
→ comparação com /alunos/
→ registro de ganhos e perdas
→ correções
→ aprovação de Luiz
→ eventual substituição
```

## O que deve ser comparado

- clareza da entrada por escola, ano, componente, etapa e capítulo;
- correspondência com páginas do livro;
- facilidade para retomar o percurso;
- navegação no celular;
- legibilidade;
- continuidade entre capítulos;
- preservação de autores, conceitos, repertórios e dados já existentes;
- funcionamento das fichas reutilizáveis em capítulos diferentes;
- facilidade de manutenção;
- instalação e comportamento como PWA;
- eventuais perdas da estrutura anterior.

## Estados

- `em desenvolvimento` — conteúdo e interface ainda mudam;
- `comparável` — já pode ser confrontado com a área atual;
- `aprovado para integração` — passou pela revisão editorial e funcional;
- `publicado` — integrado à área oficial após confirmação explícita.

## Lote 01 — Sociologia — 2º ano

- instituição: SESI Rio Claro;
- edição: SESI-SP, 3ª edição, 2026;
- etapas: 3;
- capítulos: 6;
- movimentos: 36;
- fichas reutilizáveis iniciais: 19;
- trilhas públicas: nenhuma neste lote;
- área oficial preservada: `/alunos/`;
- página inicial do site: não alterada;
- estado: `em desenvolvimento`, pronta para primeira comparação funcional.

## Arquivos

- `index.html` — casca da aplicação comparativa;
- `styles.css` — identidade visual e responsividade;
- `app.js` — capítulos, movimentos, fichas, busca e retomada.

## Restrições vigentes

- não substituir `/alunos/`;
- não criar link na página inicial;
- não tratar a branch como publicação aprovada;
- não ativar trilhas incompletas;
- não remover funções da área antiga sem comparação explícita.