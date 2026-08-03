import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [approval,history,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/aprovacoes-migracao-legado-lote2-v1.json'),read('data/historico-migracao-legado-lote2-v1.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['DAD-0002','DAD-0006','CUL-0001'];
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set((history.itens||[]).map(item=>item.id));
const repertoryIds=new Set(repertorios.map(item=>item.id));
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação do segundo lote é inválida.');
for(const id of expected){assert(!legacy.ids.includes(id),`${id} voltou ao legado.`);assert(historyIds.has(id),`${id} perdeu o histórico.`);assert(repertoryIds.has(id),`${id} deixou o acervo original.`);}
assert(dataIds.has('DAD-0002')&&dataIds.has('DAD-0006'),'Os dados do segundo lote deixaram a base canônica.');
assert(culturalIds.has('CUL-0001'),'CUL-0001 deixou a base cultural.');
const mental=publicacoes.find(item=>item.id==='DAD-0002');assert(mental.contextualizacao.includes('educação básica privada')&&mental.contextualizacao.includes('autorrelatados'),'DAD-0002 perdeu seus limites metodológicos.');
const iels=publicacoes.find(item=>item.id==='DAD-0006');assert(iels.titulo==='Pesquisa mostra que apenas 14% dos responsáveis leem para as crianças ao menos três vezes por semana','DAD-0006 perdeu o título aprovado.');assert(iels.contextualizacao.includes('não para o Brasil inteiro'),'DAD-0006 perdeu a limitação territorial.');
const joker=cultural.find(item=>item.id==='CUL-0001');assert(joker.cuidado_pedagogico.includes('Não usar o filme como evidência'),'CUL-0001 perdeu o cuidado pedagógico.');
assert(legacy.ids.length===0&&publicacoes.length===12&&cultural.length===26,'As contagens globais após o encerramento do legado estão incorretas.');
assert(publicacoes.length+cultural.length===38,'O total público canônico deixou de ser 38.');
console.log('Segundo lote continua íntegro após o encerramento do legado.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
