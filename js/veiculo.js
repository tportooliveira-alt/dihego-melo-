// ===== Página de detalhes do veículo =====

document.addEventListener("DOMContentLoaded", async function () {
  // Espera o estoque do servidor (quando houver) antes de montar a ficha.
  await ESTOQUE_PRONTO;

  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const v = VEICULOS.find(function (item) { return item.id === id; });

  const conteudo = document.getElementById("detalhe-conteudo");
  const naoEncontrado = document.getElementById("nao-encontrado");

  if (!v) {
    if (conteudo) conteudo.hidden = true;
    if (naoEncontrado) naoEncontrado.hidden = false;
    return;
  }

  document.title = v.marca + " " + v.modelo + " " + v.ano + " | " + LOJA.nome;

  // Foto principal
  document.getElementById("detalhe-foto").innerHTML = svgVeiculo(v, true);

  // Painel de informações
  document.getElementById("tipo-tag").textContent = TIPO_LABEL[v.tipo];
  document.getElementById("titulo").textContent = v.marca + " " + v.modelo;
  document.getElementById("versao").textContent = v.versao + " • " + v.ano;
  document.getElementById("preco").textContent = formatarPreco(v.preco);

  const msg =
    "Olá! Tenho interesse no " + v.marca + " " + v.modelo + " " + v.versao +
    " " + v.ano + " anunciado por " + formatarPreco(v.preco) +
    " no site da " + LOJA.nome + ". Ainda está disponível?";
  document.getElementById("btn-interesse").setAttribute("href", linkWhats(msg));

  // Tabela de especificações
  const specs = [
    ["Marca", v.marca],
    ["Modelo", v.modelo],
    ["Versão", v.versao],
    ["Ano", v.ano],
  ];
  if (v.km != null) specs.push(["Quilometragem", formatarKm(v.km)]);
  if (v.horas != null) specs.push(["Horas de uso", v.horas.toLocaleString("pt-BR") + " h"]);
  if (v.combustivel !== "—") specs.push(["Combustível", v.combustivel]);
  if (v.cambio !== "—") specs.push(["Câmbio", v.cambio]);
  specs.push(["Cor", v.cor]);
  if (v.portas) specs.push(["Portas", v.portas]);
  document.getElementById("specs").innerHTML = specs
    .map(function (linha) {
      return "<tr><td>" + linha[0] + "</td><td>" + linha[1] + "</td></tr>";
    })
    .join("");

  // Descrição e opcionais
  document.getElementById("descricao").textContent = v.descricao;
  document.getElementById("opcionais").innerHTML = v.opcionais
    .map(function (o) { return "<li>" + o + "</li>"; })
    .join("");

  // ---- Simulador de financiamento ----
  const entradaInput = document.getElementById("sim-entrada");
  const parcelasSelect = document.getElementById("sim-parcelas");
  const resultado = document.getElementById("sim-resultado");
  const TAXA_MES = 0.0189; // taxa média de referência a.m. — apenas simulação

  entradaInput.value = Math.round(v.preco * 0.2);

  function simular() {
    const entrada = Math.min(Number(entradaInput.value) || 0, v.preco);
    const n = Number(parcelasSelect.value);
    const financiado = v.preco - entrada;

    if (financiado <= 0) {
      resultado.innerHTML =
        "<strong>À vista!</strong> Com essa entrada você quita o veículo sem parcelas." +
        "<small>Fale com a gente para condições especiais à vista.</small>";
      return;
    }

    // Tabela Price: parcela = PV * i / (1 - (1+i)^-n)
    const parcela = (financiado * TAXA_MES) / (1 - Math.pow(1 + TAXA_MES, -n));
    resultado.innerHTML =
      n + "x de <strong>" +
      parcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) +
      "</strong> com entrada de " + formatarPreco(entrada) +
      "<small>Simulação com taxa de referência de " + (TAXA_MES * 100).toFixed(2).replace(".", ",") +
      "% a.m. Valores sujeitos a análise de crédito — consulte condições reais com nossa equipe.</small>";
  }

  entradaInput.addEventListener("input", simular);
  parcelasSelect.addEventListener("change", simular);
  simular();

  // ---- Veículos semelhantes ----
  const semelhantes = VEICULOS.filter(function (s) {
    return s.id !== v.id && s.tipo === v.tipo;
  }).slice(0, 3);

  if (semelhantes.length) {
    document.getElementById("grade-semelhantes").innerHTML = semelhantes
      .map(cardVeiculo)
      .join("");
  } else {
    document.getElementById("secao-semelhantes").hidden = true;
  }
});
