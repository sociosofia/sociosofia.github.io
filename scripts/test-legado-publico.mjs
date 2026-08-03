import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

assert(legacy.estado_publico==='encerrado','O registro do legado deve marcar o encerramento da migração.');
assert(Array.isArray(legacy.ids)&&legacy.ids.length===0,'Nenhum ID pode permanecer em publicado_legado.');
assert(Array.isArray(legacy.migrados)&&legacy.migrados.length===33,'O histórico cumulativo deve registrar 33 conteúdos migrados.');
const migratedIds=legacy.migrados.map(item=>item.id);
assert(new Set(migratedIds).size===33,'Há IDs duplicados no histórico de migrados.');

const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
for(const id of migratedIds)assert(repertoryMap.has(id),`O registro histórico de ${id} não existe em data/repertorios.json.`);

assert(publicacoes.length===12,'A base de dados canônica deve conter 12 registros.');
assert(cultural.length===26,'A base cultural canônica deve conter 26 registros.');
const allPublic=[...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público final deve conter 38 IDs únicos.');
for(const id of migratedIds)assert(allPublic.includes(id),`${id} foi registrado como migrado sem destino canônico.`);

const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu na publicação final.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu na publicação final.');

console.log('Migração do legado encerrada: 33 registros históricos e 38 conteúdos canônicos.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
