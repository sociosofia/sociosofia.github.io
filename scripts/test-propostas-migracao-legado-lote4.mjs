import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [proposals,themes,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/propostas-migracao-legado-lote4-v1.json'),read('data/temas.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);

const expected=['DAD-0003','CUL-0004','CUL-0005'];
assert(proposals.status==='aprovado','O quarto lote deve registrar aprovação editorial.');
assert(JSON.stringify(proposals.propostas.map(item=>item.id))===JSON.stringify(expected),'As propostas não correspondem ao quarto trio.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const migrationFlags=[dataIds.has('DAD-0003'),culturalIds.has('CUL-0004'),culturalIds.has('CUL-0005')];
assert(migrationFlags.every(Boolean)||migrationFlags.every(flag=>!flag),'O quarto lote ficou parcialmente migrado.');
const migrated=migrationFlags.every(Boolean);

if(migrated){
  assert(
    (legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5)||
    (legacy.ids.length===18&&publicacoes.length===12&&cultural.length===8)||
    (legacy.ids.length===12&&publicacoes.length===12&&cultural.length===14),
    'As contagens após a migração do quarto lote ou após lotes culturais posteriores estão incorretas.'
  );
  for(const id of expected)assert(!legacyIds.has(id),`${id} permaneceu no legado após a migração.`);
}else{
  assert(legacy.ids.length===24&&publicacoes.length===11&&cultural.length===3,'As contagens anteriores à migração do quarto lote estão incorretas.');
  for(const id of expected)assert(legacyIds.has(id),`${id} deixou o legado antes da migração.`);
}

for(const item of proposals.propostas){
  assert(item.status_editorial_proposto==='aprovado',`${item.id} não registra aprovação editorial.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo original.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.every(id=>themeIds.has(id)),`${item.id} usa tema inexistente.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral pronta.`);
  assert(Array.isArray(item.relacoes_pendentes)&&item.relacoes_pendentes.length>0,`${item.id} não registra relações pendentes.`);
}

const school=proposals.propostas.find(item=>item.id==='DAD-0003');
assert(school.titulo==='18% dos estudantes ouvidos disseram sentir medo frequente de outros alunos','DAD-0003 perdeu o título aprovado.');
assert(school.contextualizacao.includes('945.481 estudantes dos anos finais do ensino fundamental'),'DAD-0003 perdeu o universo pesquisado.');
assert(school.contextualizacao.includes('três meses anteriores'),'DAD-0003 perdeu a janela temporal.');
assert(school.contextualizacao.includes('autoriza classificar todas as experiências como bullying'),'DAD-0003 perdeu a ressalva contra classificação automática.');

const truman=proposals.propostas.find(item=>item.id==='CUL-0004');
assert(truman.leitura_sociosofia.includes('consentimento'),'CUL-0004 perdeu o eixo do consentimento.');
assert(truman.cuidado_pedagogico.includes('Não apresentar o filme como profecia literal'),'CUL-0004 perdeu o cuidado pedagógico.');

const menino=proposals.propostas.find(item=>item.id==='CUL-0005');
assert(menino.resumo_obra.includes('cinquenta meninos negros'),'CUL-0005 perdeu o recorte histórico.');
assert(menino.cuidado_pedagogico.includes('explicação externa')&&menino.cuidado_pedagogico.includes('história nacional'),'CUL-0005 perdeu a mediação sobre o racismo brasileiro.');
assert(menino.cuidado_pedagogico.includes('reconstrução documental mediada'),'CUL-0005 perdeu a mediação documental.');

console.log(migrated?'Quarto trio editorial aprovado e migrado integralmente.':'Quarto trio editorial aprovado e aguardando migração integral.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
