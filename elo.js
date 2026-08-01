const NODE_ORDER = ["dado", "conceito", "repertorio"];

const COLORS = {
  dado: "var(--elo-teal)",
  conceito: "var(--elo-purple)",
  repertorio: "var(--elo-terracotta)"
};

const EDGE_IDS = {
  "conceito|dado": "edge-dado-conceito",
  "dado|repertorio": "edge-dado-repertorio",
  "conceito|repertorio": "edge-conceito-repertorio"
};

const app = document.getElementById("eloApp");
const titleElement = document.getElementById("eloTitle");
const subtitleElement = document.getElementById("eloSubtitle");
const themeElement = document.getElementById("eloTheme");
const breadcrumbTitle = document.getElementById("eloBreadcrumbTitle");
const contentPanel = document.getElementById("contentPanel");
const emptyPanel = document.getElementById("emptyPanel");
const dynamicPanel = document.getElementById("dynamicPanel");
const pathList = document.getElementById("pathList");
const resumeBanner = document.getElementById("resumeBanner");
const resumeText = document.getElementById("resumeText");
const resumeButton = document.getElementById("resumeButton");
const discardButton = document.getElementById("discardButton");
const nodeButtons = [...document.querySelectorAll(".elo-node")];

let allElos = [];
let allRelations = [];
let elo = null;
let state = { origin: null, current: null, from: null };
let savedState = null;
let storageKey = "";

init().catch(handleError);

async function init() {
  const [elosResponse, relationsResponse] = await Promise.all([
    fetch("data/elos.json"),
    fetch("data/relacoes.json")
  ]);

  if (!elosResponse.ok || !relationsResponse.ok) {
    throw new Error("Não foi possível carregar os dados do elo.");
  }

  const elosData = await elosResponse.json();
  const relationsData = await relationsResponse.json();

  allElos = Array.isArray(elosData.elos) ? elosData.elos : [];
  allRelations = Array.isArray(relationsData.relacoes) ? relationsData.relacoes : [];

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  elo = allElos.find(item => item.id === requestedId) || allElos[0];

  if (!elo) {
    throw new Error("Nenhum elo foi encontrado.");
  }

  storageKey = `sociosofia-elo:${elo.id}`;
  configurePage();
  bindEvents();
  restoreOffer();

  const entry = params.get("entrada");
  if (NODE_ORDER.includes(entry)) {
    openNode(entry, { updateHistory: false, focusPanel: false });
  }

  app.setAttribute("aria-busy", "false");
}

function configurePage() {
  document.title = `${elo.titulo} | Elo Sociosofia`;
  titleElement.textContent = elo.titulo;
  subtitleElement.textContent = elo.subtitulo || "Escolha uma porta de entrada.";
  themeElement.textContent = elo.tema || "Elo Sociosofia";
  breadcrumbTitle.textContent = elo.titulo;

  nodeButtons.forEach(button => {
    const key = button.dataset.node;
    const vertex = elo.vertices?.[key];
    if (!vertex) {
      button.hidden = true;
      return;
    }

    button.querySelector(".elo-node-label").textContent = vertex.rotulo || labelFor(key);
    button.querySelector(".elo-node-title").textContent = vertex.titulo_curto || vertex.titulo;
    button.setAttribute(
      "aria-label",
      `Abrir ${vertex.rotulo || labelFor(key)}: ${vertex.titulo_curto || vertex.titulo}`
    );
  });
}

function bindEvents() {
  nodeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.node;
      if (state.current === key) {
        closePanel();
      } else {
        openNode(key, { updateHistory: true, focusPanel: true });
      }
    });
  });

  resumeButton.addEventListener("click", () => {
    if (!savedState?.current) return;
    state = { ...savedState };
    resumeBanner.classList.remove("visible");
    renderAll({ focusPanel: true });
  });

  discardButton.addEventListener("click", () => {
    clearSavedState();
    state = { origin: null, current: null, from: null };
    renderAll({ focusPanel: false });
  });

  dynamicPanel.addEventListener("click", event => {
    const next = event.target.closest("[data-target]");
    if (next) {
      openNode(next.dataset.target, { updateHistory: true, focusPanel: true });
      return;
    }

    const copy = event.target.closest("[data-copy-link]");
    if (copy) {
      copyCurrentLink(copy);
    }
  });
}

