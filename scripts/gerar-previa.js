// Gera uma prévia navegável do site inteiro num único arquivo HTML.
//
// Junta as cinco páginas, embute CSS, JS e imagens, e troca a navegação por
// mostrar/esconder seções — assim dá para clicar por tudo a partir de um link só.
// A prévia é SEMPRE derivada dos arquivos reais: nada aqui é escrito à mão.
//
//   node scripts/gerar-previa.js
//   -> previa-dm81.html

const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (p) => fs.readFileSync(path.join(raiz, p), "utf8");

const PAGINAS = [
  { chave: "index", arquivo: "index.html", titulo: "Início" },
  { chave: "veiculo", arquivo: "veiculo.html", titulo: "Veículo" },
  { chave: "consorcio", arquivo: "consorcio.html", titulo: "Consórcio" },
  { chave: "vender", arquivo: "vender.html", titulo: "Vender" },
  { chave: "contato", arquivo: "contato.html", titulo: "Contato" },
];

// ── Corpo de cada página, sem os <script> (rodam uma vez só, no fim) ──
function corpoDaPagina(arquivo) {
  const html = ler(arquivo);
  const m = html.match(/<body>([\s\S]*?)<\/body>/i);
  if (!m) throw new Error("não achei o <body> em " + arquivo);
  return m[1].replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

// ── Imagens embutidas como data URI (o arquivo tem que se bastar) ──
function imagemEmbutida(rel) {
  const abs = path.join(raiz, rel);
  if (!fs.existsSync(abs)) return null;
  const ext = path.extname(rel).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${fs.readFileSync(abs).toString("base64")}`;
}

let secoes = PAGINAS.map((p) => {
  let corpo = corpoDaPagina(p.arquivo);
  // O botão flutuante do WhatsApp e o chat são globais: um só para a prévia toda.
  corpo = corpo.replace(/<a class="whats-flutuante"[\s\S]*?<\/a>/gi, "");
  return `<div class="previa-pagina" id="pg-${p.chave}" hidden>\n${corpo}\n</div>`;
}).join("\n\n");

// Troca a imagem do panfleto pelo data URI.
const promo = imagemEmbutida("img/promo-consorcio.jpg");
if (promo) {
  secoes = secoes.replace(/src="img\/promo-consorcio\.jpg"/g, `src="${promo}"`);
}

const whatsFlutuante = (() => {
  const m = ler("index.html").match(/<a class="whats-flutuante"[\s\S]*?<\/a>/i);
  return m ? m[0] : "";
})();

// ── Scripts do site, na mesma ordem em que as páginas carregam ──
const scripts = ["js/data.js", "js/main.js", "js/veiculo.js", "js/vender.js", "js/chat.js"]
  .map((f) => `/* ===== ${f} ===== */\n` + ler(f))
  .join("\n\n");

// O formulário de contato mora inline no contato.html; extraímos para cá.
const scriptContato = (() => {
  const html = ler("contato.html");
  const m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
  return m ? m[1] : "";
})();

const css = ler("css/style.css");

const shim = `
/* ===== Camada da prévia (não existe no site publicado) ===== */
(function () {
  var buscaAtual = "";
  var paginaAtual = "index";

  // Substitui a leitura de ?tipo= / ?id= por um valor que a prévia controla.
  window.paramsDaPagina = function () {
    return new URLSearchParams(buscaAtual);
  };

  function mostrar(chave, busca) {
    paginaAtual = chave;
    buscaAtual = busca || "";

    document.querySelectorAll(".previa-pagina").forEach(function (el) {
      el.hidden = el.id !== "pg-" + chave;
    });

    // Remonta o que depende de parâmetro.
    if (chave === "veiculo" && typeof montarFichaVeiculo === "function") {
      var conteudo = document.getElementById("detalhe-conteudo");
      var aviso = document.getElementById("nao-encontrado");
      if (conteudo) conteudo.hidden = false;
      if (aviso) aviso.hidden = true;
      var semelhantes = document.getElementById("secao-semelhantes");
      if (semelhantes) semelhantes.hidden = false;
      montarFichaVeiculo();
    }
    if (chave === "index" && typeof iniciarCatalogo === "function") {
      iniciarCatalogo();
    }

    window.scrollTo(0, 0);
    atualizarBarra();
  }

  // Toda navegação interna vira troca de seção.
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (/^(https?:|mailto:|tel:)/.test(href)) return;

    var m = href.match(/^([\\w-]+)\\.html(\\?[^#]*)?(#.*)?$/);
    if (!m) return;

    e.preventDefault();
    var chave = m[1] === "index" ? "index" : m[1];
    mostrar(chave, m[2] || "");

    if (m[3]) {
      var alvo = document.querySelector("#pg-" + chave + " " + m[3]);
      if (alvo) setTimeout(function () { alvo.scrollIntoView({ behavior: "smooth" }); }, 60);
    }
    var menu = document.querySelector("#pg-" + chave + " .menu");
    if (menu) menu.classList.remove("aberto");
  });

  // A busca do topo é um <form action="index.html">: intercepta também.
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList.contains("busca-hero")) return;
    e.preventDefault();
    var termo = (form.querySelector("input[name=busca]") || {}).value || "";
    mostrar("index", termo ? "?busca=" + encodeURIComponent(termo) : "");
    var estoque = document.querySelector("#pg-index #estoque");
    if (estoque) setTimeout(function () { estoque.scrollIntoView({ behavior: "smooth" }); }, 60);
  });

  // Barra de navegação da prévia.
  var barra = document.createElement("div");
  barra.className = "previa-barra";
  barra.innerHTML =
    '<span class="previa-etiqueta">Prévia</span>' +
    ${JSON.stringify(PAGINAS.map((p) => ({ chave: p.chave, titulo: p.titulo })))}
      .map(function (p) {
        return '<button type="button" data-pg="' + p.chave + '">' + p.titulo + "</button>";
      })
      .join("");
  document.body.appendChild(barra);

  barra.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-pg]");
    if (!b) return;
    // A ficha precisa de um veículo: abre o primeiro do estoque.
    mostrar(b.dataset.pg, b.dataset.pg === "veiculo" ? "?id=" + (VEICULOS[0] || {}).id : "");
  });

  function atualizarBarra() {
    barra.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("ativo", b.dataset.pg === paginaAtual);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    mostrar("index", "");
  });
})();
`;

const estilosDaPrevia = `
/* Barra da prévia — some do site publicado */
.previa-barra {
  position: fixed; left: 50%; bottom: 1.1rem; transform: translateX(-50%);
  z-index: 70; display: flex; align-items: center; gap: .25rem;
  padding: .35rem .4rem; border-radius: 999px;
  background: rgba(16,31,54,.92); border: 1px solid rgba(245,240,232,.2);
  box-shadow: 0 12px 32px rgba(0,0,0,.5); backdrop-filter: blur(12px);
  font-family: "Manrope", system-ui, sans-serif; max-width: calc(100vw - 2rem);
  overflow-x: auto;
}
.previa-etiqueta {
  font-size: .62rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
  color: #c9943a; padding: 0 .55rem 0 .4rem; white-space: nowrap;
}
.previa-barra button {
  border: none; background: none; cursor: pointer; white-space: nowrap;
  color: rgba(245,240,232,.7); font-family: inherit; font-size: .82rem;
  font-weight: 600; padding: .45rem .85rem; border-radius: 999px;
  transition: background .2s, color .2s;
}
.previa-barra button:hover { color: #f5f0e8; background: rgba(245,240,232,.08); }
.previa-barra button.ativo { background: #c9943a; color: #0a1526; font-weight: 700; }
.previa-pagina[hidden] { display: none; }
/* Espaço para a barra não cobrir o rodapé */
.rodape { padding-bottom: 4.5rem; }

/* No celular a barra ocupa a largura toda, então os botões flutuantes sobem. */
@media (max-width: 560px) {
  .previa-barra {
    left: .7rem; right: .7rem; transform: none;
    justify-content: flex-start; font-size: .75rem;
  }
  .whats-flutuante { bottom: 4.8rem; }
  .chat-dm81 { bottom: 9rem; }
  .chat-painel { height: min(440px, calc(100vh - 15rem)); }
}
`;

const saida = `<title>DM81 Consultoria &amp; Finanças</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
${css}
${estilosDaPrevia}
</style>

${secoes}

${whatsFlutuante}

<script>
${scripts}

${scriptContato}

${shim}
</script>
`;

fs.writeFileSync(path.join(raiz, "previa-dm81.html"), saida, "utf8");
console.log(
  `previa-dm81.html gerada — ${PAGINAS.length} páginas, ` +
    `${(Buffer.byteLength(saida) / 1024).toFixed(0)} KB`
);
