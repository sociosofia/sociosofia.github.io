import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const [proposals,approvals,history,legacy,repertorios,publicacoes,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote2-v1.json'),
  read('data/aprovacoes-migracao-legado-lote2-v1.json'),
  read('data/historico-migracao-legado-lote2-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

const migrated=['DAD-0002','DAD-0006','CUL-0001'];
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set((history.itens||[]).map(item=>item.id));

assert(proposals.status==='aprovado','As propostas do segundo lote não registram aprovação editorial.');
assert(approvals.status==='aprovado'&&approvals.aprovado_por==='Luiz Jácomo','O segundo lote não possui aprovação nominal válida.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(migrated),'As propostas não correspondem exatamente ao segundo trio.');
assert(JSON.stringify(approvals.itens.map(item=>item.id))===JSON.stringify(migrated),'A aprovação não corresponde exatamente ao segundo trio.');

assert(legacy.ids.length===27,'O estado publicado_legado deve conter 27 itens após o segundo lote.');
assert(legacy.ids.filter(id=>id.startsWith('DAD-')).length===3,'Devem permanecer 3 cards DAD no legado.');
assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===24,'Devem permanecer 24 cards CUL no legado.');
for(const id of migrated)assert(!legacyIds.has(id),`${id} ainda aparece como publicado_legado.`);

const migratedRegistry=new Map((legacy.migrados||[]).map(item=>[item.id,item]));
for(const id of migrated){
  assert(migratedRegistry.get(id)?.lote==='legado-lote2-v1',`${id} não está registrado como migrado no segundo lote.`);
  assert(repertoryIds.has(id),`O registro histórico de ${id} deixou de existir em data/repertorios.json.`);
  assert(historyIds.has(id),`${id} não possui cópia histórica anterior à migração.`);
}
assert(history.itens.length===3,'O histórico do segundo lote deve preservar exatamente três versões antigas.');

assert(dataIds.has('DAD-0002')&&dataIds.has('DAD-0006'),'Os dois dados do segundo lote não chegaram à base canônica.');
assert(culturalIds.has('CUL-0001'),'CUL-0001 não chegou à base cultural canônica.');
assert(!dataIds.has('CUL-0001')&&!culturalIds.has('DAD-0002')&&!culturalIds.has('DAD-0006'),'Um item do segundo lote foi enviado para a base canônica errada.');
assert([...dataIds].filter(id=>culturalIds.has(id)).length===0,'Há IDs duplicados entre as bases canônicas.');

const dataValidation=validatePublicationCollection(publicacoes,{themeIds});
assert(dataValidation.errors.length===0,'A base canônica de dados falhou no contrato: '+dataValidation.errors.join(' | '));
assert(dataValidation.valid.length===9,'A base de dados deve conter nove publicações canônicas.');
const culturalValidation=validateRepertoryCollection(cultural,{themeIds});
assert(culturalValidation.errors.length===0,'A base cultural falhou no contrato: '+culturalValidation.errors.join(' | '));
assert(culturalValidation.valid.length===2,'A base cultural deve conter dois repertórios canônicos.');

const mental=publicacoes.find(item=>item.id==='DAD-0002');
assert(mental.codigo_publicacao==='R000-C02','DAD-0002 não usa o código reservado de migração.');
assert(mental.codigo_migracao==='MIG-L02-DAD-0002','DAD-0002 perdeu o código interno de migração.');
assert(mental.evi_id==='EVI-educbank-saude-mental-educacao-privada-2025','DAD-0002 perdeu a EVI definida.');
assert(mental.contextualizacao.includes('educação básica privada'),'DAD-0002 perdeu o recorte da rede privada.');
assert(mental.contextualizacao.includes('autorrelatados'),'DAD-0002 perdeu a ressalva sobre respostas autorrelatadas.');
assert(mental.contextualizacao.includes('não constituem diagnóstico clínico'),'DAD-0002 confundiu percepção e diagnóstico clínico.');

const iels=publicacoes.find(item=>item.id==='DAD-0006');
const approvedTitle='Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana';
assert(iels.codigo_publicacao==='R000-C06','DAD-0006 não usa o código reservado de migração.');
assert(iels.codigo_migracao==='MIG-L02-DAD-0006','DAD-0006 perdeu o código interno de migração.');
assert(iels.evi_id==='EVI-iels-leitura-primeira-infancia-brasil-2025','DAD-0006 perdeu a EVI definida.');
assert(iels.titulo===approvedTitle,'DAD-0006 perdeu o título aprovado por Luiz.');
assert(approvals.itens.find(item=>item.id==='DAD-0006')?.ajuste_aprovado===approvedTitle,'O título publicado não coincide com o ajuste aprovado.');
assert(!iels.titulo.includes('recorte brasileiro'),'DAD-0006 voltou a antecipar a metodologia no título.');
for(const state of ['Ceará','Pará','São Paulo'])assert(iels.contextualizacao.includes(state),`DAD-0006 não registra ${state}.`);
assert(iels.contextualizacao.includes('não para o Brasil inteiro'),'DAD-0006 perdeu a limitação territorial.');
assert(iels.contextualizacao.includes('não estabelece, sozinha, relação de causa e efeito'),'DAD-0006 perdeu a ressalva de causalidade.');
assert(iels.interpretacao_sociosofia.includes('não deve ser usada para culpar famílias'),'DAD-0006 perdeu a mediação contra culpabilização familiar.');

for(const item of [mental,iels]){
  assert(item.status==='publicado','Um dado migrado não está publicado.');
  assert(item.aprovacao?.aprovado_por==='Luiz Jácomo','Um dado migrado não preserva a aprovação nominal.');
  assert(item.origem_migracao?.lote==='legado-lote2-v1','Um dado migrado não registra o segundo lote.');
  assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote2-v1.json','Um dado migrado não aponta para o histórico correto.');
  assert(Array.isArray(item.autores)&&item.autores.length===0,'Um dado criou relação autoral automática.');
}

const joker=cultural.find(item=>item.id==='CUL-0001');
assert(joker.status==='publicado','CUL-0001 não está publicado.');
assert(joker.aprovacao?.aprovado_por==='Luiz Jácomo','CUL-0001 não preserva a aprovação nominal.');
assert(joker.origem_migracao?.lote==='legado-lote2-v1','CUL-0001 não registra o segundo lote.');
assert(joker.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote2-v1.json','CUL-0001 não aponta para o histórico correto.');
assert(Array.isArray(joker.autores)&&joker.autores.length===0,'CUL-0001 criou relação autoral automática.');
assert(joker.cuidado_pedagogico.includes('Não usar o filme como evidência'),'CUL-0001 perdeu o cuidado pedagógico aprovado.');
assert(joker.leitura_sociosofia.includes('nem provam que pessoas em sofrimento mental sejam violentas'),'CUL-0001 voltou a associar sofrimento mental e violência de forma automática.');

assert(legacy.ids.length+publicacoes.length+cultural.length===38,'A migração alterou o total público esperado de 38 conteúdos.');
const allPublicIds=[...legacy.ids,...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(new Set(allPublicIds).size===38,'A composição pública contém IDs duplicados.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');

console.log('Segundo lote migrado com histórico, aprovação, limites metodológicos e total público preservados.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
