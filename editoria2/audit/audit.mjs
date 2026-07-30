import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const BASE='http://127.0.0.1:8000';
const targets=[{id:'atual',url:`${BASE}/alunos/`},{id:'editoria2',url:`${BASE}/editoria2/`}];
const devices=[{id:'desktop',viewport:{width:1366,height:900}},{id:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
const report={generatedAt:new Date().toISOString(),targets:{}};
await fs.mkdir('editoria2/audit/output',{recursive:true});

async function axe(page){
  const a=await new AxeBuilder({page}).analyze();
  return {count:a.violations.length,violations:a.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))}))};
}
async function clickAny(page,pattern,label,result){
  const candidates=[page.getByRole('button',{name:pattern}).first(),page.getByRole('link',{name:pattern}).first(),page.getByText(pattern,{exact:false}).first()];
  for(const loc of candidates){
    if(await loc.count() && await loc.isVisible().catch(()=>false)){
      await loc.click();await page.waitForTimeout(250);result.interactions.push(label);return true;
    }
  }
  result.interactions.push(`não encontrou: ${label}`);return false;
}
async function baseChecks(page){
  return {
    title:await page.title(),h1Count:await page.locator('h1').count(),mainCount:await page.locator('main').count(),
    buttonCount:await page.locator('button').count(),linkCount:await page.locator('a').count(),
    visibleTextLength:(await page.locator('body').innerText()).length,
    horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2),
    viewport:await page.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,clientHeight:document.documentElement.clientHeight,scrollHeight:document.documentElement.scrollHeight})),
    unnamedButtons:await page.locator('button').evaluateAll(bs=>bs.filter(b=>!(b.getAttribute('aria-label')||b.innerText.trim()||b.title)).length),
    unnamedLinks:await page.locator('a').evaluateAll(as=>as.filter(a=>!(a.getAttribute('aria-label')||a.innerText.trim()||a.title)).length)
  };
}

for(const target of targets){
  report.targets[target.id]={};
  for(const device of devices){
    const browser=await chromium.launch({headless:true});
    const context=await browser.newContext({...device,locale:'pt-BR'});
    const page=await context.newPage();
    const result={url:target.url,device:device.id,consoleErrors:[],pageErrors:[],failedRequests:[],checks:{},interactions:[],axe:{}};
    page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text())});
    page.on('pageerror',e=>result.pageErrors.push(String(e)));
    page.on('requestfailed',r=>result.failedRequests.push({url:r.url(),error:r.failure()?.errorText||''}));
    try{
      await page.goto(target.url,{waitUntil:'networkidle',timeout:60000});await page.waitForTimeout(1000);
      result.checks.initial=await baseChecks(page);result.axe.initial=await axe(page);
      await page.screenshot({path:`editoria2/audit/output/${target.id}-${device.id}-home.png`,fullPage:true});

      if(target.id==='atual'){
        result.checks.loadedBeyondSpinner=!/Carregando a Área do Estudante/i.test(await page.locator('body').innerText());
        await clickAny(page,/SESI Rio Claro/i,'abriu SESI Rio Claro',result);
        await clickAny(page,/2º ano/i,'abriu 2º ano',result);
        await clickAny(page,/Sociologia/i,'abriu Sociologia',result);
        await clickAny(page,/3ª etapa/i,'abriu 3ª etapa',result);
        await clickAny(page,/Capítulo 5/i,'abriu capítulo 5',result);
        result.checks.chapter=await baseChecks(page);result.checks.chapterText=(await page.locator('body').innerText()).slice(0,1400);
        const search=page.locator('input[type="search"],#busca').first();
        if(await search.count()&&await search.isVisible().catch(()=>false)){await search.fill('Marx');await page.waitForTimeout(300);result.interactions.push('buscou Marx');result.checks.searchFound=/Karl Marx/i.test(await page.locator('body').innerText())}
        const entity=page.getByRole('button',{name:/Karl Marx|Movimentos sociais|Sociedade civil e ação coletiva/i}).first();
        if(await entity.count()&&await entity.isVisible().catch(()=>false)){await entity.click();await page.waitForTimeout(250);result.interactions.push('abriu ficha');result.checks.drawerOpen=await page.locator('.drawer.open,[role="dialog"]:visible').count();result.axe.drawer=await axe(page);await page.keyboard.press('Escape');result.interactions.push('fechou ficha com Escape')}
        result.checks.savedState=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
      }else{
        await clickAny(page,/1ª etapa/i,'abriu 1ª etapa',result);
        await clickAny(page,/Capítulo 1/i,'abriu capítulo 1',result);
        await clickAny(page,/Movimento 2/i,'abriu movimento 2',result);
        const entity=page.locator('.entity-btn').first();
        if(await entity.count()){await entity.click();await page.waitForTimeout(250);result.interactions.push('abriu ficha reutilizável');result.checks.drawerOpen=await page.locator('#drawer.open').count();result.checks.drawerText=(await page.locator('#drawer').innerText()).slice(0,700);result.axe.drawer=await axe(page);await page.keyboard.press('Escape');result.interactions.push('fechou ficha com Escape');result.checks.drawerClosed=await page.locator('#drawer.open').count()===0}
        result.checks.savedState=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
        await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(400);
        result.checks.resumedAfterReload=/Capítulo 1/.test(await page.locator('body').innerText())&&/Nação e povo/.test(await page.locator('body').innerText());
        await page.getByRole('button',{name:/Sociosofia/i}).first().click().catch(()=>{});await page.waitForTimeout(250);
        const search=page.locator('#busca').first();
        if(await search.count()&&await search.isVisible().catch(()=>false)){await search.fill('Marx');await page.keyboard.press('Enter');await page.waitForTimeout(300);result.interactions.push('buscou Marx');result.checks.searchFound=/Karl Marx/i.test(await page.locator('body').innerText())}
      }
      result.checks.final=await baseChecks(page);result.axe.final=await axe(page);
      await page.screenshot({path:`editoria2/audit/output/${target.id}-${device.id}-final.png`,fullPage:true});
    }catch(error){result.fatal=String(error)}
    report.targets[target.id][device.id]=result;await browser.close();
  }
}
await fs.writeFile('editoria2/audit/output/report.json',JSON.stringify(report,null,2));
let md=`# Auditoria funcional comparativa — rodada aprofundada\n\nGerada em ${report.generatedAt}.\n\n`;
for(const [target,ds] of Object.entries(report.targets))for(const [device,r] of Object.entries(ds))md+=`## ${target} · ${device}\n\n- erro fatal: ${r.fatal||'nenhum'}\n- console: ${r.consoleErrors.length}\n- página: ${r.pageErrors.length}\n- requisições falhas: ${r.failedRequests.length}\n- interações: ${r.interactions.join('; ')}\n- overflow inicial/final: ${r.checks.initial?.horizontalOverflow}/${r.checks.final?.horizontalOverflow}\n- Axe inicial/final/gaveta: ${r.axe.initial?.count}/${r.axe.final?.count}/${r.axe.drawer?.count??'n/a'}\n- retomada: ${r.checks.resumedAfterReload??'n/a'}\n- busca: ${r.checks.searchFound??'não executada'}\n\n`;
await fs.writeFile('editoria2/audit/output/report.md',md);console.log(md);
