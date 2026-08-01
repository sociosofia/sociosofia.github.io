import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BASE = 'http://127.0.0.1:8000/';
const OUT = path.join(ROOT, 'audit', 'output', 'site-map');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'audit/output']);

await fs.mkdir(path.join(OUT, 'screenshots'), { recursive: true });

async function walk(dir, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules' || rel.startsWith('audit/output')) continue;
      files.push(...await walk(path.join(dir, entry.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

const allFiles = await walk(ROOT);
const htmlFiles = allFiles.filter(file => file.endsWith('.html')).sort((a, b) => a.localeCompare(b, 'pt-BR'));
const existingFiles = new Set(allFiles);

function safeName(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'pagina';
}

function hash(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function classifyVisual(pathname, stylesheets) {
  if (pathname.startsWith('alunos/')) return 'area-estudante';
  if (pathname.startsWith('app/')) return 'app';
  if (pathname.startsWith('editoria2/')) return 'editoria-comparativa';
  if (stylesheets.some(x => x.includes('elo.css'))) return 'elo';
  if (stylesheets.some(x => x.includes('home-v2.css'))) return 'home-nova';
  if (stylesheets.some(x => x.includes('identity-v1.css'))) return 'identidade-parcial';
  if (stylesheets.some(x => x.endsWith('style.css'))) return 'legado-geral';
  return 'sem-classificacao';
}

function visualFlags(pathname, stylesheets, html) {
  const flags = [];
  if (!pathname.startsWith('alunos/') && !pathname.startsWith('app/') && !pathname.startsWith('editoria2/')) {
    if (!stylesheets.some(x => x.includes('identity-v1.css')) && !stylesheets.some(x => x.includes('elo.css'))) {
      flags.push('não carrega a identidade visual nova');
    }
  }
  if (/Fraunces:[^\n"']*(700|800)/i.test(html)) flags.push('carrega Fraunces em peso 700/800');
  if (/brand-mark/.test(html)) flags.push('usa marca antiga em círculo/letra');
  if (/nav-list/.test(html) && !/identity-nav/.test(html)) flags.push('usa navegação geral antiga');
  return flags;
}

async function readJson(rel) {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, rel), 'utf8'));
  } catch {
    return null;
  }
}

const repertoires = await readJson('data/repertorios.json');
const elosData = await readJson('data/elos.json');
const firstRep = Array.isArray(repertoires) ? repertoires.find(x => x?.id)?.id : null;
const firstElo = Array.isArray(elosData?.elos) ? elosData.elos.find(x => x?.id)?.id : null;

const routes = htmlFiles.map(file => ({ file, url: file }));
if (firstRep && htmlFiles.includes('repertorio.html')) routes.push({ file: 'repertorio.html', url: `repertorio.html?id=${encodeURIComponent(firstRep)}`, variant: 'repertorio-com-conteudo' });
if (firstElo && htmlFiles.includes('elo.html')) routes.push({ file: 'elo.html', url: `elo.html?id=${encodeURIComponent(firstElo)}`, variant: 'elo-com-conteudo' });
if (htmlFiles.includes('index.html')) routes.push({ file: 'index.html', url: 'index.html?tipo=conceito&entidade=Alienação#temas', variant: 'entidade-conceito' });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' });
const pages = [];
const runtimeLinks = [];
const buttonInventory = [];

for (const route of routes) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  let responseStatus = null;
  try {
    const response = await page.goto(new URL(route.url, BASE).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    responseStatus = response?.status() ?? null;
    await page.waitForTimeout(900);
  } catch (error) {
    pageErrors.push(`navegação: ${error.message}`);
  }

  const html = await fs.readFile(path.join(ROOT, route.file), 'utf8');
  const info = await page.evaluate(() => {
    const text = el => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const accessibleName = el => el.getAttribute('aria-label') || el.getAttribute('title') || text(el);
    const links = [...document.querySelectorAll('a[href]')].map((el, index) => ({
      index,
      text: text(el),
      ariaLabel: el.getAttribute('aria-label') || '',
      hrefRaw: el.getAttribute('href') || '',
      href: el.href,
      target: el.getAttribute('target') || '',
      visible: Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    }));
    const buttons = [...document.querySelectorAll('button,[role="button"]')].map((el, index) => ({
      index,
      tag: el.tagName.toLowerCase(),
      text: text(el),
      accessibleName: accessibleName(el),
      ariaLabel: el.getAttribute('aria-label') || '',
      ariaExpanded: el.getAttribute('aria-expanded'),
      ariaControls: el.getAttribute('aria-controls') || '',
      type: el.getAttribute('type') || '',
      id: el.id || '',
      classes: el.className || '',
      disabled: Boolean(el.disabled || el.getAttribute('aria-disabled') === 'true'),
      visible: Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      dataAttributes: Object.keys(el.dataset || {})
    }));
    const emptyStates = [...document.querySelectorAll('.empty-state,.portal-prompt,[data-empty],.elo-error')]
      .filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length)
      .map(text).filter(Boolean);
    return {
      title: document.title,
      h1: text(document.querySelector('h1')),
      bodyClass: document.body.className,
      stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(x => x.getAttribute('href') || ''),
      links,
      buttons,
      emptyStates,
      mainTextLength: text(document.querySelector('main')).length,
      visibleHeadings: [...document.querySelectorAll('h1,h2,h3')].filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length).map(text)
    };
  }).catch(error => ({ title: '', h1: '', bodyClass: '', stylesheets: [], links: [], buttons: [], emptyStates: [], mainTextLength: 0, visibleHeadings: [], evaluationError: error.message }));

  const visualFamily = classifyVisual(route.file, info.stylesheets);
  const flags = visualFlags(route.file, info.stylesheets, html);
  if (info.mainTextLength === 0) flags.push('conteúdo principal vazio ao carregar');
  if (!info.h1) flags.push('sem H1 visível');

  for (const link of info.links) runtimeLinks.push({ page: route.url, ...link });
  for (const button of info.buttons) {
    const issues = [];
    if (!button.accessibleName) issues.push('sem nome acessível');
    if (button.ariaControls) {
      const exists = await page.locator(`#${CSS.escape(button.ariaControls)}`).count().catch(() => 0);
      if (!exists) issues.push('aria-controls aponta para elemento inexistente');
    }
    if (!button.disabled && button.visible && !button.id && !button.ariaControls && button.dataAttributes.length === 0 && !button.classes) {
      issues.push('sem identificador de comportamento aparente');
    }
    buttonInventory.push({ page: route.url, ...button, issues });
  }

  const screenshotEligible = !route.variant && (route.file.split('/').length <= 2 || ['index.html','repertorio.html','sobre.html','elo.html','alunos/index.html','app/index.html','editoria2/index.html'].includes(route.file));
  let screenshot = '';
  if (screenshotEligible) {
    screenshot = `screenshots/${safeName(route.file)}.png`;
    await page.screenshot({ path: path.join(OUT, screenshot), fullPage: false }).catch(() => {});
  }

  pages.push({
    file: route.file,
    route: route.url,
    variant: route.variant || '',
    responseStatus,
    title: info.title,
    h1: info.h1,
    visibleHeadings: info.visibleHeadings,
    stylesheets: info.stylesheets,
    visualFamily,
    visualFlags: flags,
    linkCount: info.links.length,
    buttonCount: info.buttons.length,
    emptyStates: info.emptyStates,
    consoleErrors,
    pageErrors,
    screenshot
  });
  await page.close();
}

function localTarget(link) {
  try {
    const url = new URL(link.href, BASE);
    if (url.origin !== new URL(BASE).origin) return null;
    return url;
  } catch {
    return null;
  }
}

const linkChecks = [];
for (const link of runtimeLinks) {
  const issues = [];
  if (!link.text && !link.ariaLabel) issues.push('link sem nome acessível');
  if (!link.hrefRaw || link.hrefRaw === '#') issues.push('destino vazio ou genérico');
  if (/^javascript:/i.test(link.hrefRaw)) issues.push('usa javascript: no href');
  const local = localTarget(link);
  let status = null;
  if (local && !issues.includes('destino vazio ou genérico')) {
    try {
      const response = await fetch(local.href, { redirect: 'manual' });
      status = response.status;
      if (status >= 400) issues.push(`destino retorna HTTP ${status}`);
    } catch (error) {
      issues.push(`falha ao consultar destino: ${error.message}`);
    }
  }
  linkChecks.push({ ...link, status, issues });
}

const importantRoutes = routes.filter(route => [
  'index.html', 'alunos/index.html', 'app/index.html', 'editoria2/index.html'
].includes(route.file) || route.variant === 'elo-com-conteudo' || route.variant === 'repertorio-com-conteudo');

const behaviorChecks = [];
let testedButtons = 0;
for (const route of importantRoutes) {
  const probe = await context.newPage();
  await probe.goto(new URL(route.url, BASE).href, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await probe.waitForTimeout(900);
  const count = Math.min(await probe.locator('button:visible,[role="button"]:visible').count(), 60);
  await probe.close();

  for (let index = 0; index < count && testedButtons < 240; index++, testedButtons++) {
    const page = await context.newPage();
    await page.goto(new URL(route.url, BASE).href, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(700);
    const locator = page.locator('button:visible,[role="button"]:visible').nth(index);
    if (!await locator.count()) { await page.close(); continue; }
    const before = await locator.evaluate(el => ({
      name: el.getAttribute('aria-label') || el.getAttribute('title') || (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(),
      expanded: el.getAttribute('aria-expanded'),
      controls: el.getAttribute('aria-controls') || '',
      type: el.getAttribute('type') || '',
      disabled: Boolean(el.disabled || el.getAttribute('aria-disabled') === 'true')
    }));
    if (before.disabled) { await page.close(); continue; }
    const beforeUrl = page.url();
    const beforeText = hash(await page.locator('body').innerText().catch(() => ''));
    let targetBefore = null;
    if (before.controls) targetBefore = await page.locator(`#${before.controls}`).isVisible().catch(() => null);
    let clickError = '';
    try {
      await locator.click({ timeout: 5000 });
      await page.waitForTimeout(450);
    } catch (error) {
      clickError = error.message;
    }
    const afterUrl = page.url();
    const afterText = hash(await page.locator('body').innerText().catch(() => ''));
    const afterExpanded = await locator.getAttribute('aria-expanded').catch(() => null);
    let targetAfter = null;
    if (before.controls) targetAfter = await page.locator(`#${before.controls}`).isVisible().catch(() => null);
    const visibleEmpty = await page.locator('.empty-state:visible,.portal-prompt:visible,.elo-error:visible').allInnerTexts().catch(() => []);
    const effects = [];
    if (beforeUrl !== afterUrl) effects.push('navegação');
    if (before.expanded !== afterExpanded) effects.push('aria-expanded');
    if (targetBefore !== targetAfter) effects.push('altera painel controlado');
    if (beforeText !== afterText) effects.push('altera conteúdo');
    if (clickError) effects.push('erro ao clicar');
    const issues = [];
    if (!before.name) issues.push('sem nome acessível');
    if (!clickError && effects.length === 0 && before.type !== 'submit' && before.type !== 'reset') issues.push('sem efeito detectável');
    if (clickError) issues.push('clique falhou');
    if (visibleEmpty.some(text => /não há|nenhum|em breve|indisponível|sem conteúdo/i.test(text))) issues.push('abre estado sem conteúdo específico');
    behaviorChecks.push({ page: route.url, index, name: before.name, controls: before.controls, effects, visibleEmpty, clickError: clickError.slice(0, 300), issues });
    await page.close();
  }
}

await browser.close();

const htmlSet = new Set(htmlFiles);
const graph = new Map(htmlFiles.map(file => [file, new Set()]));
for (const link of runtimeLinks) {
  const local = localTarget(link);
  if (!local) continue;
  let target = decodeURIComponent(local.pathname.replace(/^\//, '')) || 'index.html';
  if (target.endsWith('/')) target += 'index.html';
  const source = link.page.split('?')[0].split('#')[0] || 'index.html';
  if (htmlSet.has(source) && htmlSet.has(target)) graph.get(source)?.add(target);
}
const reachable = new Set(['index.html']);
const queue = ['index.html'];
while (queue.length) {
  const current = queue.shift();
  for (const next of graph.get(current) || []) {
    if (!reachable.has(next)) { reachable.add(next); queue.push(next); }
  }
}
const orphanPages = htmlFiles.filter(file => !reachable.has(file));

const summary = {
  generatedAt: new Date().toISOString(),
  counts: {
    files: allFiles.length,
    htmlPages: htmlFiles.length,
    routesAudited: routes.length,
    links: linkChecks.length,
    buttons: buttonInventory.length,
    behaviorChecks: behaviorChecks.length,
    orphanPages: orphanPages.length
  },
  htmlFiles,
  orphanPages,
  pages,
  links: linkChecks,
  buttons: buttonInventory,
  behaviorChecks
};

await fs.writeFile(path.join(OUT, 'site-map.json'), JSON.stringify(summary, null, 2));

const md = [];
md.push('# Auditoria integral do Sociosofia');
md.push('');
md.push(`Gerada em ${summary.generatedAt}.`);
md.push('');
md.push('## Visão geral');
md.push('');
md.push(`- ${summary.counts.htmlPages} arquivos HTML encontrados;`);
md.push(`- ${summary.counts.routesAudited} rotas auditadas;`);
md.push(`- ${summary.counts.links} links inventariados;`);
md.push(`- ${summary.counts.buttons} botões/controles inventariados;`);
md.push(`- ${summary.counts.behaviorChecks} testes de comportamento;`);
md.push(`- ${summary.counts.orphanPages} páginas não alcançadas a partir da home.`);
md.push('');
md.push('## Páginas e identidade visual');
md.push('');
md.push('| Página | H1 | Família visual | Sinais de atenção | Links | Botões |');
md.push('|---|---|---|---|---:|---:|');
for (const page of pages.filter(p => !p.variant)) {
  md.push(`| \`${page.file}\` | ${String(page.h1 || '—').replaceAll('|','\\|')} | ${page.visualFamily} | ${page.visualFlags.join('; ') || '—'} | ${page.linkCount} | ${page.buttonCount} |`);
}
md.push('');
md.push('## Páginas possivelmente órfãs');
md.push('');
md.push(orphanPages.length ? orphanPages.map(x => `- \`${x}\``).join('\n') : '- Nenhuma.');
md.push('');
md.push('## Links com sinais de atenção');
md.push('');
const badLinks = linkChecks.filter(x => x.issues.length);
md.push(badLinks.length ? badLinks.slice(0, 200).map(x => `- \`${x.page}\` — “${x.text || x.ariaLabel || '(sem nome)'}” → \`${x.hrefRaw}\`: ${x.issues.join('; ')}`).join('\n') : '- Nenhum sinal automático.');
md.push('');
md.push('## Botões com sinais de atenção');
md.push('');
const badButtons = buttonInventory.filter(x => x.issues.length);
md.push(badButtons.length ? badButtons.slice(0, 200).map(x => `- \`${x.page}\` — “${x.accessibleName || '(sem nome)'}”: ${x.issues.join('; ')}`).join('\n') : '- Nenhum sinal estrutural automático.');
md.push('');
md.push('## Testes de comportamento com sinais de atenção');
md.push('');
const badBehavior = behaviorChecks.filter(x => x.issues.length);
md.push(badBehavior.length ? badBehavior.slice(0, 200).map(x => `- \`${x.page}\` — “${x.name || '(sem nome)'}”: ${x.issues.join('; ')}${x.visibleEmpty.length ? ` — estado: ${x.visibleEmpty.join(' / ')}` : ''}`).join('\n') : '- Nenhum sinal automático.');
md.push('');
md.push('## Erros de carregamento e console');
md.push('');
const errorPages = pages.filter(p => p.consoleErrors.length || p.pageErrors.length || (p.responseStatus && p.responseStatus >= 400));
md.push(errorPages.length ? errorPages.map(p => `- \`${p.route}\`: HTTP ${p.responseStatus ?? '—'}; ${[...p.consoleErrors, ...p.pageErrors].join(' | ')}`).join('\n') : '- Nenhum erro capturado.');

await fs.writeFile(path.join(OUT, 'site-map.md'), md.join('\n'));

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return `"${text.replaceAll('"','""')}"`;
}

const buttonCsv = [['page','index','name','classes','ariaControls','visible','issues'].map(csvEscape).join(',')];
for (const b of buttonInventory) buttonCsv.push([b.page,b.index,b.accessibleName,b.classes,b.ariaControls,b.visible,b.issues].map(csvEscape).join(','));
await fs.writeFile(path.join(OUT, 'buttons.csv'), buttonCsv.join('\n'));

const linkCsv = [['page','text','hrefRaw','status','issues'].map(csvEscape).join(',')];
for (const l of linkChecks) linkCsv.push([l.page,l.text || l.ariaLabel,l.hrefRaw,l.status,l.issues].map(csvEscape).join(','));
await fs.writeFile(path.join(OUT, 'links.csv'), linkCsv.join('\n'));

console.log(JSON.stringify(summary.counts, null, 2));
console.log(`Relatório: ${path.join(OUT, 'site-map.md')}`);
