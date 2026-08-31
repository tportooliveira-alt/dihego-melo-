/**
 * Mídia do hero — os vídeos gerados para a DM81 no Higgsfield.
 *
 * Hoje apontam para o CDN de onde saíram. Para produção, baixe cada arquivo,
 * salve em `public/video/` e troque `src` por `/video/nome.mp4`: o site deixa
 * de depender de um CDN de terceiros e carrega mais rápido. O `poster` é o
 * quadro que aparece enquanto o vídeo carrega.
 */

const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DnkrruBFZWtFX4V2dGbDlTO7hd";

export type MidiaHero = {
  id: string;
  rotulo: string;
  src: string;
  poster: string;
  alt: string;
};

export const midiasHero: MidiaHero[] = [
  {
    id: "01",
    rotulo: "Showroom",
    src: `${CDN}/hf_20260831_060725_bdb14713-4760-4de5-ac0a-3b119514a83d.mp4`,
    poster: `${CDN}/hf_20260831_060011_417728cd-1fba-4970-b74c-f2b178297425.png`,
    alt: "Pick-up, moto e caminhão alinhados em um showroom escuro com luz dourada",
  },
  {
    id: "02",
    rotulo: "Chaves",
    src: `${CDN}/hf_20260831_060725_d8af277d-eded-40b2-aa2e-7d3eb9544b93.mp4`,
    poster: `${CDN}/hf_20260831_060011_c9bb2efc-1b85-4f9a-a1f7-55764bd70054.png`,
    alt: "Chave de veículo sobre superfície escura polida, com luz dourada rasante",
  },
  {
    id: "03",
    rotulo: "Estúdio",
    src: `${CDN}/hf_20260831_060726_2ba2e967-dd2d-4392-9304-80d78e1e1b97.mp4`,
    poster: `${CDN}/hf_20260831_060012_79043a99-5121-42cb-acd3-ce5c6f1a78e9.png`,
    alt: "SUV em três quartos num estúdio escuro com contorno de luz dourada",
  },
  {
    id: "04",
    rotulo: "Pátio",
    src: `${CDN}/hf_20260831_053558_40c8c196-2139-4232-a0d8-d1a8c1ab82c9.mp4`,
    poster: `${CDN}/hf_20260831_053157_2f8b84f8-9f72-4e0f-96eb-02676c1c86e1.png`,
    alt: "Veículos alinhados em pátio escuro com reflexo no piso",
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
