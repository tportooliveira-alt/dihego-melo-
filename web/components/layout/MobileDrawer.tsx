"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { X } from "lucide-react";

import { navegacao } from "@/data/nav";
import { site, linkWhatsapp } from "@/data/site";

/** Menu full-screen do mobile: trava o scroll do body e fecha no ESC. */
export function MobileDrawer({
  aberto,
  aoFechar,
  secaoAtiva,
}: {
  aberto: boolean;
  aoFechar: () => void;
  secaoAtiva: string;
}) {
  useEffect(() => {
    if (!aberto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoFechar]);

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-bg-base md:hidden"
        >
          <div className="container-dm flex h-20 items-center justify-between">
            <span className="text-lg font-bold uppercase tracking-[0.12em]">
              {site.marca}
            </span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={aoFechar}
              className="grid h-10 w-10 place-items-center rounded-md border border-border-hair"
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          <nav aria-label="Principal (mobile)" className="container-dm mt-8 flex flex-col">
            {navegacao.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={aoFechar}
                aria-current={item.id === secaoAtiva ? "true" : undefined}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="border-b border-border-hair py-5 text-xl font-bold uppercase"
              >
                {item.rotulo}
              </motion.a>
            ))}

            <motion.a
              href={linkWhatsapp(`Olá! Vim pelo site da ${site.marcaCompleta}.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={aoFechar}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navegacao.length * 0.04, duration: 0.25 }}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-surface-invert text-sm font-semibold text-bg-base"
            >
              Falar agora
            </motion.a>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
