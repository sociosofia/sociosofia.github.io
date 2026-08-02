import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote5-v1.json'),
  read('data/temas.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

assert(proposals.status==='aprovado','O quinto lote deve registrar a aprovação editorial de Luiz.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O quinto lote deve conter exatamente três propostas.');

const expected=['CUL-0007','CUL-0008','CUL-0009'];
const actual=proposals.propostas.map(item=>item.id);
assert(JSON.stringify(actual)===JSON.stringify(expected),'Os IDs ou sua ordem foram alterados.');
assert(new Set(actual).size===actual.length,'Há IDs duplicados no quinto lote.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));

assert(legacy.ids.length===21,'O quinto lote editorial não deve alterar os 21 repertórios ainda publicados como legado.');
assert(publicacoes.length===12,'O quinto lote editorial não deve alterar os doze dados canônicos vigentes.');
assert(cultural.length===5,'O quinto lote editorial não deve alterar os cinco repertórios culturais canônicos vigentes.');

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu a preservação transitória.`);
  assert(item.status_editorial_proposto==='aprovado',`${item.id} não registra aprovação editorial.`);
  assert(legacyIds.has(item.id),`${item.id} não permanece no registro publicado_legado.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo legado.`);
  assert(!canonicalIds.has(item.id),`${item.id} já entrou em base canônica e seria duplicado.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  for(const themeId of item.tema_ids)assert(themeIds.has(themeId),`${item.id} usa tema inexistente: ${themeId}.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral pronta.`);
  assert(Array.isArray(item.autores_possiveis)&&item.autores_possiveis.length>0,`${item.id} perdeu as hipóteses teóricas.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);
  for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao'])assert(item[field],`${item.id} não possui ${field}.`);
}

const junipero=proposals.propostas.find(item=>item.id==='CUL-0007');
assert(junipero.titulo==='Black Mirror — San Junípero: corpo, memória e a promessa de continuar vivendo','CUL-0007 perdeu o título proposto.');
assert(junipero.leitura_sociosofia.includes('dimensão amorosa e queer'),'CUL-0007 apagou a dimensão afetiva e queer da obra.');
assert(junipero.cuidado_pedagogico.includes('Não apresentar a transferência de consciência como fato científico'),'CUL-0007 apresentou ficção como fato científico.');
assert(junipero.cuidado_pedagogico.includes('deficiência')&&junipero.cuidado_pedagogico.includes('velhice'),'CUL-0007 voltou a tratar corpo, deficiência ou velhice como prisões universais.');
assert(junipero.fonte_url.includes('netflix.com/tudum'),'CUL-0007 não usa fonte oficial da obra.');

const history=proposals.propostas.find(item=>item.id==='CUL-0008');
assert(history.titulo==='Black Mirror — The Entire History of You: quando lembrar se torna vigiar','CUL-0008 perdeu o título proposto.');
assert(history.leitura_sociosofia.includes('Transformar a experiência em arquivo não elimina a interpretação'),'CUL-0008 confundiu registro com verdade completa.');
assert(history.cuidado_pedagogico.includes('controle coercitivo'),'CUL-0008 perdeu o cuidado sobre controle em relações íntimas.');
assert(history.questao.includes('mais verdadeira')&&history.questao.includes('mais controlada'),'CUL-0008 perdeu a tensão pedagógica central.');

const merits=proposals.propostas.find(item=>item.id==='CUL-0009');
assert(merits.titulo==='Black Mirror — Fifteen Million Merits: trabalho, consumo e revolta transformada em espetáculo','CUL-0009 perdeu o título proposto.');
assert(merits.leitura_sociosofia.includes('contestação em produto'),'CUL-0009 perdeu o eixo da captura da crítica.');
assert(merits.cuidado_pedagogico.includes('alegoria'),'CUL-0009 passou a ser tratado como descrição literal da sociedade.');
assert(merits.cuidado_pedagogico.includes('humilhação')&&merits.cuidado_pedagogico.includes('sexualização'),'CUL-0009 perdeu o cuidado com cenas sensíveis.');
assert(merits.fonte_url.includes('netflix.com/tudum'),'CUL-0009 não usa fonte oficial da obra.');

const serialized=JSON.stringify(proposals).toLowerCase();
assert(!serialized.includes('relacao_validada'),'O quinto lote criou relação validada automaticamente.');
assert(!serialized.includes('r001-c02'),'R001-C02 não pode reaparecer no lote.');
assert(!serialized.includes('salário digno'),'O card de salário digno não pode aparecer no lote.');

console.log('Quinto trio cultural aprovado e mantido fora das bases canônicas.');

async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
