// ===== Página "Venda seu veículo" =====
// O formulário monta uma mensagem e abre o WhatsApp da loja com os dados preenchidos.

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-vender");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const dados = new FormData(form);
    const msg =
      "Olá! Quero vender/trocar meu veículo pela " + LOJA.nome + ".\n\n" +
      "• Nome: " + dados.get("nome") + "\n" +
      "• Telefone: " + dados.get("telefone") + "\n" +
      "• Tipo: " + dados.get("tipo") + "\n" +
      "• Marca/Modelo: " + dados.get("modelo") + "\n" +
      "• Ano: " + dados.get("ano") + "\n" +
      "• Quilometragem: " + dados.get("km") + " km\n" +
      "• Valor pretendido: R$ " + (dados.get("valor") || "a combinar") + "\n" +
      "• Interesse: " + dados.get("interesse") + "\n" +
      (dados.get("observacoes") ? "\nObservações: " + dados.get("observacoes") : "");

    window.open(linkWhats(msg), "_blank", "noopener");
  });
});