function openNode(key, options = {}) {
  if (!elo.vertices?.[key]) return;

  const previous = state.current;
  state.origin ||= key;
  state.from = previous && previous !== key ? previous : null;
  state.current = key;

  saveState();
  renderAll(options);

  if (options.updateHistory !== false) {
    const url = new URL(window.location.href);
    url.searchParams.set("id", elo.id);
    url.searchParams.set("entrada", key);
    window.history.replaceState({}, "", url);
  }
}

function closePanel() {
  state.from = state.current;
  state.current = null;
  saveState();
  renderAll({ focusPanel: false });

  const url = new URL(window.location.href);
  url.searchParams.set("id", elo.id);
  url.searchParams.delete("entrada");
  window.history.replaceState({}, "", url);
}

function renderAll({ focusPanel = false } = {}) {
  renderNodes();
  renderEdges();
  renderPath();

  if (!state.current) {
    emptyPanel.hidden = false;
    dynamicPanel.hidden = true;
    dynamicPanel.replaceChildren();
    return;
  }

  emptyPanel.hidden = true;
  dynamicPanel.hidden = false;
  dynamicPanel.innerHTML = renderPanel(state.current, state.from);
  contentPanel.setAttribute("aria-label", `${labelFor(state.current)}: ${elo.vertices[state.current].titulo}`);

  if (focusPanel) {
    contentPanel.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 930px)").matches) {
      contentPanel.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }
}

function renderNodes() {
  nodeButtons.forEach(button => {
    const active = button.dataset.node === state.current;
    button.setAttribute("aria-expanded", String(active));
  });
}

function renderEdges() {
  document.querySelectorAll(".elo-edge").forEach(edge => edge.classList.remove("active"));

  if (!state.current) return;

  if (state.from && state.from !== state.current) {
    document.getElementById(edgeId(state.from, state.current))?.classList.add("active");
    return;
  }

  NODE_ORDER
    .filter(key => key !== state.current)
    .forEach(key => document.getElementById(edgeId(state.current, key))?.classList.add("active"));
}

function renderPath() {
  if (!state.origin) {
    pathList.innerHTML = '<span class="elo-path-empty">Ainda não iniciado.</span>';
    return;
  }

  if (!state.current || state.current === state.origin) {
    pathList.innerHTML = `
      <span class="elo-path-caption">Entrada</span>
      <span class="elo-path-step">${escapeHtml(labelFor(state.origin))}</span>
    `;
    return;
  }

  pathList.innerHTML = `
    <span class="elo-path-caption">Entrada</span>
    <span class="elo-path-step">${escapeHtml(labelFor(state.origin))}</span>
    <span class="elo-path-arrow" aria-hidden="true">→</span>
    <span class="elo-path-caption">Agora</span>
    <span class="elo-path-step">${escapeHtml(labelFor(state.current))}</span>
  `;
}

function renderPanel(key, fromKey) {
  const vertex = elo.vertices[key];
  const title = vertex.titulo_em_italico
    ? `<em>${escapeHtml(vertex.titulo)}</em>`
    : escapeHtml(vertex.titulo);

  const blocks = (vertex.blocos || []).map(renderBlock).join("");
  const relation = fromKey ? renderRelation(fromKey, key) : "";
  const network = renderNetwork(key);
  const navigation = NODE_ORDER
    .filter(target => target !== key && elo.vertices[target])
    .map(target => `
      <button class="elo-next" type="button" data-target="${target}">
        ${escapeHtml(labelFor(target))}
      </button>
    `)
    .join("");

  return `
    <header class="elo-panel-head">
      <div>
        <div class="elo-panel-type" style="color:${COLORS[key]}">${escapeHtml(vertex.rotulo || labelFor(key))}</div>
        <h2 class="elo-panel-title">${title}</h2>
        ${vertex.subtitulo ? `<p class="elo-panel-subtitle">${escapeHtml(vertex.subtitulo)}</p>` : ""}
      </div>
      <div class="elo-panel-actions">
        <button class="elo-icon-button" type="button" data-copy-link aria-label="Copiar link deste ponto" title="Copiar link deste ponto">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </header>
    <div class="elo-panel-body">
      ${blocks}
      ${relation}
      ${network}
    </div>
    <footer class="elo-panel-footer">
      <div class="elo-origin">
        Entrada deste percurso: <strong>${escapeHtml(labelFor(state.origin))}</strong>
      </div>
      <div class="elo-panel-nav" aria-label="Outros vértices deste elo">
        ${navigation}
      </div>
    </footer>
  `;
}

