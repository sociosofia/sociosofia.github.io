import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE='http://127.0.0.1:8000';
const OUT='audit/output';
const targets=[
  {id:'filosofia-1ano',path:'/alunos/filosofia-1ano/',chapters:10,subject:'Filosofia',year:'1º ano',architecture:'continuous',movements:56},
  {id:'sociologia-1ano',path:'/alunos/sociologia-1ano/',chapters:10,subject:'Sociologia',year:'1º ano'},
  {id:'sociologia-2ano',path:'/alunos/sociologia-2ano/',chapters:6,subject:'Sociologia',year:'2º ano'},
  {id:'filosofia-2ano',path:'/alunos/filosofia-2ano/',chapters:7,subject:'Filosofia',year:'2º ano'}
];
const devices=[
  {id:'desktop',viewport:{width:1366,height:900}},
  {id:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];
const report={generatedAt:new Date().toISOString(),navigation:{},targets:{},summary:{blocking:[],warnings:[]}};
await fs.mkdir(OUT,{recursive:true});
function addFailure(result,message,blocking=true){(blocking?result.blocking:result.warnings).push(message)}
function pageRange(value){const nums=String(value).match(/\d+/g)?.map(Number)||[];return {start:nums[0],end:nums.at(-1)}}

async function auditNavigation(browser){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'pt-BR'});
  const page=await context.newPage();
  const nav={blocking:[],warnings:[],interactions:[],consoleErrors:[],pageErrors:[],failedRequests:[]};
  page.on('console',m=>{if(m.type()==='error')nav.consoleErrors.push(m.text())});
  page.on('pageerror',e=>nav.pageErrors.push(String(e)));
  page.on('requestfailed',r=>{if(r.url().startsWith(BASE))nav.failedRequests.push({url:r.url(),error:r.failure()?.errorText})});
  try{
    await page.goto(`${BASE}/alunos/`,{waitUntil:'networkidle',timeout:60000});
    await page.waitForSelector('button.choice',{timeout:30000});
    await page.getByRole('button',{name:/SESI Rio Claro/i}).click(); nav.interactions.push('SESI Rio Claro');
    await page.getByRole('button',{name:/2º ano/i}).click(); nav.interactions.push('2º ano');
    await page.getByRole('button',{name:/Filosofia/i}).click(); nav.interactions.push('Filosofia');
    const chapterLinks=page.locator('a.chapter-link');
    nav.chapterLinks=await chapterLinks.count();
    if(nav.chapterLinks!==7) nav.blocking.push(`Navegação de Filosofia 2º ano exibiu ${nav.chapterLinks} capítulos, esperado 7.`);
    nav.stageCount=await page.locator('section.stage').count();
    if(nav.stageCount!==3) nav.blocking.push(`Navegação exibiu ${nav.stageCount} etapas, esperado 3.`);
    const hrefs=await chapterLinks.evaluateAll(as=>as.map(a=>a.getAttribute('href')));
    if(!hrefs.every(h=>h?.startsWith('filosofia-2ano/#capitulo-'))) nav.blocking.push('Há links de capítulo apontando para destino inesperado.');
    await page.getByRole('link',{name:/Abrir o percurso anual completo/i}).click();
    await page.waitForSelector('#site-data',{timeout:30000});
    nav.finalUrl=page.url();
    if(!nav.finalUrl.includes('/alunos/filosofia-2ano/')) nav.blocking.push(`Destino final incorreto: ${nav.finalUrl}`);
    nav.horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
    if(nav.horizontalOverflow) nav.blocking.push('Transbordamento horizontal na navegação móvel.');
    await page.screenshot({path:`${OUT}/navegacao-sesi-rc-mobile.png`,fullPage:true});
  }catch(error){nav.blocking.push(`Falha fatal de navegação: ${error}`)}
  if(nav.consoleErrors.length) nav.blocking.push(`${nav.consoleErrors.length} erro(s) de console na navegação.`);
  if(nav.pageErrors.length) nav.blocking.push(`${nav.pageErrors.length} erro(s) de página na navegação.`);
  if(nav.failedRequests.length) nav.blocking.push(`${nav.failedRequests.length} recurso(s) local(is) não carregado(s).`);
  await context.close(); report.navigation=nav;
}

