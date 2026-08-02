import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=await read('data/propostas-migracao-legado-lote2-v1.json');
const themes=await read('data/temas.json');
const legacy=await read('data/publicacao-legado.json');
const repertorios=await read('data/repertorios.json');
const publicacoes=await read('data/publicacoes.json');
const culturais=await read('data/repertorios-canonicos.json');

assert(proposals.status==='em_revisao','O segundo lote editorial deve permanecer em revisão até a migração pública separada.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O segundo lote deve conter exatamente três propostas.');

const expected=['DAD-0002','DAD-0006','CUL-0001'];
const actual=proposals.propostas.map(item=>item.id);
assert(JSON.stringify(actual)===JSON.stringify(expected),'Os IDs ou sua ordem foram alterados.');
assert(new Set(actual).size===actual.length,'Há IDs duplicados nas propostas.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const canonicalIds=new Set([...publicacoes,...culturais].map(item=>item.id));

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu a preservação transitória.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão técnica antes da migração.`);
  assert(legacyIds.has(item.id),`${item.id} não está no registro publicado_legado.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo legado.`);
  assert(!canonicalIds.has(item.id),`${item.id} já existe em base canônica e seria duplicado.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  for(const themeId of item.tema_ids)assert(themeIds.has(themeId),`${item.id} usa tema inexistente: ${themeId}.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} contém relação autoral apresentada como pronta.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);

  if(item.id.startsWith('DAD-')){
    for(const field of ['dado','contextualizacao','interpretacao_sociosofia','questao']){
      assert(String(item[field]||'').trim(),`${item.id} não possui ${field}.`);
    }
    assert(item.dado!==item.contextualizacao,`${item.id} repete dado e contextualização.`);
  }else{
    for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica','cuidado_pedagogico','questao']){
      assert(String(item[field]||'').trim(),`${item.id} não possui ${field}.`);
    }
  }
}

const mental=proposals.propostas.find(item=>item.id==='DAD-0002');
assert(mental.dado.includes('64%'),'DAD-0002 perdeu o dado dominante de 64%.');
assert(mental.contextualizacao.includes('educação básica privada'),'DAD-0002 não explicita o recorte privado.');
assert(mental.contextualizacao.includes('autorrelatados'),'DAD-0002 não explicita o caráter autorrelatado.');
assert(mental.contextualizacao.includes('não constituem diagnóstico clínico'),'DAD-0002 não separa percepção e diagnóstico.');

const iels=proposals.propostas.find(item=>item.id==='DAD-0006');
assert(iels.titulo==='Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana','DAD-0006 perdeu o título editorial aprovado por Luiz.');
assert(!iels.titulo.includes('recorte brasileiro'),'DAD-0006 voltou a antecipar a metodologia no título.');
assert(iels.dado.includes('14%')&&iels.dado.includes('54%'),'DAD-0006 perdeu a comparação central.');
for(const state of ['Ceará','Pará','São Paulo'])assert(iels.contextualizacao.includes(state),`DAD-0006 não registra ${state}.`);
assert(iels.contextualizacao.includes('não para o Brasil inteiro'),'DAD-0006 não limita a abrangência territorial.');
assert(iels.interpretacao_sociosofia.includes('não deve ser usada para culpar famílias'),'DAD-0006 perdeu a mediação contra culpabilização familiar.');

const joker=proposals.propostas.find(item=>item.id==='CUL-0001');
assert(joker.cuidado_pedagogico.includes('Não usar o filme como evidência'),'CUL-0001 perdeu o cuidado pedagógico central.');
assert(joker.leitura_sociosofia.includes('nem provam que pessoas em sofrimento mental sejam violentas'),'CUL-0001 voltou a associar sofrimento mental e violência de forma automática.');

console.log('Segundo trio editorial validado, com título do DAD-0006 aprovado e publicação ainda bloqueada.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
