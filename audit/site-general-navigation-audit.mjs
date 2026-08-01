import { chromium } from 'playwright';

const base='http://127.0.0.1:8000/';
function assert(condition,message){if(!condition)throw new Error(message);}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
await page.waitForSelector('#elo-da-semana');
assert(await page.locator('a[href="#elo-da-semana"]').count()>=2,'A home não usa a âncora vigente do Elo da semana.');
assert(await page.locator('footer a[href="sobre.html"]').count()===1,'A página Sobre não está acessível pelo rodapé da home.');
await page.locator('footer a[href="sobre.html"]').click();
await page.waitForURL(/sobre\.html$/);
assert(await page.locator('.brand-name').innerText()==='Sociosofia','A página Sobre não usa a marca integrada.');
assert(await page.locator('h1').innerText()==='Repertórios para pensar o mundo','O título da página Sobre não foi atualizado.');
assert(await page.locator('.about-door').count()===3,'As três portas não aparecem na página Sobre.');
assert(await page.locator('.brand-mark').count()===0,'A marca antiga ainda aparece na página Sobre.');

await page.goto(base+'index.html#elo-em-destaque',{waitUntil:'domcontentloaded'});
await page.waitForURL(/#elo-da-semana$/);
assert(new URL(page.url()).hash==='#elo-da-semana','A âncora antiga não foi redirecionada para o Elo da semana.');

await page.goto(base+'guia.html',{waitUntil:'domcontentloaded'});
await page.waitForURL(/index\.html#temas$/);

await page.goto(base+'editoria2/',{waitUntil:'domcontentloaded'});
await page.waitForURL(/alunos\/sociologia-2ano\/$/);

await page.goto(base+'repertorio.html?id=DAD-0009',{waitUntil:'domcontentloaded'});
await page.waitForSelector('.detail-hero h1');
assert(await page.locator('footer a[href="sobre.html"]').count()===1,'Os cards não oferecem acesso à página Sobre.');
assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);

await browser.close();
console.log('Auditoria da navegação geral concluída.');
