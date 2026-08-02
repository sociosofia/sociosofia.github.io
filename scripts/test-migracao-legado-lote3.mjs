import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}
const root=new URL('../',import.meta.url);
const [approval,history,legacy,repertorios,publicacoes,cultural]=await Promise.all([
  read('data/aprovacoes-migracao-legado-lote3-v1.json'),read('data/historico-migracao-legado-lote3-v1.json'),read('data/publicacao-legado.json'),read('data/repertorios.json'),read('data/publicacoes.json'),read('data/repertorios-canonicos.json')
]);
const expected=['DAD-0001','DAD-0005','CUL-0002'];
const dataIds=new Set(publicacoes.map(item=>item.id));
const culturalIds=new Set(cultural.map(item=>item.id));
const historyIds=new Set((history.registros||[]).map(item=>item.id));
const repertoryIds=new Set(repertorios.map(item=>item.id));
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação do terceiro lote é inválida.');
for(const id of expected){assert(!legacy.ids.includes(id),`${id} voltou ao legado.`);assert(historyIds.has(id),`${id} perdeu o histórico.`);assert(repertoryIds.has(id),`${id} deixou o acervo original.`);}
assert(dataIds.has('DAD-0001')&&dataIds.has('DAD-0005'),'Os dados do terceiro lote deixaram a base canônica.');
assert(culturalIds.has('CUL-0002'),'CUL-0002 deixou a base cultural.');
const youth=publicacoes.find(item=>item.id==='DAD-0001');assert(youth.interpretacao_sociosofia.includes('não pode ser explicado por raça como característica individual'),'DAD-0001 perdeu a mediação racial.');
const teachers=publicacoes.find(item=>item.id==='DAD-0005');assert(teachers.contextualizacao.includes('voluntária e não aleatória')&&teachers.contextualizacao.includes('pós-estratificação'),'DAD-0005 perdeu os limites amostrais.');
const getOut=cultural.find(item=>item.id==='CUL-0002');assert(getOut.cuidado_pedagogico.includes('Estados Unidos')&&getOut.cuidado_pedagogico.includes('Brasil'),'CUL-0002 perdeu a distinção entre contextos raciais.');
assert(legacy.ids.length===21&&publicacoes.length===12&&cultural.length===5,'As contagens globais após o quarto lote estão incorretas.');
assert(legacy.ids.length+publicacoes.length+cultural.length===38,'O total público deixou de ser 38.');
console.log('Terceiro lote continua íntegro após o quarto lote.');
async function read(path){return JSON.parse(await readFile(new URL(path,root),'utf8'));}
