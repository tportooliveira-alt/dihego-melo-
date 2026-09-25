/**
 * Vídeos gerados para a DM81 no Higgsfield, já internalizados em
 * `public/video/` — o site não depende de CDN de terceiros. O `poster` é o
 * quadro que aparece enquanto o vídeo carrega (JPG 1600px, qualidade 80).
 *
 * Os arquivos são H.264 8 bits. O Higgsfield entrega HEVC 10 bits, que só toca
 * no Safari e em Chrome com apoio do hardware — no Firefox e em boa parte dos
 * Windows o vídeo simplesmente não aparece, fica só o poster. Ao acrescentar um
 * vídeo novo, converta antes:
 *
 *   ffmpeg -i entrada.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p \
 *     -crf 24 -preset slow -an -movflags +faststart public/video/saida.mp4
 *
 * Cada mídia tem nome próprio e as seções pedem pelo nome. Um vídeo novo no
 * hero não pode reatribuir silenciosamente a imagem do consórcio.
 */

export type Midia = {
  rotulo: string;
  src: string;
  poster?: string;
  alt: string;
};

/**
 * FALTA ENTRAR: o vídeo de varredura de luz gerado no Higgsfield.
 *
 * Baixe-o e salve como `public/video/efeitos.mp4`, converta para H.264 como os
 * outros (veja o cabeçalho acima), e então descomente o bloco e a entrada em
 * `midiasHero`. Ele não pôde ser internalizado junto com os demais porque o
 * ambiente onde foi gerado não alcança o CDN de saída.
 *
 * const efeitos: Midia = {
 *   rotulo: "Efeitos",
 *   src: "/video/efeitos.mp4",
 *   poster: "/video/enfileirados.jpg",
 *   alt: "Fileira de veículos com uma varredura de luz dourada percorrendo a lataria e o piso refletindo",
 * };
 */


const patio: Midia = {
  rotulo: "Pátio",
  src: "/video/patio.mp4",
  // Nasceu de vídeo, não de imagem, então não tem quadro próprio. O do
  // enfileiramento é a mesma cena e segura o hero até o vídeo chegar.
  poster: "/video/enfileirados.jpg",
  alt: "Duas fileiras de veículos num pátio ao entardecer, com asfalto molhado refletindo a luz",
};

const enfileirados: Midia = {
  rotulo: "Enfileirados",
  src: "/video/enfileirados.mp4",
  poster: "/video/enfileirados.jpg",
  alt: "Fileira de veículos sob luz dourada, com o piso polido refletindo a carroceria",
};

const showroom: Midia = {
  rotulo: "Showroom",
  src: "/video/showroom.mp4",
  poster: "/video/showroom.jpg",
  alt: "Pick-up, moto e caminhão alinhados num showroom escuro com luz dourada",
};

const chaves: Midia = {
  rotulo: "Chaves",
  src: "/video/chaves.mp4",
  poster: "/video/chaves.jpg",
  alt: "Chave de veículo sobre superfície escura polida, com luz dourada rasante",
};

const estudio: Midia = {
  rotulo: "Estúdio",
  src: "/video/estudio.mp4",
  poster: "/video/estudio.jpg",
  alt: "SUV em três quartos num estúdio escuro com contorno de luz dourada",
};

const moto: Midia = {
  rotulo: "Moto",
  src: "/video/moto.mp4",
  alt: "Moto esportiva em showroom escuro com luz dourada",
};

const pesados: Midia = {
  rotulo: "Pesados",
  src: "/video/pesados.mp4",
  alt: "Caminhão e carreta num pátio escuro com piso refletindo a luz",
};

/** Índice vertical do hero. A ordem aqui é a numeração 01, 02, 03… na tela. */
export const midiasHero: Midia[] = [
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
    src: "/video/vertical-suv.mp4",
    alt: "SUV em estúdio, enquadramento vertical",
  },
  {
    rotulo: "Chaves vertical",
    src: "/video/vertical-chaves.mp4",
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
