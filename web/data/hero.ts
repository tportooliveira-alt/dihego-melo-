/**
 * Vídeos gerados para a DM81 no Higgsfield.
 *
 * Hoje apontam para o CDN de onde saíram. Para produção, baixe cada arquivo,
 * salve em `public/video/` e troque `src` por `/video/nome.mp4`: o site deixa
 * de depender de um CDN de terceiros e carrega mais rápido. O `poster` é o
 * quadro que aparece enquanto o vídeo carrega.
 */

const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DnkrruBFZWtFX4V2dGbDlTO7hd";

export type Midia = {
  id: string;
  rotulo: string;
  src: string;
  poster?: string;
  alt: string;
};

/** Mídia do hero — o índice vertical 01–04 troca entre elas. */
export const midiasHero: Midia[] = [
  {
    id: "01",
    rotulo: "Pátio",
    src: `${CDN}/hf_20260831_065546_883bfe22-8afc-4556-9cf8-fd975a444f8b.mp4`,
    alt: "Duas fileiras de veículos num pátio ao entardecer, com asfalto molhado refletindo a luz",
  },
  {
    id: "02",
    rotulo: "Showroom",
    src: `${CDN}/hf_20260831_060725_bdb14713-4760-4de5-ac0a-3b119514a83d.mp4`,
    poster: `${CDN}/hf_20260831_060011_417728cd-1fba-4970-b74c-f2b178297425.png`,
    alt: "Pick-up, moto e caminhão alinhados num showroom escuro com luz dourada",
  },
  {
    id: "03",
    rotulo: "Chaves",
    src: `${CDN}/hf_20260831_060725_d8af277d-eded-40b2-aa2e-7d3eb9544b93.mp4`,
    poster: `${CDN}/hf_20260831_060011_c9bb2efc-1b85-4f9a-a1f7-55764bd70054.png`,
    alt: "Chave de veículo sobre superfície escura polida, com luz dourada rasante",
  },
  {
    id: "04",
    rotulo: "Estúdio",
    src: `${CDN}/hf_20260831_060726_2ba2e967-dd2d-4392-9304-80d78e1e1b97.mp4`,
    poster: `${CDN}/hf_20260831_060012_79043a99-5121-42cb-acd3-ce5c6f1a78e9.png`,
    alt: "SUV em três quartos num estúdio escuro com contorno de luz dourada",
  },
];

/**
 * Vídeo ambiente de cada categoria do estoque — entra atrás da silhueta quando
 * o mouse passa no card. É clima, não a foto do veículo anunciado.
 */
export const ambientes: Record<string, Midia> = {
  carros: {
    id: "amb-carros",
    rotulo: "Estúdio",
    src: `${CDN}/hf_20260831_060726_2ba2e967-dd2d-4392-9304-80d78e1e1b97.mp4`,
    alt: "SUV em estúdio escuro",
  },
  motos: {
    id: "amb-motos",
    rotulo: "Moto",
    src: `${CDN}/hf_20260831_065546_5d98603a-729c-4d02-846e-c9f7107653b4.mp4`,
    alt: "Moto esportiva em showroom escuro com luz dourada",
  },
  pesados: {
    id: "amb-pesados",
    rotulo: "Pesados",
    src: `${CDN}/hf_20260831_065545_03c19482-c951-420f-80c0-f748f22fd595.mp4`,
    alt: "Caminhão e carreta num pátio escuro com piso refletindo a luz",
  },
};

/** Formato vertical (9:16), para story e reels — não usado no site. */
export const verticais: Midia[] = [
  {
    id: "vert-suv",
    rotulo: "SUV vertical",
    src: `${CDN}/hf_20260831_061236_2aad0277-c98d-4eaa-8605-f9b4dfabe5c4.mp4`,
    alt: "SUV em estúdio, enquadramento vertical",
  },
  {
    id: "vert-chaves",
    rotulo: "Chaves vertical",
    src: `${CDN}/hf_20260831_061235_c8cece8c-5cc7-4714-8c22-f73ed1f2cd08.mp4`,
    alt: "Chave de veículo em macro, enquadramento vertical",
  },
];

export const hero = {
  // A quebra de linha é decisão de design, não do navegador.
  titulo: ["Comprar", "ou vender", "seu veículo"],
  texto:
    "Carro, moto, pick-up, caminhão, ônibus, carreta ou trator. Avaliamos o seu " +
    "usado na hora, aceitamos na troca e resolvemos o financiamento — ",
  textoDestaque: "com procedência conferida em cada veículo",
  textoFim: ".",
  cardVideo: {
    etiqueta: "Cartas contempladas",
    chamada: "Veja como funciona",
  },
  pontos: [
    { x: "38%", y: "58%", titulo: "Vistoria cautelar em todo veículo" },
    { x: "68%", y: "40%", titulo: "Garantia de 90 dias — motor e câmbio" },
  ],
} as const;
