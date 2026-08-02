import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const [approvals,history,legacy,repertorios,publicacoes,cultural,themes]=await Promise.all([
  read('data/aprovacoes-migracao-legado-lote1-v1.json'),
  read('data/historico-migracao-legado-lote1-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

const migrated=['DAD-0004','DAD-0007','CUL-0003'];
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set((history.registros||[]).map(item=>item.id));

assert(approvals.status==='aprovado','O primeiro lote não possui aprovação editorial registrada.');
assert(approvals.aprovado_por==='Luiz Jácomo','A aprovação deve estar nominalmente atribuída a Luiz Jácomo.');
assert(JSON.stringify((approvals.itens||[]).map(item=>item.id))===JSON.stringify(migrated),'A aprovação não cobre exatamente o primeiro trio migrado.');

for(const id of migrated)assert(!legacyIds.has(id),`${id} voltou ao estado publicado_legado.`);
assert(repertoryIds.has('DAD-0004')&&repertoryIds.has('DAD-0007')&&repertoryIds.has('CUL-0003'),'Os registros históricos do primeiro lote deixaram de existir no acervo legado.');
assert(dataIds.has('DAD-0004')&&dataIds.has('DAD-0007'),'Os dois dados do primeiro lote deixaram a base canônica.');
assert(culturalIds.has('CUL-0003'),'O repertório cultural do primeiro lote deixou a base canônica.');
assert(!dataIds.has('CUL-0003')&&!culturalIds.has('DAD-0004')&&!culturalIds.has('DAD-0007'),'Um item do primeiro lote foi enviado para a base canônica errada.');
assert([...dataIds].filter(id=>culturalIds.has(id)).length===0,'Há IDs duplicados entre dados e repertórios canônicos.');

for(const id of migrated)assert(historyIds.has(id),`${id} não possui cópia histórica anterior à migração.`);
assert(history.registros.length===3,'O histórico do primeiro lote deve preservar exatamente três versões antigas.');

const dataValidation=validatePublicationCollection(publicacoes,{themeIds});
assert(dataValidation.errors.length===0,'A base canônica de dados falhou no contrato: '+dataValidation.errors.join(' | '));
assert(dataValidation.valid.length===9,'A base canônica de dados deve conter nove publicações após dois lotes.');

const culturalValidation=validateRepertoryCollection(cultural,{themeIds});
assert(culturalValidation.errors.length===0,'A base canônica cultural falhou no contrato: '+culturalValidation.errors.join(' | '));
assert(culturalValidation.valid.length===2,'A base cultural deve conter dois repertórios após dois lotes.');

for(const id of ['DAD-0004','DAD-0007']){
  const item=publicacoes.find(entry=>entry.id===id);
  assert(item.codigo_publicacao.startsWith('R000-'),`${id} não usa a faixa reservada à migração do legado.`);
  assert(item.codigo_migracao,`${id} não registra código de migração.`);
  assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote1-v1.json',`${id} não aponta para o histórico do primeiro lote.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${id} criou relação autoral automática.`);
}

const her=cultural.find(item=>item.id==='CUL-0003');
assert(Array.isArray(her.autores)&&her.autores.length===0,'CUL-0003 criou relação autoral automática.');
assert(Array.isArray(her.autores_possiveis)&&her.autores_possiveis.length===2,'CUL-0003 perdeu as hipóteses teóricas pendentes.');
assert(her.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote1-v1.json','CUL-0003 não aponta para o histórico do primeiro lote.');

assert(legacy.ids.length+publicacoes.length+cultural.length===38,'Os lotes posteriores alteraram o total público esperado de 38 conteúdos.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante as migrações.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante as migrações.');

console.log('Primeiro lote continua íntegro após a migração do segundo lote.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
