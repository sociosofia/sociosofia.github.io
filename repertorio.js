const detalhe = document.querySelector("#repertorio-detalhe");
const breadcrumbAtual = document.querySelector("#breadcrumb-atual");

iniciarDetalhe();

async function iniciarDetalhe() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("id");

  if (!id) {
    renderizarErro("Nenhum repertório foi informado.");
    return;
  }

  try {
    const resposta = await fetch("data/repertorios.json");
    if (!resposta.ok) throw new Error("Não foi possível carregar o banco de repertórios.");
    const repertorios = await resposta.json();
    const item = repertorios.find((entrada) => entrada.id === id);

    if (!item) {
      renderizarErro("Repertório não encontrado.");
      return;
    }

    document.title = `${item.titulo} | Sociosofia`;
    breadcrumbAtual.textContent = item.titulo;
    renderizarItem(item);
  } catch (erro) {
    renderizarErro("Não foi possível carregar este repertório.");
    console.error(erro);
  }
}

function renderizarItem(item) {
  const conceitos = normalizarLista(item.conceitos);
  const autores = normalizarLista(item.autores);
  const tags = normalizarLista(item.tags);
  const cultural = item.categoria === "Séries, filmes, livros e músicas" || Boolean(item.leitura_sociosofia || item.resumo_obra || item.ancoragem_teorica);

  detalhe.innerHTML = `
    <header class="detail-hero">
      <div>
        <span class="tag ${item.status !== "publicado" ? "review" : ""}">${escapar(item.tipo || "Repertório")}</span>
        <h1>${escapar(item.titulo)}</h1>
        ${item.subtitulo ? `<p class="detail-subtitle">${escapar(item.subtitulo)}</p>` : ""}
        <p>${escapar(item.resumo || item.resumo_obra || "")}</p>
        <div class="detail-meta">
          <span>${escapar(item.categoria || item.editoria)}</span>
          ${item.subtema ? `<span>•</span><span>${escapar(item.subtema)}</span>` : ""}
          <span>•</span>
          <span>${escapar(item.status || "rascunho")}</span>
        </div>
        ${tags.length ? `<div class="keywords">${tags.map((tag) => `<a class="keyword" href="index.html?tag=${encodeURIComponent(tag)}#repertorios">${escapar(tag)}</a>`).join("")}</div>` : ""}
      </div>
      <aside class="detail-sidebar" aria-label="Metadados do repertório">
        <dl>
          <dt>${cultural ? "Referência da obra" : "Fonte completa"}</dt>
          <dd>${item.fonte_url ? `<a href="${escaparAtributo(item.fonte_url)}" target="_blank" rel="noopener noreferrer">${escapar(item.fonte_nome || "Acessar fonte")}</a>` : escapar(item.fonte_nome || "A definir")}</dd>
          <dt>Ano ou data</dt>
          <dd>${escapar(item.ano_data || "A definir")}</dd>
          <dt>${cultural ? "Tipo de repertório" : "Confiabilidade"}</dt>
          <dd>${escapar(item.confiabilidade || (cultural ? "Repertório cultural" : "A avaliar"))}</dd>
          <dt>${cultural ? "Status editorial" : "Conferência da fonte"}</dt>
          <dd>${escapar(item.fonte_status || item.status || "A confirmar")}</dd>
        </dl>
      </aside>
    </header>

    ${cultural ? secoesCulturais(item) : secoesDados(item)}

    <section class="detail-section">
      <h2>Conceitos relacionados</h2>
      ${conceitos.length ? `<ul class="concept-list">${conceitos.map((conceito) => `<li>${escapar(conceito)}</li>`).join("")}</ul>` : `<p>A definir.</p>`}
    </section>

    <section class="detail-section">
      <h2>Autores e autoras que ajudam a pensar</h2>
      ${autores.length ? `<p>${autores.map(escapar).join("; ")}.</p>` : `<p>A definir.</p>`}
    </section>

    <p><a class="button" href="index.html#repertorios">Voltar aos repertórios</a></p>
  `;
}

function secoesCulturais(item) {
  return [
    secao("Resumo da obra", item.resumo_obra || item.resumo),
    secao("Leitura Sociosofia", item.leitura_sociosofia),
    secao("Ancoragem teórica", item.ancoragem_teorica)
  ].join("");
}

function secoesDados(item) {
  return [
    secao("Dado ou ideia central", item.dado || item.ideia),
    secao("Conexões possíveis", item.conexoes),
    secao("Observação editorial", item.observacao_editorial)
  ].join("");
}

function secao(titulo, conteudo) {
  if (!conteudo) return "";
  return `
    <section class="detail-section">
      <h2>${escapar(titulo)}</h2>
      <p>${escapar(conteudo)}</p>
    </section>
  `;
}

function renderizarErro(mensagem) {
  breadcrumbAtual.textContent = "Erro";
  detalhe.innerHTML = `
    <section class="detail-section">
      <h1>Ops, não encontramos esse repertório.</h1>
      <p>${escapar(mensagem)}</p>
      <p><a class="button" href="index.html#repertorios">Voltar aos repertórios</a></p>
    </section>
  `;
}

function normalizarLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean);
  if (!valor) return [];
  return String(valor).split(/[;,]/).map((item) => item.trim()).filter(Boolean);
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
