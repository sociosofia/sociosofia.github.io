const CONFIG = {
  // Durante a montagem, deixe true para visualizar fichas em revisão.
  // Antes de divulgar para estudantes, mude para false ou publique apenas itens revisados.
  mostrarRascunhos: true,
  statusPublicaveis: ["revisado", "publicado"]
};

const elementos = {
  busca: document.querySelector("#busca"),
  formBusca: document.querySelector(".search-box"),
  lista: document.querySelector("#lista-repertorios"),
  curadoria: document.querySelector("#curadoria"),
  contador: document.querySelector("#contador"),
  semResultados: document.querySelector("#sem-resultados"),
  filtroCategoria: document.querySelector("#filtro-categoria"),
  filtroTipo: document.querySelector("#filtro-tipo"),
  filtroUso: document.querySelector("#filtro-uso"),
  limparFiltros: document.querySelector("#limpar-filtros"),
  navToggle: document.querySelector(".nav-toggle"),
  navList: document.querySelector("#menu-principal")
};

let repertorios = [];
let estado = {
  termo: "",
  categoria: "",
  tipo: "",
  uso: ""
};

iniciar();

async function iniciar() {
  configurarMenuMobile();
  configurarEventos();

  try {
    const resposta = await fetch("data/repertorios.json");
    if (!resposta.ok) throw new Error("Não foi possível carregar data/repertorios.json");
    repertorios = await resposta.json();
    repertorios = normalizarRepertorios(repertorios);
    preencherFiltros(repertorios);
    renderizarCuradoria(repertorios);
    renderizarLista();
  } catch (erro) {
    elementos.lista.innerHTML = `<p class="empty-state">Não foi possível carregar o banco de repertórios. Confira se o arquivo <strong>data/repertorios.json</strong> está no repositório.</p>`;
    console.error(erro);
  }
}

function configurarMenuMobile() {
  if (!elementos.navToggle || !elementos.navList) return;

  elementos.navToggle.addEventListener("click", () => {
    const aberto = elementos.navToggle.getAttribute("aria-expanded") === "true";
    elementos.navToggle.setAttribute("aria-expanded", String(!aberto));
    elementos.navList.classList.toggle("open");
  });
}

