const CONFIG = {
  // Durante a montagem, deixe true para visualizar fichas em revisão e rascunhos.
  // Antes de divulgar para estudantes, mude para false ou publique apenas itens revisados.
  mostrarRascunhos: true,
  statusPublicaveis: ["revisado", "publicado"]
};

const CATEGORIAS_PRINCIPAIS = [
  {
    nome: "Notícias, dados e informações",
    descricao: "Pesquisas, relatórios, levantamentos, artigos, dados públicos e fatos verificáveis.",
    vazio: "Nenhuma fonte de dados cadastrada ainda."
  },
  {
    nome: "Séries, filmes, livros e músicas",
    descricao: "Obras culturais que ajudam a pensar questões sociais, filosóficas, políticas e subjetivas.",
    vazio: "Esta estante cultural ainda está em construção."
  }
];

const elementos = {
  busca: document.querySelector("#busca"),
  formBusca: document.querySelector(".search-box"),
  lista: document.querySelector("#lista-repertorios"),
  curadoria: document.querySelector("#curadoria"),
  contador: document.querySelector("#contador"),
  semResultados: document.querySelector("#sem-resultados"),
  filtroCategoria: document.querySelector("#filtro-categoria"),
  filtroTipo: document.querySelector("#filtro-tipo"),
  filtroConceito: document.querySelector("#filtro-conceito"),
  limparFiltros: document.querySelector("#limpar-filtros"),
  temasEditoriais: document.querySelector("#temas-editoriais"),
  navToggle: document.querySelector(".nav-toggle"),
  navList: document.querySelector("#menu-principal")
};

let repertorios = [];
let estado = { termo: "", categoria: "", tipo: "", conceito: "" };

iniciar();

async function iniciar() {
  configurarMenuMobile();
  configurarEventosBasicos();

  try {
    const resposta = await fetch("data/repertorios.json");
    if (!resposta.ok) throw new Error("Não foi possível carregar data/repertorios.json");
    repertorios = normalizarRepertorios(await resposta.json());
    aplicarParametroDeBusca();
    preencherFiltros(repertorios);
    renderizarCategorias(repertorios);
    renderizarCuradoria(repertorios);
    configurarEventosDinamicos();
    renderizarLista();
  } catch (erro) {
    elementos.lista.innerHTML = `<p class="empty-state">Não foi possível carregar o banco de repertórios. Confira se o arquivo <strong>data/repertorios.json</strong> está no repositório.</p>`;
    console.error(erro);
  }
}

function aplicarParametroDeBusca() {
  const parametros = new URLSearchParams(window.location.search);
  const tag = parametros.get("tag");
  const categoria = parametros.get("categoria");
  const termo = tag || categoria;
  if (!termo) return;
  estado.termo = termo;
  if (elementos.busca) elementos.busca.value = termo;
}

function configurarMenuMobile() {
  if (!elementos.navToggle || !elementos.navList) return;
  elementos.navToggle.addEventListener("click", () => {
    const aberto = elementos.navToggle.getAttribute("aria-expanded") === "true";
    elementos.navToggle.setAttribute("aria-expanded", String(!aberto));
    elementos.navList.classList.toggle("open");
  });
}

function configurarEventosBasicos() {
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

  elementos.filtroConceito?.addEventListener("change", () => {
    estado.conceito = elementos.filtroConceito.value;
    renderizarLista();
  });

  elementos.limparFiltros?.addEventListener("click", () => {
    estado = { termo: "", categoria: "", tipo: "", conceito: "" };
    elementos.busca.value = "";
    elementos.filtroCategoria.value = "";
    elementos.filtroTipo.value = "";
    elementos.filtroConceito.value = "";
    document.querySelectorAll(".chip.active").forEach((chip) => chip.classList.remove("active"));
    renderizarLista();
  });
}

function configurarEventosDinamicos() {
  document.querySelectorAll("[data-chip]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const termo = botao.dataset.chip;
      estado.termo = termo;
      if (elementos.busca) elementos.busca.value = termo;
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
    editoria: item.editoria || item.categoria || "Notícias, dados e informações",
    categoria: item.categoria || item.editoria || "Notícias, dados e informações",
    conceitos: Array.isArray(item.conceitos) ? item.conceitos : separarLista(item.conceitos),
    autores: Array.isArray(item.autores) ? item.autores : separarLista(item.autores),
    tags: Array.isArray(item.tags) ? item.tags : separarLista(item.tags)
  }));
}

function separarLista(valor) {
  if (!valor) return [];
  return String(valor).split(/[;,]/).map((item) => item.trim()).filter(Boolean);
}

function filtrarPorStatus(itens) {
  if (CONFIG.mostrarRascunhos) return itens.filter((item) => item.status !== "arquivado");
  return itens.filter((item) => CONFIG.statusPublicaveis.includes(item.status));
}

