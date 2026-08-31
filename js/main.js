// ===== DM Veículos — lógica compartilhada =====

const TIPO_LABEL = {
  carro: "Carro",
  moto: "Moto",
  caminhao: "Caminhão",
  utilitario: "Utilitário",
};

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatarKm(km) {
  return km.toLocaleString("pt-BR") + " km";
}

// ---- Ilustrações SVG dos veículos (placeholders vetoriais) ----
// Cada anúncio ganha uma arte com gradiente próprio e a silhueta do tipo.

const SILHUETAS = {
  sedan:
    '<path d="M30 138 L48 134 Q56 110 78 104 L118 96 Q150 78 196 82 L232 100 L268 108 Q286 112 288 126 L288 138 Z"/>' +
    '<circle cx="92" cy="140" r="17"/><circle cx="236" cy="140" r="17"/>' +
    '<circle cx="92" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="236" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  carro:
    '<path d="M34 138 L50 132 Q60 108 84 102 L120 96 Q146 80 186 84 L224 102 L258 110 Q276 114 278 128 L278 138 Z"/>' +
    '<circle cx="94" cy="140" r="17"/><circle cx="226" cy="140" r="17"/>' +
    '<circle cx="94" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="226" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  suv:
    '<path d="M30 138 L44 130 Q50 100 76 94 L110 88 Q134 70 184 74 L228 92 L262 102 Q282 108 284 124 L284 138 Z"/>' +
    '<circle cx="90" cy="140" r="19"/><circle cx="232" cy="140" r="19"/>' +
    '<circle cx="90" cy="140" r="9" fill="rgba(0,0,0,.35)"/><circle cx="232" cy="140" r="9" fill="rgba(0,0,0,.35)"/>',
  picape:
    '<path d="M28 138 L42 130 Q48 102 74 96 L108 90 Q126 72 168 76 L184 94 L188 96 L188 118 L286 118 L286 138 Z"/>' +
    '<path d="M196 96 L282 96 L286 116 L196 116 Z" opacity=".75"/>' +
    '<circle cx="88" cy="140" r="18"/><circle cx="238" cy="140" r="18"/>' +
    '<circle cx="88" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="238" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  moto:
    '<circle cx="80" cy="132" r="26" fill="none" stroke="rgba(255,255,255,.92)" stroke-width="9"/>' +
    '<circle cx="240" cy="132" r="26" fill="none" stroke="rgba(255,255,255,.92)" stroke-width="9"/>' +
    '<path d="M80 132 L128 92 L196 92 L240 132 L196 132 L156 100 Z"/>' +
    '<path d="M120 92 L104 68 L132 68 Z"/>' +
    '<rect x="150" y="82" width="52" height="14" rx="7"/>',
  caminhao:
    '<path d="M30 138 L30 96 Q30 84 42 84 L86 84 L106 108 L106 138 Z"/>' +
    '<rect x="112" y="62" width="176" height="76" rx="6" opacity=".85"/>' +
    '<circle cx="66" cy="140" r="17"/><circle cx="160" cy="140" r="17"/><circle cx="246" cy="140" r="17"/>' +
    '<circle cx="66" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="160" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="246" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  van:
    '<path d="M34 138 L34 100 Q34 78 60 76 L220 70 Q262 70 276 96 L284 118 L284 138 Z"/>' +
    '<rect x="46" y="86" width="40" height="26" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<circle cx="90" cy="140" r="17"/><circle cx="234" cy="140" r="17"/>' +
    '<circle cx="90" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="234" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
};

function svgVeiculo(v, mostrarNome) {
  const gid = "g" + v.id + (mostrarNome ? "d" : "c");
  const silhueta = SILHUETAS[v.icone] || SILHUETAS.carro;
  const nome = mostrarNome
    ? '<text x="160" y="34" text-anchor="middle" fill="rgba(255,255,255,.85)" ' +
      'font-family="Segoe UI, sans-serif" font-size="17" font-weight="700">' +
      v.marca + " " + v.modelo + "</text>"
    : "";
  return (
    '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" ' +
    'aria-label="' + v.marca + " " + v.modelo + '" preserveAspectRatio="xMidYMid slice">' +
    "<defs><linearGradient id=\"" + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="' + v.g1 + '"/>' +
    '<stop offset="100%" stop-color="' + v.g2 + '"/>' +
    "</linearGradient></defs>" +
    '<rect width="320" height="200" fill="url(#' + gid + ')"/>' +
    '<circle cx="270" cy="30" r="70" fill="rgba(255,255,255,.06)"/>' +
    '<circle cx="30" cy="185" r="55" fill="rgba(0,0,0,.10)"/>' +
    '<rect y="156" width="320" height="44" fill="rgba(0,0,0,.18)"/>' +
    '<g fill="rgba(255,255,255,.92)">' + silhueta + "</g>" +
    nome +
    "</svg>"
  );
}

// ---- Links de WhatsApp ----

function linkWhats(mensagem) {
  return (
    "https://wa.me/" + LOJA.whatsapp + "?text=" + encodeURIComponent(mensagem)
  );
}

// ---- Card de veículo ----

function cardVeiculo(v) {
  return (
    '<article class="card-veiculo">' +
    '<a class="card-foto" href="veiculo.html?id=' + v.id + '">' +
    svgVeiculo(v, false) +
    '<span class="card-badge">' + TIPO_LABEL[v.tipo] + "</span>" +
    (v.destaque ? '<span class="card-badge destaque">Destaque</span>' : "") +
    "</a>" +
    '<div class="card-corpo">' +
    "<h3>" + v.marca + " " + v.modelo + "</h3>" +
    '<p class="versao">' + v.versao + "</p>" +
    '<div class="card-specs">' +
    "<span>📅 " + v.ano + "</span>" +
    "<span>🛣️ " + formatarKm(v.km) + "</span>" +
    "<span>⛽ " + v.combustivel + "</span>" +
    "<span>⚙️ " + v.cambio + "</span>" +
    "</div>" +
    '<div class="card-preco">' +
    '<span class="valor">' + formatarPreco(v.preco) + "</span>" +
    '<a class="btn-detalhes" href="veiculo.html?id=' + v.id + '">Ver detalhes</a>' +
    "</div></div></article>"
  );
}