function renderBlock(block) {
  if (!block || !block.tipo) return "";

  switch (block.tipo) {
    case "estatistica":
      return `
        <div class="elo-stat">
          <div class="elo-stat-number">${escapeHtml(block.valor)}</div>
          <div class="elo-stat-copy">${escapeHtml(block.texto)}</div>
        </div>
      `;

    case "texto":
      return `
        <section class="elo-content-section">
          <h3>${escapeHtml(block.titulo)}</h3>
          ${(block.paragrafos || []).map(text => `<p>${escapeHtml(text)}</p>`).join("")}
        </section>
      `;

    case "lista":
      return `
        <section class="elo-content-section">
          <h3>${escapeHtml(block.titulo)}</h3>
          <ul class="elo-related-list">
            ${(block.itens || []).map(item => `
              <li>${item.destaque ? `<strong>${escapeHtml(item.destaque)}</strong> ` : ""}${escapeHtml(item.texto || "")}</li>
            `).join("")}
          </ul>
        </section>
      `;

    case "lista_simples":
      return `
        <section class="elo-content-section">
          <h3>${escapeHtml(block.titulo)}</h3>
          <ul class="elo-related-list">
            ${(block.itens || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      `;

    case "destaque":
      return `
        <aside class="elo-callout">
          ${block.rotulo ? `<span class="elo-callout-label">${escapeHtml(block.rotulo)}</span>` : ""}
          ${block.titulo ? `<strong>${escapeHtml(block.titulo)}</strong>` : ""}
          ${(block.paragrafos || []).map(text => `<p>${escapeHtml(text)}</p>`).join("")}
        </aside>
      `;

    case "metadados":
      return `
        <ul class="elo-meta-list" aria-label="Ficha rápida">
          ${(block.itens || []).map(item => `
            <li><strong>${escapeHtml(item.rotulo)}</strong><span>${escapeHtml(item.valor)}</span></li>
          `).join("")}
        </ul>
      `;

    case "fonte":
      if (!block.url) return "";
      return `
        <section class="elo-content-section">
          <h3>${escapeHtml(block.titulo || "Fonte original")}</h3>
          <a class="elo-source-link" href="${safeUrl(block.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(block.nome || "Acessar fonte original")}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </section>
      `;

    default:
      return "";
  }
}

function renderRelation(fromKey, toKey) {
  const relation = relationBetween(fromKey, toKey);
  if (!relation?.projecao_publica) return "";

  return `
    <section class="elo-relation-box">
      <h3>${escapeHtml(relation.projecao_publica.rotulo_curto || "Como estes conteúdos se relacionam")}</h3>
      <p>${escapeHtml(relation.projecao_publica.resumo || "")}</p>
    </section>
  `;
}

