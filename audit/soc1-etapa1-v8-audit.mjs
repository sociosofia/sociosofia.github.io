import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE='http://127.0.0.1:8000';
const URL=`${BASE}/alunos/sociologia-1ano/`;
const OUT='audit/output-soc1-v8';
const devices=[
  {id:'desktop',viewport:{width:1366,height:900}},
  {id:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];
const expectedChapters=[
  [1,'Fundação e construção do pensamento sociológico','12–35',5],
  [2,'A dinâmica das relações entre indivíduo e sociedade','30–41',4],
  [3,'Processo de socialização e suas instituições','42–55',5],
  [4,'Caracterizando a mobilidade e a desigualdade sociais','56–69',5]
];
const report={generatedAt:new Date().toISOString(),results:{},blocking:[]};
await fs.mkdir(OUT,{recursive:true});

function fail(result,message){result.blocking.push(message);report.blocking.push(`${result.device}: ${message}`)}

const browser=await chromium.launch({headless:true});
for(const device of devices){
  const context=await browser.newContext({...device,locale:'pt-BR'});
  const page=await context.newPage();
  const result={device:device.id,blocking:[],consoleErrors:[],pageErrors:[],checks:{}};
  page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text())});
  page.on('pageerror',e=>result.pageErrors.push(String(e)));
  try{
    await page.goto(URL,{waitUntil:'networkidle',timeout:60000});
    await page.waitForSelector('#site-data',{state:'attached',timeout:30000});
    await page.waitForSelector('.chapter-card',{timeout:30000});

    result.checks.marker=await page.evaluate(()=>document.documentElement.dataset.sociosofiaContent||'');
    if(result.checks.marker!=='soc1-e1-v8') fail(result,`Marcador v8 ausente: ${result.checks.marker||'(vazio)'}.`);

    const data=await page.evaluate(()=>JSON.parse(document.getElementById('site-data').textContent));
    result.checks.meta={chapters:data.meta.chapter_count,movements:data.meta.movement_count,entities:data.meta.entity_count};
    if(data.meta.chapter_count!==10||data.meta.movement_count!==54||data.meta.entity_count!==83) fail(result,'Contagens anuais canônicas foram alteradas.');
    if(data.v8?.content!=='soc1-e1-v8') fail(result,'Contrato v8 não foi incorporado ao site-data.');

    for(const [number,title,pages,movements] of expectedChapters){
      const c=data.chapters.find(x=>x.number===number);
      if(!c) {fail(result,`Capítulo ${number} ausente.`);continue}
      if(c.title!==title||c.pages!==pages||c.movements.length!==movements) fail(result,`Capítulo ${number} divergiu da estrutura v8.`);
      if(!c.movements.every(m=>m.v8)) fail(result,`Capítulo ${number} contém movimento sem payload v8.`);
    }
    const stageMovements=data.chapters.filter(c=>c.number<=4).reduce((n,c)=>n+c.movements.length,0);
    if(stageMovements!==19) fail(result,`1ª etapa possui ${stageMovements} movimentos, esperado 19.`);
    if(data.chapters[0].movements[0].question!=='Como uma situação cotidiana deixa de parecer apenas “normal” e se transforma em problema sociológico?') fail(result,'Pergunta final de C1-M1 não corresponde à v8 aprovada.');

    const firstCard=await page.locator('.chapter-card').first().innerText();
    if(!firstCard.includes('12–35')) fail(result,'Mapa anual não reflete a paginação aprovada do capítulo 1.');

    await page.locator('.chapter-card').first().click();
    await page.waitForSelector('.movement[data-sociosofia-v8="true"]',{timeout:30000});
    if(await page.locator('.movement[data-sociosofia-v8="true"]').count()!==5) fail(result,'Capítulo 1 não renderizou cinco movimentos v8.');
    const m1=await page.locator('#c1-m1').innerText();
    if(!m1.includes('O estranhamento sociológico começa quando suspendemos a resposta automática')) fail(result,'Texto final de C1-M1 não foi renderizado integralmente.');
    if(/MythBusters/i.test(m1)) fail(result,'MythBusters reapareceu indevidamente em C1-M1.');
    const m4=await page.locator('#c1-m4').innerText();
    if(!m4.includes('Investigação sociológica')||!m4.includes('MythBusters')) fail(result,'Vínculo Investigação sociológica ↔ MythBusters não apareceu em C1-M4.');

    const full=page.locator('#c1-m1 .v8-full-trigger').first();
    await full.click();
    await page.waitForSelector('#drawer.open',{timeout:10000});
    const fullDrawerTitle=(await page.locator('#drawer-title').textContent()||'').trim();
    const fullDrawerSections=await page.locator('#drawer-body .drawer-section').count();
    result.checks.fullDrawer={title:fullDrawerTitle,sections:fullDrawerSections};
    if(fullDrawerTitle!=='Estranhamento sociológico'||fullDrawerSections<5) fail(result,'Ficha canônica integral não abriu a partir da apresentação completa.');
    await page.keyboard.press('Escape');

    await page.evaluate(()=>openChapter(3));
    await page.waitForSelector('#c3-m5[data-sociosofia-v8="true"]');
    const c3m5=page.locator('#c3-m5');
    const c3titles=await c3m5.locator('.v8-contextual-title').allTextContents();
    if(c3titles.some(t=>/Socialização|Construção social da realidade|Instituição social/i.test(t))) fail(result,'Ocorrência absorvida reapareceu como bloco separado em C3-M5.');
    const c3text=await c3m5.innerText();
    if(!c3text.includes('Ao longo da vida, aprendizagens anteriores podem ser confirmadas')) fail(result,'Parágrafo integrado de C3-M5 não foi preservado.');

    await page.evaluate(()=>openChapter(4));
    await page.waitForSelector('#c4-m3[data-sociosofia-v8="true"]');
    const c4m3=page.locator('#c4-m3');
    if(await c4m3.locator('.v8-reading-flow > p').count()!==3) fail(result,'C4-M3 não preservou os três parágrafos integrados.');
    const c4m3titles=await c4m3.locator('.v8-contextual-title').allTextContents();
    for(const name of ['Karl Marx','Max Weber','Pierre Bourdieu']) if(!c4m3titles.includes(name)) fail(result,`Destaque contextual de ${name} ausente em C4-M3.`);
    if(c4m3titles.some(t=>/Desigualdade social|Estratificação social/i.test(t))) fail(result,'Conceitos absorvidos reapareceram como destaque em C4-M3.');

    const contextual=c4m3.locator('.v8-contextual-use').first();
    await contextual.click();
    await page.waitForSelector('#drawer.open');
    const contextualDrawerTitle=(await page.locator('#drawer-title').textContent()||'').trim();
    const contextualDrawerSections=await page.locator('#drawer-body .drawer-section').count();
    result.checks.contextualDrawer={title:contextualDrawerTitle,sections:contextualDrawerSections};
    if(!['Karl Marx','Max Weber','Pierre Bourdieu'].includes(contextualDrawerTitle)||contextualDrawerSections<5) fail(result,'Retomada contextual não recuperou a ficha canônica.');
    await page.keyboard.press('Escape');

    const c4m5=page.locator('#c4-m5');
    const c4m5titles=await c4m5.locator('.v8-contextual-title').allTextContents();
    if(c4m5titles.some(t=>/Mobilidade social|Capitais em Bourdieu/i.test(t))) fail(result,'Ocorrência absorvida reapareceu como bloco em C4-M5.');
    if(!c4m5titles.includes('Desigualdade social')) fail(result,'Destaque de Desigualdade social ausente em C4-M5.');
    if(!(await c4m5.innerText()).includes('Um exemplo ajuda a perceber essa diferença.')) fail(result,'Exemplo integrado de C4-M5 não foi preservado.');

    result.checks.horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
    if(result.checks.horizontalOverflow) fail(result,'Há transbordamento horizontal.');
    await page.screenshot({path:`${OUT}/soc1-etapa1-v8-${device.id}.png`,fullPage:true});
  }catch(error){fail(result,`Falha fatal: ${error}`)}
  if(result.consoleErrors.length) fail(result,`${result.consoleErrors.length} erro(s) de console: ${result.consoleErrors.join(' | ')}`);
  if(result.pageErrors.length) fail(result,`${result.pageErrors.length} erro(s) de página: ${result.pageErrors.join(' | ')}`);
  report.results[device.id]=result;
  await context.close();
}
await browser.close();
report.status=report.blocking.length?'FALHOU':'APROVADO';
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
const md=`# Validação Sociosofia — Sociologia 1º ano · 1ª etapa v8\n\n**${report.status}**\n\n- desktop: ${report.results.desktop.blocking.length} falha(s)\n- celular: ${report.results.mobile.blocking.length} falha(s)\n- total: ${report.blocking.length} falha(s)\n\n${report.blocking.length?'## Falhas\n\n'+report.blocking.map(x=>'- '+x).join('\n'):'Todos os testes específicos da transposição v8 foram aprovados.'}\n`;
await fs.writeFile(`${OUT}/report.md`,md);console.log(md);if(report.blocking.length)process.exitCode=1;
