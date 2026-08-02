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
assert(legacy.length===27,`Esperados 27 itens publicado_legado; encontrados ${legacy.length}.`);
assert(current.length===11,`Esperadas 11 publicações canônicas; encontradas ${current.length}.`);
assert(snapshot.length===38,`A fachada pública deveria conter 38 itens; encontrou ${snapshot.length}.`);
assert(new Set(snapshot.map(item=>item.id)).size===38,'A fachada pública contém IDs duplicados.');
assert(legacy.filter(item=>item.id.startsWith('DAD-')).length===3,'O conjunto legado deveria conter 3 cards DAD.');
assert(legacy.filter(item=>item.id.startsWith('CUL-')).length===24,'O conjunto legado deveria conter 24 cards CUL.');

for(const id of ['DAD-0004','DAD-0007','CUL-0003','DAD-0002','DAD-0006','CUL-0001']){
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

await verifyDataCard('DAD-0002',[
  '64% dos estudantes ouvidos relataram sobrecarga e cansaço',
  'educação básica privada',
  'autorrelatados',
  'não constituem diagnóstico clínico',
  'Quando o sofrimento escolar deve ser tratado como problema individual'
]);

await verifyDataCard('DAD-0006',[
  'Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana',
  'Ceará, Pará e São Paulo',
  'não para o Brasil inteiro',
  'não deve ser usada para culpar famílias',
  'Como ampliar experiências de leitura na primeira infância'
]);

await verifyCulturalCard('CUL-0003',[
  'Her: intimidade, projeção e vínculos mediados por tecnologia',
  'sempre disponível e adaptável',
  'Sherry Turkle',
  'Nenhuma dessas referências é explícita no filme'
]);

await verifyCulturalCard('CUL-0001',[
  'Coringa: sofrimento, humilhação e espetáculo da violência',
  'não anulam responsabilidade',
  'nem provam que pessoas em sofrimento mental sejam violentas',
  'Erving Goffman',
  'Não usar o filme como evidência de que transtorno mental causa violência'
]);

assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria dos dois lotes migrados concluída.');

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

async function verifyCulturalCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();
  for(const expected of ['A obra','Leitura Sociosofia','Ancoragem teórica']){
    assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  }
  const body=await page.locator('body').innerText();
  for(const expected of expectedTexts){
    assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  }
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a referência da obra como link.`);
}