async function auditContinuousPage(page,target,result){
  await page.waitForSelector('.stage-block',{timeout:30000});
  result.checks.architecture='continuous';
  result.checks.stageSections=await page.locator('section.stage-block[id^="etapa-"]').count();
  result.checks.chapterSections=await page.locator('section.chapter[id^="capitulo-"]').count();
  result.checks.movements=await page.locator('article.movement').count();
  result.checks.entityCards=await page.locator('details.entity').count();
  result.checks.h1Home=await page.locator('h1').count();
  result.checks.publicText=(await page.locator('body').innerText()).slice(0,40000);
  result.checks.horizontalOverflowHome=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  if(result.checks.stageSections!==3) addFailure(result,`Leitura contínua exibiu ${result.checks.stageSections} etapas, esperado 3.`);
  if(result.checks.chapterSections!==target.chapters) addFailure(result,`Leitura contínua exibiu ${result.checks.chapterSections} capítulos, esperado ${target.chapters}.`);
  if(result.checks.movements!==target.movements) addFailure(result,`Leitura contínua exibiu ${result.checks.movements} movimentos, esperado ${target.movements}.`);
  if(!result.checks.entityCards) addFailure(result,'Leitura contínua não possui fichas expansíveis.');
  if(result.checks.h1Home!==1) addFailure(result,`Leitura contínua possui ${result.checks.h1Home} títulos h1, esperado 1.`);
  if(result.checks.horizontalOverflowHome) addFailure(result,'Transbordamento horizontal na leitura contínua.');
  const forbidden=/(rascunho|revisão editorial|não publicado|orientações didáticas|pendência editorial|HAB-SESI|EM\.\d{2}\.FIL|EM\.\d{2}\.SOC|SOC-0007|SOC-0008|Fraunces|#5B2E91|#51425F|#3E1C68)/i;
  if(forbidden.test(result.checks.publicText)) addFailure(result,'Texto público contém marca de bastidor ou identidade visual proibida.');
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id).filter(Boolean));
  if(new Set(ids).size!==ids.length) addFailure(result,'Há IDs duplicados na leitura contínua.');
  const brokenAnchors=await page.evaluate(()=>{
    const ids=new Set([...document.querySelectorAll('[id]')].map(node=>node.id));
    return [...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>id&&!ids.has(id));
  });
  if(brokenAnchors.length) addFailure(result,`Links internos sem destino: ${brokenAnchors.slice(0,10).join(', ')}.`);
  const firstDetails=page.locator('details.entity').first();
  await firstDetails.locator('summary').click(); result.interactions.push('abriu ficha expansível');
  if(!(await firstDetails.evaluate(node=>node.open))) addFailure(result,'Ficha expansível não abriu.');
  const detailsText=(await firstDetails.innerText()).trim();
  if(detailsText.length<80) addFailure(result,'Ficha expansível não apresentou conteúdo suficiente.');
  await firstDetails.locator('summary').click();
  if(await firstDetails.evaluate(node=>node.open)) addFailure(result,'Ficha expansível não fechou.');
  await page.goto(`${BASE}${target.path}#capitulo-${target.chapters}`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector(`#capitulo-${target.chapters} .movement`,{timeout:30000}); result.interactions.push('abriu último capítulo por URL');
  result.checks.lastChapterTitle=await page.locator(`#capitulo-${target.chapters} > h2`).innerText();
  result.checks.horizontalOverflowChapter=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  if(result.checks.horizontalOverflowChapter) addFailure(result,'Transbordamento horizontal no último capítulo.');
}

