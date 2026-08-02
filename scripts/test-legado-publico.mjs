import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const repertorios=JSON.parse(await readFile(new URL('data/repertorios.json',root),'utf8'));

assert(legacy.estado_publico==='publicado_legado','O registro do legado precisa usar publicado_legado.');
assert(Array.isArray(legacy.ids),'A lista de IDs do legado não foi encontrada.');
assert(legacy.ids.length===21,'A fachada pública legada deve preservar 21 itens após o quarto lote.');
assert(new Set(legacy.ids).size===legacy.ids.length,'Há IDs duplicados no registro do legado.');
assert(legacy.ids.filter(id=>id.startsWith('DAD-')).length===0,'Nenhum card DAD deve permanecer no legado após o quarto lote.');
assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===21,'O legado deve preservar 21 cards CUL.');

const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
for(const id of legacy.ids){
  const item=repertoryMap.get(id);
  assert(item,`O ID legado ${id} não existe em data/repertorios.json.`);
  assert(item.status!=='arquivado',`O ID arquivado ${id} não pode permanecer público.`);
}

const expectedMigrated=['DAD-0004','DAD-0007','CUL-0003','DAD-0002','DAD-0006','CUL-0001','DAD-0001','DAD-0005','CUL-0002','DAD-0003','CUL-0004','CUL-0005'];
const migratedIds=(legacy.migrados||[]).map(item=>item.id);
assert(JSON.stringify(migratedIds)===JSON.stringify(expectedMigrated),'O registro de migrados não corresponde aos quatro lotes aprovados.');
assert(new Set(migratedIds).size===migratedIds.length,'Há IDs duplicados no histórico de migrados.');

for(const id of migratedIds){
  assert(repertoryMap.has(id),`O histórico legado de ${id} não foi preservado.`);
  assert(!legacy.ids.includes(id),`${id} aparece simultaneamente como legado e migrado.`);
}

const allowedOutsideLegacy=new Set(migratedIds);
const unlisted=repertorios.filter(item=>item.status!=='publicado'&&!legacy.ids.includes(item.id)&&!allowedOutsideLegacy.has(item.id));
assert(unlisted.length===0,'Há itens legados fora do registro transitório ou da lista de migrados: '+unlisted.map(item=>item.id).join(', '));

console.log('Registro público transitório do legado validado após quatro lotes.');
