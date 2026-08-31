// ===== Atendente virtual da DM81 =====
// Widget de chat do site. Envia as mensagens para o backend em CHAT.endpoint
// (a VPS) e mostra a resposta da IA. Sem backend no ar, o widget continua
// funcionando e encaminha a pessoa para o WhatsApp.

const CHAT = {
  // Endereço do backend. Em produção, aponte para a VPS:
  //   endpoint: "https://api.seudominio.com.br/api/chat"
  // Deixando relativo, funciona quando o site é servido pela própria VPS.
  endpoint: "/api/chat",
  // Tempo máximo de espera pela resposta da IA.
  timeoutMs: 25000,
  saudacao:
    "Olá! Sou o assistente da DM81. Posso te ajudar a encontrar um veículo, " +
    "simular um financiamento ou explicar como funciona a carta contemplada. " +
    "O que você procura?",
};

(function () {
  let aberto = false;
  let enviando = false;
  const historico = [];

  // Identifica a conversa para o backend conseguir manter o contexto.
  function sessaoId() {
    let id = null;
    try {
      id = sessionStorage.getItem("dm81_sessao");
    } catch (e) {
      /* navegador sem storage: segue sem identificar a sessão */
    }
    if (!id) {
      id = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      try {
        sessionStorage.setItem("dm81_sessao", id);
      } catch (e) {
        /* ignora */
      }
    }
    return id;
  }

  function el(tag, classe, texto) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function montar() {
    const raiz = el("div", "chat-dm81");

    // Botão flutuante
    const botao = el("button", "chat-botao");
    botao.type = "button";
    botao.setAttribute("aria-label", "Abrir atendimento");
    botao.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3-.5L4 21l1.7-4.2A8.2 8.2 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/>' +
      "</svg>";

    // Painel
    const painel = el("div", "chat-painel");
    painel.hidden = true;

    const topo = el("div", "chat-topo");
    topo.innerHTML =
      '<span class="chat-avatar" aria-hidden="true">81</span>' +
      '<span class="chat-titulo"><strong>Assistente DM81</strong>' +
      "<small>Tire suas dúvidas por aqui</small></span>";
    const fechar = el("button", "chat-fechar", "×");
    fechar.type = "button";
    fechar.setAttribute("aria-label", "Fechar atendimento");
    topo.appendChild(fechar);

    const corpo = el("div", "chat-corpo");
    corpo.setAttribute("role", "log");
    corpo.setAttribute("aria-live", "polite");

    const rodape = el("form", "chat-rodape");
    const campo = el("input", "chat-campo");
    campo.type = "text";
    campo.placeholder = "Escreva sua mensagem...";
    campo.setAttribute("aria-label", "Sua mensagem");
    campo.autocomplete = "off";
    const enviar = el("button", "chat-enviar");
    enviar.type = "submit";
    enviar.setAttribute("aria-label", "Enviar");
    enviar.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="21" y1="3" x2="10.5" y2="13.5"/><polygon points="21 3 14.5 21 10.5 13.5 3 9.5 21 3"/>' +
      "</svg>";
    rodape.appendChild(campo);
    rodape.appendChild(enviar);

    painel.appendChild(topo);
    painel.appendChild(corpo);
    painel.appendChild(rodape);
    raiz.appendChild(painel);
    raiz.appendChild(botao);
    document.body.appendChild(raiz);

    return { raiz, botao, painel, fechar, corpo, rodape, campo };
  }

  const ui = montar();

  function bolha(quem, texto) {
    const b = el("div", "chat-msg " + quem);
    b.textContent = texto;
    ui.corpo.appendChild(b);
    ui.corpo.scrollTop = ui.corpo.scrollHeight;
    return b;
  }

  // Quando o backend não responde, o atendimento não morre: leva pro WhatsApp.
  function bolhaWhats(texto) {
    const b = el("div", "chat-msg ia");
    b.appendChild(document.createTextNode(texto + " "));
    const a = el("a", "chat-link", "Falar no WhatsApp");
    a.href = linkWhats("Olá! Vim pelo site da " + LOJA.nome + " e quero atendimento.");
    a.target = "_blank";
    a.rel = "noopener";
    b.appendChild(a);
    ui.corpo.appendChild(b);
    ui.corpo.scrollTop = ui.corpo.scrollHeight;
  }

  function digitando(ligado) {
    const antigo = ui.corpo.querySelector(".chat-digitando");
    if (antigo) antigo.remove();
    if (ligado) {
      const d = el("div", "chat-msg ia chat-digitando");
      d.innerHTML = "<span></span><span></span><span></span>";
      ui.corpo.appendChild(d);
      ui.corpo.scrollTop = ui.corpo.scrollHeight;
    }
  }

  async function perguntar(mensagem) {
    const controle = new AbortController();
    const prazo = setTimeout(function () { controle.abort(); }, CHAT.timeoutMs);
    try {
      const r = await fetch(CHAT.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: mensagem,
          sessao: sessaoId(),
          historico: historico.slice(-12),
          origem: "site",
          pagina: location.pathname,
        }),
        signal: controle.signal,
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const dados = await r.json();
      return dados.resposta || dados.mensagem || dados.texto || null;
    } finally {
      clearTimeout(prazo);
    }
  }

  async function enviar(texto) {
    if (enviando || !texto.trim()) return;
    enviando = true;
    ui.campo.value = "";

    bolha("eu", texto);
    historico.push({ papel: "usuario", texto: texto });
    digitando(true);

    try {
      const resposta = await perguntar(texto);
      digitando(false);
      if (resposta) {
        bolha("ia", resposta);
        historico.push({ papel: "assistente", texto: resposta });
      } else {
        bolhaWhats("Não consegui responder agora.");
      }
    } catch (e) {
      digitando(false);
      bolhaWhats("Nosso atendimento automático está indisponível no momento.");
    } finally {
      enviando = false;
      ui.campo.focus();
    }
  }

  function abrir() {
    aberto = true;
    ui.painel.hidden = false;
    ui.raiz.classList.add("aberto");
    if (!ui.corpo.childElementCount) bolha("ia", CHAT.saudacao);
    ui.campo.focus();
  }

  function fechar() {
    aberto = false;
    ui.painel.hidden = true;
    ui.raiz.classList.remove("aberto");
  }

  ui.botao.addEventListener("click", function () { (aberto ? fechar : abrir)(); });
  ui.fechar.addEventListener("click", fechar);
  ui.rodape.addEventListener("submit", function (e) {
    e.preventDefault();
    enviar(ui.campo.value);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && aberto) fechar();
  });
})();
