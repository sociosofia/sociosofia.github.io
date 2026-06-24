# Sociosofia — V1.2 Editorias e Subcards

Esta versão testa a arquitetura sugerida por Luiz: **tema/editoria grande** com **subcards de repertórios** dentro dele.

## O que mudou

- A home agora renderiza automaticamente editorias a partir do campo `editoria`.
- Dentro de cada editoria aparecem subcards de repertórios.
- Cada repertório tem `titulo` + `subtitulo`.
- O resumo aparece em um parágrafo único.
- As palavras-chave (`tags`) são clicáveis e filtram o site.
- A página individual mostra: resumo, dado central, questão para pensar, conexões possíveis, fonte completa e tags.

## Alimentação do site

Edite `data/repertorios.json`. Cada item segue o modelo em `data/modelo-repertorio.json`.

Campos principais:

- `editoria`: grande tema do site, como Educação e juventudes.
- `subtema`: recorte menor dentro do tema.
- `titulo`: título curto, com palavras-chave.
- `subtitulo`: frase explicativa mais longa.
- `resumo`: um parágrafo com fonte, achado principal e problema social.
- `fonte_url`: link para a fonte completa.
- `tags`: palavras-chave clicáveis.
- `fonte_status`: conferida, parcial ou aguardando link direto.
- `status`: aguardando fonte, aguardando revisão, revisado ou publicado.

## Segurança editorial

Nem todo item de Instagram deve virar fonte. A legenda pode servir como pista, mas a publicação final deve apontar para fonte original: relatório, pesquisa, órgão público, universidade, periódico, observatório ou reportagem confiável.