// ---- Menu mobile ----

function iniciarMenu() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  if (botao && menu) {
    botao.addEventListener("click", function () {
      menu.classList.toggle("aberto");
    });
  }
}

// ---- Dados da loja espalhados pelo site ----

function preencherDadosLoja() {
  document.querySelectorAll("[data-loja]").forEach(function (el) {
    const chave = el.getAttribute("data-loja");
    if (LOJA[chave]) el.textContent = LOJA[chave];
  });
  document.querySelectorAll("[data-whats]").forEach(function (el) {
    el.setAttribute(
      "href",
      linkWhats(el.getAttribute("data-whats") || "Olá! Vim pelo site da " + LOJA.nome + ".")
    );
  });
  const ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();
}

// ---- Catálogo com filtros (página inicial) ----

function iniciarCatalogo() {
  const grade = document.getElementById("grade-catalogo");
  if (!grade) return;

  const fTipo = document.getElementById("f-tipo");
  const fMarca = document.getElementById("f-marca");
  const fPreco = document.getElementById("f-preco");
  const fAno = document.getElementById("f-ano");
  const fCambio = document.getElementById("f-cambio");
  const fBusca = document.getElementById("f-busca");
  const fOrdem = document.getElementById("f-ordem");
  const info = document.getElementById("resultado-info");
  const limpar = document.getElementById("btn-limpar");

  // Preenche marcas dinamicamente a partir do estoque.
  const marcas = Array.from(new Set(VEICULOS.map(function (v) { return v.marca; }))).sort();
  marcas.forEach(function (m) {
    const op = document.createElement("option");
    op.value = m;
    op.textContent = m;
    fMarca.appendChild(op);
  });

  // Aplica parâmetros vindos da URL (busca do hero / categorias).
  const params = new URLSearchParams(location.search);
  if (params.get("tipo")) fTipo.value = params.get("tipo");
  if (params.get("busca")) fBusca.value = params.get("busca");

  function aplicar() {
    let lista = VEICULOS.slice();

    if (fTipo.value) lista = lista.filter(function (v) { return v.tipo === fTipo.value; });
    if (fMarca.value) lista = lista.filter(function (v) { return v.marca === fMarca.value; });
    if (fCambio.value) {
      lista = lista.filter(function (v) {
        return fCambio.value === "automatico"
          ? v.cambio.toLowerCase().indexOf("autom") === 0
          : v.cambio.toLowerCase().indexOf("autom") !== 0;
      });
    }
    if (fAno.value) lista = lista.filter(function (v) { return v.ano >= Number(fAno.value); });
    if (fPreco.value) lista = lista.filter(function (v) { return v.preco <= Number(fPreco.value); });

    const termo = fBusca.value.trim().toLowerCase();
    if (termo) {
      lista = lista.filter(function (v) {
        return (v.marca + " " + v.modelo + " " + v.versao + " " + TIPO_LABEL[v.tipo])
          .toLowerCase()
          .indexOf(termo) !== -1;
      });
    }

    switch (fOrdem.value) {
      case "menor-preco":
        lista.sort(function (a, b) { return a.preco - b.preco; });
        break;
      case "maior-preco":
        lista.sort(function (a, b) { return b.preco - a.preco; });
        break;
      case "mais-novo":
        lista.sort(function (a, b) { return b.ano - a.ano; });
        break;
      case "menor-km":
        lista.sort(function (a, b) { return a.km - b.km; });
        break;
      default:
        lista.sort(function (a, b) { return Number(b.destaque) - Number(a.destaque); });
    }

    grade.innerHTML = lista.length
      ? lista.map(cardVeiculo).join("")
      : '<p class="sem-resultados">Nenhum veículo encontrado com esses filtros. ' +
        "Tente ajustar a busca ou fale com a gente no WhatsApp — buscamos o veículo pra você!</p>";

    info.textContent =
      lista.length + (lista.length === 1 ? " veículo encontrado" : " veículos encontrados");
  }

  [fTipo, fMarca, fPreco, fAno, fCambio, fOrdem].forEach(function (el) {
    el.addEventListener("change", aplicar);
  });
  fBusca.addEventListener("input", aplicar);

  limpar.addEventListener("click", function () {
    fTipo.value = "";
    fMarca.value = "";
    fPreco.value = "";
    fAno.value = "";
    fCambio.value = "";
    fBusca.value = "";
    fOrdem.value = "relevancia";
    aplicar();
  });

  aplicar();

  // Se veio de uma busca ou categoria, rola direto até o catálogo.
  if (params.get("tipo") || params.get("busca")) {
    const secao = document.getElementById("estoque");
    if (secao) secao.scrollIntoView();
  }
}

// ---- Destaques na home ----

function iniciarDestaques() {
  const grade = document.getElementById("grade-destaques");
  if (!grade) return;
  grade.innerHTML = VEICULOS.filter(function (v) { return v.destaque; })
    .slice(0, 4)
    .map(cardVeiculo)
    .join("");
}

document.addEventListener("DOMContentLoaded", function () {
  iniciarMenu();
  preencherDadosLoja();
  iniciarDestaques();
  iniciarCatalogo();
});
