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

  detalhe.innerHTML = `
    <header class="detail-hero">
      <div>
        <span class="tag ${item.status !== "publicado" ? "review" : ""}">${escapar(item.tipo || "Repertório")}</span>
        <h1>${escapar(item.titulo)}</h1>
        <p>${escapar(item.resumo)}</p>
        <div class="detail-meta">
          <span>${escapar(item.categoria)}</span>
          <span>•</span>
          <span>${escapar(item.tema)}</span>
          <span>•</span>
          <span>${escapar(item.status || "rascunho")}</span>
        </div>
      </div>
      <aside class="detail-sidebar" aria-label="Metadados do repertório">
        <dl>
          <dt>Fonte original</dt>
          <dd>${item.fonte_url ? `<a href="${escaparAtributo(item.fonte_url)}" target="_blank" rel="noopener noreferrer">${escapar(item.fonte_nome || "Acessar fonte")}</a>` : escapar(item.fonte_nome || "A definir")}</dd>
          <dt>Ano ou data</dt>
          <dd>${escapar(item.ano_data || "A definir")}</dd>
          <dt>Confiabilidade</dt>
          <dd>${escapar(item.confiabilidade || "A avaliar")}</dd>
          <dt>Tempo de leitura</dt>
          <dd>${escapar(item.tempo_leitura || "Leitura rápida")}</dd>
        </dl>
      </aside>
    </header>

    ${secao("Dado ou ideia central", item.ideia)}
    ${secao("Por que isso importa?", item.importancia)}
    ${secao("Como transformar em argumento?", item.uso)}

    <section class="detail-section">
      <h2>Conceitos que aparecem aqui</h2>
      ${conceitos.length ? `<ul class="concept-list">${conceitos.map((conceito) => `<li>${escapar(conceito)}</li>`).join("")}</ul>` : `<p>A definir.</p>`}
    </section>

    <section class="detail-section">
      <h2>Autores que ajudam a pensar</h2>
      ${autores.length ? `<p>${autores.map(escapar).join("; ")}.</p>` : `<p>A definir.</p>`}
    </section>

    ${item.midia_relacionada ? secao("Repertório cultural relacionado", item.midia_relacionada) : ""}

    <p><a class="button" href="index.html#repertorios">Voltar aos repertórios</a></p>
  `;
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
  return escapar(texto);
}
