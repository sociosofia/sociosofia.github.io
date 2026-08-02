import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const legacy=JSON.parse(await readFile(new URL('data/publicacao-legado.json',root),'utf8'));
const repertorios=JSON.parse(await readFile(new URL('data/repertorios.json',root),'utf8'));
const proposals=JSON.parse(await readFile(new URL('data/propostas-migracao-legado-lote1-v1.json',root),'utf8'));

assert(legacy.estado_publico==='publicado_legado','O registro do legado precisa usar publicado_legado.');
assert(Array.isArray(legacy.ids),'A lista de IDs do legado não foi encontrada.');
assert(legacy.ids.length===33,'A fachada pública legada deve preservar 33 itens.');
assert(new Set(legacy.ids).size===legacy.ids.length,'Há IDs duplicados no registro do legado.');
assert(legacy.ids.filter(id=>id.startsWith('DAD-')).length===7,'O legado deve preservar 7 cards DAD.');
assert(legacy.ids.filter(id=>id.startsWith('CUL-')).length===26,'O legado deve preservar 26 cards CUL.');

const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
for(const id of legacy.ids){
  const item=repertoryMap.get(id);
  assert(item,`O ID legado ${id} não existe em data/repertorios.json.`);
  assert(item.status!=='arquivado',`O ID arquivado ${id} não pode permanecer público.`);
}

const unlisted=repertorios.filter(item=>item.status!=='publicado'&&!legacy.ids.includes(item.id));
assert(unlisted.length===0,'Há itens legados fora do registro transitório: '+unlisted.map(item=>item.id).join(', '));

assert(proposals.status==='em_revisao','O piloto deve permanecer em revisão.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O piloto deve conter exatamente três propostas.');
const expected=['DAD-0004','DAD-0007','CUL-0003'];
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'Os IDs do piloto foram alterados.');

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu o estado público transitório.`);
  assert(item.status_editorial_proposto==='em_revisao',`${item.id} não está em revisão.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  assert(item.fonte_nome&&item.fonte_url&&item.ano_data,`${item.id} não possui referência completa.`);
  if(item.id.startsWith('DAD-')){
    for(const field of ['dado','contextualizacao','interpretacao_sociosofia','questao']){
      assert(item[field],`${item.id} não possui ${field}.`);
    }
  }else{
    for(const field of ['resumo_obra','leitura_sociosofia','ancoragem_teorica']){
      assert(item[field],`${item.id} não possui ${field}.`);
    }
  }
}

console.log('Registro público do legado e piloto de migração validados.');