function renderNetwork(key) {
  const entityId = elo.vertices[key].entidade_id;
  const currentRelations = new Set(elo.arestas || []);

  const extraRelations = allRelations.filter(relation =>
    !currentRelations.has(relation.id) &&
    (relation.entidades || []).some(entity => entity.entidade_id === entityId) &&
    relation.editorial?.status !== "arquivado"
  );

  const otherElos = allElos
    .filter(candidate => candidate.id !== elo.id)
    .map(candidate => {
      const entry = NODE_ORDER.find(node => candidate.vertices?.[node]?.entidade_id === entityId);
      return entry ? { candidate, entry } : null;
    })
    .filter(Boolean);

  if (!extraRelations.length && !otherElos.length) return "";

  const relationItems = extraRelations.map(relation => {
    const other = (relation.entidades || []).find(entity => entity.entidade_id !== entityId);
    const label = entityLabel(other?.entidade_id) || other?.entidade_id || "Outra conexão";
    return `
      <li>
        <div class="elo-network-link">
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(relation.projecao_publica?.rotulo_curto || "Relação validada")}</small>
        </div>
      </li>
    `;
  }).join("");

  const eloItems = otherElos.map(({ candidate, entry }) => `
    <li>
      <a class="elo-network-link" href="elo.html?id=${encodeURIComponent(candidate.id)}&entrada=${encodeURIComponent(entry)}">
        <strong>${escapeHtml(candidate.titulo)}</strong>
        <small>Outro elo com este conteúdo</small>
      </a>
    </li>
  `).join("");

  return `
    <section class="elo-network">
      <h3>Outras ramificações</h3>
      <p class="elo-network-intro">Este vértice também participa de outras relações validadas.</p>
      <ul class="elo-network-list">${eloItems}${relationItems}</ul>
    </section>
  `;
}

function relationBetween(aKey, bKey) {
  const a = elo.vertices[aKey]?.entidade_id;
  const b = elo.vertices[bKey]?.entidade_id;
  if (!a || !b) return null;

  return allRelations.find(relation =>
    (elo.arestas || []).includes(relation.id) &&
    includesEntity(relation, a) &&
    includesEntity(relation, b)
  );
}

function includesEntity(relation, entityId) {
  return (relation.entidades || []).some(entity => entity.entidade_id === entityId);
}

function entityLabel(entityId) {
  for (const candidate of allElos) {
    for (const key of NODE_ORDER) {
      const vertex = candidate.vertices?.[key];
      if (vertex?.entidade_id === entityId) return vertex.titulo_curto || vertex.titulo;
    }
  }
  return "";
}

function edgeId(a, b) {
  return EDGE_IDS[[a, b].sort().join("|")];
}

function labelFor(key) {
  return elo?.vertices?.[key]?.rotulo || {
    dado: "Dado",
    conceito: "Conceito",
    repertorio: "Repertório"
  }[key] || key;
}

function saveState() {
  if (!storageKey || !state.origin) return;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function restoreOffer() {
  const parsed = safeParse(localStorage.getItem(storageKey));
  if (!validState(parsed) || !parsed.current) return;

  savedState = parsed;
  resumeText.textContent = `${labelFor(parsed.origin)} → ${labelFor(parsed.current)}`;
  resumeBanner.classList.add("visible");
}

function clearSavedState() {
  localStorage.removeItem(storageKey);
  savedState = null;
  resumeBanner.classList.remove("visible");
}

async function copyCurrentLink(button) {
  const url = new URL(window.location.href);
  url.searchParams.set("id", elo.id);
  url.searchParams.set("entrada", state.current);

  try {
    await navigator.clipboard.writeText(url.toString());
    const oldTitle = button.title;
    button.title = "Link copiado";
    button.setAttribute("aria-label", "Link copiado");
    window.setTimeout(() => {
      button.title = oldTitle;
      button.setAttribute("aria-label", oldTitle);
    }, 1600);
  } catch {
    window.prompt("Copie o endereço deste ponto:", url.toString());
  }
}

function validState(candidate) {
  return Boolean(
    candidate &&
    NODE_ORDER.includes(candidate.origin) &&
    (candidate.current === null || NODE_ORDER.includes(candidate.current)) &&
    (candidate.from === null || NODE_ORDER.includes(candidate.from))
  );
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#";
  } catch {
    return "#";
  }
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function handleError(error) {
  console.error(error);
  app?.setAttribute("aria-busy", "false");
  if (app) {
    app.innerHTML = `
      <div class="elo-error">
        <h1>Não foi possível abrir este elo.</h1>
        <p>${escapeHtml(error.message || "Tente novamente mais tarde.")}</p>
        <p><a href="index.html">Voltar à página inicial</a></p>
      </div>
    `;
  }
}