async function auditInteractivePage(page,target,result){
  await page.waitForSelector('#site-data',{timeout:30000});
  await page.waitForSelector('.chapter-card',{timeout:30000});
  const data=await page.evaluate(()=>JSON.parse(document.getElementById('site-data').textContent));
  result.checks.architecture='interactive';
  result.checks.meta=data.meta;
  result.checks.chapterCards=await page.locator('.chapter-card').count();
  result.checks.stageSections=await page.locator('.stage-section[id^="etapa-"]').count();
  result.checks.modeLabels=await page.locator('.mode strong').allTextContents();
  result.checks.horizontalOverflowHome=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  result.checks.h1Home=await page.locator('h1').count();
  result.checks.publicText=(await page.locator('body').innerText()).slice(0,20000);
  if(data.meta.chapter_count!==target.chapters || data.chapters.length!==target.chapters) addFailure(result,`Capítulos: meta=${data.meta.chapter_count}, dados=${data.chapters.length}, esperado=${target.chapters}.`);
  if(data.meta.subject!==target.subject) addFailure(result,`Componente incorreto: ${data.meta.subject}.`);
  if(data.meta.year!==target.year) addFailure(result,`Ano incorreto: ${data.meta.year}.`);
  if(result.checks.chapterCards!==target.chapters) addFailure(result,`Mapa anual exibiu ${result.checks.chapterCards} cards, esperado ${target.chapters}.`);
  if(result.checks.stageSections!==3) addFailure(result,`Mapa anual exibiu ${result.checks.stageSections} etapas, esperado 3.`);
  const expectedModes=['Ler antes da aula','Acompanhar o capítulo','Retomar para avaliação'];
  if(!expectedModes.every(x=>result.checks.modeLabels.includes(x))) addFailure(result,'Os três modos de uso não estão íntegros.');
  if(result.checks.horizontalOverflowHome) addFailure(result,'Transbordamento horizontal no mapa anual.');
  const chapterNumbers=data.chapters.map(c=>c.number);
  if(new Set(chapterNumbers).size!==chapterNumbers.length) addFailure(result,'Há números de capítulo duplicados.');
  for(const chapter of data.chapters){const movementIds=chapter.movements.map(m=>m.id);if(new Set(movementIds).size!==movementIds.length)addFailure(result,`Há IDs de movimentos duplicados no capítulo ${chapter.number}.`);}
  const missing=[]; const missingOccurrences=[];
  for(const chapter of data.chapters) for(const movement of chapter.movements) for(const id of movement.cards||[]){
    if(!data.entities[id]) missing.push(`${chapter.number}:${movement.id}:${id}`);
    else if(!data.entities[id].occurrences?.[String(chapter.number)]) missingOccurrences.push(`${chapter.number}:${movement.id}:${id}`);
  }
  if(missing.length) addFailure(result,`Fichas inexistentes referenciadas: ${missing.slice(0,10).join(', ')}`);
  if(missingOccurrences.length) addFailure(result,`Fichas sem ocorrência contextual: ${missingOccurrences.slice(0,10).join(', ')}`);
  const entityIds=Object.keys(data.entities);
  if(data.meta.entity_count!==entityIds.length) addFailure(result,`Contagem de fichas divergente: meta=${data.meta.entity_count}, real=${entityIds.length}.`);
  const badConnections=[];
  for(const entity of Object.values(data.entities)) for(const occurrence of Object.values(entity.occurrences||{})) for(const id of occurrence.connections||[]) if(!data.entities[id]) badConnections.push(`${entity.id}->${id}`);
  if(badConnections.length) addFailure(result,`Conexões sem destino: ${badConnections.slice(0,10).join(', ')}`,false);
  const ranges=data.chapters.map(c=>pageRange(c.pages));
  for(let i=1;i<ranges.length;i++) if(ranges[i].start!==ranges[i-1].end+1) addFailure(result,`Paginação não contínua entre capítulos ${i} e ${i+1}: ${data.chapters[i-1].pages} → ${data.chapters[i].pages}.`,false);
  const forbidden=/(rascunho|revisão editorial|não publicado|orientações didáticas|pendência editorial|HAB-SESI|EM\.\d{2}\.FIL|EM\.\d{2}\.SOC)/i;
  if(forbidden.test(result.checks.publicText)) addFailure(result,'Texto público contém marca de bastidor editorial.');
  await page.locator('.chapter-card').first().click(); result.interactions.push('abriu primeiro capítulo');
  await page.waitForSelector('.movement');
  result.checks.movementsFirst=await page.locator('.movement').count();
  if(!result.checks.movementsFirst) addFailure(result,'Primeiro capítulo não exibiu movimentos.');
  result.checks.chapterModes=await page.locator('.chapter-modes button').count();
  if(result.checks.chapterModes!==3) addFailure(result,'Capítulo não preservou os três modos de uso.');
  const entityButton=page.locator('.entity-btn').first();
  if(await entityButton.count()){
    await entityButton.click(); result.interactions.push('abriu ficha contextual'); await page.waitForSelector('#drawer.open');
    const drawerText=await page.locator('#drawer').textContent();
    for(const label of ['Em poucas palavras','Localização neste capítulo','Como aparece neste capítulo','Um exemplo','É fácil confundir']) if(!drawerText.includes(label)) addFailure(result,`Ficha contextual não exibe “${label}”.`);
    await page.keyboard.press('Escape'); if(await page.locator('#drawer.open').count()) addFailure(result,'Ficha não fechou com Escape.');
  } else addFailure(result,'Primeiro capítulo não possui ficha contextual acionável.');
  await page.goto(`${BASE}${target.path}`,{waitUntil:'networkidle'}); await page.waitForSelector('#busca');
  const query=Object.values(data.entities)[0]?.title||target.subject; await page.locator('#busca').fill(query); await page.waitForTimeout(250);
  result.checks.searchResults=await page.locator('.search-result').count();
  if(!result.checks.searchResults) addFailure(result,`Busca por ${query} não retornou resultados.`);
  await page.goto(`${BASE}${target.path}#capitulo-${target.chapters}`,{waitUntil:'networkidle'}); await page.waitForSelector('.movement'); result.interactions.push('abriu último capítulo por URL');
  result.checks.lastChapterTitle=await page.locator('.chapter-book h2').innerText();
  result.checks.horizontalOverflowChapter=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  if(result.checks.horizontalOverflowChapter) addFailure(result,'Transbordamento horizontal no capítulo.');
}

