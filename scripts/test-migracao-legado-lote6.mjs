import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [base,expansion,approval,history,legacy,repertorios,publicacoes,cultural,themes]=await Promise.all([
  read('data/propostas-migracao-legado-lote6-v1.json'),read('data/propostas-migracao-legado-lote6-ampliacao-v1.json'),read('data/aprovacoes-migracao-legado-lote6-v1.json'),read('data/historico-migracao-legado-lote6-v1.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json'),read('data/temas.json')
]);
const expected=['CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];const proposals=[...base.propostas,...expansion.propostas];
assert(JSON.stringify(proposals.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao sexto lote ampliado.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do sexto lote é inválida.');
assert(JSON.stringify(approval.itens.map(item=>item.id))===JSON.stringify(expected),'A aprovação não corresponde aos seis IDs do lote.');
assert(history.aprovado_por==='Luiz Jácomo'&&history.itens.length===6,'O histórico do sexto lote é inválido.');
const legacyIds=new Set(legacy.ids||[]);const migratedMap=new Map((legacy.migrados||[]).map(item=>[item.id,item]));const repertoryIds=new Set(repertorios.map(item=>item.id));const culturalIds=new Set(cultural.map(item=>item.id));const historyIds=new Set(history.itens.map(item=>item.id));
for(const id of expected){assert(!legacyIds.has(id),`${id} ainda aparece como publicado_legado.`);assert(migratedMap.get(id)?.lote==='legado-lote6-v1',`${id} não está registrado no sexto lote.`);assert(repertoryIds.has(id),`${id} perdeu o registro histórico original.`);assert(historyIds.has(id),`${id} não possui cópia histórica do sexto lote.`);assert(culturalIds.has(id),`${id} não chegou à base cultural canônica.`);}
assert(legacy.ids.length===0,'O portão legado deve estar vazio após o encerramento.');assert(publicacoes.length===12,'A migração cultural alterou os doze dados canônicos.');assert(cultural.length===26,'A base cultural final deve conter 26 repertórios.');
const themeIds=new Set(themeMapFromRegistry(themes).keys());assert(validateRepertoryCollection(cultural,{themeIds}).errors.length===0,'A base cultural falhou no contrato.');
const byId=new Map(cultural.map(item=>[item.id,item]));
for(const id of expected){const item=byId.get(id);assert(item.status==='publicado',`${id} não está publicado.`);assert(item.aprovacao?.aprovado_por==='Luiz Jácomo',`${id} não preserva a aprovação nominal.`);assert(item.origem_migracao?.lote==='legado-lote6-v1',`${id} não registra o sexto lote.`);assert(item.origem_migracao?.historico_ref==='data/historico-migracao-legado-lote6-v1.json',`${id} não aponta para o histórico correto.`);assert(Array.isArray(item.autores)&&item.autores.length===0,`${id} criou relação autoral automática.`);}
const fire=byId.get('CUL-0010');assert(fire.leitura_sociosofia.includes('não o cria sozinha'),'CUL-0010 voltou ao determinismo tecnológico.');assert(fire.cuidado_pedagogico.includes('instituições, ideologias e decisões políticas'),'CUL-0010 perdeu a mediação institucional.');
const classroom=byId.get('CUL-0011');assert(classroom.leitura_sociosofia.includes('posição institucional assimétrica'),'CUL-0011 apagou a assimetria escolar.');assert(classroom.cuidado_pedagogico.includes('Não usar o filme para culpar estudantes, professores ou famílias'),'CUL-0011 voltou à culpabilização individual.');
const city=byId.get('CUL-0012');assert(city.leitura_sociosofia.includes('O Estado também não está simplesmente ausente'),'CUL-0012 voltou à explicação por ausência simples do Estado.');assert(city.cuidado_pedagogico.includes('espetacularização da violência'),'CUL-0012 perdeu a discussão sobre representação.');
const arms=byId.get('CUL-0013');assert(arms.leitura_sociosofia.includes('não funciona apenas à margem dos Estados'),'CUL-0013 apagou a participação estatal.');assert(arms.cuidado_pedagogico.includes('responsabilidade institucional')&&arms.cuidado_pedagogico.includes('responsabilidade individual'),'CUL-0013 perdeu a tensão sobre responsabilidade.');
const delivered=byId.get('CUL-0014');assert(delivered.leitura_sociosofia.includes('quem absorve os riscos'),'CUL-0014 perdeu o eixo da transferência de riscos.');assert(delivered.cuidado_pedagogico.includes('Não tratar os entregadores como vítimas sem agência'),'CUL-0014 apagou a agência dos trabalhadores.');assert(delivered.ano_data==='2019'&&delivered.confiabilidade.includes('21 minutos'),'CUL-0014 perdeu autoria, ano ou duração conferidos.');
const prada=byId.get('CUL-0015');assert(prada.leitura_sociosofia.includes('A aparência funciona como linguagem profissional'),'CUL-0015 perdeu o eixo da apresentação de si.');assert(prada.cuidado_pedagogico.includes('Não desqualificar a moda como atividade superficial'),'CUL-0015 voltou a desqualificar o campo da moda.');
const allPublic=[...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público não preservou 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a migração.');assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a migração.');
console.log('Sexto lote continua íntegro após o encerramento do legado.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
