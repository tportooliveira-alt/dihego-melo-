"use client";

import { motion } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

export type Aba<T extends string> = { id: T; rotulo: string };

/**
 * Abas com a barra ativa deslizando entre elas (layoutId), sobre uma régua de
 * 1px. Navega por setas do teclado, como manda o padrão de tablist.
 */
export function Tabs<T extends string>({
  abas,
  ativa,
  aoTrocar,
  rotulo,
}: {
  abas: Aba<T>[];
  ativa: T;
  aoTrocar: (id: T) => void;
  rotulo: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function aoTeclar(e: React.KeyboardEvent, indice: number) {
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const proximo = (indice + passo + abas.length) % abas.length;
    aoTrocar(abas[proximo].id);
    refs.current[proximo]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={rotulo}
      // Em telas estreitas as abas rolam no próprio trilho — quem não cabe
      // não empurra a página.
      className="flex w-full gap-1 overflow-x-auto border-b border-border-hair [scrollbar-width:none] sm:justify-between sm:gap-2 [&::-webkit-scrollbar]:hidden"
    >
      {abas.map((aba, i) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`aba-${aba.id}`}
            aria-selected={selecionada}
            aria-controls={`painel-${aba.id}`}
            tabIndex={selecionada ? 0 : -1}
            onClick={() => aoTrocar(aba.id)}
            onKeyDown={(e) => aoTeclar(e, i)}
            className="relative flex shrink-0 items-center justify-center gap-2 px-4 pb-4 text-sm transition-colors duration-200 sm:flex-1 sm:shrink sm:px-2"
          >
            <span
              aria-hidden
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200",
                selecionada ? "bg-accent" : "bg-text-muted",
              )}
            />
            <span
              className={cn(
                "transition-colors duration-200",
                selecionada ? "text-text-primary" : "text-text-secondary",
              )}
            >
              {aba.rotulo}
            </span>

            {selecionada ? (
              <motion.span
                layoutId="aba-ativa"
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-0.5 bg-surface-invert"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
