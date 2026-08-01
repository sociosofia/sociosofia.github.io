import {chromium} from 'playwright';

function assert(condition,message){if(!condition)throw new Error(message);}

const base='http://127.0.0.1:8000/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

await page.goto(base+'index.html',{waitUntil:'networkidle'});
await page.locator('[data-entry-portal="dados"]').click();
await page.waitForSelector('#painel-dados:not([hidden])');
const genderButton=page.locator('[data-theme="genero"]');
assert(await genderButton.count()===1,'O tema canônico genero não apareceu na navegação de dados.');
assert((await genderButton.innerText()).trim()==='Gênero, sexualidade e corpo','O tema genero não usa o rótulo público canônico.');
await genderButton.click();
await page.waitForSelector('#lista-dados .card');
const genderText=await page.locator('#lista-dados').innerText();
assert(genderText.includes('3,7 milhões de brasileiras'),'DAD-0009 não apareceu no tema genero.');
assert(genderText.includes('21,3% menos'),'DAD-0010 não apareceu no tema genero.');
assert(genderText.includes('quase o dobro do tempo'),'DAD-0011 não apareceu no tema genero.');

await page.goto(base+'repertorio.html?id=DAD-0009',{waitUntil:'networkidle'});
const headings=await page.locator('.detail-section h2').allInnerTexts();
for(const expected of ['Dado','Contextualização','Interpretação Sociosofia','Para continuar pensando']){
  assert(headings.includes(expected),`A seção ${expected} não foi renderizada.`);
}
assert(await page.locator('.detail-hero > div > p:not(.detail-subtitle)').count()===0,'O resumo legado voltou a repetir as seções canônicas.');
assert((await page.locator('.detail-meta').innerText()).includes('Gênero, sexualidade e corpo'),'O card não exibe o tema canônico principal.');
const contextText=await page.locator('.detail-section').filter({has:page.locator('h2', {hasText:'Contextualização'})}).innerText();
assert(!contextText.includes('3,7 milhões'),'A contextualização está repetindo o dado principal.');
assert(await page.locator('.detail-sidebar a').count()===1,'A fonte original não foi exibida como link.');
const bodyText=(await page.locator('body').innerText()).toLowerCase();
assert(!bodyText.includes('salário digno'),'O card em ajuste apareceu na interface pública.');
assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);

await browser.close();
console.log('Auditoria pública do contrato concluída.');
