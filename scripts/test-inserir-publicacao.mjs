import {readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

function assert(condition,message){
  if(!condition)throw new Error(message);
}

const publicationsPath=new URL('../data/publicacoes.json',import.meta.url);
const before=await readFile(publicationsPath,'utf8');
const publications=JSON.parse(before);
const base=structuredClone(publications[0]);
const validPath=join(tmpdir(),`sociosofia-valid-${process.pid}.json`);
const invalidPath=join(tmpdir(),`sociosofia-invalid-${process.pid}.json`);

const valid={
  ...base,
  id:'DAD-9998',
  codigo_publicacao:'R999-C98',
  evi_id:'EVI-teste-insercao-segura'
};
const invalid={
  ...valid,
  id:'DAD-9997',
  codigo_publicacao:'R999-C97',
  status:'em_ajuste'
};

await writeFile(validPath,JSON.stringify(valid),'utf8');
await writeFile(invalidPath,JSON.stringify(invalid),'utf8');

try{
  const accepted=spawnSync(process.execPath,['scripts/inserir-publicacao.mjs',validPath],{encoding:'utf8'});
  assert(accepted.status===0,`A simulação válida falhou: ${accepted.stderr}`);
  assert(accepted.stdout.includes('modo de simulação'),'A rotina não informou que operava sem escrita.');

  const rejected=spawnSync(process.execPath,['scripts/inserir-publicacao.mjs',invalidPath],{encoding:'utf8'});
  assert(rejected.status!==0,'A rotina aceitou um card em ajuste.');
  assert(rejected.stderr.includes('somente registros com status publicado'),'O motivo do bloqueio não foi informado.');

  const after=await readFile(publicationsPath,'utf8');
  assert(after===before,'O modo de simulação alterou a base pública.');
}finally{
  await Promise.all([rm(validPath,{force:true}),rm(invalidPath,{force:true})]);
}

console.log('Rotina de inserção segura validada.');