async function auditAnnual(browser,target,device){
  const context=await browser.newContext({...device,locale:'pt-BR'});
  const page=await context.newPage();
  const result={blocking:[],warnings:[],consoleErrors:[],pageErrors:[],failedRequests:[],checks:{},axe:[],interactions:[]};
  page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text())});
  page.on('pageerror',e=>result.pageErrors.push(String(e)));
  page.on('requestfailed',r=>{if(r.url().startsWith(BASE))result.failedRequests.push({url:r.url(),error:r.failure()?.errorText})});
  try{
    await page.goto(`${BASE}${target.path}`,{waitUntil:'networkidle',timeout:60000});
    if(target.architecture==='continuous') await auditContinuousPage(page,target,result);
    else await auditInteractivePage(page,target,result);
    const axe=await new AxeBuilder({page}).analyze();
    result.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,description:v.description}));
    const serious=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
    if(serious.length) addFailure(result,`Acessibilidade: ${serious.length} violação(ões) séria(s)/crítica(s): ${serious.map(v=>v.id).join(', ')}.`,false);
    await page.screenshot({path:`${OUT}/${target.id}-${device.id}-ultimo-capitulo.png`,fullPage:true});
  }catch(error){addFailure(result,`Falha fatal: ${error}`)}
  if(result.consoleErrors.length) addFailure(result,`${result.consoleErrors.length} erro(s) de console.`);
  if(result.pageErrors.length) addFailure(result,`${result.pageErrors.length} erro(s) de página.`);
  if(result.failedRequests.length) addFailure(result,`${result.failedRequests.length} recurso(s) local(is) não carregado(s).`);
  await context.close(); return result;
}

const browser=await chromium.launch({headless:true});
await auditNavigation(browser);
for(const target of targets){report.targets[target.id]={};for(const device of devices)report.targets[target.id][device.id]=await auditAnnual(browser,target,device)}
await browser.close();
for(const [id,devicesData] of Object.entries(report.targets)) for(const [device,result] of Object.entries(devicesData)){
  report.summary.blocking.push(...result.blocking.map(x=>`${id}/${device}: ${x}`)); report.summary.warnings.push(...result.warnings.map(x=>`${id}/${device}: ${x}`));
}
report.summary.blocking.push(...(report.navigation.blocking||[]).map(x=>`navegação: ${x}`)); report.summary.warnings.push(...(report.navigation.warnings||[]).map(x=>`navegação: ${x}`));
report.summary.status=report.summary.blocking.length?'FALHOU':'APROVADO';
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
let md=`# Auditoria de fechamento — SESI Rio Claro\n\nGerada em ${report.generatedAt}.\n\n## Resultado\n\n**${report.summary.status}**\n\n- falhas bloqueantes: ${report.summary.blocking.length}\n- alertas não bloqueantes: ${report.summary.warnings.length}\n\n`;
if(report.summary.blocking.length)md+=`## Falhas bloqueantes\n\n${report.summary.blocking.map(x=>`- ${x}`).join('\n')}\n\n`;
if(report.summary.warnings.length)md+=`## Alertas\n\n${report.summary.warnings.map(x=>`- ${x}`).join('\n')}\n\n`;
md+=`## Percursos testados\n\n${targets.map(t=>`- ${t.subject} — ${t.year}: ${t.chapters} capítulos — desktop e celular — arquitetura ${t.architecture||'interativa'}`).join('\n')}\n\n`;
md+=`## Navegação institucional\n\n- caminho: SESI Rio Claro → 2º ano → Filosofia → percurso anual\n- interações: ${(report.navigation.interactions||[]).join(' → ')}\n- capítulos encontrados: ${report.navigation.chapterLinks??'n/a'}\n- etapas encontradas: ${report.navigation.stageCount??'n/a'}\n`;
await fs.writeFile(`${OUT}/report.md`,md); console.log(md); if(report.summary.blocking.length)process.exitCode=1;
