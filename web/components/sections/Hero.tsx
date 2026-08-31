"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Play } from "lucide-react";

import { hero, midiasHero, numeroDaMidia } from "@/data/hero";
import { site, linkWhatsapp } from "@/data/site";
import { Hotspot } from "@/components/ui/Hotspot";
import { cn } from "@/lib/utils";

/**
 * Split assimétrico 35/65: painel escuro à esquerda, mídia sangrando até a
 * borda direita da viewport. O índice vertical troca o vídeo com crossfade.
 */
export function Hero() {
  const [ativo, setAtivo] = useState(0);
  const midia = midiasHero[ativo];

  return (
    <section
      id="inicio"
      className="relative min-h-[640px] lg:min-h-[calc(100vh-80px)]"
    >
      <div className="grid min-h-[640px] lg:min-h-[calc(100vh-80px)] lg:grid-cols-[35fr_65fr]">
        {/* ── Coluna esquerda ── */}
        <div className="container-dm flex flex-col justify-between py-16 lg:max-w-none lg:py-20 lg:pl-[max(24px,calc((100vw-1280px)/2+40px))] lg:pr-10">
          <motion.h1
            initial="oculto"
            animate="visivel"
            variants={{ visivel: { transition: { staggerChildren: 0.08 } } }}
            className="text-[40px] font-bold uppercase leading-[1.02] lg:text-[72px]"
          >
            {hero.titulo.map((linha) => (
              <motion.span
                key={linha}
                variants={{
                  oculto: { opacity: 0, y: 24 },
                  visivel: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {linha}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 max-w-[38ch] text-[13px] leading-relaxed text-text-secondary lg:mt-auto lg:pt-16"
          >
            {hero.texto}
            <strong className="font-semibold text-text-primary">
              {hero.textoDestaque}
            </strong>
            {hero.textoFim}
          </motion.p>
        </div>

        {/* ── Coluna direita: mídia sangrando ── */}
        <div className="relative min-h-[420px] overflow-hidden lg:min-h-0">
          <AnimatePresence mode="sync">
            <motion.video
              key={midia.rotulo}
              src={midia.src}
              poster={midia.poster}
              aria-label={midia.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              }}
              className="foto-tratada absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Degradê para o texto respirar sobre a mídia. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg-base)_0%,transparent_35%)]"
          />

          {hero.pontos.map((p) => (
            <Hotspot key={p.titulo} x={p.x} y={p.y} titulo={p.titulo} />
          ))}

          {/* Índice vertical */}
          <div className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-6 lg:right-8">
            {midiasHero.map((m, i) => (
              <button
                key={m.rotulo}
                type="button"
                onClick={() => setAtivo(i)}
                aria-label={`Ver ${m.rotulo}`}
                aria-current={i === ativo}
                className={cn(
                  "num-tabular rounded-full px-2 py-1 text-xs transition-colors duration-200",
                  i === ativo
                    ? "bg-white/[.12] text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                {numeroDaMidia(i)}
              </button>
            ))}
          </div>

          {/* Card ancorado no canto inferior direito */}
          <a
            href={linkWhatsapp(
              `Olá! Quero entender como funciona a carta contemplada na ${site.marcaCompleta}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 z-10 hidden w-[280px] items-center gap-4 rounded-md border border-border-hair bg-bg-base/60 p-4 backdrop-blur-lg transition-transform duration-200 ease-suave hover:-translate-y-0.5 sm:flex lg:bottom-8 lg:right-8"
          >
            <span className="flex-1">
              <span className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">
                {hero.cardVideo.etiqueta}
              </span>
              <span className="mt-1 block text-[13px] text-text-primary">
                {hero.cardVideo.chamada}
              </span>
            </span>
            <span className="grid h-14 w-[72px] shrink-0 place-items-center rounded-sm bg-bg-subtle">
              <Play size={18} strokeWidth={1.5} aria-hidden />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
