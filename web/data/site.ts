/** Dados da empresa. Trocar aqui muda o site inteiro. */
export const site = {
  marca: "DM81",
  marcaCompleta: "DM81 Consultoria & Finanças",
  descricao:
    "Compra e venda de veículos em geral — carros, motos, pick-ups, caminhões, " +
    "ônibus, carretas e tratores. Consórcios e cartas contempladas.",
  cidade: "Vitória da Conquista",
  endereco: "Av. dos Veículos, 1000 — Centro",
  telefone: "(77) 98846-8505",
  // Só dígitos, com DDI. Trocar pelo número real da loja.
  whatsapp: "5577988468505",
  email: "pointermelo@gmail.com",
  horario: "Seg a Sex 8h–18h · Sáb 8h–13h",
  parceiro: "Perim Consórcios",
  ano: 2026,
} as const;

export function linkWhatsapp(mensagem: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
