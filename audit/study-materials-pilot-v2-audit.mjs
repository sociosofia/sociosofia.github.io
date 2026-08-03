import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:8000';
const OUT = 'audit/output-study-materials-v2';
const report = {generatedAt:new Date().toISOString(), blocking:[], warnings:[], checks:{}};
await fs.mkdir(OUT,{recursive:true});
const browser = await chromium.launch({headless:true});

async function openPage(viewport){
  const context = await browser.newContext({viewport,locale:'pt-BR'});
  const page = await context.newPage();
  const consoleErrors=[]; const pageErrors=[]; const failedRequests=[];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
  page.on('pageerror',error=>pageErrors.push(String(error)));
  page.on('requestfailed',request=>{if(request.url().startsWith(BASE))failedRequests.push(request.url())});
  await page.goto(`${BASE}/alunos/sociologia-2ano/`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector('#study-materials-launch',{timeout:30000});
  return {context,page,consoleErrors,pageErrors,failedRequests};
}

const clickCard = async (page, text, within='dialog') => {
  const root = within === 'dialog' ? page.locator('dialog[open]') : page.locator(within);
  await root.locator('label').filter({hasText:text}).first().click();
};

async function testStageFlow(page,device){
  await page.getByRole('button',{name:'Criar material'}).click();
  await clickCard(page,'Etapa');
  const stagePathVisible = await page.locator('#study-stage-path').isVisible();
  const chapterPathHidden = await page.locator('#study-chapter-path').isHidden();
  if(!stagePathVisible||!chapterPathHidden) report.blocking.push(`${device}: a escolha Etapa não abriu somente sua barra.`);

  await clickCard(page,'3ª etapa');
  const openPanels = await page.locator('[data-stage-panel]:visible').count();
  if(openPanels!==1) report.blocking.push(`${device}: a etapa escolhida não abriu uma única barra de opções.`);

  await clickCard(page,'Selecionar capítulos');
  const stagePanel = page.locator('[data-stage-panel="3ª etapa"]');
  const available = await stagePanel.locator('input[name="stageChapters"]').evaluateAll(inputs=>inputs.map(input=>Number(input.value)));
  report.checks[`${device}Stage3Chapters`] = available;
  if(JSON.stringify(available)!==JSON.stringify([5,6])) report.blocking.push(`${device}: etapa 3 ofereceu capítulos ${available.join(', ')}, esperado 5 e 6.`);

  await stagePanel.locator('input[name="stageChapters"][value="5"]').check();
  await stagePanel.locator('input[name="stageChapters"][value="6"]').check();
  await clickCard(page,'Revisar para uma prova');
  await page.getByRole('button',{name:'Gerar material'}).click();
  const text = (await page.locator('#study-material-document').innerText()).toLocaleLowerCase('pt-BR');
  if(!text.includes('capítulo 5')||!text.includes('capítulo 6')) report.blocking.push(`${device}: revisão da etapa não incluiu os capítulos escolhidos.`);
  if(!text.includes('revisão para a prova')) report.blocking.push(`${device}: revisão não recebeu a finalidade correta.`);
  if(!text.includes('primeira versão')) report.blocking.push(`${device}: material não informa que usa somente o conteúdo existente.`);
  await page.screenshot({path:`${OUT}/revisao-etapa-${device}.png`,fullPage:true});
}

async function testMovementGap(page){
  await page.getByRole('button',{name:'Alterar seleção'}).click();
  await clickCard(page,'Capítulo');
  await page.locator('label.study-path-bar').filter({hasText:'Capítulo 6'}).click();
  const openPanels = await page.locator('[data-chapter-panel]:visible').count();
  if(openPanels!==1) report.blocking.push('desktop: o capítulo escolhido não abriu uma única barra de opções.');
  await clickCard(page,'Movimentos específicos');
  const panel = page.locator('[data-chapter-panel="6"]');
  const inputs = panel.locator('input[name="chapterMovements"]');
  const ids = await inputs.evaluateAll(items=>items.map(item=>item.value));
  if(ids.length!==6||!ids.every(id=>id.startsWith('c6-'))) report.blocking.push('desktop: a barra do capítulo 6 contém movimentos de outro capítulo.');
  await inputs.nth(1).check();
  await inputs.nth(3).check();
  const omitted = await page.evaluate(()=>{
    const data=JSON.parse(document.getElementById('site-data').textContent);
    return data.chapters.find(chapter=>chapter.number===6).movements[2];
  });
  await clickCard(page,'Treinar com exercícios');
  await page.getByRole('button',{name:'Gerar material'}).click();
  const documentText = await page.locator('#study-material-document').innerText();
  const lowered = documentText.toLocaleLowerCase('pt-BR');
  if(!lowered.includes('movimentos 2, 4')) report.blocking.push('desktop: o cabeçalho não registra os movimentos 2 e 4.');
  if(!lowered.includes('recorte não contínuo')||!documentText.includes(omitted.title)) report.blocking.push('desktop: o salto entre movimentos não foi sinalizado com o título já existente.');
  if(documentText.includes(omitted.text)) report.blocking.push('desktop: o movimento omitido foi desenvolvido apesar de não ter sido selecionado.');
  const questionCount = await page.locator('.study-exercise-list>li').count();
  report.checks.exerciseCount = questionCount;
  if(questionCount<2) report.blocking.push('desktop: lista de exercícios gerou menos de duas questões.');
  await page.screenshot({path:`${OUT}/exercicios-movimentos-descontinuos-desktop.png`,fullPage:true});
}

async function testPreClass(page){
  await page.getByRole('button',{name:'Alterar seleção'}).click();
  await page.locator('label.study-path-bar').filter({hasText:'Capítulo 5'}).click();
  await clickCard(page,'Todo o capítulo');
  await clickCard(page,'Preparar-se antes da aula');
  await page.getByRole('button',{name:'Gerar material'}).click();
  const text = (await page.locator('#study-material-document').innerText()).toLocaleLowerCase('pt-BR');
  if(!text.includes('antes da aula')||!text.includes('capítulo 5')) report.blocking.push('desktop: material antes da aula não preservou o capítulo escolhido.');
  const movementCount = await page.locator('.study-material-movements>li').count();
  report.checks.preClassMovementCount = movementCount;
  if(movementCount!==6) report.blocking.push(`desktop: capítulo 5 completo gerou ${movementCount} movimentos, esperado 6.`);
  await page.screenshot({path:`${OUT}/antes-da-aula-capitulo-desktop.png`,fullPage:true});
}

for(const device of [{id:'desktop',viewport:{width:1366,height:900}},{id:'mobile',viewport:{width:390,height:844}}]){
  const session = await openPage(device.viewport);
  try{
    await testStageFlow(session.page,device.id);
    if(device.id==='desktop'){
      await testMovementGap(session.page);
      await testPreClass(session.page);
    }
    const axe = await new AxeBuilder({page:session.page}).analyze();
    const serious = axe.violations.filter(violation=>['critical','serious'].includes(violation.impact));
    if(serious.length) report.warnings.push(`${device.id}: ${serious.length} violação(ões) séria(s)/crítica(s): ${serious.map(item=>item.id).join(', ')}.`);
  }catch(error){report.blocking.push(`${device.id}: ${error}`)}
  if(session.consoleErrors.length) report.blocking.push(`${device.id}: ${session.consoleErrors.length} erro(s) de console.`);
  if(session.pageErrors.length) report.blocking.push(`${device.id}: ${session.pageErrors.length} erro(s) de página.`);
  if(session.failedRequests.length) report.blocking.push(`${device.id}: ${session.failedRequests.length} recurso(s) local(is) falhou(aram).`);
  await session.context.close();
}

await browser.close();
report.status = report.blocking.length ? 'FALHOU' : 'APROVADO';
await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2));
const md = `# Auditoria — piloto de materiais de estudo v2\n\n**${report.status}**\n\n- falhas bloqueantes: ${report.blocking.length}\n- alertas: ${report.warnings.length}\n\n## Regras verificadas\n\n- abertura progressiva de etapas e capítulos;\n- capítulos limitados à etapa escolhida;\n- movimentos limitados ao capítulo escolhido;\n- ordem canônica preservada;\n- recortes descontínuos sinalizados sem desenvolver itens omitidos;\n- três finalidades dirigidas ao estudante;\n- conteúdo restrito à base já existente;\n- desktop, celular e acessibilidade automatizada.\n\n${report.blocking.map(item=>`- ${item}`).join('\n')}\n${report.warnings.map(item=>`- ${item}`).join('\n')}\n`;
await fs.writeFile(`${OUT}/report.md`,md);
console.log(md);
if(report.blocking.length) process.exitCode=1;
