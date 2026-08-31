"use client";

import { motion, useInView, useReducedMotion, type MotionStyle } from "motion/react";
import { useEffect, useRef } from "react";

import type { Midia } from "@/data/hero";

/**
 * Vídeo de fundo que só existe enquanto está na tela.
 *
 * Com `preload="none"` e sem `autoPlay`, o navegador não baixa nada até o
 * primeiro `play()` — que só acontece quando a seção chega perto da janela.
 * Ao sair, pausa: quatro vídeos decodificando ao mesmo tempo fora de vista
 * custam bateria no celular sem ninguém ver.
 */
export function VideoAmbiente({
  midia,
  className,
  style,
}: {
  midia: Midia;
  className?: string;
  style?: MotionStyle;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // A margem adianta o carregamento: chega tocando, não começa a carregar aí.
  const naTela = useInView(ref, { margin: "200px" });
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (naTela && !semMovimento) {
      video.play().catch(() => {
        /* autoplay recusado: fica no poster, que já conta a mesma história */
      });
    } else {
      video.pause();
    }
  }, [naTela, semMovimento]);

  return (
    <motion.video
      ref={ref}
      src={midia.src}
      poster={midia.poster}
      aria-label={midia.alt}
      muted
      loop
      playsInline
      preload="none"
      style={style}
      className={className}
    />
  );
}
