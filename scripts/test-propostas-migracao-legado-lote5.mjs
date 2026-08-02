import {readFile} from 'node:fs/promises';

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
  for(const id of expected)assert(!legacyIds.has(id),`${id} permaneceu no legado após a migração.`);
}else{
  assert(legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5,'As contagens anteriores à migração do quinto lote estão incorretas.');
  for(const id of expected)assert(legacyIds.has(id),`${id} deixou o legado antes da migração.`);
}

for(const item of proposals.propostas){
  assert(item.status_editorial_proposto==='aprovado',`${item.id} não registra aprovação editorial.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo original.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral pronta.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);
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
