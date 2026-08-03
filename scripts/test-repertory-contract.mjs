import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}

const repertorios=JSON.parse(await readFile(new URL('../data/repertorios-canonicos.json',import.meta.url),'utf8'));
const themes=JSON.parse(await readFile(new URL('../data/temas.json',import.meta.url),'utf8'));
const themeIds=new Set(themeMapFromRegistry(themes).keys());

const valid=validateRepertoryCollection(repertorios,{themeIds});
assert(valid.errors.length===0,'O repertório cultural vigente deveria passar no contrato.');
assert(valid.valid.length===14,'A base cultural canônica deve conter 14 registros após o sexto lote.');

const canonicalIds=['CUL-0001','CUL-0002','CUL-0003','CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009','CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
for(const id of canonicalIds){
  const item=repertorios.find(entry=>entry.id===id);
  assert(item,`${id} não está na base cultural canônica.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${id} contém relação autoral automática.`);
}

const joker=repertorios.find(item=>item.id==='CUL-0001');
assert(joker.origem_migracao?.lote==='legado-lote2-v1','CUL-0001 não registra a origem do segundo lote.');
assert(joker.cuidado_pedagogico?.includes('Não usar o filme como evidência'),'CUL-0001 perdeu o cuidado pedagógico aprovado.');
const getOut=repertorios.find(item=>item.id==='CUL-0002');
assert(getOut.origem_migracao?.lote==='legado-lote3-v1','CUL-0002 não registra a origem do terceiro lote.');
assert(getOut.cuidado_pedagogico?.includes('Não tratá-la como documentário'),'CUL-0002 perdeu o cuidado pedagógico aprovado.');
assert(getOut.cuidado_pedagogico?.includes('Estados Unidos')&&getOut.cuidado_pedagogico?.includes('Brasil'),'CUL-0002 perdeu a distinção entre contextos raciais.');
const truman=repertorios.find(item=>item.id==='CUL-0004');
assert(truman.origem_migracao?.lote==='legado-lote4-v1','CUL-0004 não registra a origem do quarto lote.');
assert(truman.leitura_sociosofia.includes('consentimento'),'CUL-0004 perdeu o eixo do consentimento.');
assert(truman.cuidado_pedagogico.includes('Não apresentar o filme como profecia literal'),'CUL-0004 perdeu o cuidado contra leitura profética.');
const menino=repertorios.find(item=>item.id==='CUL-0005');
assert(menino.origem_migracao?.lote==='legado-lote4-v1','CUL-0005 não registra a origem do quarto lote.');
assert(menino.cuidado_pedagogico.includes('reconstrução documental mediada'),'CUL-0005 perdeu a mediação documental.');
assert(menino.cuidado_pedagogico.includes('história nacional de escravização e racismo'),'CUL-0005 perdeu o cuidado contra externalização do racismo brasileiro.');
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
assert(merits.cuidado_pedagogico.includes('alegoria')&&merits.cuidado_pedagogico.includes('sexualização'),'CUL-0009 perdeu os cuidados pedagógicos aprovados.');

const lot6Ids=['CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
for(const id of lot6Ids)assert(repertorios.find(item=>item.id===id)?.origem_migracao?.lote==='legado-lote6-v1',`${id} não registra a origem do sexto lote.`);
const fire=repertorios.find(item=>item.id==='CUL-0010');
assert(fire.leitura_sociosofia.includes('não o cria sozinha'),'CUL-0010 voltou ao determinismo tecnológico.');
const classroom=repertorios.find(item=>item.id==='CUL-0011');
assert(classroom.cuidado_pedagogico.includes('Não usar o filme para culpar estudantes, professores ou famílias'),'CUL-0011 voltou à culpabilização individual.');
const city=repertorios.find(item=>item.id==='CUL-0012');
assert(city.cuidado_pedagogico.includes('espetacularização da violência'),'CUL-0012 perdeu a discussão sobre representação.');
const arms=repertorios.find(item=>item.id==='CUL-0013');
assert(arms.leitura_sociosofia.includes('não funciona apenas à margem dos Estados'),'CUL-0013 apagou a participação estatal.');
const delivered=repertorios.find(item=>item.id==='CUL-0014');
assert(delivered.cuidado_pedagogico.includes('Não tratar os entregadores como vítimas sem agência'),'CUL-0014 apagou a agência dos trabalhadores.');
const prada=repertorios.find(item=>item.id==='CUL-0015');
assert(prada.cuidado_pedagogico.includes('Não desqualificar a moda como atividade superficial'),'CUL-0015 voltou a desqualificar o campo da moda.');

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

console.log('Bloqueios do contrato cultural e 14 repertórios canônicos confirmados.');
