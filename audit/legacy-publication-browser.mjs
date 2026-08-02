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
assert(legacy.length===30,`Esperados 30 itens publicado_legado; encontrados ${legacy.length}.`);
assert(current.length===8,`Esperadas 8 publicações canônicas; encontradas ${current.length}.`);
assert(snapshot.length===38,`A fachada pública deveria conter 38 itens; encontrou ${snapshot.length}.`);
assert(new Set(snapshot.map(item=>item.id)).size===38,'A fachada pública contém IDs duplicados.');
assert(legacy.filter(item=>item.id.startsWith('DAD-')).length===5,'O conjunto legado deveria conter 5 cards DAD.');
assert(legacy.filter(item=>item.id.startsWith('CUL-')).length===25,'O conjunto legado deveria conter 25 cards CUL.');

for(const id of ['DAD-0004','DAD-0007','CUL-0003']){
  const matches=snapshot.filter(item=>item.id===id);
  assert(matches.length===1,`${id} deveria aparecer exatamente uma vez.`);
  assert(matches[0].status_publicacao==='publicado',`${id} não foi promovido ao estado canônico publicado.`);
}

await verifyDataCard('DAD-0004',[
  'Metade dos casos analisados teve início até os 14 anos',
  '9.282 adultos',
  'medicalização automática',
  'Como escola e serviços de saúde podem agir precocemente'
]);

await verifyDataCard('DAD-0007',[
  'Brasil tinha 1.578 escolas militarizadas em maio de 2026',
  'mais de 600 pedidos de acesso à informação',
  'gestão democrática',
  'Uma escola pública oferece escolha real'
]);

await page.goto(base+'repertorio.html?id=CUL-0003',{waitUntil:'networkidle'});
const culturalHeadings=await page.locator('.detail-section h2').allInnerTexts();
for(const expected of ['A obra','Leitura Sociosofia','Ancoragem teórica']){
  assert(culturalHeadings.includes(expected),`CUL-0003 não renderizou a seção ${expected}.`);
}
const culturalBody=await page.locator('body').innerText();
for(const expected of [
  'Her: intimidade, projeção e vínculos mediados por tecnologia',
  'sempre disponível e adaptável',
  'Sherry Turkle',
  'Nenhuma dessas referências é explícita no filme'
]){
  assert(culturalBody.includes(expected),`CUL-0003 não exibiu o trecho esperado: ${expected}`);
}
assert(await page.locator('.detail-sidebar a').count()===1,'CUL-0003 não exibe a referência da obra como link.');

assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria do primeiro lote migrado concluída.');

async function verifyDataCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();
  for(const expected of ['Dado','Contextualização','Interpretação Sociosofia','Para continuar pensando']){
    assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  }
  const body=await page.locator('body').innerText();
  for(const expected of expectedTexts){
    assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  }
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a fonte como link.`);
}
