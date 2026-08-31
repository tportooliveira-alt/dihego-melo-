"use client";

import { useState, type FormEvent } from "react";
import {
  IconeWhatsapp,
  IconeInstagram,
  IconeFacebook,
} from "@/components/icons/social";

import { navegacao } from "@/data/nav";
import { site, linkWhatsapp } from "@/data/site";

const colunas = [
  { titulo: "Navegação", itens: navegacao.map((n) => ({ rotulo: n.rotulo, href: `#${n.id}` })) },
  {
    titulo: "Atendimento",
    itens: [
      { rotulo: site.telefone, href: `tel:${site.telefone.replace(/\D/g, "")}` },
      { rotulo: site.email, href: `mailto:${site.email}` },
      { rotulo: "WhatsApp", href: linkWhatsapp(`Olá! Vim pelo site da ${site.marcaCompleta}.`) },
    ],
  },
  {
    titulo: "A loja",
    itens: [
      { rotulo: site.endereco, href: "#inicio" },
      { rotulo: site.cidade, href: "#inicio" },
      { rotulo: site.horario, href: "#inicio" },
    ],
  },
];

const legais = ["Termos de uso", "Política de privacidade", "Mapa do site"];

export function Footer() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"parado" | "erro" | "ok">("parado");

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    setEstado(valido ? "ok" : "erro");
  }

  return (
    <footer className="border-t border-border-hair bg-bg-elevated pt-20">
      <div className="container-dm">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="text-lg font-bold uppercase tracking-[0.12em]">
              {site.marca}
            </span>
            <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-text-secondary">
              {site.descricao}
            </p>

            <form onSubmit={aoEnviar} noValidate className="mt-6 max-w-[340px]">
              <label htmlFor="email-news" className="sr-only">
                Seu e-mail para receber as novidades
              </label>
              <div className="flex h-11 items-center overflow-hidden rounded-md border border-border-hair">
                <input
                  id="email-news"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEstado("parado");
                  }}
                  placeholder="seu@email.com.br"
                  aria-invalid={estado === "erro"}
                  aria-describedby="aviso-news"
                  className="h-full flex-1 bg-transparent px-4 text-[13px] outline-none placeholder:text-text-muted"
                />
                <button
                  type="submit"
                  className="h-full bg-bg-subtle px-4 text-[13px] font-semibold transition-colors duration-200 ease-suave hover:bg-surface-invert hover:text-bg-base"
                >
                  Receber
                </button>
              </div>
              <p
                id="aviso-news"
                role="status"
                className="mt-2 min-h-[18px] text-[13px] text-text-muted"
              >
                {estado === "erro" ? "Confira o e-mail digitado." : null}
                {estado === "ok" ? "Pronto! Avisamos quando entrar novidade." : null}
              </p>
            </form>
          </div>

          {colunas.map((coluna) => (
            <div key={coluna.titulo} className="lg:col-span-2 lg:col-start-auto">
              <h3 className="text-base font-semibold">{coluna.titulo}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {coluna.itens.map((item) => (
                  <li key={item.rotulo}>
                    <a
                      href={item.href}
                      className="text-[13px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      {item.rotulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border-hair py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
              {legais.map((item, i) => (
                <span key={item} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden>·</span> : null}
                  <a href="#inicio" className="transition-colors hover:text-text-primary">
                    {item}
                  </a>
                </span>
              ))}
            </p>
            <p className="mt-2 text-[13px] text-text-muted">
              © {site.marcaCompleta} {site.ano}. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {[
              { Icone: IconeWhatsapp, rotulo: "WhatsApp", href: linkWhatsapp("Olá!") },
              { Icone: IconeInstagram, rotulo: "Instagram", href: "#inicio" },
              { Icone: IconeFacebook, rotulo: "Facebook", href: "#inicio" },
            ].map(({ Icone, rotulo, href }) => (
              <a
                key={rotulo}
                href={href}
                aria-label={rotulo}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                <Icone size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
