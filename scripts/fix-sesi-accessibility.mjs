import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const TARGETS = [
  'alunos/filosofia-1ano',
  'alunos/sociologia-1ano',
  'alunos/sociologia-2ano',
  'alunos/filosofia-2ano',
];

function fail(message) {
  throw new Error(message);
}

function readPage(directory) {
  const indexPath = path.join(directory, 'index.html');
  const loader = fs.readFileSync(indexPath, 'utf8');
  const match = loader.match(/const files=\[(.*?)\];/s);
  if (!match) fail(`Lista de partes não encontrada em ${indexPath}`);

  const files = JSON.parse(`[${match[1]}]`);
  if (!Array.isArray(files) || files.length === 0) {
    fail(`Lista de partes inválida em ${indexPath}`);
  }

  const encoded = files
    .map((file) => fs.readFileSync(path.join(directory, file), 'utf8').trim())
    .join('');
  const html = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
  return { indexPath, loader, files, html };
}

function extractData(html) {
  const match = html.match(/<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) fail('Bloco site-data não encontrado');
  return match[1];
}

function patchHtml(original, directory) {
  let html = original;
  const dataBefore = extractData(original);

  // Preserva o terracota editorial em superfícies e elementos gráficos,
  // mas usa uma variante mais escura em textos pequenos para atingir WCAG AA.
  if (!html.includes('--terra-text:')) {
    html = html.replace(
      '--terra:#D95D39;',
      '--terra:#D95D39;--terra-text:#B34727;'
    );
  }
  html = html.replaceAll('color:var(--terra)', 'color:var(--terra-text)');

  // A gaveta nasce realmente inativa: fora do teclado e da árvore de acessibilidade.
  html = html.replace(
    /<aside class="drawer"([^>]*?)aria-hidden="true"([^>]*?)>/,
    (full, before, after) => full.includes(' inert')
      ? full
      : `<aside class="drawer"${before}aria-hidden="true" inert${after}>`
  );

  // Ao abrir, a gaveta volta a participar da navegação antes de receber foco.
  if (!html.includes("drawer.removeAttribute('inert');drawer.classList.add('open')")) {
    html = html.replace(
      "drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false');",
      "drawer.removeAttribute('inert');drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false');"
    );
  }

  // Ao fechar, o foco retorna ao acionador; só então a gaveta fica inerte.
  const oldClose = /function closeDrawer\(restore=true\)\{\s*drawer\.classList\.remove\('open'\);backdrop\.classList\.remove\('open'\);drawer\.setAttribute\('aria-hidden','true'\);document\.body\.style\.overflow='';\s*if\(restore&&lastFocus\)lastFocus\.focus\(\);\s*\}/;
  const newClose = `function closeDrawer(restore=true){\n  if(restore&&lastFocus)lastFocus.focus();\n  drawer.classList.remove('open');backdrop.classList.remove('open');drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');document.body.style.overflow='';\n}`;
  if (oldClose.test(html)) {
    html = html.replace(oldClose, newClose);
  } else if (!html.includes("drawer.setAttribute('inert','')")) {
    fail(`Função closeDrawer não reconhecida em ${directory}`);
  }

  if (!html.includes('--terra-text:#B34727;')) {
    fail(`Cor de texto acessível não aplicada em ${directory}`);
  }
  if (!/<aside class="drawer"[^>]*aria-hidden="true"[^>]*\binert\b/.test(html)) {
    fail(`Estado inerte inicial não aplicado em ${directory}`);
  }
  if (!html.includes("drawer.removeAttribute('inert')")) {
    fail(`Remoção de inert na abertura não aplicada em ${directory}`);
  }
  if (!html.includes("drawer.setAttribute('inert','')")) {
    fail(`Aplicação de inert no fechamento não aplicada em ${directory}`);
  }

  const dataAfter = extractData(html);
  if (dataBefore !== dataAfter) {
    fail(`Conteúdo pedagógico foi alterado inadvertidamente em ${directory}`);
  }

  return html;
}

function writePage(directory, files, html) {
  const compressed = zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9 });
  const encoded = compressed.toString('base64');
  const chunkSize = Math.ceil(encoded.length / files.length);

  files.forEach((file, index) => {
    const start = index * chunkSize;
    const end = Math.min(encoded.length, start + chunkSize);
    fs.writeFileSync(path.join(directory, file), encoded.slice(start, end), 'utf8');
  });
}

for (const directory of TARGETS) {
  const { files, html } = readPage(directory);
  const beforeHash = crypto.createHash('sha256').update(extractData(html)).digest('hex');
  const patched = patchHtml(html, directory);
  const afterHash = crypto.createHash('sha256').update(extractData(patched)).digest('hex');
  writePage(directory, files, patched);
  console.log(`${directory}: corrigido; dados pedagógicos preservados ${beforeHash === afterHash ? '✓' : '✗'}`);
}
