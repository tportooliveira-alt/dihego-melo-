// ===== Painel de fotos (admin.html) =====
// Publica fotos reais dos anúncios direto no repositório do site via API do
// GitHub. O acesso é um fine-grained token do GitHub (só este repositório,
// permissão Contents: read/write), colado uma vez e guardado no aparelho.
// O GitHub Pages republica o site sozinho em ~2 minutos após cada mudança.

const ADMIN = {
  owner: "tportooliveira-alt",
  repo: "dihego-melo-",
  branch: "main",
  arquivoFotos: "img/veiculos/fotos.json",
};

let tokenAdmin = localStorage.getItem("dm81_token") || "";
let fotosMapa = {}; // id -> lista de caminhos (estado vivo, vindo do GitHub)
let fotosSha = null; // sha do fotos.json no GitHub, exigido para atualizá-lo

// ---- Cliente da API do GitHub ----

function gh(caminho, opcoes) {
  opcoes = opcoes || {};
  opcoes.headers = {
    Authorization: "Bearer " + tokenAdmin,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (opcoes.body) opcoes.headers["Content-Type"] = "application/json";
  return fetch("https://api.github.com" + caminho, opcoes);
}

function b64paraTexto(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ""))));
}

function textoParaB64(texto) {
  return btoa(unescape(encodeURIComponent(texto)));
}

// Prévia sempre fresca (independe do cache do Pages).
function urlRaw(caminho) {
  return "https://raw.githubusercontent.com/" + ADMIN.owner + "/" + ADMIN.repo +
    "/" + ADMIN.branch + "/" + caminho;
}

// ---- Avisos ----

let avisoTimer = null;
function avisar(msg, duracao) {
  const el = document.getElementById("aviso");
  el.textContent = msg;
  el.classList.add("visivel");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(function () { el.classList.remove("visivel"); }, duracao || 3500);
}

// ---- Entrada ----

async function entrar(token) {
  tokenAdmin = token.trim();
  if (!tokenAdmin) return avisar("Cole o código de acesso primeiro.");
  const r = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo);
  if (!r.ok) {
    tokenAdmin = "";
    return avisar("Código inválido ou sem acesso ao site. Confira e tente de novo.");
  }
  localStorage.setItem("dm81_token", tokenAdmin);
  await iniciarPainel();
}

function sair() {
  localStorage.removeItem("dm81_token");
  location.reload();
}

// ---- Estado das fotos no GitHub ----

async function carregarFotosDoGitHub() {
  const r = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo +
    "/contents/" + ADMIN.arquivoFotos + "?ref=" + ADMIN.branch + "&t=" + Date.now());
  if (r.status === 404) { fotosMapa = {}; fotosSha = null; return; }
  if (!r.ok) throw new Error("Não consegui ler as fotos atuais (HTTP " + r.status + ").");
  const dados = await r.json();
  fotosSha = dados.sha;
  try { fotosMapa = JSON.parse(b64paraTexto(dados.content)) || {}; }
  catch (e) { fotosMapa = {}; }
}

async function salvarFotosJson(mensagem) {
  const corpo = {
    message: mensagem,
    content: textoParaB64(JSON.stringify(fotosMapa, null, 2) + "\n"),
    branch: ADMIN.branch,
  };
  if (fotosSha) corpo.sha = fotosSha;

  let r = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo +
    "/contents/" + ADMIN.arquivoFotos, { method: "PUT", body: JSON.stringify(corpo) });

  // Conflito de sha (alguém salvou antes): pega o sha novo e tenta uma vez mais.
  if (r.status === 409 || r.status === 422) {
    const atual = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo +
      "/contents/" + ADMIN.arquivoFotos + "?ref=" + ADMIN.branch + "&t=" + Date.now());
    if (atual.ok) {
      corpo.sha = (await atual.json()).sha;
      r = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo +
        "/contents/" + ADMIN.arquivoFotos, { method: "PUT", body: JSON.stringify(corpo) });
    }
  }
  if (!r.ok) throw new Error("Não consegui salvar a lista de fotos (HTTP " + r.status + ").");
  fotosSha = (await r.json()).content.sha;
}

// ---- Upload ----

// Reduz a foto para no máximo 1600px e JPG ~q80 — padrão de peso do site.
function comprimirFoto(arquivo) {
  return new Promise(function (resolver, rejeitar) {
    const img = new Image();
    img.onload = function () {
      const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolver(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
    };
    img.onerror = function () { rejeitar(new Error("Arquivo não é uma imagem válida.")); };
    img.src = URL.createObjectURL(arquivo);
  });
}

async function subirFotos(veiculoId, arquivos, botao) {
  const rotulo = botao.textContent;
  botao.disabled = true;
  try {
    const novos = [];
    for (let i = 0; i < arquivos.length; i++) {
      botao.textContent = "Enviando " + (i + 1) + " de " + arquivos.length + "…";
      const base64 = await comprimirFoto(arquivos[i]);
      const caminho = "img/veiculos/" + veiculoId + "-" + Date.now() + "-" + i + ".jpg";
      const r = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo + "/contents/" + caminho, {
        method: "PUT",
        body: JSON.stringify({
          message: "Foto do veículo " + veiculoId + " (painel admin)",
          content: base64,
          branch: ADMIN.branch,
        }),
      });
      if (!r.ok) throw new Error("Falha ao enviar a foto " + (i + 1) + " (HTTP " + r.status + ").");
      novos.push(caminho);
    }
    const chave = String(veiculoId);
    fotosMapa[chave] = (fotosMapa[chave] || []).concat(novos);
    botao.textContent = "Publicando…";
    await salvarFotosJson("Atualiza fotos do veículo " + veiculoId + " (painel admin)");
    desenharPainel();
    avisar("Foto publicada! O site atualiza em ~2 minutos.", 5000);
  } catch (e) {
    avisar(e.message || "Algo deu errado. Tente de novo.", 5000);
  } finally {
    botao.disabled = false;
    botao.textContent = rotulo;
  }
}

