"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";

import { hero, midiasHero, numeroDaMidia } from "@/data/hero";
import { site, linkWhatsapp } from "@/data/site";
import { Hotspot } from "@/components/ui/Hotspot";
import { cn } from "@/lib/utils";

/**
 * Hero em tela cheia: o vídeo ocupa toda a viewport (descontada a navbar) e o
 * texto flutua por cima, sobre um degradê. O índice vertical troca o vídeo com
 * crossfade; o restante da página aparece ao rolar.
 */
export function Hero() {
  const [ativo, setAtivo] = useState(0);
  const midia = midiasHero[ativo];

  return (
    <section
      id="inicio"
      className="relative min-h-[calc(100svh-80px)] overflow-hidden"
    >
      {/* ── Mídia em tela cheia ── */}
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

      {/* Degradês para o texto respirar sobre a mídia. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg-base)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(0deg,var(--color-bg-base)_0%,transparent_100%)]"
      />

      {hero.pontos.map((p) => (
        <Hotspot key={p.titulo} x={p.x} y={p.y} titulo={p.titulo} />
      ))}

      {/* ── Conteúdo sobreposto ── */}
      <div className="container-dm relative z-10 flex min-h-[calc(100svh-80px)] flex-col justify-center py-16">
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
          className="mt-8 max-w-[38ch] text-[13px] leading-relaxed text-text-secondary"
        >
          {hero.texto}
          <strong className="font-semibold text-text-primary">
            {hero.textoDestaque}
          </strong>
          {hero.textoFim}
        </motion.p>
      </div>

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

      {/* Convite para rolar e ver o restante */}
      <motion.div
        aria-hidden
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-text-muted"
      >
        <ChevronDown size={20} strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}
