# Sociologia · 1º ano · 1ª etapa — transposição v8

Status: **aprovado para transposição; não publicado**.

Fonte editorial fechada: Mesa Editorial v8, aprovada em 09/08/2026.

## Contrato de integridade

- 4 capítulos e 19 movimentos preservados na ordem aprovada.
- Perguntas, parágrafos e passagens são transportados sem resumo ou reescrita pelo layout.
- Cada uma das 28 entidades possui uma apresentação completa na etapa.
- Apresentações completas reutilizam as fichas integrais já existentes no `site-data`; a camada v8 não substitui essas fichas por definições curtas.
- Retomadas contextualizadas mantêm acesso à ficha integral correspondente.
- 9 ocorrências absorvidas já fazem parte do texto corrido e não geram bloco visual separado.
- Vínculos editoriais não alteram a condição completa/contextual/absorvida das entidades.
- Busca, navegação, histórico, modos de uso e fichas laterais continuam operando sobre a infraestrutura canônica do percurso.

## Estratégia técnica

Os quatro arquivos `page-*.b64` permanecem byte a byte inalterados. O loader recompõe o payload existente e aplica os patches de acessibilidade e identidade visual já vigentes. Em seguida, antes de entregar a página ao estudante, a camada v8 atualiza diretamente o `site-data` canônico dos capítulos 1–4 e estende o renderizador de movimentos para suportar parágrafos contínuos, apresentações completas, retomadas contextualizadas, ocorrências absorvidas e vínculos editoriais.

As 83 entidades e suas fichas integrais continuam pertencendo à base canônica já existente; a v8 registra apenas como cada entidade é usada editorialmente nesta etapa. Isso evita criar uma segunda base de fichas e protege a integralidade do acervo.

A transposição possui uma auditoria própria em `audit/soc1-etapa1-v8-audit.mjs`, que verifica em navegador real a entrada da redação v8, tratamentos de ocorrência, abertura das fichas, desktop/celular e ausência de overflow.

A publicação/merge permanece condicionada à conferência final de Luiz.
