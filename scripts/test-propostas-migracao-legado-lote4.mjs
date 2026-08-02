import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote4-v1.json'),
  read('data/temas.json'),
  read('data/publicacao-legado.json'),
  read('data/repertorios.json'),
  read('data/publicacoes.json'),
  read('data/repertorios-canonicos.json')
]);

assert(proposals.status==='em_revisao','O quarto lote deve permanecer em revisão até decisão explícita de Luiz.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O quarto lote deve conter exatamente três propostas.');

const expected=['DAD-0003','CUL-0004','CUL-0005'];
const actual=proposals.propostas.map(item=>item.id);
assert(JSON.stringify(actual)===JSON.stringify(expected),'Os IDs ou sua ordem foram alterados.');
assert(new Set(actual).size===actual.length,'Há IDs duplicados no quarto lote.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const canonicalIds=new Set([...publicacoes,...cultural].map(item=>item.id));

assert(legacy.ids.length===24,'O quarto lote não deve alterar os 24 itens ainda publicados como legado.');
assert(publicacoes.length===11,'O quarto lote não deve alterar os onze dados canônicos vigentes.');
assert(cultural.length===3,'O quarto lote não deve alterar os três repertórios culturais canônicos vigentes.');

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu a preservação transitória.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão.`);
  assert(legacyIds.has(item.id),`${item.id} não permanece no registro publicado_legado.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo legado.`);
  assert(!canonicalIds.has(item.id),`${item.id} já entrou em base canônica e seria duplicado.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  for(const themeId of item.tema_ids)assert(themeIds.has(themeId),`${item.id} usa tema inexistente: ${themeId}.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral pronta.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);
}

const school=proposals.propostas.find(item=>item.id==='DAD-0003');
for(const field of ['dado','contextualizacao','interpretacao_sociosofia','questao'])assert(school[field],`DAD-0003 não possui ${field}.`);
assert(school.titulo==='18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos','DAD-0003 perdeu o título preciso.');
assert(school.dado.includes('945.481')&&school.dado.includes('18%'),'DAD-0003 perdeu amostra ou percentual.');
assert(school.contextualizacao.includes('anos finais do ensino fundamental'),'DAD-0003 ampliou indevidamente o universo escolar.');
assert(school.contextualizacao.includes('três meses anteriores'),'DAD-0003 perdeu a janela temporal da pergunta.');
assert(school.contextualizacao.includes('classificar todas as experiências como bullying')&&school.contextualizacao.includes('não demonstra'),'DAD-0003 transformou medo em diagnóstico automático de bullying.');
assert(!school.titulo.includes('medo de ir à escola'),'DAD-0003 voltou à formulação imprecisa da fonte secundária.');

const truman=proposals.propostas.find(item=>item.id==='CUL-0004');
for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao'])assert(truman[field],`CUL-0004 não possui ${field}.`);
assert(truman.leitura_sociosofia.includes('consentimento'),'CUL-0004 perdeu o eixo ético do consentimento.');
assert(truman.cuidado_pedagogico.includes('Não apresentar o filme como profecia literal'),'CUL-0004 voltou a tratar a obra como previsão automática das redes sociais.');
assert(truman.fonte_url.includes('paramountpictures.com'),'CUL-0004 não usa a fonte oficial da obra.');

const menino=proposals.propostas.find(item=>item.id==='CUL-0005');
for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao'])assert(menino[field],`CUL-0005 não possui ${field}.`);
assert(menino.titulo==='Menino 23: eugenia, trabalho forçado e apagamento histórico','CUL-0005 perdeu o título proposto.');
assert(menino.resumo_obra.includes('cinquenta meninos negros'),'CUL-0005 perdeu o recorte histórico central.');
assert(menino.cuidado_pedagogico.includes('raízes brasileiras'),'CUL-0005 voltou a externalizar o racismo brasileiro no nazismo.');
assert(menino.cuidado_pedagogico.includes('reconstrução documental mediada'),'CUL-0005 apresenta o documentário como registro transparente e completo.');

const serialized=JSON.stringify(proposals).toLowerCase();
assert(!serialized.includes('relacao_validada'),'O quarto lote criou relação validada automaticamente.');
assert(!serialized.includes('r001-c02'),'R001-C02 não pode reaparecer no lote.');
assert(!serialized.includes('salário digno'),'O card de salário digno não pode aparecer no lote.');

console.log('Quarto trio editorial validado e mantido fora das bases canônicas.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
