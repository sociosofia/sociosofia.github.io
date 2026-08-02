import {readFile,writeFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);

await edit('scripts/test-legado-publico.mjs',text=>text
  .replace("assert(legacy.ids.length===21,'A fachada pública legada deve preservar 21 itens após o quarto lote.');","assert(legacy.ids.length===18,'A fachada pública legada deve preservar 18 itens após o quinto lote.');")
  .replace("assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===21,'O legado deve preservar 21 cards CUL.');","assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===18,'O legado deve preservar 18 cards CUL.');")
  .replace("'CUL-0004','CUL-0005'];","'CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009'];")
  .replace('não corresponde aos quatro lotes aprovados','não corresponde aos cinco lotes aprovados')
  .replace('validado após quatro lotes','validado após cinco lotes'));

await edit('scripts/test-repertory-contract.mjs',text=>text
  .replace("assert(valid.valid.length===5,'A base cultural canônica deve conter cinco registros após o quarto lote.');","assert(valid.valid.length===8,'A base cultural canônica deve conter oito registros após o quinto lote.');")
  .replace("['CUL-0001','CUL-0002','CUL-0003','CUL-0004','CUL-0005']","['CUL-0001','CUL-0002','CUL-0003','CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009']")
  .replace("assert(menino.cuidado_pedagogico.includes('história nacional de escravização e racismo'),'CUL-0005 perdeu o cuidado contra externalização do racismo brasileiro.');",`assert(menino.cuidado_pedagogico.includes('história nacional de escravização e racismo'),'CUL-0005 perdeu o cuidado contra externalização do racismo brasileiro.');

const junipero=repertorios.find(item=>item.id==='CUL-0007');
assert(junipero.origem_migracao?.lote==='legado-lote5-v1','CUL-0007 não registra a origem do quinto lote.');
assert(junipero.leitura_sociosofia.includes('dimensão amorosa e queer'),'CUL-0007 perdeu a dimensão afetiva e queer.');
assert(junipero.cuidado_pedagogico.includes('Não apresentar a transferência de consciência como fato científico'),'CUL-0007 apresentou ficção como fato científico.');

const entireHistory=repertorios.find(item=>item.id==='CUL-0008');
assert(entireHistory.origem_migracao?.lote==='legado-lote5-v1','CUL-0008 não registra a origem do quinto lote.');
assert(entireHistory.leitura_sociosofia.includes('Transformar a experiência em arquivo não elimina a interpretação'),'CUL-0008 confundiu registro e verdade completa.');
assert(entireHistory.cuidado_pedagogico.includes('controle coercitivo'),'CUL-0008 perdeu o cuidado sobre controle íntimo.');

const merits=repertorios.find(item=>item.id==='CUL-0009');
assert(merits.origem_migracao?.lote==='legado-lote5-v1','CUL-0009 não registra a origem do quinto lote.');
assert(merits.leitura_sociosofia.includes('contestação em produto'),'CUL-0009 perdeu o eixo da captura da crítica.');
assert(merits.cuidado_pedagogico.includes('alegoria')&&merits.cuidado_pedagogico.includes('sexualização'),'CUL-0009 perdeu os cuidados pedagógicos aprovados.');`)
  .replace('cinco repertórios canônicos confirmados','oito repertórios canônicos confirmados'));

for(const lote of [1,2,3]){
  await edit(`scripts/test-migracao-legado-lote${lote}.mjs`,text=>text
    .replace("legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5","legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8")
    .replace('após o quarto lote','após o quinto lote'));
}

await edit('scripts/test-migracao-legado-lote4.mjs',text=>text
  .replace("assert(legacy.ids.length===21,'O legado deve conter 21 itens após o quarto lote.');","assert(legacy.ids.length===18,'O legado deve conter 18 itens após o quinto lote.');")
  .replace("assert(cultural.length===5&&culturalIds.has('CUL-0004')&&culturalIds.has('CUL-0005')","assert(cultural.length===8&&culturalIds.has('CUL-0004')&&culturalIds.has('CUL-0005')")
  .replace("console.log('Quarto lote migrado com histórico, aprovação, contratos e total público preservados.');","console.log('Quarto lote continua íntegro após a migração do quinto lote.');"));

