import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';

const base='http://127.0.0.1:8000/';
const out='audit/output/search-network';
await fs.mkdir(out,{recursive:true});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

function assert(condition,message){if(!condition)throw new Error(message);}

await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
await page.waitForSelector('#elo-da-semana',{timeout:30000});
await page.waitForSelector('#busca',{timeout:30000});
await page.waitForTimeout(700);

const bodyText=await page.locator('body').innerText();
assert(bodyText.includes('Elo da semana'),'A home não apresenta Elo da semana.');
assert(!bodyText.includes('Repertório da semana'),'A curadoria concorrente de repertório ainda aparece.');
assert(!bodyText.includes('Notícias\nDados\nPesquisas\nFilmes\nLivros'),'Os atalhos antigos ainda aparecem.');

await page.locator('#busca').fill('racismo');
await page.locator('.keyword-search-box').press('Enter');
await page.waitForSelector('#repertorios:not([hidden])');
assert(await page.locator('[data-search-portal]').count()===3,'A busca não apresenta os três vértices.');
await page.screenshot({path:out+'/busca-racismo-fechada.png',fullPage:true});

for(const key of ['dados','conceitos','cultura']){
  const button=page.locator(`[data-search-portal="${key}"]`);
  if(await button.isDisabled())continue;
  await button.click();
  assert(await page.locator(`[data-search-panel="${key}"]`).isVisible(),`O painel ${key} não abriu.`);
  const openPanels=await page.locator('[data-search-panel]:visible').count();
  assert(openPanels===1,'Mais de um painel da busca ficou aberto.');
  await button.click();
  assert(!(await page.locator(`[data-search-panel="${key}"]`).isVisible()),`O painel ${key} não fechou no segundo clique.`);
}

const dataButton=page.locator('[data-search-portal="dados"]');
assert(!(await dataButton.isDisabled()),'A busca por racismo não retornou dados para o teste.');
await dataButton.click();
await page.waitForSelector('[data-search-panel="dados"] .card-title-link');
await page.screenshot({path:out+'/busca-racismo-dados.png',fullPage:true});
const href=await page.locator('[data-search-panel="dados"] .card-title-link').first().getAttribute('href');
assert(href.includes('busca=racismo'),'O card não preserva a busca inicial.');
assert(href.includes('origem=dados'),'O card não preserva o vértice de origem.');

await page.goto(new URL(href,base).href,{waitUntil:'domcontentloaded'});
await page.waitForSelector('.search-continuity',{timeout:30000});
const continuityText=await page.locator('.search-continuity').innerText();
assert(continuityText.includes('Outros caminhos para “racismo”'),'O card não preservou o contexto da busca.');
assert(await page.locator('.continuity-vertex').count()===3,'O card não devolve os três vértices.');
assert(continuityText.includes('resultados contextuais da busca'),'A diferença entre busca e relação validada não está explícita.');
await page.screenshot({path:out+'/card-continuidade-racismo.png',fullPage:true});

assert(errors.length===0,`Erros de navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria da busca triangular concluída.');
