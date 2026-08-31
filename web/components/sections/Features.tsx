import { cabecalhoDiferenciais, diferenciais } from "@/data/features";
import { linkWhatsapp, site } from "@/data/site";
import { LearnMoreLink } from "@/components/ui/LearnMoreLink";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Três colunas numeradas. Sem card, sem borda — tipografia e espaço. */
export function Features() {
  return (
    <section id="diferenciais" className="secao-y">
      <div className="container-dm">
        <SectionHeading
          titulo={cabecalhoDiferenciais.titulo}
          subtitulo={cabecalhoDiferenciais.subtitulo}
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-10">
          {diferenciais.map((d, i) => (
            <Reveal key={d.numero} atraso={i * 0.1}>
              <p className="num-tabular text-xl text-text-muted">{d.numero}</p>
              <h3 className="mt-4 text-base font-semibold">{d.titulo}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {d.descricao}
              </p>
              <div className="mt-4">
                <LearnMoreLink
                  externo
                  href={linkWhatsapp(
                    `Olá! Quero saber mais sobre "${d.titulo}" na ${site.marcaCompleta}.`,
                  )}
                >
                  Saiba mais
                </LearnMoreLink>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
