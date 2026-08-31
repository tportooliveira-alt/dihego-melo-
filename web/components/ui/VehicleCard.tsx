"use client";

import { useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { ambientes } from "@/data/hero";
import { site, linkWhatsapp } from "@/data/site";
import type { Veiculo } from "@/data/vehicles";
import { partesDoPreco, formatarKm } from "@/lib/formatCurrency";
import { ArteVeiculo } from "@/components/icons/ArteVeiculo";

export function VehicleCard({ veiculo }: { veiculo: Veiculo }) {
  const video = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const { moeda, numero } = partesDoPreco(veiculo.preco);

  // Clima da categoria — nunca uma foto fingindo ser o veículo anunciado.
  const ambiente = ambientes[veiculo.categoria] ?? ambientes.carros;

  const rodagem =
    veiculo.km != null
      ? formatarKm(veiculo.km)
      : veiculo.horas != null
        ? `${veiculo.horas.toLocaleString("pt-BR")} h`
        : null;

  const mensagem =
    `Olá! Tenho interesse no ${veiculo.nome} ${veiculo.versao} ` +
    `${veiculo.ano ?? ""} anunciado por ${moeda} ${numero} no site da ${site.marcaCompleta}.`;

  /** O vídeo só carrega e roda enquanto o ponteiro está sobre o card. */
  function entrar() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTocando(true);
    video.current?.play().catch(() => {
      /* autoplay recusado: o card segue com a arte estática */
    });
  }

  function sair() {
    setTocando(false);
    video.current?.pause();
  }

  return (
    <article
      onMouseEnter={entrar}
      onMouseLeave={sair}
      onFocusCapture={entrar}
      onBlurCapture={sair}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-border-hair bg-bg-elevated transition-[transform,border-color] duration-300 ease-suave hover:-translate-y-1 hover:border-border-strong"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background:
            `radial-gradient(120% 100% at 78% 14%, ${veiculo.arte.g1}59, transparent 62%),` +
            " linear-gradient(160deg, var(--color-bg-subtle), var(--color-bg-base))",
        }}
      >
        <video
          ref={video}
          src={ambiente.src}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          className="foto-tratada absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-suave"
          style={{ opacity: tocando ? 0.55 : 0 }}
        />

        {/* A silhueta fica por cima do vídeo e sobe de leve no hover. */}
        <div className="absolute inset-0 transition-transform duration-500 ease-suave group-hover:scale-[1.04]">
          <ArteVeiculo veiculo={veiculo} transparente />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="num-tabular text-lg font-bold leading-none">
            <span className="text-accent">{moeda}</span> <span>{numero}</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-text-muted">
            <MapPin size={14} strokeWidth={1.5} aria-hidden />
            {site.cidade}
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold text-text-secondary">
          {veiculo.nome}
          {veiculo.versao ? ` — ${veiculo.versao}` : ""}
        </h3>

        <p className="mt-1 text-[13px] text-text-muted">
          {[veiculo.ano, rodagem, veiculo.cambio !== "—" ? veiculo.cambio : null]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <a
          href={linkWhatsapp(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-surface-invert text-sm font-semibold text-bg-base transition-colors duration-200 ease-suave hover:bg-accent hover:text-text-primary"
        >
          Tenho interesse
        </a>
      </div>
    </article>
  );
}
