"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { Duvida } from "@/data/faq";

/** Um item aberto por vez; o primeiro já vem aberto. */
export function Accordion({ itens }: { itens: Duvida[] }) {
  const [aberto, setAberto] = useState(0);

  return (
    <div>
      {itens.map((item, i) => {
        const estaAberto = i === aberto;
        return (
          <div key={item.pergunta} className="border-b border-border-hair">
            <h3>
              <button
                type="button"
                id={`duvida-${i}`}
                aria-expanded={estaAberto}
                aria-controls={`resposta-${i}`}
                onClick={() => setAberto(estaAberto ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-base font-semibold">{item.pergunta}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-text-muted transition-transform duration-300 ease-suave"
                  style={{ transform: estaAberto ? "rotate(90deg)" : "none" }}
                >
                  {estaAberto ? (
                    <Minus size={18} strokeWidth={1.5} />
                  ) : (
                    <Plus size={18} strokeWidth={1.5} />
                  )}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {estaAberto ? (
                <motion.div
                  id={`resposta-${i}`}
                  role="region"
                  aria-labelledby={`duvida-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 text-[13px] leading-relaxed text-text-secondary">
                    {item.resposta}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
