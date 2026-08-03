import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote8-final-v1.json'),read('data/temas.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['CUL-0006','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
assert(proposals.status==='em_revisao','O snapshot do lote final deve permanecer como submetido à revisão.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao lote final.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const canonicalIds=new Set(cultural.map(item=>item.id));
const flags=expected.map(id=>canonicalIds.has(id));
assert(flags.every(Boolean)||flags.every(flag=>!flag),'O lote final ficou parcialmente migrado.');
const migrated=flags.every(Boolean);

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu o estado público histórico.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} alterou retrospectivamente o snapshot editorial.`);
  assert(repertoryIds.has(item.id),`${item.id} não existe no acervo original.`);
  assert(migrated?!legacyIds.has(item.id):legacyIds.has(item.id),`${item.id} apresenta estado legado incoerente.`);
  assert(migrated?canonicalIds.has(item.id):!canonicalIds.has(item.id),`${item.id} apresenta estado canônico incoerente.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral automática.`);
  assert(item.cuidado_pedagogico&&item.questao,`${item.id} perdeu cuidado pedagógico ou pergunta.`);
}

const seal=proposals.propostas.find(item=>item.id==='CUL-0006');
assert(seal.leitura_sociosofia.includes('sem garantia de resposta'),'CUL-0006 transformou a dúvida em solução fechada.');
assert(seal.cuidado_pedagogico.includes('não devem ser pressionados a expor crenças'),'CUL-0006 perdeu o cuidado com crenças e luto.');
const virgins=proposals.propostas.find(item=>item.id==='CUL-0022');
assert(virgins.leitura_sociosofia.includes('quem tem o poder de narrar'),'CUL-0022 perdeu o eixo da voz e do olhar.');
assert(virgins.cuidado_pedagogico.includes('Não romantizar ou estetizar as mortes')&&virgins.cuidado_pedagogico.includes('não evidência causal'),'CUL-0022 perdeu o cuidado com suicídio e causalidade.');
const blade=proposals.propostas.find(item=>item.id==='CUL-0023');
assert(blade.resumo.includes('filme de 1982'),'CUL-0023 não delimitou o objeto ao filme de 1982.');
assert(blade.cuidado_pedagogico.includes('não reúne a franquia nem o filme de 2017'),'CUL-0023 voltou a misturar obras distintas.');
assert(blade.leitura_sociosofia.includes('relações de trabalho e poder'),'CUL-0023 perdeu o eixo do trabalho e reconhecimento.');
const democracy=proposals.propostas.find(item=>item.id==='CUL-0024');
assert(democracy.leitura_sociosofia.includes('não substitui instituições políticas'),'CUL-0024 confundiu democracia interna e instituições políticas.');
assert(democracy.cuidado_pedagogico.includes('Não apresentar a Democracia Corinthiana como causa única'),'CUL-0024 perdeu o limite histórico.');
const adolescence=proposals.propostas.find(item=>item.id==='CUL-0025');
assert(adolescence.leitura_sociosofia.includes('não deve ser tratado como monstro isolado'),'CUL-0025 individualizou a violência.');
assert(adolescence.cuidado_pedagogico.includes('não apresentar a internet como causa automática')&&adolescence.cuidado_pedagogico.includes('não reproduz um caso individual real'),'CUL-0025 perdeu os limites causal e ficcional.');
const dancing=proposals.propostas.find(item=>item.id==='CUL-0026');
assert(dancing.leitura_sociosofia.includes('abandonar a fórmula simples de ausência do Estado'),'CUL-0026 voltou à tese de ausência simples do Estado.');
assert(dancing.cuidado_pedagogico.includes('Não generalizar favelas e periferias')&&dancing.cuidado_pedagogico.includes('não podem ser tratados como forças moralmente equivalentes'),'CUL-0026 perdeu os cuidados territoriais e políticos.');

if(migrated)assert(legacy.ids.length===0&&publicacoes.length===12&&cultural.length===26,'O estado final do lote 8 está incorreto.');
else assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'O estado anterior ao lote 8 está incorreto.');
const allPublic=[...legacy.ids,...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público deixou de conter 38 IDs únicos.');
console.log(migrated?'Lote final editorial preservado e migrado integralmente.':'Lote final editorial preservado antes da migração.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
