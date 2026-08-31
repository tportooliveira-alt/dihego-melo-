// ===== DM Veículos — lógica compartilhada =====

const TIPO_LABEL = {
  carro: "Carro",
  moto: "Moto",
  caminhao: "Caminhão",
  utilitario: "Utilitário",
  onibus: "Ônibus",
  carreta: "Carreta",
  trator: "Trator",
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

// Rodagem do veículo: km, horas de uso (tratores/máquinas) ou nada (carretas).
function rodagem(v) {
  if (v.km != null) return chip("km", formatarKm(v.km));
  if (v.horas != null) return chip("horas", v.horas.toLocaleString("pt-BR") + " h");
  return "";
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
  // Silhueta única e contínua: garfo, guidão, tanque, banco, rabeta e motor.
  moto:
    '<circle cx="84" cy="130" r="26" fill="none" stroke="#f5f0e8" stroke-width="8"/>' +
    '<circle cx="236" cy="130" r="26" fill="none" stroke="#f5f0e8" stroke-width="8"/>' +
    '<path d="M84 130 L108 88 L104 77 L138 74 Q160 72 180 79 L208 85 L233 81 L236 128 ' +
    'L200 118 L168 116 L148 123 Z"/>',
  caminhao:
    '<path d="M26 138 L26 92 Q26 82 38 82 L84 82 L106 110 L106 138 Z"/>' +
    '<rect x="100" y="58" width="188" height="80" rx="5" opacity=".82"/>' +
    '<circle cx="64" cy="140" r="17"/><circle cx="162" cy="140" r="17"/><circle cx="246" cy="140" r="17"/>' +
    '<circle cx="64" cy="140" r="8" fill="rgba(0,0,0,.4)"/><circle cx="162" cy="140" r="8" fill="rgba(0,0,0,.4)"/><circle cx="246" cy="140" r="8" fill="rgba(0,0,0,.4)"/>',
  van:
    '<path d="M34 138 L34 100 Q34 78 60 76 L220 70 Q262 70 276 96 L284 118 L284 138 Z"/>' +
    '<rect x="46" y="86" width="40" height="26" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<circle cx="90" cy="140" r="17"/><circle cx="234" cy="140" r="17"/>' +
    '<circle cx="90" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="234" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  onibus:
    '<rect x="30" y="64" width="258" height="74" rx="12"/>' +
    '<rect x="42" y="76" width="34" height="24" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="84" y="76" width="34" height="24" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="126" y="76" width="34" height="24" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="168" y="76" width="34" height="24" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="210" y="76" width="34" height="24" rx="4" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="254" y="76" width="26" height="52" rx="4" fill="rgba(0,0,0,.22)"/>' +
    '<circle cx="86" cy="140" r="17"/><circle cx="232" cy="140" r="17"/>' +
    '<circle cx="86" cy="140" r="8" fill="rgba(0,0,0,.35)"/><circle cx="232" cy="140" r="8" fill="rgba(0,0,0,.35)"/>',
  carreta:
    '<rect x="56" y="60" width="230" height="66" rx="5"/>' +
    '<path d="M56 126 L34 126 L34 118 L56 112 Z" opacity=".85"/>' +
    '<rect x="86" y="126" width="8" height="18" opacity=".85"/>' +
    '<line x1="66" y1="72" x2="66" y2="114" stroke="rgba(0,0,0,.18)" stroke-width="4"/>' +
    '<line x1="120" y1="72" x2="120" y2="114" stroke="rgba(0,0,0,.18)" stroke-width="4"/>' +
    '<line x1="174" y1="72" x2="174" y2="114" stroke="rgba(0,0,0,.18)" stroke-width="4"/>' +
    '<line x1="228" y1="72" x2="228" y2="114" stroke="rgba(0,0,0,.18)" stroke-width="4"/>' +
    '<circle cx="190" cy="140" r="16"/><circle cx="228" cy="140" r="16"/><circle cx="266" cy="140" r="16"/>' +
    '<circle cx="190" cy="140" r="7" fill="rgba(0,0,0,.35)"/><circle cx="228" cy="140" r="7" fill="rgba(0,0,0,.35)"/><circle cx="266" cy="140" r="7" fill="rgba(0,0,0,.35)"/>',
  trator:
    '<path d="M54 136 L54 106 Q54 100 60 100 L128 100 L128 62 Q128 56 134 56 L178 56 Q184 56 184 62 L184 100 L196 104 L196 136 Z"/>' +
    '<rect x="138" y="66" width="34" height="24" rx="3" fill="rgba(0,0,0,.3)"/>' +
    '<rect x="142" y="36" width="7" height="22" rx="2"/>' +
    '<circle cx="222" cy="118" r="34"/><circle cx="222" cy="118" r="15" fill="rgba(0,0,0,.35)"/>' +
    '<circle cx="88" cy="138" r="18"/><circle cx="88" cy="138" r="8" fill="rgba(0,0,0,.35)"/>',
};

function svgVeiculo(v, mostrarNome) {
  const gid = "g" + v.id + (mostrarNome ? "d" : "c");
  const glow = "gl" + v.id + (mostrarNome ? "d" : "c");
  const silhueta = SILHUETAS[v.icone] || SILHUETAS.carro;
  const nome = mostrarNome
    ? '<text x="160" y="32" text-anchor="middle" fill="rgba(245,240,232,.55)" ' +
      'font-family="Sora, system-ui, sans-serif" font-size="12" font-weight="700" ' +
      'letter-spacing="2.4">' +
      (v.marca + " " + v.modelo).toUpperCase() + "</text>"
    : "";
  return (
    '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" ' +
    'aria-label="' + v.marca + " " + v.modelo + '" preserveAspectRatio="xMidYMid slice">' +
    "<defs>" +
    '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0.6" y2="1">' +
    '<stop offset="0%" stop-color="#16283f"/>' +
    '<stop offset="100%" stop-color="#0a1526"/>' +
    "</linearGradient>" +
    '<radialGradient id="' + glow + '" cx="0.78" cy="0.12" r="0.75">' +
    '<stop offset="0%" stop-color="' + v.g1 + '" stop-opacity="0.55"/>' +
    '<stop offset="100%" stop-color="' + v.g1 + '" stop-opacity="0"/>' +
    "</radialGradient>" +
    "</defs>" +
    '<rect width="320" height="200" fill="url(#' + gid + ')"/>' +
    '<rect width="320" height="200" fill="url(#' + glow + ')"/>' +
    '<ellipse cx="160" cy="152" rx="128" ry="16" fill="rgba(0,0,0,.35)"/>' +
    '<g fill="#f5f0e8" opacity="0.96">' + silhueta + "</g>" +
    '<rect x="28" y="157" width="264" height="2" rx="1" fill="rgba(201,148,58,.55)"/>' +
    nome +
    "</svg>"
  );
}

// ---- Ícones de linha (SVG) usados nos chips e listas ----

const ICONES = {
  ano:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>' +
    '<line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  km:
    '<path d="M4 18a8 8 0 1 1 16 0"/><line x1="12" y1="18" x2="16" y2="12"/>',
  horas:
    '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  combustivel:
    '<path d="M5 21V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16"/><line x1="3" y1="21" x2="15" y2="21"/>' +
    '<path d="M13 9h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-2.5-3"/>',
  cambio:
    '<line x1="6" y1="4" x2="6" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>' +
    '<line x1="18" y1="4" x2="18" y2="12"/><line x1="6" y1="12" x2="18" y2="12"/>' +
    '<circle cx="6" cy="20" r="1.6"/>',
};

function ico(nome, tamanho) {
  const t = tamanho || 13;
  return (
    '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' + ICONES[nome] + "</svg>"
  );
}

function chip(icone, texto) {
  return "<span>" + ico(icone) + texto + "</span>";
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
    chip("ano", v.ano) +
    rodagem(v) +
    (v.combustivel !== "—" ? chip("combustivel", v.combustivel) : "") +
    (v.cambio !== "—" ? chip("cambio", v.cambio) : "") +
    "</div>" +
    '<div class="card-preco">' +
    '<span class="valor">' + formatarPreco(v.preco) + "</span>" +
    '<a class="btn-detalhes" href="veiculo.html?id=' + v.id + '">Ver detalhes</a>' +
    "</div></div></article>"
  );
}

