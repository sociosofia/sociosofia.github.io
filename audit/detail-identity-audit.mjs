import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';

const base='http://127.0.0.1:8000/';
const out='audit/output/detail-identity';
await fs.mkdir(out,{recursive:true});

function assert(condition,message){if(!condition)throw new Error(message);}

const browser=await chromium.launch({headless:true});
const errors=[];

async function audit(viewport,name){
  const context=await browser.newContext({viewport,locale:'pt-BR'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(`${name}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error')errors.push(`${name}: ${message.text()}`);});

  await page.goto(base+'repertorio.html?id=DAD-0009&busca=viol%C3%AAncia&origem=dados',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.detail-hero h1',{timeout:30000});
  assert(await page.locator('#repertorio-detalhe').getAttribute('data-kind')==='dados','O card de dado não recebeu sua identidade semântica.');
  const dataText=await page.locator('#repertorio-detalhe').innerText();
  assert(dataText.includes('Dado'),'O título canônico Dado não aparece.');
  assert(dataText.includes('Interpretação Sociosofia'),'A interpretação não está identificada pelo modelo canônico.');
  assert(dataText.includes('Para continuar pensando'),'A pergunta do card não aparece.');
  assert(dataText.includes('Explore a partir deste card'),'A área de expansão da entidade não aparece.');
  assert(dataText.includes('Outros caminhos para “violência”'),'A continuidade da busca não aparece.');
  assert(!dataText.includes('Temas relacionados'),'A antiga repetição de blocos ainda aparece.');
  assert(await page.locator('.brand-name').innerText()==='Sociosofia','O cabeçalho minimalista não foi aplicado.');
  await page.screenshot({path:`${out}/${name}-dado.png`,fullPage:true});

  await page.goto(base+'repertorio.html?id=CUL-0014',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.detail-hero h1',{timeout:30000});
  assert(await page.locator('#repertorio-detalhe').getAttribute('data-kind')==='cultura','O repertório cultural não recebeu sua identidade semântica.');
  const cultureText=await page.locator('#repertorio-detalhe').innerText();
  assert(cultureText.includes('A obra'),'O repertório cultural não apresenta a seção A obra.');
  assert(cultureText.includes('Leitura Sociosofia'),'A leitura editorial do repertório não aparece.');
  assert(cultureText.includes('Explore a partir deste card'),'O repertório não oferece expansão pela rede.');
  await page.screenshot({path:`${out}/${name}-repertorio.png`,fullPage:true});

  await context.close();
}

await audit({width:390,height:844},'mobile');
await audit({width:1440,height:1000},'desktop');

assert(errors.length===0,`Erros de navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria das páginas individuais concluída.');
