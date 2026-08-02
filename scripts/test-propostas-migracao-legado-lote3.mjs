import {readFile} from 'node:fs/promises';

function assert(condition,message){if(!condition)throw new Error(message);}

const root=new URL('../',import.meta.url);
const proposals=await read('data/propostas-migracao-legado-lote3-v1.json');
const approval=await read('data/aprovacoes-migracao-legado-lote3-v1.json');
const themes=await read('data/temas.json');
const legacy=await read('data/publicacao-legado.json');
const repertorios=await read('data/repertorios.json');
const publicacoes=await read('data/publicacoes.json');
const culturais=await read('data/repertorios-canonicos.json');

assert(proposals.status==='aprovado','O terceiro lote deve registrar a aprovação editorial de Luiz.');
assert(approval.status==='aprovado'&&approval.aprovado_por==='Luiz Jácomo','A aprovação nominal do terceiro lote não foi registrada.');
assert(Array.isArray(proposals.propostas)&&proposals.propostas.length===3,'O terceiro lote deve conter exatamente três propostas.');

const expected=['DAD-0001','DAD-0005','CUL-0002'];
const actual=proposals.propostas.map(item=>item.id);
assert(JSON.stringify(actual)===JSON.stringify(expected),'Os IDs ou sua ordem foram alterados.');
assert(new Set(actual).size===actual.length,'Há IDs duplicados no terceiro lote.');
assert(JSON.stringify((approval.itens||[]).map(item=>item.id))===JSON.stringify(expected),'A aprovação não cobre exatamente o terceiro trio.');
assert(approval.itens.every(item=>item.decisao==='aprovar_migracao'),'Há item sem autorização de migração.');

const themeIds=new Set((themes.temas||[]).map(theme=>theme.id));
const legacyIds=new Set(legacy.ids||[]);
const repertoryMap=new Map(repertorios.map(item=>[item.id,item]));
const canonicalIds=new Set([...publicacoes,...culturais].map(item=>item.id));

assert(legacy.ids.length===27,'A aprovação editorial não deve alterar os 27 itens ainda publicados como legado.');
assert(publicacoes.length===9,'A aprovação editorial não deve alterar os nove dados canônicos vigentes.');
assert(culturais.length===2,'A aprovação editorial não deve alterar os dois repertórios culturais canônicos vigentes.');

for(const item of proposals.propostas){
  assert(item.estado_publico_preservado==='publicado_legado',`${item.id} perdeu a preservação transitória.`);
  assert(item.status_editorial_proposto==='aprovado',`${item.id} não está aprovado editorialmente.`);
  assert(legacyIds.has(item.id),`${item.id} não permanece no registro publicado_legado.`);
  assert(repertoryMap.has(item.id),`${item.id} não existe no acervo legado.`);
  assert(!canonicalIds.has(item.id),`${item.id} já entrou em base canônica e seria duplicado.`);
  assert(Array.isArray(item.tema_ids)&&item.tema_ids.length>0,`${item.id} não possui tema_ids.`);
  for(const themeId of item.tema_ids)assert(themeIds.has(themeId),`${item.id} usa tema inexistente: ${themeId}.`);
  assert(item.fonte_nome&&item.fonte_url?.startsWith('https://')&&item.ano_data,`${item.id} não possui referência completa.`);
  assert(Array.isArray(item.autores)&&item.autores.length===0,`${item.id} apresenta relação autoral pronta.`);
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

const youth=proposals.propostas.find(item=>item.id==='DAD-0001');
assert(youth.titulo.startsWith('Sete em cada dez jovens'),'DAD-0001 perdeu o dado racial dominante no título.');
assert(youth.dado.includes('7,9 milhões')&&youth.dado.includes('sete em cada dez'),'DAD-0001 perdeu os dois valores centrais.');
assert(youth.contextualizacao.includes('PNAD Contínua 2025'),'DAD-0001 não identifica a base do indicador.');
assert(youth.interpretacao_sociosofia.includes('não pode ser explicado por raça como característica individual'),'DAD-0001 naturaliza a desigualdade racial.');

const teachers=proposals.propostas.find(item=>item.id==='DAD-0005');
assert(teachers.titulo.includes('83% dos docentes ouvidos'),'DAD-0005 perdeu o dado dominante ou passou a sugerir censo da categoria.');
assert(teachers.contextualizacao.includes('2.597 respostas')&&teachers.contextualizacao.includes('2.215 respostas'),'DAD-0005 não registra amostra recebida e base analisada.');
assert(teachers.contextualizacao.includes('voluntária e não aleatória'),'DAD-0005 não explicita a autosseleção da amostra.');
assert(teachers.contextualizacao.includes('pós-estratificação'),'DAD-0005 não registra o ajuste amostral.');
assert(teachers.interpretacao_sociosofia.includes('não transforma estudantes ou famílias em culpados'),'DAD-0005 culpabiliza atores escolares pelo adoecimento docente.');

const getOut=proposals.propostas.find(item=>item.id==='CUL-0002');
assert(getOut.titulo==='Corra!: admiração, apropriação e controle do corpo negro','CUL-0002 perdeu o título proposto.');
assert(getOut.leitura_sociosofia.includes('não aparece apenas como rejeição explícita'),'CUL-0002 reduziu o racismo à hostilidade aberta.');
assert(getOut.cuidado_pedagogico.includes('Não tratá-la como documentário'),'CUL-0002 perdeu a distinção entre ficção e evidência empírica.');
assert(getOut.cuidado_pedagogico.includes('Estados Unidos')&&getOut.cuidado_pedagogico.includes('Brasil'),'CUL-0002 não diferencia os contextos raciais nacionais.');

const serialized=JSON.stringify(proposals).toLowerCase();
assert(!serialized.includes('relacao_validada'),'O terceiro lote criou relação validada automaticamente.');
assert(!serialized.includes('r001-c02'),'R001-C02 não pode reaparecer no lote.');
assert(!serialized.includes('salário digno'),'O card de salário digno não pode aparecer no lote.');

console.log('Terceiro trio editorial aprovado, validado e mantido fora das bases canônicas.');

async function read(path){
  return JSON.parse(await readFile(new URL(path,root),'utf8'));
}
