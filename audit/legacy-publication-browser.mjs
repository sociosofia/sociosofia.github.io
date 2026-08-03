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
assert(legacy.length===0,`O portão legado deveria estar vazio; encontrou ${legacy.length} itens.`);
assert(current.length===38,`Esperadas 38 publicações canônicas; encontradas ${current.length}.`);
assert(snapshot.length===38&&new Set(snapshot.map(item=>item.id)).size===38,'A fachada pública final deve conter 38 IDs únicos.');

const migratedIds=['DAD-0004','DAD-0007','CUL-0003','DAD-0002','DAD-0006','CUL-0001','DAD-0001','DAD-0005','CUL-0002','DAD-0003','CUL-0004','CUL-0005','CUL-0007','CUL-0008','CUL-0009','CUL-0010','CUL-0011','CUL-0012','CUL-0013','CUL-0014','CUL-0015','CUL-0016','CUL-0017','CUL-0018','CUL-0019','CUL-0020','CUL-0021','CUL-0006','CUL-0022','CUL-0023','CUL-0024','CUL-0025','CUL-0026'];
assert(migratedIds.length===33&&new Set(migratedIds).size===33,'A lista de auditoria dos migrados está incorreta.');
for(const id of migratedIds){const matches=snapshot.filter(item=>item.id===id);assert(matches.length===1,`${id} deveria aparecer exatamente uma vez.`);assert(matches[0].status_publicacao==='publicado',`${id} não foi promovido ao estado canônico publicado.`);}

await verifyDataCard('DAD-0004',['Metade dos casos analisados teve início até os 14 anos','9.282 adultos','medicalização automática']);
await verifyDataCard('DAD-0007',['Brasil tinha 1.578 escolas militarizadas em maio de 2026','mais de 600 pedidos de acesso à informação','gestão democrática']);
await verifyDataCard('DAD-0002',['64% dos estudantes ouvidos relataram sobrecarga e cansaço','educação básica privada','autorrelatados']);
await verifyDataCard('DAD-0006',['Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana','Ceará, Pará e São Paulo','não para o Brasil inteiro']);
await verifyDataCard('DAD-0001',['Sete em cada dez jovens fora da escola sem concluir a educação básica eram negros','7,9 milhões de jovens','PNAD Contínua 2025']);
await verifyDataCard('DAD-0005',['Cansaço e desgaste foram apontados por 83% dos docentes ouvidos como fatores de adoecimento','2.597 respostas','2.215 respostas']);
await verifyDataCard('DAD-0003',['18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos','945.481 estudantes dos anos finais do ensino fundamental','três meses anteriores']);

const culturalChecks={
'CUL-0003':['Her: intimidade, projeção e vínculos mediados por tecnologia','sempre disponível e adaptável'],
'CUL-0001':['Coringa: sofrimento, humilhação e espetáculo da violência','Não usar o filme como evidência'],
'CUL-0002':['Corra!: admiração, apropriação e controle do corpo negro','Não tratá-la como documentário'],
'CUL-0004':['O Show de Truman: vigilância, espetáculo e realidade fabricada','consentimento'],
'CUL-0005':['Menino 23: eugenia, trabalho forçado e apagamento histórico','reconstrução documental mediada'],
'CUL-0007':['Black Mirror — San Junípero: corpo, memória e a promessa de continuar vivendo','dimensão amorosa e queer'],
'CUL-0008':['Black Mirror — The Entire History of You: quando lembrar se torna vigiar','controle coercitivo'],
'CUL-0009':['Black Mirror — Fifteen Million Merits: trabalho, consumo e revolta transformada em espetáculo','contestação em produto'],
'CUL-0010':['Black Mirror — Men Against Fire: tecnologia, desumanização e fabricação do inimigo','não o cria sozinha'],
'CUL-0011':['Entre os Muros da Escola: linguagem, autoridade e reconhecimento em disputa','posição institucional assimétrica'],
'CUL-0012':['Cidade de Deus: território, juventude e escolhas sob desigualdade','espetacularização da violência'],
'CUL-0013':['O Senhor das Armas: lucro, Estados e circulação global da violência','responsabilidade institucional'],
'CUL-0014':['Vidas Entregues: trabalho por aplicativo entre autonomia e transferência de riscos','Não tratar os entregadores como vítimas sem agência'],
'CUL-0015':['O Diabo Veste Prada: trabalho, distinção e transformação de si','Não desqualificar a moda como atividade superficial'],
'CUL-0016':['Garapa: fome, cuidado e dignidade sob privação','culpabilizar famílias'],
'CUL-0017':['Precisamos Falar Sobre o Kevin: culpa, memória e explicações para a violência','Não diagnosticar Kevin'],
'CUL-0018':['Jojo Rabbit: propaganda, pertencimento e aprendizagem do ódio','não deve banalizar o nazismo'],
'CUL-0019':['1917: corpo, tempo e obediência na guerra','tempo militar e tempo vivido'],
'CUL-0020':['Nada de Novo no Front: juventude, nacionalismo e vidas sacrificadas','transforma juventude em recurso político'],
'CUL-0021':['As Vantagens de Ser Invisível: pertencimento, trauma e escuta na juventude','sem obrigação de relato pessoal'],
'CUL-0006':['O Sétimo Selo: dúvida, finitude e sentido diante da morte','não devem ser pressionados a expor crenças'],
'CUL-0022':['As Virgens Suicidas: controle, idealização e silêncio sobre jovens mulheres','Não romantizar ou estetizar as mortes'],
'CUL-0023':['Blade Runner: memória, trabalho e vidas fabricadas','não reúne a franquia nem o filme de 2017'],
'CUL-0024':['Democracia em Preto e Branco: futebol, música e participação no fim da ditadura','Não apresentar a Democracia Corinthiana como causa única'],
'CUL-0025':['Adolescência: masculinidade, pertencimento e violência em redes digitais','não apresentar a internet como causa automática'],
'CUL-0026':['Dançando com o Diabo: polícia, tráfico e religião em territórios sob violência','Não generalizar favelas e periferias']
};
for(const [id,texts] of Object.entries(culturalChecks))await verifyCulturalCard(id,texts);

assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria final dos 33 conteúdos migrados concluída.');

async function verifyDataCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();
  for(const expected of ['Dado','Contextualização','Interpretação Sociosofia','Para continuar pensando'])assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  const body=await page.locator('body').innerText();for(const expected of expectedTexts)assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a fonte como link.`);
}
async function verifyCulturalCard(id,expectedTexts){
  await page.goto(base+`repertorio.html?id=${id}`,{waitUntil:'networkidle'});
  const headings=await page.locator('.detail-section h2').allInnerTexts();for(const expected of ['A obra','Leitura Sociosofia','Ancoragem teórica'])assert(headings.includes(expected),`${id} não renderizou a seção ${expected}.`);
  const body=await page.locator('body').innerText();for(const expected of expectedTexts)assert(body.includes(expected),`${id} não exibiu o trecho esperado: ${expected}`);
  assert(await page.locator('.detail-sidebar a').count()===1,`${id} não exibe a referência da obra como link.`);
}
