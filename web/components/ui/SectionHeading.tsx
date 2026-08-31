import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** Cabeçalho centralizado de Diferenciais, Estoque e afins. */
export function SectionHeading({
  titulo,
  subtitulo,
  className,
}: {
  titulo: string;
  subtitulo?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mx-auto max-w-[560px] text-center", className)}>
      <h2 className="text-[28px] font-bold uppercase leading-[1.1] lg:text-[40px]">
        {titulo}
      </h2>
      {subtitulo ? (
        <p className="mt-4 text-text-secondary">{subtitulo}</p>
      ) : null}
    </Reveal>
  );
}
