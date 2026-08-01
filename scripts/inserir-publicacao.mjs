import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';

function fail(message){
  console.error(message);
  process.exit(1);
}

const args=process.argv.slice(2);
const inputArg=args.find(arg=>!arg.startsWith('--'));
const shouldWrite=args.includes('--write');

if(!inputArg){
  fail('Uso: node scripts/inserir-publicacao.mjs caminho/do/card.json [--write]');
}

const inputPath=resolve(process.cwd(),inputArg);
const publicationsPath=new URL('../data/publicacoes.json',import.meta.url);
const themesPath=new URL('../data/temas.json',import.meta.url);

let candidate;
let current;
let themes;
try{
  candidate=JSON.parse(await readFile(inputPath,'utf8'));
  current=JSON.parse(await readFile(publicationsPath,'utf8'));
  themes=JSON.parse(await readFile(themesPath,'utf8'));
}catch(error){
  fail(`Não foi possível ler os arquivos: ${error.message}`);
}

if(Array.isArray(candidate)){
  if(candidate.length!==1)fail('O arquivo de entrada deve conter exatamente um card público.');
  [candidate]=candidate;
}

const themeIds=new Set(themeMapFromRegistry(themes).keys());
const result=validatePublicationCollection([...current,candidate],{themeIds});

if(result.errors.length){
  console.error('A inserção foi bloqueada:');
  result.errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
}

const merged=[...current,candidate].sort((a,b)=>String(a.id).localeCompare(String(b.id),'pt-BR'));
const output=`${JSON.stringify(merged,null,2)}\n`;

if(!shouldWrite){
  console.log('Card validado em modo de simulação. Nenhum arquivo foi alterado.');
  console.log(`Pronto para inserir: ${candidate.codigo_publicacao} → ${candidate.id}`);
  process.exit(0);
}

await writeFile(publicationsPath,output,'utf8');
console.log(`Publicação inserida: ${candidate.codigo_publicacao} → ${candidate.id}`);