await edit('scripts/test-propostas-migracao-legado-lote4.mjs',text=>text
  .replace("assert(legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5,'As contagens após a migração do quarto lote estão incorretas.');",`assert(
    (legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5)||
    (legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8),
    'As contagens após a migração do quarto lote ou após lotes culturais posteriores estão incorretas.'
  );`));

await write('scripts/test-propostas-migracao-legado-lote5.mjs',String.raw`import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote5-v1.json'),read('data/temas.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0007','CUL-0008','CUL-0009'];
assert(proposals.status==='aprovado','O quinto lote deve registrar aprovação editorial.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quinto trio.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const culturalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>culturalIds.has(id));
assert(flags.every(Boolean)||flags.every(flag=>!flag),'O quinto lote ficou parcialmente migrado.');
const migrated=flags.every(Boolean);

if(migrated){
  assert(legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8,'As contagens após a migração do quinto lote estão incorretas.');
  for(const id of expected)assert(!legacyIds.has(id),\`\${id} permaneceu no legado após a migração.\`);
}else{
  assert(legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5,'As contagens anteriores à migração do quinto lote estão incorretas.');
  for(const id of expected)assert(legacyIds.has(id),\`\${id} deixou o legado antes da migração.\`);
}

for(const item of proposals.propostas){
  assert(item.status_editorial_proposto==='aprovado',\`\${item.id} não registra aprovação editorial.\`);
  assert(repertoryMap.has(item.id),\`\${item.id} não existe no acervo original.\`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.every(id=>themeIds.has(id)),\`\${item.id} usa tema inexistente.\`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,\`\${item.id} não possui referência completa.\`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,\`\${item.id} apresenta relação autoral pronta.\`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,\`\${item.id} não registra relações pendentes.\`);
}

const junipero=proposals.propostas.find(item=>item.id==='CUL-0007');
assert(junipero.leitura_sociosofia.includes('dimensão amorosa e queer'),'CUL-0007 apagou a dimensão afetiva e queer.');
assert(junipero.cuidado_pedagogico.includes('Não apresentar a transferência de consciência como fato científico'),'CUL-0007 apresentou ficção como fato científico.');
assert(junipero.cuidado_pedagogico.includes('deficiência')&&junipero.cuidado_pedagogico.includes('velhice'),'CUL-0007 voltou a universalizar corpo, deficiência ou velhice como prisão.');

const entireHistory=proposals.propostas.find(item=>item.id==='CUL-0008');
assert(entireHistory.leitura_sociosofia.includes('Transformar a experiência em arquivo não elimina a interpretação'),'CUL-0008 confundiu registro e verdade completa.');
assert(entireHistory.cuidado_pedagogico.includes('controle coercitivo'),'CUL-0008 perdeu o cuidado sobre controle íntimo.');

const merits=proposals.propostas.find(item=>item.id==='CUL-0009');
assert(merits.leitura_sociosofia.includes('contestação em produto'),'CUL-0009 perdeu o eixo da captura da crítica.');
assert(merits.cuidado_pedagogico.includes('alegoria'),'CUL-0009 passou a ser tratado como descrição literal.');
assert(merits.cuidado_pedagogico.includes('humilhação')&&merits.cuidado_pedagogico.includes('sexualização'),'CUL-0009 perdeu o cuidado com cenas sensíveis.');

console.log(migrated?'Quinto trio editorial aprovado e migrado integralmente.':'Quinto trio editorial aprovado e aguardando migração integral.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
`);

