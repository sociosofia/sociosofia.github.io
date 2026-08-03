import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [base,expansion,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote6-v1.json'),
  read('data/propostas-migracao-legado-lote6-ampliacao-v1.json'),
  read('data/temas.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

assert(base.status==='em_revisao'&&expansion.status==='em_revisao','Os snapshots do sexto lote devem preservar o estado em que foram submetidos à revisão.');
const proposals=[...base.propostas,...expansion.propostas];
const expected=['CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
assert(JSON.stringify(proposals.map(item=>item.id))===JSON.stringify(expected),'Os IDs ou a ordem do sexto lote ampliado foram alterados.');
assert(new Set(expected).size===expected.length,'Há IDs repetidos no sexto lote ampliado.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>culturalIds.has(id));
assert(flags.every(Boolean)||flags.every(flag=>!flag),'O sexto lote ficou parcialmente migrado.');
const migrated=flags.every(Boolean);

if(migrated){
  assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'As contagens após a migração do sexto lote estão incorretas.');
  for(const id of expected)assert(!legacyIds.has(id),`${id} permaneceu no legado após a migração.`);
}else{
  assert(legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8,'As contagens anteriores à migração do sexto lote estão incorretas.');
  for(const id of expected)assert(legacyIds.has(id),`${id} deixou o legado antes da aprovação e da migração.`);
}
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'O total público deixou de ser 38.');

for(const item of proposals){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu o estado transitório na proposta histórica.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} perdeu o estado em que foi submetido à revisão.`);
  assert(repertoryIds.has(item.id),`${item.id} não existe no acervo original.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_url?.startsWith('https://'),`${item.id} não possui fonte completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} criou vínculo autoral automático.`);
  assert(item.autores_possiveis?.length>0&&item.relacoes_pendentes?.length>0,`${item.id} perdeu as hipóteses de leitura.`);
  for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao'])assert(item[field],`${item.id} não possui ${field}.`);
  if(migrated)assert(culturalIds.has(item.id),`${item.id} não chegou à base canônica após a migração.`);
}

const byId=new Map(proposals.map(item=>[item.id,item]));
const fire=byId.get('CUL-0010');
assert(fire.leitura_sociosofia.includes('não o cria sozinha'),'CUL-0010 voltou ao determinismo tecnológico.');
assert(fire.cuidado_pedagogico.includes('instituições, ideologias e decisões políticas'),'CUL-0010 perdeu a mediação institucional.');
const classroom=byId.get('CUL-0011');
assert(classroom.leitura_sociosofia.includes('posição institucional assimétrica'),'CUL-0011 apagou a assimetria escolar.');
assert(classroom.cuidado_pedagogico.includes('Não usar o filme para culpar estudantes, professores ou famílias'),'CUL-0011 voltou à culpabilização individual.');
assert(classroom.cuidado_pedagogico.includes('sistema educacional francês')&&classroom.cuidado_pedagogico.includes('Brasil'),'CUL-0011 perdeu a distinção de contexto.');
const city=byId.get('CUL-0012');
assert(city.leitura_sociosofia.includes('O Estado também não está simplesmente ausente'),'CUL-0012 voltou à explicação por ausência simples do Estado.');
assert(city.cuidado_pedagogico.includes('retrato documental transparente de todas as favelas'),'CUL-0012 perdeu o cuidado contra estigma territorial.');
assert(city.cuidado_pedagogico.includes('espetacularização da violência'),'CUL-0012 perdeu a discussão sobre representação.');
const arms=byId.get('CUL-0013');
assert(arms.leitura_sociosofia.includes('não funciona apenas à margem dos Estados'),'CUL-0013 apagou a participação estatal.');
assert(arms.cuidado_pedagogico.includes('Não usar o filme como documentário'),'CUL-0013 perdeu a distinção entre ficção e documento.');
assert(arms.cuidado_pedagogico.includes('responsabilidade institucional')&&arms.cuidado_pedagogico.includes('responsabilidade individual'),'CUL-0013 perdeu a tensão sobre responsabilidade.');
const delivered=byId.get('CUL-0014');
assert(delivered.leitura_sociosofia.includes('quem absorve os riscos'),'CUL-0014 perdeu o eixo da transferência de riscos.');
assert(delivered.cuidado_pedagogico.includes('Não tratar os entregadores como vítimas sem agência'),'CUL-0014 apagou a agência dos trabalhadores.');
assert(delivered.cuidado_pedagogico.includes('recorte situado'),'CUL-0014 voltou a universalizar o documentário.');
assert(delivered.ano_data==='2019'&&delivered.confiabilidade.includes('21 minutos'),'CUL-0014 perdeu autoria, ano ou duração conferidos.');
const prada=byId.get('CUL-0015');
assert(prada.leitura_sociosofia.includes('A aparência funciona como linguagem profissional'),'CUL-0015 perdeu o eixo da apresentação de si.');
assert(prada.cuidado_pedagogico.includes('Não desqualificar a moda como atividade superficial'),'CUL-0015 voltou a desqualificar o campo da moda.');
assert(prada.cuidado_pedagogico.includes('vaidade feminina'),'CUL-0015 perdeu o cuidado contra estereótipo de gênero.');

const serialized=JSON.stringify({base,expansion}).toLowerCase();
assert(!serialized.includes('relacao_validada'),'O sexto lote criou relação validada automaticamente.');
assert(!serialized.includes('r001-c02'),'R001-C02 reapareceu no lote.');
assert(!serialized.includes('salário digno'),'O card de salário digno reapareceu no lote.');
console.log(migrated?'Sexto lote cultural aprovado e migrado integralmente.':'Sexto lote cultural validado e mantido fora das bases canônicas.');

async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
