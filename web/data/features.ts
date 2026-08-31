export type Diferencial = {
  numero: string;
  titulo: string;
  descricao: string;
};

export const diferenciais: Diferencial[] = [
  {
    numero: "01",
    titulo: "Procedência conferida",
    descricao:
      "Vistoria cautelar e checagem completa de documentação antes de o veículo entrar no pátio.",
  },
  {
    numero: "02",
    titulo: "Seu usado na troca",
    descricao:
      "Avaliamos na hora e usamos como entrada. Carro, moto, caminhão ou máquina.",
  },
  {
    numero: "03",
    titulo: "Garantia de motor e câmbio",
    descricao:
      "Noventa dias de cobertura em todo o estoque, sem letra miúda escondida.",
  },
];

export const cabecalhoDiferenciais = {
  titulo: "Por que fechar com a DM81",
  subtitulo:
    "Vender veículo é confiança. Trabalhamos para que a decisão seja fácil de tomar e fácil de defender depois.",
} as const;
