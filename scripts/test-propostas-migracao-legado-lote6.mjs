import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote6-v1.json'),
  read('data/temas.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0010','CUL-0011','CUL-0012'];
assert(proposals.status==='em_revisao','O sexto lote deve permanecer em revisão.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'Os IDs do sexto lote foram alterados.');
assert(new Set(expected).size===expected.length,'Há IDs repetidos no sexto lote.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));
assert(legacy.ids.length===18,'O lote editorial alterou a contagem do legado.');
assert(publicacoes.length===12,'O lote editorial alterou a base de dados.');
assert(cultural.length===8,'O lote editorial alterou a base cultural.');
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'O total público deixou de ser 38.');

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu o estado transitório.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão.`);
  assert(legacyIds.has(item.id),`${item.id} deixou o legado antes da aprovação.`);
  assert(repertoryIds.has(item.id),`${item.id} não existe no acervo original.`);
  assert(!canonicalIds.has(item.id),`${item.id} já aparece em base canônica.`);
  assert(item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_url.startsWith('https://'),`${item.id} não possui fonte completa.`);
  assert(item.autores.length===0,`${item.id} criou vínculo autoral automático.`);
  assert(item.autores_possiveis.length>0&&item.relacoes_pendentes.length>0,`${item.id} perdeu as hipóteses de leitura.`);
  for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao'])assert(item[field],`${item.id} não possui ${field}.`);
}

const fire=proposals.propostas[0];
assert(fire.titulo.includes('fabricação do inimigo'),'CUL-0010 perdeu o eixo principal.');
assert(fire.leitura_sociosofia.includes('não o cria sozinha'),'CUL-0010 voltou a explicar o processo apenas pela tecnologia.');
assert(fire.cuidado_pedagogico.includes('instituições, ideologias e decisões políticas'),'CUL-0010 perdeu a mediação institucional.');

const classroom=proposals.propostas[1];
assert(classroom.titulo.includes('linguagem, autoridade e reconhecimento'),'CUL-0011 perdeu o eixo principal.');
assert(classroom.leitura_sociosofia.includes('posição institucional assimétrica'),'CUL-0011 apagou a assimetria escolar.');
assert(classroom.cuidado_pedagogico.includes('Não usar o filme para culpar estudantes, professores ou famílias'),'CUL-0011 voltou à culpabilização individual.');
assert(classroom.cuidado_pedagogico.includes('sistema educacional francês')&&classroom.cuidado_pedagogico.includes('Brasil'),'CUL-0011 perdeu a distinção de contexto.');

const city=proposals.propostas[2];
assert(city.titulo.includes('território, juventude e escolhas sob desigualdade'),'CUL-0012 perdeu o eixo principal.');
assert(city.leitura_sociosofia.includes('O Estado também não está simplesmente ausente'),'CUL-0012 voltou à explicação por ausência simples do Estado.');
assert(city.cuidado_pedagogico.includes('retrato documental transparente de todas as favelas'),'CUL-0012 perdeu o cuidado contra generalização territorial.');
assert(city.cuidado_pedagogico.includes('espetacularização da violência'),'CUL-0012 perdeu a discussão sobre representação cinematográfica.');

const serialized=JSON.stringify(proposals).toLowerCase();
assert(!serialized.includes('relacao_validada'),'O sexto lote criou relação validada automaticamente.');
assert(!serialized.includes('r001-c02'),'R001-C02 reapareceu no lote.');
assert(!serialized.includes('salário digno'),'O card de salário digno reapareceu no lote.');
console.log('Sexto trio cultural validado e mantido fora das bases canônicas.');

async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
