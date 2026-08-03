import {chromium} from 'playwright';

function assert(condition,message){if(!condition)throw new Error(message);}

const base='http://127.0.0.1:8000/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},locale:'pt-BR'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

await page.goto(base+'index.html',{waitUntil:'networkidle'});
const snapshot=await page.evaluate(async()=>{
  const module=await import('./site-shared.js');
  const items=await module.loadItems();
  return items.map(item=>({id:item.id,status_publicacao:item.status_publicacao,bloco:item.bloco,titulo:item.titulo}));
});

const legacy=snapshot.filter(item=>item.status_publicacao==='publicado_legado');
const current=snapshot.filter(item=>item.status_publicacao==='publicado');
assert(legacy.length===12,`Esperados 12 itens publicado_legado; encontrados ${legacy.length}.`);
assert(current.length===26,`Esperadas 26 publicações canônicas; encontradas ${current.length}.`);
assert(snapshot.length===38,`A fachada pública deveria conter 38 itens; encontrou ${snapshot.length}.`);
assert(new Set(snapshot.map(item=>item.id)).size===38,'A fachada pública contém IDs duplicados.');
assert(legacy.every(item=>item.id.startsWith('CUL-')),'Nenhum card DAD deveria permanecer no legado.');

const migratedIds=['DAD-0004','DAD-0007','CUL-0003','DAD-0002','DAD-0006','CUL-0001','DAD-0001','DAD-0005','CUL-0002','DAD-0003','CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009','CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015'];
for(const id of migratedIds){
  const matches=snapshot.filter(item=>item.id===id);
  assert(matches.length===1,`${id} deveria aparecer exatamente uma vez.`);
  assert(matches[0].status_publicacao==='publicado',`${id} não foi promovido ao estado canônico publicado.`);
}

await verifyDataCard('DAD-0004',['Metade dos casos analisados teve início até os 14 anos','9.282 adultos','medicalização automática']);
await verifyDataCard('DAD-0007',['Brasil tinha 1.578 escolas militarizadas em maio de 2026','mais de 600 pedidos de acesso à informação','gestão democrática']);
await verifyDataCard('DAD-0002',['64% dos estudantes ouvidos relataram sobrecarga e cansaço','educação básica privada','autorrelatados']);
await verifyDataCard('DAD-0006',['Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana','Ceará, Pará e São Paulo','não para o Brasil inteiro']);
await verifyDataCard('DAD-0001',['Sete em cada dez jovens fora da escola sem concluir a educação básica eram negros','7,9 milhões de jovens','PNAD Contínua 2025']);
await verifyDataCard('DAD-0005',['Cansaço e desgaste foram apontados por 83% dos docentes ouvidos como fatores de adoecimento','2.597 respostas','2.215 respostas']);
await verifyDataCard('DAD-0003',['18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos','945.481 estudantes dos anos finais do ensino fundamental','três meses anteriores','O que uma escola precisa mudar quando parte dos estudantes teme os próprios colegas?']);

await verifyCulturalCard('CUL-0003',['Her: intimidade, projeção e vínculos mediados por tecnologia','sempre disponível e adaptável','Sherry Turkle']);
await verifyCulturalCard('CUL-0001',['Coringa: sofrimento, humilhação e espetáculo da violência','não anulam responsabilidade','Não usar o filme como evidência']);
await verifyCulturalCard('CUL-0002',['Corra!: admiração, apropriação e controle do corpo negro','Não tratá-la como documentário','Estados Unidos','Brasil']);
await verifyCulturalCard('CUL-0004',['O Show de Truman: vigilância, espetáculo e realidade fabricada','consentimento','Não apresentar o filme como profecia literal','Que diferença existe entre compartilhar a própria vida']);
await verifyCulturalCard('CUL-0005',['Menino 23: eugenia, trabalho forçado e apagamento histórico','cinquenta meninos negros','reconstrução documental mediada','história nacional de escravização e racismo']);
await verifyCulturalCard('CUL-0007',['Black Mirror — San Junípero: corpo, memória e a promessa de continuar vivendo','dimensão amorosa e queer','Não apresentar a transferência de consciência como fato científico','Uma existência digital seria continuação da mesma pessoa']);
await verifyCulturalCard('CUL-0008',['Black Mirror — The Entire History of You: quando lembrar se torna vigiar','Transformar a experiência em arquivo não elimina a interpretação','controle coercitivo','Rever tudo tornaria uma relação mais verdadeira']);
await verifyCulturalCard('CUL-0009',['Black Mirror — Fifteen Million Merits: trabalho, consumo e revolta transformada em espetáculo','contestação em produto','alegoria','humilhação','O que acontece com a crítica social']);
await verifyCulturalCard('CUL-0010',['Black Mirror — Men Against Fire: tecnologia, desumanização e fabricação do inimigo','não o cria sozinha','instituições, ideologias e decisões políticas','O que precisa acontecer para que uma sociedade aceite']);
await verifyCulturalCard('CUL-0011',['Entre os Muros da Escola: linguagem, autoridade e reconhecimento em disputa','posição institucional assimétrica','sistema educacional francês','Como construir autoridade pedagógica']);
await verifyCulturalCard('CUL-0012',['Cidade de Deus: território, juventude e escolhas sob desigualdade','O Estado também não está simplesmente ausente','espetacularização da violência','Como explicar a violência sem transformar o território']);
await verifyCulturalCard('CUL-0013',['O Senhor das Armas: lucro, Estados e circulação global da violência','não funciona apenas à margem dos Estados','responsabilidade institucional','Quem é responsável pela violência produzida por uma arma']);
await verifyCulturalCard('CUL-0014',['Vidas Entregues: trabalho por aplicativo entre autonomia e transferência de riscos','quem absorve os riscos','Não tratar os entregadores como vítimas sem agência','Existe autonomia quando outra organização define preços']);
await verifyCulturalCard('CUL-0015',['O Diabo Veste Prada: trabalho, distinção e transformação de si','A aparência funciona como linguagem profissional','vaidade feminina','Até que ponto adaptar-se a uma cultura profissional']);

assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria dos seis lotes migrados concluída.');

async function verifyDataCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();
  for(const expected of ['Dado','Contextualização','Interpretação Sociosofia','Para continuar pensando']){
    assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  }
  const body=await page.locator('body').innerText();
  for(const expected of expectedTexts)assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a fonte como link.`);
}

async function verifyCulturalCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();
  for(const expected of ['A obra','Leitura Sociosofia','Ancoragem teórica']){
    assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  }
  const body=await page.locator('body').innerText();
  for(const expected of expectedTexts)assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a referência da obra como link.`);
}
