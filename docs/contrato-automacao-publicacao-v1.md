# Contrato entre automação editorial e site público — v1

**Status:** proposta técnica para validação de Luiz  
**Escopo:** projeções públicas de dados derivadas de evidências canônicas EVI  
**Arquivo público:** `data/publicacoes.json`

## 1. Separação de camadas

A automação trabalha em duas camadas distintas:

1. **Base editorial interna:** fontes, evidências EVI, método, escopo, limitações, pendências, atualizações e cards em ajuste.
2. **Projeção pública:** somente cards aprovados, autônomos e prontos para exibição.

Uma EVI pode permanecer validada internamente mesmo quando sua projeção pública está `em_ajuste`. Registros em ajuste não pertencem a `data/publicacoes.json`.

## 2. Portão humano

Nenhuma descoberta, EVI ou proposta de card é publicada automaticamente.

O fluxo é:

```text
busca e triagem
→ FON e EVI provisórias
→ proposta de card
→ revisão de Luiz
→ aprovação explícita
→ validação técnica
→ inclusão em data/publicacoes.json
→ interface pública
```

Cada projeção pública precisa registrar:

```json
"status": "publicado",
"aprovacao": {
  "status": "aprovado",
  "aprovado_por": "Luiz Jácomo"
}
```

## 3. Campos obrigatórios

```json
{
  "versao_contrato": "1.0",
  "modelo_publico": "card_dados_v1",
  "id": "DAD-0000",
  "codigo_publicacao": "R000-C00",
  "evi_id": "EVI-identificador-estavel",
  "tema_ids": ["tema-canonico"],
  "titulo": "",
  "dado": "",
  "contextualizacao": "",
  "interpretacao_sociosofia": "",
  "questao": "",
  "fonte_nome": "",
  "fonte_url": "https://...",
  "ano_data": "",
  "status": "publicado",
  "aprovacao": {
    "status": "aprovado",
    "aprovado_por": "Luiz Jácomo"
  }
}
```

`questao` é recomendada e exibida quando aprovada, mas não substitui o dado, a contextualização ou a interpretação.

## 4. Regras do card público

O card deve funcionar sozinho. Sua sequência é:

```text
título
→ dado principal
→ contextualização
→ Interpretação Sociosofia
→ pergunta para continuar pensando, quando houver
→ fonte original e data
```

Conceitos indispensáveis à compreensão precisam ser explicados no próprio texto. Links, autores, conceitos relacionados e Elos aprofundam a leitura, mas não corrigem uma explicação insuficiente.

Cada card possui uma mensagem empírica dominante. Uma EVI composta pode gerar mais de uma projeção pública, desde que cada card indique sua origem por `evi_id` e preserve IDs públicos distintos.

## 5. Temas canônicos

Os vínculos principais usam IDs de `data/temas.json`.

Exemplo:

```json
"tema_ids": ["genero", "trabalho"]
```

Aliases ajudam a reconciliar rótulos históricos. O site pode continuar usando palavras-chave para descoberta e serendipidade, mas a pertença editorial principal não depende mais de coincidência textual.

## 6. Compatibilidade e legado

Campos como `resumo`, `categoria`, `editoria`, `conexoes`, `tags`, `conceitos` e `autores` podem permanecer durante a migração. Eles não substituem os campos canônicos obrigatórios.

O carregador público:

- aceita somente registros válidos;
- ignora e registra no console qualquer projeção rejeitada;
- não exibe conteúdos `em_ajuste`, `rascunho`, `em_revisao` ou `arquivado`;
- impede IDs e códigos de publicação duplicados;
- rejeita `tema_ids` inexistentes;
- exige fonte original e aprovação humana.

## 7. Registros vigentes

Os seguintes cards permanecem públicos:

- R001–C01 → DAD-0008;
- R002–C01 → DAD-0009;
- R002–C02 → DAD-0010;
- R002–C03 → DAD-0011.

R001–C02, sobre salário digno, permanece fora de `data/publicacoes.json` e não pode aparecer no site enquanto estiver `em_ajuste`.

## 8. Entrega esperada da automação após aprovação

Depois da aprovação explícita de Luiz, a automação deverá entregar um único objeto compatível com este contrato. Antes de gravá-lo, deverá:

1. verificar se o `evi_id` já existe;
2. distinguir novo card, atualização ou duplicata;
3. atribuir `tema_ids` válidos;
4. garantir unicidade de `id` e `codigo_publicacao`;
5. preencher a aprovação humana;
6. executar o validador;
7. inserir o objeto sem alterar outros registros;
8. confirmar a renderização pública.

A automação não cria RELs, conceitos, autores ou Elos automaticamente. Pode propor conexões para revisão editorial separada.
