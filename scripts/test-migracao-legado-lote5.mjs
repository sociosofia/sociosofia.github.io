import {readFile} from 'node:fs/promises';
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
  assert(!legacyIds.has(id),`${id} ainda aparece como publicado_legado.`);
  assert(migratedMap.get(id)?.lote==='legado-lote5-v1',`${id} não está registrado no quinto lote.`);
  assert(repertoryIds.has(id),`${id} perdeu o registro histórico original.`);
  assert(historyIds.has(id),`${id} não possui cópia histórica do quinto lote.`);
  assert(culturalIds.has(id),`${id} não chegou à base cultural canônica.`);
}

assert(legacy.ids.length===18&&legacy.ids.every(id=>id.startsWith('CUL-')),'O legado deve conter 18 repertórios culturais após o quinto lote.');
assert(publicacoes.length===12,'A migração cultural alterou os doze dados canônicos.');
assert(cultural.length===8,'A base cultural deve conter oito repertórios após o quinto lote.');
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const validation=validateRepertoryCollection(cultural,{themeIds});
assert(validation.errors.length===0,'A base cultural falhou no contrato: '+validation.errors.join(' | '));

for(const id of expected){
  const item=cultural.find(entry=>entry.id===id);
  assert(item.status==='publicado',`${id} não está publicado.`);
  assert(item.aprovacao?.aprovado_por==='Luiz Jácomo',`${id} não preserva a aprovação nominal.`);
  assert(item.origem_migracao?.lote==='legado-lote5-v1',`${id} não registra o quinto lote.`);
  assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote5-v1.json',`${id} não aponta para o histórico correto.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${id} criou relação autoral automática.`);
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