function preencherFiltros(itens) {
  const visiveis = filtrarPorStatus(itens);
  preencherSelect(elementos.filtroCategoria, CATEGORIAS_PRINCIPAIS.map((cat) => cat.nome));
  preencherSelect(elementos.filtroTipo, unicos(visiveis.map((item) => item.tipo)));
  preencherSelect(elementos.filtroConceito, unicos(visiveis.flatMap((item) => item.conceitos || [])));
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

function renderizarCategorias(itens) {
  if (!elementos.temasEditoriais) return;
  const visiveis = filtrarPorStatus(itens);

  elementos.temasEditoriais.innerHTML = CATEGORIAS_PRINCIPAIS.map((categoria) => {
    const entradas = visiveis.filter((item) => item.categoria === categoria.nome || item.editoria === categoria.nome);
    const subtemas = unicos(entradas.map((item) => item.subtema)).slice(0, 5);
    return `
      <article class="editoria-card">
        <div class="editoria-head">
          <span class="tag">Categoria</span>
          <h3>${escapar(categoria.nome)}</h3>
          <p>${escapar(categoria.descricao)}</p>
          <p class="editoria-count">${entradas.length} repertório${entradas.length === 1 ? "" : "s"}</p>
          ${subtemas.length ? `<p class="editoria-subtemas">${subtemas.map(escapar).join(" • ")}</p>` : ""}
        </div>
        <div class="mini-list">
          ${entradas.length ? entradas.slice(0, 4).map((item) => criarMiniCard(item)).join("") : `<p class="empty-mini">${escapar(categoria.vazio)}</p>`}
        </div>
        <button class="button ghost small" type="button" data-chip="${escaparAtributo(categoria.nome)}">Ver ${escapar(categoria.nome)}</button>
      </article>
    `;
  }).join("");
}

function criarMiniCard(item) {
  return `
    <a class="mini-card" href="repertorio.html?id=${encodeURIComponent(item.id)}">
      <strong>${escapar(item.titulo)}</strong>
      <span>${escapar(item.subtitulo || item.subtema || item.tema || "")}</span>
      <small>${escapar(item.tipo || item.status || "")}</small>
    </a>
  `;
}

function renderizarCuradoria(itens) {
  if (!elementos.curadoria) return;
  const visiveis = filtrarPorStatus(itens);
  const destaque = visiveis.find((item) => item.destaque) || visiveis[0];

  if (!destaque) {
    elementos.curadoria.innerHTML = `<p>Nenhuma curadoria publicada ainda.</p>`;
    return;
  }

  elementos.curadoria.innerHTML = `
    <div>
      <span class="tag ${destaque.status !== "publicado" ? "review" : ""}">${escapar(destaque.tipo)}</span>
      <h3>${escapar(destaque.titulo)}</h3>
      ${destaque.subtitulo ? `<p class="feature-subtitle">${escapar(destaque.subtitulo)}</p>` : ""}
      <p>${escapar(destaque.resumo)}</p>
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
        ${(destaque.tags || []).slice(0, 6).map((tag) => `<li><a href="index.html?tag=${encodeURIComponent(tag)}#repertorios">${escapar(tag)}</a></li>`).join("")}
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

function filtrarRepertorios(itens) {
  const base = filtrarPorStatus(itens);
  const termo = normalizarTexto(estado.termo);

  return base.filter((item) => {
    const textoBusca = normalizarTexto([
      item.titulo, item.subtitulo, item.resumo, item.resumo_obra, item.leitura_sociosofia,
      item.ancoragem_teorica, item.categoria, item.editoria, item.subtema, item.tema,
      item.tipo, item.dado, item.ideia, item.importancia, item.conexoes, item.fonte_nome,
      item.midia_relacionada, ...(item.conceitos || []), ...(item.autores || []), ...(item.tags || [])
    ].join(" "));

    const combinaTermo = !termo || textoBusca.includes(termo);
    const combinaCategoria = !estado.categoria || item.categoria === estado.categoria;
    const combinaTipo = !estado.tipo || item.tipo === estado.tipo;
    const combinaConceito = !estado.conceito || (item.conceitos || []).includes(estado.conceito);
    return combinaTermo && combinaCategoria && combinaTipo && combinaConceito;
  });
}

function criarCard(item) {
  const conceitos = (item.conceitos || []).slice(0, 3).join(" • ");
  const tags = (item.tags || []).slice(0, 6).map((tag) => `<a class="keyword" href="index.html?tag=${encodeURIComponent(tag)}#repertorios">${escapar(tag)}</a>`).join("");
  const rotuloExtra = item.ancoragem_teorica ? "Ancoragem teórica" : "Conecta com";
  const extra = item.ancoragem_teorica ? item.ancoragem_teorica : conceitos;

  return `
    <article class="card">
      <span class="tag ${item.status !== "publicado" ? "review" : ""}">${escapar(item.tipo)}</span>
      <h3><a class="card-title-link" href="repertorio.html?id=${encodeURIComponent(item.id)}">${escapar(item.titulo)}</a></h3>
      ${item.subtitulo ? `<p class="card-subtitle">${escapar(item.subtitulo)}</p>` : ""}
      <p class="card-summary">${escapar(item.resumo)}</p>
      <div class="card-meta">
        <span>${escapar(item.categoria)}</span>
        ${item.subtema ? `<span>•</span><span>${escapar(item.subtema)}</span>` : ""}
        <span>•</span>
        <span>${escapar(item.tempo_leitura || "Leitura rápida")}</span>
      </div>
      ${extra ? `<p class="card-meta"><strong>${escapar(rotuloExtra)}:</strong> ${escapar(extra)}</p>` : ""}
      ${tags ? `<div class="keywords">${tags}</div>` : ""}
      <div class="card-actions">
        <span class="card-meta">${escapar(item.fonte_status || item.status)}</span>
        <a class="read-more" href="repertorio.html?id=${encodeURIComponent(item.id)}">Abrir</a>
      </div>
    </article>
  `;
}

function normalizarTexto(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  return escapar(String(texto ?? ""));
}