await write('scripts/test-aprovacao-migracao-legado-lote5.mjs',String.raw`import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,legacy,publications,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote5-v1.json'),read('data/aprovacoes-migracao-legado-lote5-v1.json'),read('data/publicacao-legado.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['CUL-0007','CUL-0008','CUL-0009'];
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quinto lote é inválida.');
assert(approval.autoriza_migracao_tecnica===true,'A migração técnica do quinto lote não foi autorizada.');
assert(approval.nao_autoriza_relacoes_automaticas===true,'A aprovação não preserva o bloqueio de relações automáticas.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente o quinto trio.');
assert(approval.itens.every(item=>item.status==='aprovado'),'Há item não aprovado no quinto lote.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas e a aprovação não correspondem ao mesmo trio.');

const legacyIds=new Set(legacy.ids||[]);
const culturalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>culturalIds.has(id));
assert(flags.every(Boolean)||flags.every(flag=>!flag),'A aprovação foi aplicada apenas a parte do quinto trio.');
if(flags.every(Boolean)){
  for(const id of expected)assert(!legacyIds.has(id),\`\${id} permaneceu no legado após a migração.\`);
}else{
  for(const id of expected)assert(legacyIds.has(id),\`\${id} deixou o legado antes da migração integral.\`);
}
assert(publications.length===12,'A migração cultural alterou a base de dados.');

console.log(flags.every(Boolean)?'Aprovação nominal aplicada integralmente ao quinto lote.':'Aprovação nominal registrada sem publicação prematura.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
`);

await write('scripts/test-migracao-legado-lote5.mjs',String.raw`import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,history,legacy,repertorios,publicacoes,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote5-v1.json'),read('data/aprovacoes-migracao-legado-lote5-v1.json'),read('data/historico-migracao-legado-lote5-v1.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json'),read('data/temas.json')
]);

const expected=['CUL-0007','CUL-0008','CUL-0009'];
assert(proposals.status==='aprovado','As propostas do quinto lote não estão aprovadas.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quinto lote é inválida.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quinto trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde ao quinto trio.');
assert(history.aprovado_por==='Luiz Jácomo'&&history.itens.length===3,'O histórico do quinto lote é inválido.');

const legacyIds=new Set(legacy.ids||[]);
const migratedMap=new Map((legacy.migrados||[]).map(item=>[item.id,item]));
const repertoryIds=new Set(repertorios.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set(history.itens.map(item=>item.id));
for(const id of expected){
  assert(!legacyIds.has(id),\`\${id} ainda aparece como publicado_legado.\`);
  assert(migratedMap.get(id)?.lote==='legado-lote5-v1',\`\${id} não está registrado no quinto lote.\`);
  assert(repertoryIds.has(id),\`\${id} perdeu o registro histórico original.\`);
  assert(historyIds.has(id),\`\${id} não possui cópia histórica do quinto lote.\`);
  assert(culturalIds.has(id),\`\${id} não chegou à base cultural canônica.\`);
}

assert(legacy.ids.length===18&&legacy.ids.every(id=>id.startsWith('CUL-')),'O legado deve conter 18 repertórios culturais após o quinto lote.');
assert(publicacoes.length===12,'A migração cultural alterou os doze dados canônicos.');
assert(cultural.length===8,'A base cultural deve conter oito repertórios após o quinto lote.');
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const validation=validateRepertoryCollection(cultural,{themeIds});
assert(validation.errors.length===0,'A base cultural falhou no contrato: '+validation.errors.join(' | '));

for(const id of expected){
  const item=cultural.find(entry=>entry.id===id);
  assert(item.status==='publicado',\`\${id} não está publicado.\`);
  assert(item.aprovacao?.aprovado_por==='Luiz Jácomo',\`\${id} não preserva a aprovação nominal.\`);
  assert(item.origem_migracao?.lote==='legado-lote5-v1',\`\${id} não registra o quinto lote.\`);
  assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote5-v1.json',\`\${id} não aponta para o histórico correto.\`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,\`\${id} criou relação autoral automática.\`);
}

const junipero=cultural.find(item=>item.id==='CUL-0007');
assert(junipero.leitura_sociosofia.includes('dimensão amorosa e queer'),'CUL-0007 perdeu a dimensão afetiva e queer.');
assert(junipero.cuidado_pedagogico.includes('Não apresentar a transferência de consciência como fato científico'),'CUL-0007 apresentou ficção como fato científico.');
const entireHistory=cultural.find(item=>item.id==='CUL-0008');
assert(entireHistory.leitura_sociosofia.includes('Transformar a experiência em arquivo não elimina a interpretação'),'CUL-0008 confundiu registro e verdade.');
assert(entireHistory.cuidado_pedagogico.includes('controle coercitivo'),'CUL-0008 perdeu o cuidado sobre controle íntimo.');
const merits=cultural.find(item=>item.id==='CUL-0009');
assert(merits.leitura_sociosofia.includes('contestação em produto'),'CUL-0009 perdeu a captura da crítica.');
assert(merits.cuidado_pedagogico.includes('alegoria')&&merits.cuidado_pedagogico.includes('sexualização'),'CUL-0009 perdeu os cuidados pedagógicos.');

const allPublic=[...legacy.ids,...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');

console.log('Quinto lote migrado com histórico, aprovação, contrato e total público preservados.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
`);

