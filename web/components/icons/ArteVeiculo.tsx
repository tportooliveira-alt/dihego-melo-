import type { Veiculo } from "@/data/vehicles";

/**
 * Arte vetorial do veículo — silhueta clara sobre base escura, com um brilho
 * de cor por unidade para o grid não ficar monótono. É placeholder honesto:
 * não simula uma foto do veículo que está à venda.
 */

const SILHUETAS: Record<string, string> = {
  sedan:
    "M30 138 L48 134 Q56 110 78 104 L118 96 Q150 78 196 82 L232 100 L268 108 Q286 112 288 126 L288 138 Z",
  carro:
    "M34 138 L50 132 Q60 108 84 102 L120 96 Q146 80 186 84 L224 102 L258 110 Q276 114 278 128 L278 138 Z",
  suv: "M30 138 L44 130 Q50 100 76 94 L110 88 Q134 70 184 74 L228 92 L262 102 Q282 108 284 124 L284 138 Z",
  picape:
    "M28 138 L42 130 Q48 102 74 96 L108 90 Q126 72 168 76 L184 94 L188 96 L188 118 L286 118 L286 138 Z",
  moto:
    "M84 130 L108 88 L104 77 L138 74 Q160 72 180 79 L208 85 L233 81 L236 128 L200 118 L168 116 L148 123 Z",
  van: "M34 138 L34 100 Q34 78 60 76 L220 70 Q262 70 276 96 L284 118 L284 138 Z",
  onibus: "M30 64 H288 V138 H30 Z",
  carreta: "M56 60 H286 V126 H56 Z",
  trator:
    "M54 136 L54 106 Q54 100 60 100 L128 100 L128 62 Q128 56 134 56 L178 56 Q184 56 184 62 L184 100 L196 104 L196 136 Z",
  caminhao:
    "M26 138 L26 92 Q26 82 38 82 L84 82 L106 110 L106 138 Z",
};

/** Rodas por tipo — pares [cx, r]. */
const RODAS: Record<string, [number, number][]> = {
  sedan: [[92, 17], [236, 17]],
  carro: [[94, 17], [226, 17]],
  suv: [[90, 19], [232, 19]],
  picape: [[88, 18], [238, 18]],
  van: [[90, 17], [234, 17]],
  onibus: [[86, 17], [232, 17]],
  carreta: [[190, 16], [228, 16], [266, 16]],
  caminhao: [[64, 17], [162, 17], [246, 17]],
  trator: [[88, 18], [222, 30]],
};

export function ArteVeiculo({
  veiculo,
  transparente = false,
}: {
  veiculo: Veiculo;
  /** Sem o fundo próprio — deixa aparecer o que estiver atrás (o vídeo). */
  transparente?: boolean;
}) {
  const icone = veiculo.arte.icone in SILHUETAS ? veiculo.arte.icone : "carro";
  const idBase = `v${veiculo.id}`;
  const rodas = RODAS[icone] ?? RODAS.carro;

  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label={`Ilustração de ${veiculo.nome}`}
      className={transparente ? "h-full w-full" : "aspect-[4/3] w-full"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${idBase}-base`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#1c1c1f" />
          <stop offset="100%" stopColor="#0b0b0c" />
        </linearGradient>
        <radialGradient id={`${idBase}-brilho`} cx="0.78" cy="0.14" r="0.76">
          <stop offset="0%" stopColor={veiculo.arte.g1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={veiculo.arte.g1} stopOpacity="0" />
        </radialGradient>
      </defs>

      {transparente ? null : (
        <>
          <rect width="320" height="200" fill={`url(#${idBase}-base)`} />
          <rect width="320" height="200" fill={`url(#${idBase}-brilho)`} />
        </>
      )}
      <ellipse cx="160" cy="152" rx="128" ry="16" fill="rgba(0,0,0,.35)" />

      {icone === "moto" ? (
        <>
          <circle cx="84" cy="130" r="26" fill="none" stroke="#f2f2f2" strokeWidth="8" />
          <circle cx="236" cy="130" r="26" fill="none" stroke="#f2f2f2" strokeWidth="8" />
          <path d={SILHUETAS.moto} fill="#f2f2f2" opacity="0.96" />
        </>
      ) : (
        <>
          <path d={SILHUETAS[icone]} fill="#f2f2f2" opacity="0.96" />
          {icone === "caminhao" ? (
            <rect x="100" y="58" width="188" height="80" rx="5" fill="#f2f2f2" opacity="0.82" />
          ) : null}
          {icone === "trator" ? (
            <rect x="142" y="36" width="7" height="22" rx="2" fill="#f2f2f2" opacity="0.96" />
          ) : null}
          {rodas.map(([cx, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={icone === "trator" && r > 20 ? 118 : 140} r={r} fill="#f2f2f2" />
              <circle
                cx={cx}
                cy={icone === "trator" && r > 20 ? 118 : 140}
                r={r * 0.45}
                fill="rgba(0,0,0,.4)"
              />
            </g>
          ))}
        </>
      )}

      <rect x="28" y="157" width="264" height="2" rx="1" fill="rgba(255,107,44,.5)" />
    </svg>
  );
}
