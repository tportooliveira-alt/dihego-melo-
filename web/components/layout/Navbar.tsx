"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { navegacao } from "@/data/nav";
import { site, linkWhatsapp } from "@/data/site";
import { MobileDrawer } from "./MobileDrawer";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [rolou, setRolou] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState(navegacao[0].id);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Fundo com blur depois de 40px de rolagem.
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 40);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Scroll-spy: o link ativo acompanha a seção visível.
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((e) => e.isIntersecting);
        if (visivel) setSecaoAtiva(visivel.target.id);
      },
      { threshold: 0.5 },
    );

    const secoes = navegacao
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    secoes.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 h-20 transition-colors duration-[250ms]",
          rolou
            ? "border-b border-border-hair bg-bg-base/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-dm flex h-full items-center justify-between">
          <a
            href="#inicio"
            className="text-lg font-bold uppercase tracking-[0.12em]"
          >
            {site.marca}
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            {navegacao.map((item) => {
              const ativo = item.id === secaoAtiva;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={ativo ? "true" : undefined}
                  className={cn(
                    "group relative py-1 text-sm transition-colors duration-200",
                    ativo ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {item.rotulo}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-2 left-0 h-px w-full origin-left bg-current transition-transform duration-200 ease-suave",
                      ativo ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={linkWhatsapp(
                `Olá! Vim pelo site da ${site.marcaCompleta}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center rounded-md bg-surface-invert px-5 text-sm font-semibold text-bg-base transition-colors duration-200 ease-suave hover:bg-accent hover:text-text-primary sm:inline-flex"
            >
              Falar agora
            </a>

            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={drawerAberto}
              onClick={() => setDrawerAberto(true)}
              className="grid h-10 w-10 place-items-center rounded-md border border-border-hair md:hidden"
            >
              <Menu size={18} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        aberto={drawerAberto}
        aoFechar={() => setDrawerAberto(false)}
        secaoAtiva={secaoAtiva}
      />
    </>
  );
}
