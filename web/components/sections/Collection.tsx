"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  abasEstoque,
  filtrarVeiculos,
  type CategoriaVeiculo,
} from "@/data/vehicles";
import { linkWhatsapp, site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tabs } from "@/components/ui/Tabs";
import { VehicleCard } from "@/components/ui/VehicleCard";

const texto = {
  titulo: "Estoque",
  subtitulo:
    "Uma parte do que temos hoje. Não achou o seu? A gente procura na nossa rede e traz as opções.",
  verTodos: "Ver todo o estoque",
} as const;

export function Collection() {
  const [categoria, setCategoria] = useState<CategoriaVeiculo>("destaques");
  const lista = filtrarVeiculos(categoria);

  return (
    <section id="estoque" className="secao-y">
      <div className="container-dm">
        <SectionHeading titulo={texto.titulo} subtitulo={texto.subtitulo} />

        <div className="mt-12">
          <Tabs
            abas={abasEstoque}
            ativa={categoria}
            aoTrocar={setCategoria}
            rotulo="Categorias do estoque"
          />
        </div>

        <div
          role="tabpanel"
          id={`painel-${categoria}`}
          aria-labelledby={`aba-${categoria}`}
          className="mt-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={categoria}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {lista.map((veiculo, i) => (
                <motion.div
                  key={veiculo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <VehicleCard veiculo={veiculo} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={linkWhatsapp(
              `Olá! Quero ver o estoque completo da ${site.marcaCompleta}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-surface-invert px-8 text-sm font-semibold text-bg-base transition-colors duration-200 ease-suave hover:bg-accent hover:text-text-primary"
          >
            {texto.verTodos}
            <ArrowRight
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className="transition-transform duration-200 ease-suave group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