async function removerFoto(veiculoId, caminho) {
  try {
    const arq = await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo +
      "/contents/" + caminho + "?ref=" + ADMIN.branch + "&t=" + Date.now());
    if (arq.ok) {
      const sha = (await arq.json()).sha;
      await gh("/repos/" + ADMIN.owner + "/" + ADMIN.repo + "/contents/" + caminho, {
        method: "DELETE",
        body: JSON.stringify({
          message: "Remove foto do veículo " + veiculoId + " (painel admin)",
          sha: sha,
          branch: ADMIN.branch,
        }),
      });
    }
    const chave = String(veiculoId);
    fotosMapa[chave] = (fotosMapa[chave] || []).filter(function (c) { return c !== caminho; });
    if (!fotosMapa[chave].length) delete fotosMapa[chave];
    await salvarFotosJson("Atualiza fotos do veículo " + veiculoId + " (painel admin)");
    desenharPainel();
    avisar("Foto removida. O site atualiza em ~2 minutos.");
  } catch (e) {
    avisar(e.message || "Não consegui remover. Tente de novo.", 5000);
  }
}

async function tornarCapa(veiculoId, caminho) {
  const chave = String(veiculoId);
  const lista = fotosMapa[chave] || [];
  fotosMapa[chave] = [caminho].concat(lista.filter(function (c) { return c !== caminho; }));
  try {
    await salvarFotosJson("Define capa do veículo " + veiculoId + " (painel admin)");
    desenharPainel();
    avisar("Capa definida! O site atualiza em ~2 minutos.");
  } catch (e) {
    avisar(e.message, 5000);
  }
}

// ---- Desenho ----

function desenharPainel() {
  const lista = document.getElementById("lista-veiculos");
  lista.innerHTML = VEICULOS.map(function (v) {
    const fotos = fotosMapa[String(v.id)] || [];
    const capa = fotos.length
      ? '<img src="' + urlRaw(fotos[0]) + '" alt="">'
      : svgVeiculo(v, false);
    const miniaturas = fotos.map(function (c, i) {
      return (
        '<div class="admin-foto' + (i === 0 ? " capa-atual" : "") + '">' +
        '<img src="' + urlRaw(c) + '" alt="">' +
        (i === 0 ? '<span class="tag-capa">Capa</span>' : "") +
        '<div class="mini-acoes">' +
        (i !== 0 ? '<button class="btn-mini" data-acao="capa" data-id="' + v.id + '" data-caminho="' + c + '">Capa</button>' : "") +
        '<button class="btn-mini perigo" data-acao="remover" data-id="' + v.id + '" data-caminho="' + c + '">Excluir</button>' +
        "</div></div>"
      );
    }).join("");
    return (
      '<article class="admin-item">' +
      '<div class="capa">' + capa + "</div>" +
      "<div>" +
      "<h3>" + v.marca + " " + v.modelo + "</h3>" +
      '<p class="sub">' + v.versao + " · " + v.ano + " · " +
      (fotos.length ? fotos.length + " foto" + (fotos.length > 1 ? "s" : "") : "sem foto real — usando arte") +
      "</p>" +
      '<div class="admin-fotos">' + miniaturas + "</div>" +
      '<button class="btn-add" data-acao="adicionar" data-id="' + v.id + '">+ Adicionar fotos</button>' +
      "</div></article>"
    );
  }).join("");
}

// ---- Fiação ----

async function iniciarPainel() {
  try {
    await carregarFotosDoGitHub();
  } catch (e) {
    return avisar(e.message, 5000);
  }
  document.getElementById("login").hidden = true;
  document.getElementById("painel").hidden = false;
  document.getElementById("btn-sair").hidden = false;
  desenharPainel();
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btn-entrar").addEventListener("click", function () {
    entrar(document.getElementById("campo-token").value);
  });
  document.getElementById("campo-token").addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") entrar(ev.target.value);
  });
  document.getElementById("btn-sair").addEventListener("click", sair);

  // Um input de arquivo só, reaproveitado por todos os botões "Adicionar".
  const seletor = document.createElement("input");
  seletor.type = "file";
  seletor.accept = "image/*";
  seletor.multiple = true;
  let botaoAtivo = null;

  seletor.addEventListener("change", function () {
    if (seletor.files.length && botaoAtivo) {
      subirFotos(Number(botaoAtivo.getAttribute("data-id")), Array.from(seletor.files), botaoAtivo);
    }
    seletor.value = "";
  });

  document.getElementById("lista-veiculos").addEventListener("click", function (ev) {
    const botao = ev.target.closest("[data-acao]");
    if (!botao) return;
    const acao = botao.getAttribute("data-acao");
    const id = Number(botao.getAttribute("data-id"));
    const caminho = botao.getAttribute("data-caminho");
    if (acao === "adicionar") { botaoAtivo = botao; seletor.click(); }
    if (acao === "remover") removerFoto(id, caminho);
    if (acao === "capa") tornarCapa(id, caminho);
  });

  if (tokenAdmin) iniciarPainel();
});