// Parâmetros da URL (?tipo=moto, ?id=7). Isolado numa função porque a prévia
// de página única troca esta implementação para navegar sem recarregar.
function paramsDaPagina() {
  return new URLSearchParams(location.search);
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
  const params = paramsDaPagina();
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

    info.innerHTML =
      "<strong>" + lista.length + "</strong>" +
      (lista.length === 1 ? " veículo encontrado" : " veículos encontrados");
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
    .slice(0, 8)
    .map(cardVeiculo)
    .join("");
}

// Quando o site é servido pela VPS, o estoque vem do backend (sempre atualizado).
// Sem backend — no GitHub Pages, por exemplo — usa o que está em js/data.js.
async function carregarEstoqueDoServidor() {
  try {
    const controle = new AbortController();
    const prazo = setTimeout(function () { controle.abort(); }, 4000);
    const r = await fetch("/api/veiculos", { signal: controle.signal });
    clearTimeout(prazo);
    if (!r.ok) return false;

    const dados = await r.json();
    if (!Array.isArray(dados.veiculos) || !dados.veiculos.length) return false;

    // As cores e o ícone da arte continuam vindo do data.js, casados por id.
    const visual = {};
    VEICULOS.forEach(function (v) {
      visual[v.id] = { g1: v.g1, g2: v.g2, icone: v.icone };
    });

    VEICULOS.length = 0;
    dados.veiculos.forEach(function (v) {
      const arte = visual[v.id] || { g1: "#1d3350", g2: "#0a1526", icone: v.tipo };
      VEICULOS.push(Object.assign({}, v, arte));
    });
    return true;
  } catch (e) {
    return false;
  }
}

// Começa a buscar já, sem esperar o DOM. Todas as páginas aguardam esta promessa
// antes de desenhar qualquer coisa — inclusive a ficha do veículo, em veiculo.js.
const ESTOQUE_PRONTO = carregarEstoqueDoServidor();

// Nomeada para a prévia de página única poder rodar de novo ao trocar de página.
async function iniciarSite() {
  iniciarMenu();
  preencherDadosLoja();
  await ESTOQUE_PRONTO;
  iniciarDestaques();
  iniciarCatalogo();
}

document.addEventListener("DOMContentLoaded", iniciarSite);
