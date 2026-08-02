import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry} from '../publication-contract.mjs';
import {validateRepertoryCollection} from '../repertory-contract.mjs';

const repertorios=JSON.parse(await readFile(new URL('../data/repertorios-canonicos.json',import.meta.url),'utf8'));
const themes=JSON.parse(await readFile(new URL('../data/temas.json',import.meta.url),'utf8'));
const themeIds=new Set(themeMapFromRegistry(themes).keys());
const result=validateRepertoryCollection(repertorios,{themeIds});

if(result.errors.length){
  console.error(result.errors.join('\n'));
  process.exit(1);
}

console.log(`Contrato cultural validado com ${result.valid.length} repertório canônico.`);
