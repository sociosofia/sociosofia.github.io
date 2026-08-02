import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const repertorios=JSON.parse(await readFile(new URL('data/repertorios.json',root),'utf8'));

assert(legacy.estado_publico==='publicado_legado','O registro do legado precisa usar publicado_legado.');
assert(Array.isArray(legacy.ids),'A lista de IDs do legado não foi encontrada.');
assert(legacy.ids.length===33,'A fachada pública legada deve preservar 33 itens.');
assert(new Set(legacy.ids).size===legacy.ids.length,'Há IDs duplicados no registro do legado.');
assert(legacy.ids.filter(id=>id.startsWith('DAD-')).length===7,'O legado deve preservar 7 cards DAD.');
assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===26,'O legado deve preservar 26 cards CUL.');

const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
for(const id of legacy.ids){
  const item=repertoryMap.get(id);
  assert(item,`O ID legado ${id} não existe em data/repertorios.json.`);
  assert(item.status!=='arquivado',`O ID arquivado ${id} não pode permanecer público.`);
}

const unlisted=repertorios.filter(item=>item.status!=='publicado'&&!legacy.ids.includes(item.id));
assert(unlisted.length===0,'Há itens legados fora do registro transitório: '+unlisted.map(item=>item.id).join(', '));

console.log('Registro público transitório do legado validado.');