function configurarEventos() {
  elementos.formBusca?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    estado.termo = elementos.busca.value.trim();
    renderizarLista();
    document.querySelector("#repertorios")?.scrollIntoView({ behavior: "smooth" });
  });

  elementos.busca?.addEventListener("input", () => {
    estado.termo = elementos.busca.value.trim();
    renderizarLista();
  });

  elementos.filtroCategoria?.addEventListener("change", () => {
    estado.categoria = elementos.filtroCategoria.value;
    renderizarLista();
  });

  elementos.filtroTipo?.addEventListener("change", () => {
    estado.tipo = elementos.filtroTipo.value;
    renderizarLista();
  });

  elementos.filtroUso?.addEventListener("change", () => {
    estado.uso = elementos.filtroUso.value;
    renderizarLista();
  });

  elementos.limparFiltros?.addEventListener("click", () => {
    estado = { termo: "", categoria: "", tipo: "", uso: "" };
    elementos.busca.value = "";
    elementos.filtroCategoria.value = "";
    elementos.filtroTipo.value = "";
    elementos.filtroUso.value = "";
    document.querySelectorAll(".chip.active").forEach((chip) => chip.classList.remove("active"));
    renderizarLista();
  });

  document.querySelectorAll("[data-chip]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const termo = botao.dataset.chip;
      estado.termo = termo;
      elementos.busca.value = termo;
      document.querySelectorAll(".chip.active").forEach((chip) => chip.classList.remove("active"));
      if (botao.classList.contains("chip")) botao.classList.add("active");
      renderizarLista();
      document.querySelector("#repertorios")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function normalizarRepertorios(itens) {
  return itens.map((item) => ({
    ...item,
    conceitos: Array.isArray(item.conceitos) ? item.conceitos : separarLista(item.conceitos),
    autores: Array.isArray(item.autores) ? item.autores : separarLista(item.autores),
    tags: Array.isArray(item.tags) ? item.tags : separarLista(item.tags)
  }));
}

function separarLista(valor) {
  if (!valor) return [];
  return String(valor)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function preencherFiltros(itens) {
  const visiveis = filtrarPorStatus(itens);
  preencherSelect(elementos.filtroCategoria, unicos(visiveis.map((item) => item.categoria)));
  preencherSelect(elementos.filtroTipo, unicos(visiveis.map((item) => item.tipo)));
}

function preencherSelect(select, opcoes) {
  if (!select) return;
  opcoes.forEach((opcao) => {
    const option = document.createElement("option");
    option.value = opcao;
    option.textContent = opcao;
    select.appendChild(option);
  });
}

function unicos(lista) {
  return [...new Set(lista.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function renderizarCuradoria(itens) {
  if (!elementos.curadoria) return;
  const visiveis = filtrarPorStatus(itens);
  const destaque = visiveis.find((item) => item.destaque) || visiveis[0];

  if (!destaque) {
    elementos.curadoria.innerHTML = `<p>Nenhuma curadoria publicada ainda. Adicione um item em <strong>data/repertorios.json</strong> e marque <strong>"destaque": true</strong>.</p>`;
    return;
  }

  elementos.curadoria.innerHTML = `
    <div>
      <span class="tag ${destaque.status !== "publicado" ? "review" : ""}">${escapar(destaque.tipo)}</span>
      <h3>${escapar(destaque.titulo)}</h3>
      <p>${escapar(destaque.resumo)}</p>
      <p class="card-practical"><strong>Use para pensar:</strong> ${escapar(destaque.uso)}</p>
    </div>
    <aside>
      <div class="feature-meta">
        <span>${escapar(destaque.categoria)}</span>
        <span>•</span>
        <span>${escapar(destaque.tempo_leitura || "Leitura rápida")}</span>
        <span>•</span>
        <span>${escapar(destaque.status)}</span>
      </div>
      <ul class="concept-list">
        ${destaque.conceitos.slice(0, 5).map((conceito) => `<li>${escapar(conceito)}</li>`).join("")}
      </ul>
      <p><a class="read-more" href="repertorio.html?id=${encodeURIComponent(destaque.id)}">Abrir repertório completo</a></p>
    </aside>
  `;
}

function renderizarLista() {
  if (!elementos.lista) return;
  const filtrados = filtrarRepertorios(repertorios);

  elementos.contador.textContent = `${filtrados.length} repertório${filtrados.length === 1 ? "" : "s"}`;
  elementos.semResultados.hidden = filtrados.length > 0;

  elementos.lista.innerHTML = filtrados.map(criarCard).join("");
}

function filtrarPorStatus(itens) {
  if (CONFIG.mostrarRascunhos) return itens.filter((item) => item.status !== "arquivado");
  return itens.filter((item) => CONFIG.statusPublicaveis.includes(item.status));
}

function filtrarRepertorios(itens) {
  const base = filtrarPorStatus(itens);
  const termo = normalizarTexto(estado.termo);

  return base.filter((item) => {
    const textoBusca = normalizarTexto([
      item.titulo,
      item.resumo,
      item.categoria,
      item.tema,
      item.tipo,
      item.ideia,
      item.importancia,
      item.uso,
      item.fonte_nome,
      item.midia_relacionada,
      ...(item.conceitos || []),
      ...(item.autores || []),
      ...(item.tags || [])
    ].join(" "));

    const combinaTermo = !termo || textoBusca.includes(termo);
    const combinaCategoria = !estado.categoria || item.categoria === estado.categoria;
    const combinaTipo = !estado.tipo || item.tipo === estado.tipo;
    const combinaUso = !estado.uso || normalizarTexto(item.uso).includes(normalizarTexto(estado.uso));

    return combinaTermo && combinaCategoria && combinaTipo && combinaUso;
  });
}

function criarCard(item) {
  const tipo = normalizarTexto(item.tipo).split(" ")[0];
  const conceitos = item.conceitos.slice(0, 3).join(" • ");

  return `
    <article class="card" data-type="${escaparAtributo(tipo)}">
      <span class="tag ${item.status !== "publicado" ? "review" : ""}">${escapar(item.tipo)}</span>
      <h3><a class="card-title-link" href="repertorio.html?id=${encodeURIComponent(item.id)}">${escapar(item.titulo)}</a></h3>
      <p class="card-summary">${escapar(item.resumo)}</p>
      <div class="card-meta">
        <span>${escapar(item.categoria)}</span>
        <span>•</span>
        <span>${escapar(item.tempo_leitura || "Leitura rápida")}</span>
      </div>
      ${conceitos ? `<p class="card-meta"><strong>Conecta com:</strong> ${escapar(conceitos)}</p>` : ""}
      <p class="card-practical"><strong>Use para pensar:</strong> ${escapar(item.uso)}</p>
      <div class="card-actions">
        <span class="card-meta">${escapar(item.status)}</span>
        <a class="read-more" href="repertorio.html?id=${encodeURIComponent(item.id)}">Ler mais</a>
      </div>
    </article>
  `;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapar(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escaparAtributo(texto) {
  return escapar(normalizarTexto(texto).replace(/[^a-z0-9-]/g, "-"));
}
