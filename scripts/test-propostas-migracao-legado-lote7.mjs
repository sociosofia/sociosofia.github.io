import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote7-v1.json'),
  read('data/temas.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

const expected=['CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021'];
assert(proposals.status==='em_revisao','O sétimo lote deve permanecer em revisão antes da aprovação explícita.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao sétimo lote ampliado.');
assert(new Set(expected).size===6,'O sétimo lote contém IDs repetidos.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryIds=new Set(repertorios.map(item=>item.id));
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));
for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} não preserva o estado público vigente.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} foi aprovado ou publicado antes da decisão de Luiz.`);
  assert(legacyIds.has(item.id),`${item.id} deixou o portão legado antes da aprovação.`);
  assert(repertoryIds.has(item.id),`${item.id} não existe no acervo original.`);
  assert(!canonicalIds.has(item.id),`${item.id} entrou prematuramente em uma base canônica.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0&&item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral automática.`);
  assert(Array.isArray(item.autores_possiveis)&&item.autores_possiveis.length>0,`${item.id} não registra hipóteses autorais.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);
  assert(item.cuidado_pedagogico&&item.questao,`${item.id} perdeu cuidado pedagógico ou pergunta.`);
}

const garapa=proposals.propostas.find(item=>item.id==='CUL-0016');
assert(garapa.leitura_sociosofia.includes('não aparece como resultado de incapacidade individual'),'CUL-0016 voltou a individualizar a fome.');
assert(garapa.cuidado_pedagogico.includes('piedade')&&garapa.cuidado_pedagogico.includes('culpabilizar famílias'),'CUL-0016 perdeu o cuidado contra exposição moral da pobreza.');

const kevin=proposals.propostas.find(item=>item.id==='CUL-0017');
assert(kevin.leitura_sociosofia.includes('não pode ser deduzida automaticamente da maternidade'),'CUL-0017 voltou a responsabilizar a mãe.');
assert(kevin.cuidado_pedagogico.includes('Não diagnosticar Kevin')&&kevin.cuidado_pedagogico.includes('não associar transtorno mental à violência'),'CUL-0017 perdeu os bloqueios diagnósticos.');

const jojo=proposals.propostas.find(item=>item.id==='CUL-0018');
assert(jojo.leitura_sociosofia.includes('o ódio precisa ser ensinado'),'CUL-0018 perdeu o eixo da aprendizagem ideológica.');
assert(jojo.cuidado_pedagogico.includes('não deve banalizar o nazismo')&&jojo.cuidado_pedagogico.includes('Holocausto'),'CUL-0018 perdeu a mediação histórica da sátira.');

const nineteen=proposals.propostas.find(item=>item.id==='CUL-0019');
assert(nineteen.leitura_sociosofia.includes('tempo militar e tempo vivido'),'CUL-0019 perdeu o eixo temporal.');
assert(nineteen.cuidado_pedagogico.includes('perspectiva britânica')&&nineteen.cuidado_pedagogico.includes('escolha estética'),'CUL-0019 perdeu os limites de representação.');

const western=proposals.propostas.find(item=>item.id==='CUL-0020');
assert(western.leitura_sociosofia.includes('transforma juventude em recurso político'),'CUL-0020 perdeu o eixo do sacrifício juvenil.');
assert(western.cuidado_pedagogico.includes('não deve apagar as causas')&&western.cuidado_pedagogico.includes('equivalência automática'),'CUL-0020 perdeu a ressalva histórica.');

const perks=proposals.propostas.find(item=>item.id==='CUL-0021');
assert(perks.leitura_sociosofia.includes('não sugere que vínculos afetivos substituam cuidado profissional'),'CUL-0021 transformou amizade em cura automática.');
assert(perks.cuidado_pedagogico.includes('sem obrigação de relato pessoal'),'CUL-0021 perdeu o cuidado com exposição dos estudantes.');

assert(legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14,'A revisão editorial alterou as bases públicas vigentes.');
const allPublic=[...legacy.ids,...publicacoes.map(item=>item.id),...cultural.map(item=>item.id)];
assert(allPublic.length===38&&new Set(allPublic).size===38,'O conjunto público deixou de conter 38 IDs únicos.');
const serialized=JSON.stringify({publicacoes,cultural}).toLowerCase();
assert(!serialized.includes('r001-c02'),'R001-C02 apareceu durante a revisão.');
assert(!serialized.includes('salário digno'),'O card de salário digno apareceu durante a revisão.');

console.log('Sétimo lote cultural ampliado validado sem publicação prematura.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
