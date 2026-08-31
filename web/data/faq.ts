export type Duvida = { pergunta: string; resposta: string };

export const duvidas: Duvida[] = [
  {
    pergunta: "Qual a diferença entre consórcio e financiamento?",
    resposta:
      "No financiamento você paga juros ao banco. No consórcio você paga parcelas e uma taxa de administração, sem juros, e é contemplado por sorteio ou lance. Sai bem mais barato no total, mas exige planejamento — a menos que você entre por uma carta já contemplada.",
  },
  {
    pergunta: "O que é uma carta contemplada?",
    resposta:
      "É uma cota de consórcio que já foi sorteada ou contemplada por lance. O crédito sai na hora, você compra o veículo à vista e segue pagando as parcelas restantes sem juros. É o caminho de quem tem pressa e não quer pagar taxa de financiamento.",
  },
  {
    pergunta: "Vocês aceitam meu veículo na troca?",
    resposta:
      "Aceitamos. Avaliamos na hora, com o veículo à frente, e o valor entra como entrada. Vale para carro, moto, pick-up, caminhão, ônibus, carreta e trator.",
  },
  {
    pergunta: "Preciso de entrada para financiar?",
    resposta:
      "Nem sempre. Trabalhamos com os principais bancos e existem linhas sem entrada, mas tudo depende da análise de crédito. Traga seus dados que simulamos as opções reais para o seu perfil.",
  },
  {
    pergunta: "E se o veículo que eu quero não estiver no estoque?",
    resposta:
      "A gente procura. Diga o modelo, o ano e a faixa de preço que buscamos na nossa rede e trazemos as opções — com a mesma vistoria de sempre.",
  },
];

export const cabecalhoDuvidas = {
  titulo: ["Dúvidas", "frequentes"],
} as const;
