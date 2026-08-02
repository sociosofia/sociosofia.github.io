import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const [proposals,approval,history,legacy,repertorios,publicacoes,culturais,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote3-v1.json'),
  read('data/aprovacoes-migracao-legado-lote3-v1.json'),
  read('data/historico-migracao-legado-lote3-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

const expected=['DAD-0001','DAD-0005','CUL-0002'];
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(culturais.map(item=>item.id));
const historyIds=new Set((history.registros||[]).map(item=>item.id));

assert(proposals.status==='aprovado','As propostas do terceiro lote não estão aprovadas.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','O terceiro lote não possui aprovação nominal válida.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao terceiro trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde ao terceiro trio.');

assert(legacy.ids.length===24,'O estado publicado_legado deve conter 24 itens após o terceiro lote.');
assert(legacy.ids.filter(id=>id.startsWith('DAD-')).length===1,'Deve permanecer um card DAD no legado.');
assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===23,'Devem permanecer 23 cards CUL no legado.');
for(const id of expected)assert(!legacyIds.has(id),`${id} ainda aparece como publicado_legado.`);

const migratedRegistry=new Map((legacy.migrados||[]).map(item=>[item.id,item]));
for(const id of expected){
  assert(migratedRegistry.get(id)?.lote==='legado-lote3-v1',`${id} não está registrado como migrado no terceiro lote.`);
  assert(repertoryIds.has(id),`O registro histórico de ${id} deixou de existir em data/repertorios.json.`);
  assert(historyIds.has(id),`${id} não possui cópia histórica anterior à migração.`);
}
assert(history.registros.length===3,'O histórico do terceiro lote deve preservar exatamente três versões antigas.');
assert(history.aprovado_por==='Luiz Jácomo','O histórico não preserva a autoria da aprovação.');

assert(dataIds.has('DAD-0001')&&dataIds.has('DAD-0005'),'Os dois dados do terceiro lote não chegaram à base canônica.');
assert(culturalIds.has('CUL-0002'),'CUL-0002 não chegou à base cultural canônica.');
assert(!dataIds.has('CUL-0002')&&!culturalIds.has('DAD-0001')&&!culturalIds.has('DAD-0005'),'Um item do terceiro lote foi enviado para a base canônica errada.');
assert([...dataIds].filter(id=>culturalIds.has(id)).length===0,'Há IDs duplicados entre as bases canônicas.');

const dataValidation=validatePublicationCollection(publicacoes,{themeIds});
assert(dataValidation.errors.length===0,'A base canônica de dados falhou no contrato: '+dataValidation.errors.join(' | '));
assert(dataValidation.valid.length===11,'A base de dados deve conter onze publicações canônicas.');
const culturalValidation=validateRepertoryCollection(culturais,{themeIds});
assert(culturalValidation.errors.length===0,'A base cultural falhou no contrato: '+culturalValidation.errors.join(' | '));
assert(culturalValidation.valid.length===3,'A base cultural deve conter três repertórios canônicos.');

const youth=publicacoes.find(item=>item.id==='DAD-0001');
assert(youth.codigo_publicacao==='R000-C01','DAD-0001 não usa o código reservado de migração.');
assert(youth.codigo_migracao==='MIG-L03-DAD-0001','DAD-0001 perdeu o código interno de migração.');
assert(youth.evi_id==='EVI-juventudes-minorizadas-pnad-educacao-raca-2025','DAD-0001 perdeu a EVI definida.');
assert(youth.titulo==='Sete em cada dez jovens fora da escola sem concluir a educação básica eram negros','DAD-0001 perdeu o título aprovado.');
assert(youth.contextualizacao.includes('PNAD Contínua 2025'),'DAD-0001 perdeu a base do indicador.');
assert(youth.interpretacao_sociosofia.includes('não pode ser explicado por raça como característica individual'),'DAD-0001 naturaliza a desigualdade racial.');

const teachers=publicacoes.find(item=>item.id==='DAD-0005');
assert(teachers.codigo_publicacao==='R000-C05','DAD-0005 não usa o código reservado de migração.');
assert(teachers.codigo_migracao==='MIG-L03-DAD-0005','DAD-0005 perdeu o código interno de migração.');
assert(teachers.evi_id==='EVI-sinte-sc-saude-docente-2025','DAD-0005 perdeu a EVI definida.');
assert(teachers.titulo.includes('83% dos docentes ouvidos'),'DAD-0005 perdeu o cuidado contra generalização.');
assert(teachers.contextualizacao.includes('2.597 respostas')&&teachers.contextualizacao.includes('2.215 respostas'),'DAD-0005 perdeu o percurso amostral.');
assert(teachers.contextualizacao.includes('voluntária e não aleatória'),'DAD-0005 perdeu a ressalva de autosseleção.');
assert(teachers.contextualizacao.includes('pós-estratificação'),'DAD-0005 perdeu o ajuste amostral.');
assert(teachers.contextualizacao.includes('não constituem diagnóstico clínico'),'DAD-0005 confundiu percepção e diagnóstico.');
assert(teachers.interpretacao_sociosofia.includes('não transforma estudantes ou famílias em culpados'),'DAD-0005 voltou a culpabilizar atores escolares.');

for(const item of [youth,teachers]){
  assert(item.status==='publicado','Um dado do terceiro lote não está publicado.');
  assert(item.aprovacao?.aprovado_por==='Luiz Jácomo','Um dado do terceiro lote não preserva a aprovação nominal.');
  assert(item.origem_migracao?.lote==='legado-lote3-v1','Um dado não registra o terceiro lote.');
  assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote3-v1.json','Um dado não aponta para o histórico correto.');
  assert(Array.isArray(item.autores)&&item.autores.length===0,'Um dado criou relação autoral automática.');
}

const getOut=culturais.find(item=>item.id==='CUL-0002');
assert(getOut.status==='publicado','CUL-0002 não está publicado.');
assert(getOut.aprovacao?.aprovado_por==='Luiz Jácomo','CUL-0002 não preserva a aprovação nominal.');
assert(getOut.origem_migracao?.lote==='legado-lote3-v1','CUL-0002 não registra o terceiro lote.');
assert(getOut.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote3-v1.json','CUL-0002 não aponta para o histórico correto.');
assert(Array.isArray(getOut.autores)&&getOut.autores.length===0,'CUL-0002 criou relação autoral automática.');
assert(getOut.leitura_sociosofia.includes('não aparece apenas como rejeição explícita'),'CUL-0002 reduziu o racismo à hostilidade aberta.');
assert(getOut.cuidado_pedagogico.includes('Não tratá-la como documentário'),'CUL-0002 perdeu o cuidado contra uso como evidência empírica.');
assert(getOut.cuidado_pedagogico.includes('Estados Unidos')&&getOut.cuidado_pedagogico.includes('Brasil'),'CUL-0002 perdeu a distinção entre contextos raciais.');

assert(legacy.ids.length+publicacoes.length+culturais.length===38,'A migração alterou o total público esperado de 38 conteúdos.');
const allPublicIds=[...legacy.ids,...publicacoes.map(item=>item.id),...culturais.map(item=>item.id)];
assert(new Set(allPublicIds).size===38,'A composição pública contém IDs duplicados.');
const serialized=JSON.stringify({publicacoes,culturais}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');

console.log('Terceiro lote migrado com histórico, aprovação, limites metodológicos e total público preservados.');

async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
