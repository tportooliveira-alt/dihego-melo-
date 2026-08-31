"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

/**
 * Ponto sobre a imagem: pulsa sozinho e abre o rótulo no hover ou no foco.
 * Posicionado em % para acompanhar o recorte da foto em qualquer largura.
 */
export function Hotspot({
  x,
  y,
  titulo,
}: {
  x: string;
  y: string;
  titulo: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        aria-label={titulo}
        onMouseEnter={() => setAberto(true)}
        onMouseLeave={() => setAberto(false)}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        className="relative grid h-8 w-8 place-items-center rounded-full bg-white/90 text-bg-base"
      >
        {/* Anel que pulsa. Desliga em prefers-reduced-motion (regra global). */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-[pulso_2s_ease-out_infinite] rounded-full bg-white/40"
        />
        <Plus size={16} strokeWidth={1.5} aria-hidden />
      </button>

      {aberto ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-border-hair bg-bg-base/90 px-3 py-2 text-[13px] leading-snug text-text-secondary backdrop-blur-md"
        >
          {titulo}
        </span>
      ) : null}

      <style>{`
        @keyframes pulso {
          0%   { transform: scale(1);   opacity: .5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
