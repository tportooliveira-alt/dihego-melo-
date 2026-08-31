"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { midiasHero } from "@/data/hero";
import { linkWhatsapp, site } from "@/data/site";
import { Hotspot } from "@/components/ui/Hotspot";
import { LearnMoreLink } from "@/components/ui/LearnMoreLink";
import { Reveal } from "@/components/ui/Reveal";

const texto = {
  titulo: ["Consórcio e", "carta", "contemplada"],
  paragrafo:
    "Financiamento cobra juros. Consórcio, não — você paga parcela e taxa de " +
    "administração, e é contemplado por sorteio ou lance. Quem tem pressa entra " +
    "por uma carta já contemplada: o crédito sai na hora, você compra à vista e " +
    "segue pagando o que falta, sem juros.",
  legenda: "Crédito liberado para comprar à vista",
} as const;

/** Grid assimétrico 5/1/6 + imagem editorial com parallax leve. */
export function Consorcio() {
  const alvo = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: alvo,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const midia = midiasHero[1]; // as chaves

  return (
    <section id="consorcio" className="secao-y">
      <div className="container-dm">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-0">
          <Reveal className="lg:col-span-5">
            <h2 className="text-[28px] font-bold uppercase leading-[1.1] lg:text-[40px]">
              {texto.titulo.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </h2>
          </Reveal>

          <div className="hidden lg:col-span-1 lg:block" />

          <Reveal atraso={0.1} className="lg:col-span-6">
            <p className="text-text-secondary">{texto.paragrafo}</p>
            <div className="mt-6">
              <LearnMoreLink
                externo
                href={linkWhatsapp(
                  `Olá! Quero simular um consórcio com a ${site.marcaCompleta}.`,
                )}
              >
                Simular meu consórcio
              </LearnMoreLink>
            </div>
            <p className="mt-6 text-[13px] text-text-muted">
              Em parceria com a {site.parceiro}.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <div
            ref={alvo}
            className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-border-hair"
          >
            <motion.video
              style={{ y }}
              src={midia.src}
              poster={midia.poster}
              aria-label={midia.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="foto-tratada absolute inset-0 h-[112%] w-full object-cover"
            />
            <Hotspot x="50%" y="50%" titulo="Cota já contemplada, crédito imediato" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-border-hair bg-bg-base/70 px-4 py-2 text-[13px] text-text-secondary backdrop-blur-md">
              {texto.legenda}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