await edit('audit/legacy-publication-browser.mjs',text=>text
  .replace('assert(legacy.length===21,`Esperados 21 itens publicado_legado; encontrados ${legacy.length}.`);','assert(legacy.length===18,`Esperados 18 itens publicado_legado; encontrados ${legacy.length}.`);')
  .replace('assert(current.length===17,`Esperadas 17 publicações canônicas; encontradas ${current.length}.`);','assert(current.length===20,`Esperadas 20 publicações canônicas; encontradas ${current.length}.`);')
  .replace("'CUL-0004','CUL-0005'])","'CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009'])")
  .replace("await verifyCulturalCard('CUL-0005',['Menino 23: eugenia, trabalho forçado e apagamento histórico','cinquenta meninos negros','reconstrução documental mediada','história nacional de escravização e racismo']);",`await verifyCulturalCard('CUL-0005',['Menino 23: eugenia, trabalho forçado e apagamento histórico','cinquenta meninos negros','reconstrução documental mediada','história nacional de escravização e racismo']);
await verifyCulturalCard('CUL-0007',['Black Mirror — San Junípero: corpo, memória e a promessa de continuar vivendo','dimensão amorosa e queer','Não apresentar a transferência de consciência como fato científico','Uma existência digital seria continuação da mesma pessoa']);
await verifyCulturalCard('CUL-0008',['Black Mirror — The Entire History of You: quando lembrar se torna vigiar','Transformar a experiência em arquivo não elimina a interpretação','controle coercitivo','Rever tudo tornaria uma relação mais verdadeira']);
await verifyCulturalCard('CUL-0009',['Black Mirror — Fifteen Million Merits: trabalho, consumo e revolta transformada em espetáculo','contestação em produto','alegoria','humilhação','O que acontece com a crítica social']);`)
  .replace('Auditoria dos quatro lotes migrados concluída.','Auditoria dos cinco lotes migrados concluída.'));

await write('.github/workflows/validate-migracao-legado-lote5.yml',`name: Validar quinto lote migrado

on:
  push:
    branches:
      - publicar-migracao-legado-lote5-v1
    paths:
      - 'data/historico-migracao-legado-lote5-v1.json'
      - 'data/publicacao-legado.json'
      - 'data/repertorios-canonicos.json'
      - 'scripts/test-migracao-legado-lote5.mjs'
      - '.github/workflows/validate-migracao-legado-lote5.yml'
  pull_request:
    branches:
      - main
    paths:
      - 'data/historico-migracao-legado-lote5-v1.json'
      - 'data/publicacao-legado.json'
      - 'data/repertorios-canonicos.json'
      - 'scripts/test-migracao-legado-lote5.mjs'
      - '.github/workflows/validate-migracao-legado-lote5.yml'
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
          node --check scripts/test-migracao-legado-lote5.mjs
          node -e "JSON.parse(require('fs').readFileSync('data/historico-migracao-legado-lote5-v1.json','utf8'))"
      - name: Validar migração do quinto lote
        run: node scripts/test-migracao-legado-lote5.mjs
`);

console.log('Validações do quinto lote preparadas.');

async function edit(path,transform){const current=await readFile(new URL(path,root),'utf8');await writeFile(new URL(path,root),transform(current));}
async function write(path,content){await writeFile(new URL(path,root),content.endsWith('\n')?content:content+'\n');}
