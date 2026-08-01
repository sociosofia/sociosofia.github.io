import {readFile} from 'node:fs/promises';
import {themeMapFromRegistry,validatePublicationCollection} from '../publication-contract.mjs';

const [publicationsRaw,themesRaw]=await Promise.all([
  readFile(new URL('../data/publicacoes.json',import.meta.url),'utf8'),
  readFile(new URL('../data/temas.json',import.meta.url),'utf8')
]);

let publications;
let themes;
try{
  publications=JSON.parse(publicationsRaw);
  themes=JSON.parse(themesRaw);
}catch(error){
  console.error('JSON inválido:',error.message);
  process.exit(1);
}

const themeMap=themeMapFromRegistry(themes);
const result=validatePublicationCollection(publications,{themeIds:new Set(themeMap.keys())});

if(result.errors.length){
  console.error('Falha no contrato de publicações públicas:');
  result.errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Contrato validado: ${result.valid.length} publicações públicas e ${themeMap.size} temas registrados.`);
