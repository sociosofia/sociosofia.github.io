import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection,normalizePublication} from '../publication-contract.mjs';

function assert(condition,message){
  if(!condition)throw new Error(message);
}

const publications=JSON.parse(await readFile(new URL('../data/publicacoes.json',import.meta.url),'utf8'));
const themes=JSON.parse(await readFile(new URL('../data/temas.json',import.meta.url),'utf8'));
const themeMap=themeMapFromRegistry(themes);
const themeIds=new Set(themeMap.keys());

const valid=validatePublicationCollection(publications,{themeIds});
assert(valid.errors.length===0,'Os registros vigentes deveriam passar no contrato.');
assert(valid.valid.length===7,'A base pública deve conter exatamente sete registros de dados após o primeiro lote de migração.');
assert(publications.every(item=>item.dado!==item.contextualizacao),'Dado e contextualização não podem ser cópias idênticas.');

const genderCard=normalizePublication(publications.find(item=>item.id==='DAD-0009'),themeMap);
assert(genderCard.categoria==='Gênero, sexualidade e corpo','O tema canônico genero não assumiu o rótulo público principal.');

for(const id of ['DAD-0004','DAD-0007']){
  const migrated=publications.find(item=>item.id===id);
  assert(migrated,`${id} não está na base canônica.`);
  assert(migrated.codigo_publicacao.startsWith('R000-'),`${id} não usa a faixa reservada à migração.`);
  assert(migrated.origem_migracao?.lote==='legado-lote1-v1',`${id} não registra sua origem de migração.`);
}

const adjusting=structuredClone(publications);
adjusting.push({...structuredClone(publications[0]),id:'DAD-9997',codigo_publicacao:'R999-C97',status:'em_ajuste'});
const adjustingResult=validatePublicationCollection(adjusting,{themeIds});
assert(adjustingResult.errors.some(error=>error.includes('somente registros com status publicado')),'Um card em ajuste não foi bloqueado.');

const unknownTheme=structuredClone(publications);
unknownTheme[0].tema_ids=['tema-inexistente'];
const unknownThemeResult=validatePublicationCollection(unknownTheme,{themeIds});
assert(unknownThemeResult.errors.some(error=>error.includes('tema_id desconhecido')),'Um tema inexistente não foi bloqueado.');

const duplicate=structuredClone(publications);
duplicate.push({...structuredClone(publications[0]),codigo_publicacao:'R999-C98'});
const duplicateResult=validatePublicationCollection(duplicate,{themeIds});
assert(duplicateResult.errors.some(error=>error.includes('id duplicado')),'Um ID público duplicado não foi bloqueado.');

const duplicateCode=structuredClone(publications);
duplicateCode.push({...structuredClone(publications[0]),id:'DAD-9996'});
const duplicateCodeResult=validatePublicationCollection(duplicateCode,{themeIds});
assert(duplicateCodeResult.errors.some(error=>error.includes('codigo_publicacao duplicado')),'Um código de publicação duplicado não foi bloqueado.');

const serialized=JSON.stringify(publications).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 não pode estar na base pública.');
assert(!serialized.includes('salário digno'),'O card do salário digno não pode estar na base pública.');

console.log('Bloqueios, migrações e campos canônicos confirmados.');
