# Movimento 2 — registro de proposta descartada

**Projeto:** Sociosofia — Área do Estudante — Filosofia — 1º ano  
**Estado:** descartada após revisão humana de Luiz Jácomo em 05/08/2026  
**Publicação autorizada:** não

## Motivo do descarte

A proposta reconstruiu corretamente parte da modelagem editorial das entidades, mas adotou uma arquitetura pública anual incompatível com o padrão aprovado da Área do Estudante.

Foram identificados os seguintes desvios:

- substituição do fluxo escola → ano → disciplina → etapa → capítulo por uma página anual única;
- uso de contagem de movimentos no nível da etapa, embora movimento seja divisão interna de capítulo;
- títulos e acentos cromáticos fora da identidade visual aprovada da Área do Estudante;
- perda da navegação que leva o estudante do fim de um capítulo ao início do capítulo seguinte em outro ambiente;
- cabeçalho incompatível com o padrão aprovado;
- divergência entre a paleta aplicada e a identidade atual do Sociosofia Estudante.

## Decisão

Esta branch não deve ser integrada à `main`.

A reconstrução seguinte deve partir novamente da arquitetura da Área do Estudante e reaproveitar apenas o conteúdo editorial saneado, sem conservar o invólucro anual desta proposta.
