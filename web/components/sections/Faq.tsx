import { cabecalhoDuvidas, duvidas } from "@/data/faq";
import { midiasHero } from "@/data/hero";
import { Accordion } from "@/components/ui/Accordion";
import { Hotspot } from "@/components/ui/Hotspot";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  const midia = midiasHero[3]; // estúdio

  return (
    <section id="duvidas" className="secao-y">
      <div className="container-dm grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <h2 className="text-[28px] font-bold uppercase leading-[1.1] lg:text-[40px]">
            {cabecalhoDuvidas.titulo.map((linha) => (
              <span key={linha} className="block">
                {linha}
              </span>
            ))}
          </h2>
          <div className="mt-8">
            <Accordion itens={duvidas} />
          </div>
        </Reveal>

        <Reveal atraso={0.1} className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-hair">
            <video
              src={midia.src}
              poster={midia.poster}
              aria-label={midia.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="foto-tratada absolute inset-0 h-full w-full object-cover"
            />
            <Hotspot x="52%" y="55%" titulo="Vistoria cautelar antes da venda" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
