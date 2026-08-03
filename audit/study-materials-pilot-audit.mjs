import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE='http://127.0.0.1:8000';
const OUT='audit/output-study-materials';
const report={generatedAt:new Date().toISOString(),blocking:[],warnings:[],checks:{}};
await fs.mkdir(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});

async function openPage(viewport){
  const context=await browser.newContext({viewport,locale:'pt-BR'});
  const page=await context.newPage();
  const consoleErrors=[]; const pageErrors=[]; const failedRequests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',r=>{if(r.url().startsWith(BASE))failedRequests.push(r.url())});
  await page.goto(`${BASE}/alunos/sociologia-2ano/`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector('#study-materials-launch',{timeout:30000});
  return {context,page,consoleErrors,pageErrors,failedRequests};
}

const radioCard=(page,name,value)=>page.locator(`label.study-radio-card:has(input[name="${name}"][value="${value}"])`);
const checkCard=(page,name,value)=>page.locator(`label.study-check-card:has(input[name="${name}"][value="${value}"])`);

async function testStageSelection(page){
  await page.getByRole('button',{name:'Criar material'}).click();
  await radioCard(page,'scope','stage').click();
  await page.locator('select[name="stage"]').selectOption('3ª etapa');
  await radioCard(page,'stageMode','selected').click();
  const available=await page.locator('input[name="stageChapters"]').evaluateAll(xs=>xs.map(x=>Number(x.value)));
  report.checks.stage3AvailableChapters=available;
  if(JSON.stringify(available)!==JSON.stringify([5,6])) report.blocking.push(`Etapa 3 ofereceu capítulos ${available.join(', ')}, esperado 5 e 6.`);
  await checkCard(page,'stageChapters','5').click();
  await checkCard(page,'stageChapters','6').click();
  await radioCard(page,'materialType','revisao_prova').click();
  await page.getByRole('button',{name:'Gerar material'}).click();
  await page.locator('#study-material-result:not([hidden])').waitFor({state:'visible',timeout:10000});
  const text=await page.locator('#study-material-document').innerText();
  if(!text.includes('Capítulo 5')||!text.includes('Capítulo 6')) report.blocking.push('Revisão da etapa não incluiu os dois capítulos selecionados.');
  if(text.includes('Capítulo 4')) report.blocking.push('Revisão da etapa incluiu capítulo de outra etapa.');
  if(!text.includes('Revisão para a prova')) report.blocking.push('Tipo de material de revisão não foi projetado corretamente.');
}

async function testMovementSelection(page){
  await page.getByRole('button',{name:'Alterar seleção'}).click();
  await page.locator('#study-material-form:not([hidden])').waitFor({state:'visible',timeout:10000});
  await radioCard(page,'scope','chapter').click();
  await page.locator('select[name="chapter"]').selectOption('6');
  await radioCard(page,'chapterMode','selected').click();
  const chapter6Ids=await page.locator('input[name="chapterMovements"]').evaluateAll(xs=>xs.map(x=>x.value));
  if(chapter6Ids.length!==6||!chapter6Ids.every(id=>id.startsWith('c6-'))) report.blocking.push('Seleção de movimentos do capítulo 6 contém movimentos de outro capítulo.');
  const movementCards=page.locator('label.study-check-card:has(input[name="chapterMovements"])');
  await movementCards.nth(1).click();
  await movementCards.nth(3).click();
  await radioCard(page,'materialType','lista_exercicios').click();
  await page.getByRole('button',{name:'Gerar material'}).click();
  await page.locator('#study-material-result:not([hidden])').waitFor({state:'visible',timeout:10000});
  const text=await page.locator('#study-material-document').innerText();
  if(!text.includes('movimentos 2, 4')) report.blocking.push('Escopo do material não registrou os movimentos selecionados.');
  const questionCount=await page.locator('.study-exercise-list>li').count();
  report.checks.exerciseCount=questionCount;
  if(questionCount<2) report.blocking.push('Lista de exercícios gerou menos de duas questões.');
  const forbidden=/(orientação ao professor|plano de aula|mediação docente|decisão editorial|para seu planejamento|privada_docente)/i;
  if(forbidden.test(text)) report.blocking.push('Material público contém linguagem de bastidor ou orientação docente.');
}

for(const device of [{id:'desktop',viewport:{width:1366,height:900}},{id:'mobile',viewport:{width:390,height:844}}]){
  const session=await openPage(device.viewport);
  try{
    await testStageSelection(session.page);
    if(device.id==='desktop') await testMovementSelection(session.page);
    const axe=await new AxeBuilder({page:session.page}).analyze();
    const serious=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
    if(serious.length) report.warnings.push(`${device.id}: ${serious.length} violação(ões) séria(s)/crítica(s): ${serious.map(v=>v.id).join(', ')}.`);
    await session.page.screenshot({path:`${OUT}/materiais-${device.id}.png`,fullPage:true});
  }catch(error){
    const formError=await session.page.locator('#study-form-error').textContent().catch(()=>null);
    report.blocking.push(`${device.id}: ${error}${formError?` · mensagem da interface: ${formError}`:''}`);
  }
  if(session.consoleErrors.length) report.blocking.push(`${device.id}: ${session.consoleErrors.length} erro(s) de console.`);
  if(session.pageErrors.length) report.blocking.push(`${device.id}: ${session.pageErrors.length} erro(s) de página.`);
  if(session.failedRequests.length) report.blocking.push(`${device.id}: ${session.failedRequests.length} recurso(s) local(is) falhou(aram).`);
  await session.context.close();
}

await browser.close();
report.status=report.blocking.length?'FALHOU':'APROVADO';
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
const md=`# Auditoria — piloto de materiais de estudo\n\n**${report.status}**\n\n- falhas bloqueantes: ${report.blocking.length}\n- alertas: ${report.warnings.length}\n\n## Regras verificadas\n\n- capítulos limitados à etapa escolhida;\n- movimentos limitados a um único capítulo;\n- geração de revisão para prova;\n- geração de lista de exercícios;\n- ausência de linguagem docente e bastidores;\n- desktop e celular;\n- acessibilidade automatizada.\n\n${report.blocking.map(x=>`- ${x}`).join('\n')}\n${report.warnings.map(x=>`- ${x}`).join('\n')}\n`;
await fs.writeFile(`${OUT}/report.md`,md);
console.log(md);
if(report.blocking.length) process.exitCode=1;
