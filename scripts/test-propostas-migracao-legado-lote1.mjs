import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=JSON.parse(await readFile(new URL('data/propostas-migracao-legado-lote1-v1.json',root),'utf8'));
const themes=JSON.parse(await readFile(new URL('data/temas.json',root),'utf8'));
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const repertorios=JSON.parse(await readFile(new URL('data/repertorios.json',root),'utf8'));
const publicacoes=JSON.parse(await readFile(new URL('data/publicacoes.json',root),'utf8'));

assert(proposals.status==='em_revisao','O lote editorial deve permanecer em revisão.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O lote deve conter exatamente três propostas.');

const expected=['DAD-0004','DAD-0007','CUL-0003'];
const actual=proposals.propostas.map(item=>item.id);
assert(JSON.stringify(actual)===JSON.stringify(expected),'Os IDs ou sua ordem foram alterados.');
assert(new Set(actual).size===actual.length,'Há IDs duplicados nas propostas.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const publicIds=new Set(publicacoes.map(item=>item.id));

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu a preservação transitória.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão.`);
  assert(legacyIds.has(item.id),`${item.id} não está no registro publicado_legado.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo legado.`);
  assert(repertoryMap.get(item.id).status!=='arquivado',`${item.id} está arquivado no acervo legado.`);
  assert(!publicIds.has(item.id),`${item.id} já existe na base canônica e seria duplicado.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  for(const themeId of item.tema_ids)assert(themeIds.has(themeId),`${item.id} usa tema inexistente: ${themeId}.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} contém relação autoral apresentada como pronta.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);

  if(item.id.startsWith('DAD-')){
    for(const field of ['dado','contextualizacao','interpretacao_sociosofia','questao']){
      assert(String(item[field]||'').trim(),`${item.id} não possui ${field}.`);
    }
  }else{
    for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica']){
      assert(String(item[field]||'').trim(),`${item.id} não possui ${field}.`);
    }
  }
}

console.log('Trio editorial do lote 1 validado e mantido fora da publicação canônica.');
