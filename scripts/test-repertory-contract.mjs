import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}

const repertorios=JSON.parse(await readFile(new URL('../data/repertorios-canonicos.json',import.meta.url),'utf8'));
const themes=JSON.parse(await readFile(new URL('../data/temas.json',import.meta.url),'utf8'));
const themeIds=new Set(themeMapFromRegistry(themes).keys());

const valid=validateRepertoryCollection(repertorios,{themeIds});
assert(valid.errors.length===0,'O repertório cultural vigente deveria passar no contrato.');
assert(valid.valid.length===2,'A base cultural canônica deve conter dois registros após o segundo lote.');

for(const id of ['CUL-0001','CUL-0003']){
  const item=repertorios.find(entry=>entry.id===id);
  assert(item,`${id} não está na base cultural canônica.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${id} contém relação autoral automática.`);
}

const joker=repertorios.find(item=>item.id==='CUL-0001');
assert(joker.origem_migracao?.lote==='legado-lote2-v1','CUL-0001 não registra a origem do segundo lote.');
assert(joker.cuidado_pedagogico?.includes('Não usar o filme como evidência'),'CUL-0001 perdeu o cuidado pedagógico aprovado.');

const adjusting=structuredClone(repertorios);
adjusting[0].status='em_ajuste';
const adjustingResult=validateRepertoryCollection(adjusting,{themeIds});
assert(adjustingResult.errors.some(error=>error.includes('somente repertórios com status publicado')),'Um repertório em ajuste não foi bloqueado.');

const unknownTheme=structuredClone(repertorios);
unknownTheme[0].tema_ids=['tema-inexistente'];
const unknownThemeResult=validateRepertoryCollection(unknownTheme,{themeIds});
assert(unknownThemeResult.errors.some(error=>error.includes('tema_id desconhecido')),'Um tema cultural inexistente não foi bloqueado.');

const automaticAuthor=structuredClone(repertorios);
automaticAuthor[0].autores=['Michel Foucault'];
const authorResult=validateRepertoryCollection(automaticAuthor,{themeIds});
assert(authorResult.errors.some(error=>error.includes('REL separada')),'Uma relação autoral automática não foi bloqueada.');

const duplicate=structuredClone(repertorios);
duplicate.push(structuredClone(repertorios[0]));
const duplicateResult=validateRepertoryCollection(duplicate,{themeIds});
assert(duplicateResult.errors.some(error=>error.includes('id duplicado')),'Um ID cultural duplicado não foi bloqueado.');

console.log('Bloqueios do contrato cultural e dois repertórios canônicos confirmados.');
