import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,approval,history,legacy,repertorios,publicacoes,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote4-v1.json'),
  read('data/aprovacoes-migracao-legado-lote4-v1.json'),
  read('data/historico-migracao-legado-lote4-v1.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json'),
  read('data/temas.json')
]);

const expected=['DAD-0003','CUL-0004','CUL-0005'];
assert(proposals.status==='aprovado','As propostas do quarto lote não estão aprovadas.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do quarto lote é inválida.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quarto trio.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde ao quarto trio.');
assert(history.aprovado_por==='Luiz Jácomo'&&history.itens.length===3,'O histórico do quarto lote é inválido.');

const legacyIds=new Set(legacy.ids||[]);
const migratedMap=new Map((legacy.migrados||[]).map(item=>[item.id,item]));
const repertoryIds=new Set(repertorios.map(item=>item.id));
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set(history.itens.map(item=>item.id));
for(const id of expected){
  assert(!legacyIds.has(id),`${id} ainda aparece como publicado_legado.`);
  assert(migratedMap.get(id)?.lote==='legado-lote4-v1',`${id} não está registrado no quarto lote.`);
  assert(repertoryIds.has(id),`${id} perdeu o registro histórico original.`);
  assert(historyIds.has(id),`${id} não possui cópia histórica do quarto lote.`);
}

assert(legacy.ids.length===12,'O legado deve conter 12 itens após o sexto lote.');
assert(legacy.ids.every(id=>id.startsWith('CUL-')),'Nenhum DAD deve permanecer no legado.');
assert(publicacoes.length===12&&dataIds.has('DAD-0003'),'DAD-0003 não chegou à base de dados canônica.');
assert(cultural.length===14&&culturalIds.has('CUL-0004')&&culturalIds.has('CUL-0005'),'Os repertórios do quarto lote não permanecem na base cultural.');
assert([...dataIds].filter(id=>culturalIds.has(id)).length===0,'Há IDs duplicados entre as bases canônicas.');

const themeIds=new Set(themeMapFromRegistry(themes).keys());
const dataValidation=validatePublicationCollection(publicacoes,{themeIds});
assert(dataValidation.errors.length===0,'A base de dados falhou no contrato: '+dataValidation.errors.join(' | '));
const culturalValidation=validateRepertoryCollection(cultural,{themeIds});
assert(culturalValidation.errors.length===0,'A base cultural falhou no contrato: '+culturalValidation.errors.join(' | '));

const school=publicacoes.find(item=>item.id==='DAD-0003');
assert(school.codigo_publicacao==='R000-C03','DAD-0003 não usa o código reservado de migração.');
assert(school.codigo_migracao==='MIG-L04-DAD-0003','DAD-0003 perdeu o código interno de migração.');
assert(school.evi_id==='EVI-gepem-convivencia-medo-alunos-sp-2022','DAD-0003 perdeu a EVI definida.');
assert(school.titulo==='18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos','DAD-0003 perdeu o título aprovado.');
assert(school.contextualizacao.includes('945.481 estudantes dos anos finais do ensino fundamental da rede estadual paulista'),'DAD-0003 perdeu o universo pesquisado.');
assert(school.contextualizacao.includes('três meses anteriores'),'DAD-0003 perdeu a janela temporal.');
assert(school.contextualizacao.includes('autoriza classificar todas as experiências como bullying'),'DAD-0003 perdeu a ressalva contra diagnóstico automático.');
assert(school.autores.length===0,'DAD-0003 criou relação autoral automática.');

const truman=cultural.find(item=>item.id==='CUL-0004');
assert(truman.origem_migracao?.lote==='legado-lote4-v1','CUL-0004 não registra o quarto lote.');
assert(truman.leitura_sociosofia.includes('consentimento'),'CUL-0004 perdeu o eixo do consentimento.');
assert(truman.cuidado_pedagogico.includes('Não apresentar o filme como profecia literal'),'CUL-0004 perdeu o cuidado pedagógico.');
assert(truman.autores.length===0,'CUL-0004 criou relação autoral automática.');

const menino=cultural.find(item=>item.id==='CUL-0005');
assert(menino.origem_migracao?.lote==='legado-lote4-v1','CUL-0005 não registra o quarto lote.');
assert(menino.resumo_obra.includes('cinquenta meninos negros'),'CUL-0005 perdeu o recorte histórico.');
assert(menino.cuidado_pedagogico.includes('reconstrução documental mediada'),'CUL-0005 perdeu a mediação documental.');
assert(menino.cuidado_pedagogico.includes('história nacional de escravização e racismo'),'CUL-0005 perdeu o cuidado contra externalização do racismo.');
assert(menino.autores.length===0,'CUL-0005 criou relação autoral automática.');

const allPublic=[...legacy.ids,...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');

console.log('Quarto lote continua íntegro após a migração do sexto lote.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
