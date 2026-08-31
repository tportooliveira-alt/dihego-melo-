/**
 * Vídeos gerados para a DM81 no Higgsfield.
 *
 * Hoje apontam para o CDN de onde saíram. Para produção, baixe cada arquivo,
 * salve em `public/video/` e troque `src` por `/video/nome.mp4`: o site deixa
 * de depender de um CDN de terceiros e carrega mais rápido. O `poster` é o
 * quadro que aparece enquanto o vídeo carrega.
 *
 * Cada mídia tem nome próprio e as seções pedem pelo nome. Um vídeo novo no
 * hero não pode reatribuir silenciosamente a imagem do consórcio.
 */

const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DnkrruBFZWtFX4V2dGbDlTO7hd";

export type Midia = {
  rotulo: string;
  src: string;
  poster?: string;
  alt: string;
};

const efeitos: Midia = {
  rotulo: "Efeitos",
  src: `${CDN}/hf_20260831_071311_8da1bdfb-d573-4919-99df-3117ac576fff.mp4`,
  poster: `${CDN}/hf_20260831_053157_2f8b84f8-9f72-4e0f-96eb-02676c1c86e1.png`,
  alt: "Fileira de veículos com uma varredura de luz dourada percorrendo a lataria e o piso refletindo",
};

const patio: Midia = {
  rotulo: "Pátio",
  src: `${CDN}/hf_20260831_065546_883bfe22-8afc-4556-9cf8-fd975a444f8b.mp4`,
  // Nasceu de vídeo, não de imagem, então não tem quadro próprio. O do
  // enfileiramento é a mesma cena e segura o hero até o vídeo chegar.
  poster: `${CDN}/hf_20260831_053157_2f8b84f8-9f72-4e0f-96eb-02676c1c86e1.png`,
  alt: "Duas fileiras de veículos num pátio ao entardecer, com asfalto molhado refletindo a luz",
};

const enfileirados: Midia = {
  rotulo: "Enfileirados",
  src: `${CDN}/hf_20260831_053558_40c8c196-2139-4232-a0d8-d1a8c1ab82c9.mp4`,
  poster: `${CDN}/hf_20260831_053157_2f8b84f8-9f72-4e0f-96eb-02676c1c86e1.png`,
  alt: "Fileira de veículos sob luz dourada, com o piso polido refletindo a carroceria",
};

const showroom: Midia = {
  rotulo: "Showroom",
  src: `${CDN}/hf_20260831_060725_bdb14713-4760-4de5-ac0a-3b119514a83d.mp4`,
  poster: `${CDN}/hf_20260831_060011_417728cd-1fba-4970-b74c-f2b178297425.png`,
  alt: "Pick-up, moto e caminhão alinhados num showroom escuro com luz dourada",
};

const chaves: Midia = {
  rotulo: "Chaves",
  src: `${CDN}/hf_20260831_060725_d8af277d-eded-40b2-aa2e-7d3eb9544b93.mp4`,
  poster: `${CDN}/hf_20260831_060011_c9bb2efc-1b85-4f9a-a1f7-55764bd70054.png`,
  alt: "Chave de veículo sobre superfície escura polida, com luz dourada rasante",
};

const estudio: Midia = {
  rotulo: "Estúdio",
  src: `${CDN}/hf_20260831_060726_2ba2e967-dd2d-4392-9304-80d78e1e1b97.mp4`,
  poster: `${CDN}/hf_20260831_060012_79043a99-5121-42cb-acd3-ce5c6f1a78e9.png`,
  alt: "SUV em três quartos num estúdio escuro com contorno de luz dourada",
};

const moto: Midia = {
  rotulo: "Moto",
  src: `${CDN}/hf_20260831_065546_5d98603a-729c-4d02-846e-c9f7107653b4.mp4`,
  alt: "Moto esportiva em showroom escuro com luz dourada",
};

const pesados: Midia = {
  rotulo: "Pesados",
  src: `${CDN}/hf_20260831_065545_03c19482-c951-420f-80c0-f748f22fd595.mp4`,
  alt: "Caminhão e carreta num pátio escuro com piso refletindo a luz",
};

/** Índice vertical do hero. A ordem aqui é a numeração 01, 02, 03… na tela. */
export const midiasHero: Midia[] = [
  efeitos,
  patio,
  enfileirados,
  showroom,
  chaves,
  estudio,
];

/** Numeração exibida — sempre acompanha a posição, sem lista paralela. */
export const numeroDaMidia = (i: number) => String(i + 1).padStart(2, "0");

/** Mídia das seções, por nome. */
export const midiaConsorcio = chaves;
export const midiaDuvidas = estudio;

/**
 * Vídeo ambiente de cada categoria do estoque — entra atrás da silhueta quando
 * o mouse passa no card. É clima, não a foto do veículo anunciado.
 */
export const ambientes: Record<string, Midia> = {
  carros: estudio,
  motos: moto,
  pesados,
};

/** Formato vertical (9:16), para story e reels — não usado no site. */
export const verticais: Midia[] = [
  {
    rotulo: "SUV vertical",
    src: `${CDN}/hf_20260831_061236_2aad0277-c98d-4eaa-8605-f9b4dfabe5c4.mp4`,
    alt: "SUV em estúdio, enquadramento vertical",
  },
  {
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
