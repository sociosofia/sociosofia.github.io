import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const repertorios=JSON.parse(await readFile(new URL('../data/repertorios-canonicos.json',import.meta.url),'utf8'));
const themes=JSON.parse(await readFile(new URL('../data/temas.json',import.meta.url),'utf8'));
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const valid=validateRepertoryCollection(repertorios,{themeIds});
assert(valid.errors.length===0,'O repertório cultural vigente deveria passar no contrato.');
assert(valid.valid.length===26,'A base cultural canônica deve conter 26 registros após o encerramento do legado.');

const expected=['CUL-0001','CUL-0002','CUL-0003','CUL-0004','CUL-0005','CUL-0006','CUL-0007','CUL-0008','CUL-0009','CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015','CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
assert(JSON.stringify(repertorios.map(item=>item.id).sort())===JSON.stringify([...expected].sort()),'A base cultural final não contém os 26 IDs esperados.');
for(const item of repertorios){
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} contém relação autoral automática.`);
  assert(item.aprovacao?.status==='aprovado'&&item.aprovacao?.aprovado_por==='Luiz Jácomo',`${item.id} não possui aprovação humana válida.`);
  assert(item.origem_migracao?.historico_ref&&item.origem_migracao?.aprovacao_ref,`${item.id} não preserva origem e histórico.`);
}

const checks={
  'CUL-0001':['cuidado_pedagogico','Não usar o filme como evidência'],
  'CUL-0004':['leitura_sociosofia','consentimento'],
  'CUL-0007':['leitura_sociosofia','dimensão amorosa e queer'],
  'CUL-0010':['leitura_sociosofia','não o cria sozinha'],
  'CUL-0016':['cuidado_pedagogico','culpabilizar famílias'],
  'CUL-0017':['cuidado_pedagogico','Não diagnosticar Kevin'],
  'CUL-0018':['cuidado_pedagogico','não deve banalizar o nazismo'],
  'CUL-0019':['leitura_sociosofia','tempo militar e tempo vivido'],
  'CUL-0020':['leitura_sociosofia','transforma juventude em recurso político'],
  'CUL-0021':['cuidado_pedagogico','sem obrigação de relato pessoal'],
  'CUL-0006':['cuidado_pedagogico','não devem ser pressionados a expor crenças'],
  'CUL-0022':['cuidado_pedagogico','Não romantizar ou estetizar as mortes'],
  'CUL-0023':['cuidado_pedagogico','não reúne a franquia nem o filme de 2017'],
  'CUL-0024':['cuidado_pedagogico','Não apresentar a Democracia Corinthiana como causa única'],
  'CUL-0025':['cuidado_pedagogico','não apresentar a internet como causa automática'],
  'CUL-0026':['cuidado_pedagogico','Não generalizar favelas e periferias']
};
for(const [id,[field,fragment]] of Object.entries(checks))assert(repertorios.find(item=>item.id===id)?.[field]?.includes(fragment),`${id} perdeu um cuidado editorial aprovado.`);

const adjusting=structuredClone(repertorios); adjusting[0].status='em_ajuste';
assert(validateRepertoryCollection(adjusting,{themeIds}).errors.some(error=>error.includes('somente repertórios com status publicado')),'Um repertório em ajuste não foi bloqueado.');
const unknown=structuredClone(repertorios); unknown[0].tema_ids=['tema-inexistente'];
assert(validateRepertoryCollection(unknown,{themeIds}).errors.some(error=>error.includes('tema_id desconhecido')),'Um tema inexistente não foi bloqueado.');
const author=structuredClone(repertorios); author[0].autores=['Michel Foucault'];
assert(validateRepertoryCollection(author,{themeIds}).errors.some(error=>error.includes('REL separada')),'Uma relação autoral automática não foi bloqueada.');
const duplicate=structuredClone(repertorios); duplicate.push(structuredClone(repertorios[0]));
assert(validateRepertoryCollection(duplicate,{themeIds}).errors.some(error=>error.includes('id duplicado')),'Um ID duplicado não foi bloqueado.');

console.log('Contrato cultural e 26 repertórios canônicos confirmados.');
