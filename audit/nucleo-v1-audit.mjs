import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';

const base='http://127.0.0.1:8000/';
const out='audit/output/nucleo-v1';
await fs.mkdir(out,{recursive:true});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});
const failures=[];

function check(condition,message){if(!condition)failures.push(message);}

const home=await context.newPage();
await home.goto(base,{waitUntil:'networkidle'});
check(!(await home.locator('body').innerText()).includes('ferramenta de interpretação'),'A home ainda usa “ferramenta de interpretação”.');
check(await home.locator('.entry-node-count').count()===0,'Ainda há contadores nos vértices.');

const dado=home.locator('[data-entry-portal="dados"]');
await dado.click();
await home.waitForTimeout(300);
check(await home.locator('#painel-dados').isVisible(),'O vértice Dado não abriu.');
check(await home.locator('#painel-dados .topic-button small').count()===0,'Os subtemas ainda exibem contagens.');
await home.screenshot({path:`${out}/home-dado-aberto.png`,fullPage:true});
await dado.click();
await home.waitForTimeout(200);
check(!(await home.locator('#painel-dados').isVisible()),'O segundo clique não fechou o vértice Dado.');

const conceito=home.locator('[data-entry-portal="conceitos"]');
await conceito.click();
await home.waitForTimeout(250);
check(await home.locator('#painel-conceitos').isVisible(),'O vértice Conceito não abriu.');
await home.screenshot({path:`${out}/home-conceito-aberto.png`,fullPage:true});

const elo=await context.newPage();
await elo.addInitScript(()=>localStorage.setItem('sociosofia-elo:ELO-trabalho-plataformas-controle',JSON.stringify({origin:'dado',current:'dado',from:null})));
await elo.goto(`${base}elo.html?id=ELO-trabalho-plataformas-controle&entrada=conceito`,{waitUntil:'networkidle'});
await elo.waitForSelector('#dynamicPanel:not([hidden])');
check(await elo.locator('#resumeBanner').count()===0,'O banner de retomada ainda está presente.');
const text=await elo.locator('#dynamicPanel').innerText();
check(text.includes('O que é alienação'),'A definição explícita de alienação não apareceu.');
check(text.includes('forma de separação produzida no trabalho'),'A explicação central de alienação não apareceu.');
check(await elo.locator('.elo-panel-title a[href*="entidade=Aliena"]').count()===1,'Alienação não está clicável.');
check(await elo.locator('.elo-callout a[href*="Karl%20Marx"]').count()===1,'Karl Marx não está clicável.');
await elo.screenshot({path:`${out}/elo-conceito.png`,fullPage:true});

await elo.locator('[data-node="repertorio"]').click();
await elo.waitForTimeout(300);
check(await elo.locator('.elo-panel-title a[href*="CUL-0014"]').count()===1,'Vidas Entregues não está clicável.');
await elo.screenshot({path:`${out}/elo-repertorio.png`,fullPage:true});

await browser.close();

const report={ok:failures.length===0,failures};
await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('Auditoria do núcleo relacional concluída com sucesso.');
