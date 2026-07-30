import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE='http://127.0.0.1:8000';
const targets=[
  {id:'atual',url:`${BASE}/alunos/`},
  {id:'editoria2',url:`${BASE}/editoria2/`}
];
const devices=[
  {id:'desktop',viewport:{width:1366,height:900}},
  {id:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];
const report={generatedAt:new Date().toISOString(),targets:{}};
await fs.mkdir('editoria2/audit/output',{recursive:true});

function push(obj,key,value){(obj[key]??=[]).push(value)}

for(const target of targets){
  report.targets[target.id]={};
  for(const device of devices){
    const browser=await chromium.launch({headless:true});
    const context=await browser.newContext({...device,locale:'pt-BR'});
    const page=await context.newPage();
    const result={url:target.url,device:device.id,consoleErrors:[],pageErrors:[],failedRequests:[],checks:{},interactions:[],axe:{}};
    page.on('console',msg=>{if(msg.type()==='error')result.consoleErrors.push(msg.text())});
    page.on('pageerror',err=>result.pageErrors.push(String(err)));
    page.on('requestfailed',req=>result.failedRequests.push({url:req.url(),error:req.failure()?.errorText||''}));
    try{
      await page.goto(target.url,{waitUntil:'networkidle',timeout:60000});
      await page.waitForTimeout(1200);
      result.checks.title=await page.title();
      result.checks.h1Count=await page.locator('h1').count();
      result.checks.mainCount=await page.locator('main').count();
      result.checks.buttonCount=await page.locator('button').count();
      result.checks.linkCount=await page.locator('a').count();
      result.checks.visibleTextLength=(await page.locator('body').innerText()).length;
      result.checks.horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
      result.checks.viewport=await page.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,clientHeight:document.documentElement.clientHeight,scrollHeight:document.documentElement.scrollHeight}));
      result.checks.unnamedButtons=await page.locator('button').evaluateAll(btns=>btns.filter(b=>!(b.getAttribute('aria-label')||b.innerText.trim()||b.title)).length);
      result.checks.unnamedLinks=await page.locator('a').evaluateAll(links=>links.filter(a=>!(a.getAttribute('aria-label')||a.innerText.trim()||a.title)).length);
      const axe=await new AxeBuilder({page}).analyze();
      result.axe.violations=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.length}));
      result.axe.count=axe.violations.length;

      if(target.id==='editoria2'){
        const stage=page.getByRole('button',{name:/1ª etapa/i}).first();
        if(await stage.count()){await stage.click();result.interactions.push('abriu 1ª etapa')}
        const chapter=page.getByRole('button',{name:/Capítulo 1/i}).first();
        if(await chapter.count()){await chapter.click();result.interactions.push('abriu capítulo 1')}
        const mov2=page.getByRole('button',{name:/Movimento 2/i}).first();
        if(await mov2.count()){await mov2.click();result.interactions.push('abriu movimento 2')}
        const entity=page.locator('[data-entity]').first();
        if(await entity.count()){await entity.click();result.interactions.push('abriu ficha reutilizável');result.checks.entityDialogVisible=await page.locator('[role="dialog"],dialog,.drawer,.modal').filter({visible:true}).count().catch(()=>0)}
        const close=page.getByRole('button',{name:/fechar/i}).first();
        if(await close.count()){await close.click();result.interactions.push('fechou ficha')}
        const search=page.locator('input[type="search"]').first();
        if(await search.count()){await search.fill('Marx');await page.waitForTimeout(300);result.interactions.push('buscou Marx');result.checks.searchResultText=(await page.locator('body').innerText()).includes('Karl Marx')}
        result.checks.savedState=await page.evaluate(()=>Object.keys(localStorage).reduce((a,k)=>(a[k]=localStorage.getItem(k),a),{}));
        await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(500);
        result.checks.afterReloadText=(await page.locator('body').innerText()).slice(0,500);
      }else{
        const bodyText=await page.locator('body').innerText();
        result.checks.loadedBeyondSpinner=!/Carregando a Área do Estudante/i.test(bodyText)||bodyText.length>500;
        const chapter=page.getByRole('button',{name:/Capítulo 5|Capítulo 6/i}).first();
        if(await chapter.count()){await chapter.click();result.interactions.push('abriu capítulo')}
        const search=page.locator('input[type="search"]').first();
        if(await search.count()){await search.fill('Marx');await page.waitForTimeout(300);result.interactions.push('buscou Marx');result.checks.searchResultText=(await page.locator('body').innerText()).includes('Karl Marx')}
        const entity=page.locator('button').filter({hasText:/Karl Marx|Alienação|Movimentos sociais/}).first();
        if(await entity.count()){await entity.click();result.interactions.push('abriu ficha/conceito')}
        result.checks.savedState=await page.evaluate(()=>Object.keys(localStorage).reduce((a,k)=>(a[k]=localStorage.getItem(k),a),{}));
      }
      await page.screenshot({path:`editoria2/audit/output/${target.id}-${device.id}.png`,fullPage:true});
    }catch(error){result.fatal=String(error)}
    report.targets[target.id][device.id]=result;
    await browser.close();
  }
}

await fs.writeFile('editoria2/audit/output/report.json',JSON.stringify(report,null,2));
let md=`# Auditoria funcional comparativa\n\nGerada em ${report.generatedAt}.\n\n`;
for(const [target,devicesData] of Object.entries(report.targets)){
  md+=`## ${target}\n\n`;
  for(const [device,r] of Object.entries(devicesData)){
    md+=`### ${device}\n\n- erro fatal: ${r.fatal||'nenhum'}\n- erros de console: ${r.consoleErrors.length}\n- erros de página: ${r.pageErrors.length}\n- requisições falhas: ${r.failedRequests.length}\n- transbordamento horizontal: ${r.checks.horizontalOverflow}\n- violações Axe: ${r.axe.count}\n- interações: ${r.interactions.join('; ')||'nenhuma'}\n- título: ${r.checks.title||''}\n- texto visível: ${r.checks.visibleTextLength||0} caracteres\n\n`;
  }
}
await fs.writeFile('editoria2/audit/output/report.md',md);
console.log(md);
