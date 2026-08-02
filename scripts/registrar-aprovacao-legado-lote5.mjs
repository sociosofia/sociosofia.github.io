import {readFile, writeFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const proposalPath = new URL('data/propostas-migracao-legado-lote5-v1.json', root);
const docPath = new URL('docs/piloto-migracao-legado-lote5-v1.md', root);
const proposalTestPath = new URL('scripts/test-propostas-migracao-legado-lote5.mjs', root);
const approvalTestPath = new URL('scripts/test-aprovacao-migracao-legado-lote5.mjs', root);
const workflowPath = new URL('.github/workflows/validate-propostas-migracao-legado-lote5.yml', root);

const proposals = JSON.parse(await readFile(proposalPath, 'utf8'));
proposals.status = 'aprovado';
proposals.escopo = 'Quinto trio do acervo legado e primeiro lote exclusivamente cultural. As propostas foram aprovadas por Luiz Jácomo e permanecem fora da interface até migração técnica separada.';
for (const item of proposals.propostas) item.status_editorial_proposto = 'aprovado';
await writeFile(proposalPath, JSON.stringify(proposals, null, 2) + '\n');

let doc = await readFile(docPath, 'utf8');
doc = doc
  .replace('**Status:** em revisão', '**Status:** aprovado editorialmente')
  .replace('**Publicação:** bloqueada até nova aprovação explícita de Luiz', '**Publicação:** bloqueada até a migração técnica separada')
  .replace('Nenhuma proposta substitui o texto público nesta etapa.', 'As três propostas foram aprovadas por Luiz Jácomo. Nenhuma substitui o texto público nesta etapa; a migração técnica ocorrerá em branch e PR separados.')
  .replace('## 7. Decisão esperada\n\nA revisão pode aprovar ou devolver separadamente:\n\n- `CUL-0007`;\n- `CUL-0008`;\n- `CUL-0009`.\n\nA aprovação editorial não publica automaticamente os cards. A migração pública será feita em branch e PR separados.', '## 7. Decisão registrada\n\nLuiz Jácomo aprovou `CUL-0007`, `CUL-0008` e `CUL-0009` em 02/08/2026. A aprovação editorial não publicou automaticamente os cards. A migração pública será feita em branch e PR separados, sem criação automática de REL, ficha de autor, conceito ou Elo.');
await writeFile(docPath, doc);

let proposalTest = await readFile(proposalTestPath, 'utf8');
proposalTest = proposalTest
  .replace("assert(proposals.status==='em_revisao','O quinto lote deve permanecer em revisão até decisão explícita de Luiz.');", "assert(proposals.status==='aprovado','O quinto lote deve registrar a aprovação editorial de Luiz.');")
  .replace("assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão.`);", "assert(item.status_editorial_proposto==='aprovado',`${item.id} não registra aprovação editorial.`);")
  .replace("console.log('Quinto trio cultural validado e mantido fora das bases canônicas.');", "console.log('Quinto trio cultural aprovado e mantido fora das bases canônicas.');");
await writeFile(proposalTestPath, proposalTest);

const approvalTest = `import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=JSON.parse(await readFile(new URL('data/propostas-migracao-legado-lote5-v1.json',root),'utf8'));
const approval=JSON.parse(await readFile(new URL('data/aprovacoes-migracao-legado-lote5-v1.json',root),'utf8'));
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const publications=JSON.parse(await readFile(new URL('data/publicacoes.json',root),'utf8'));
const cultural=JSON.parse(await readFile(new URL('data/repertorios-canonicos.json',root),'utf8'));

const expected=['CUL-0007','CUL-0008','CUL-0009'];
assert(approval.status==='aprovado','O quinto lote não possui aprovação editorial.');
assert(approval.aprovado_por==='Luiz Jácomo','A aprovação não está atribuída a Luiz Jácomo.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica do quinto lote não foi autorizada.');
assert(approval.nao_autoriza_relacoes_automaticas===true,'A aprovação não preserva o bloqueio de relações automáticas.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente o quinto trio.');
assert(approval.itens.every(item=>item.status==='aprovado'),'Há item não aprovado no quinto lote.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas e a aprovação não correspondem ao mesmo trio.');

const legacyIds=new Set(legacy.ids||[]);
const canonicalIds=new Set([...publications,...cultural].map(item=>item.id));
for(const id of expected){
  assert(legacyIds.has(id),\`${id} deixou o legado antes da migração técnica.\`);
  assert(!canonicalIds.has(id),\`${id} entrou prematuramente em base canônica.\`);
}

console.log('Aprovação nominal do quinto lote registrada sem publicação prematura.');
`;
await writeFile(approvalTestPath, approvalTest);

const workflow = `name: Validar propostas do quinto lote legado

on:
  push:
    branches:
      - migracao-editorial-legado-lote5-v1
    paths:
      - 'data/propostas-migracao-legado-lote5-v1.json'
      - 'data/aprovacoes-migracao-legado-lote5-v1.json'
      - 'data/publicacao-legado.json'
      - 'data/repertorios.json'
      - 'data/publicacoes.json'
      - 'data/repertorios-canonicos.json'
      - 'data/temas.json'
      - 'scripts/test-propostas-migracao-legado-lote5.mjs'
      - 'scripts/test-aprovacao-migracao-legado-lote5.mjs'
      - '.github/workflows/validate-propostas-migracao-legado-lote5.yml'
  pull_request:
    branches:
      - main
    paths:
      - 'data/propostas-migracao-legado-lote5-v1.json'
      - 'data/aprovacoes-migracao-legado-lote5-v1.json'
      - 'data/publicacao-legado.json'
      - 'data/repertorios.json'
      - 'data/publicacoes.json'
      - 'data/repertorios-canonicos.json'
      - 'data/temas.json'
      - 'scripts/test-propostas-migracao-legado-lote5.mjs'
      - 'scripts/test-aprovacao-migracao-legado-lote5.mjs'
      - '.github/workflows/validate-propostas-migracao-legado-lote5.yml'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Verificar sintaxe e JSON
        run: |
          node --check scripts/test-propostas-migracao-legado-lote5.mjs
          node --check scripts/test-aprovacao-migracao-legado-lote5.mjs
          node -e \"JSON.parse(require('fs').readFileSync('data/propostas-migracao-legado-lote5-v1.json','utf8'))\"
          node -e \"JSON.parse(require('fs').readFileSync('data/aprovacoes-migracao-legado-lote5-v1.json','utf8'))\"
      - name: Validar quinto trio cultural
        run: node scripts/test-propostas-migracao-legado-lote5.mjs
      - name: Validar aprovação nominal
        run: node scripts/test-aprovacao-migracao-legado-lote5.mjs
`;
await writeFile(workflowPath, workflow);

console.log('Aprovação editorial do quinto lote registrada.');
