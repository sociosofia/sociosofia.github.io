import {chromium} from 'playwright';

function assert(condition,message){if(!condition)throw new Error(message);}

const base='http://127.0.0.1:8000/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},locale:'pt-BR'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});

await page.goto(base+'index.html',{waitUntil:'networkidle'});
const snapshot=await page.evaluate(async()=>{
  const module=await import('./site-shared.js');
  const items=await module.loadItems();
  return items.map(item=>({id:item.id,status_publicacao:item.status_publicacao,bloco:item.bloco}));
});

const legacy=snapshot.filter(item=>item.status_publicacao==='publicado_legado');
const current=snapshot.filter(item=>item.status_publicacao==='publicado');
assert(legacy.length===33,`Esperados 33 itens publicado_legado; encontrados ${legacy.length}.`);
assert(current.length===5,`Esperadas 5 publicações canônicas; encontradas ${current.length}.`);
assert(snapshot.length===38,`A fachada pública deveria conter 38 itens; encontrou ${snapshot.length}.`);
assert(legacy.filter(item=>item.id.startsWith('DAD-')).length===7,'O conjunto legado perdeu cards DAD.');
assert(legacy.filter(item=>item.id.startsWith('CUL-')).length===26,'O conjunto legado perdeu cards CUL.');

for(const id of ['DAD-0004','DAD-0007','CUL-0003','DAD-0012']){
  assert(snapshot.some(item=>item.id===id),`${id} não foi carregado na fachada pública.`);
}

assert(errors.length===0,`Erros no navegador: ${errors.join(' | ')}`);
await browser.close();
console.log('Auditoria do estado publicado_legado concluída.');
