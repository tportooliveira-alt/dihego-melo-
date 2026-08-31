import { marcas } from "@/data/brands";

/** Faixa de marcas do estoque. No mobile vira marquee infinito. */
export function BrandStrip() {
  return (
    <div className="border-y border-border-hair">
      <div className="container-dm hidden h-24 items-center justify-between lg:flex">
        {marcas.slice(0, 8).map((marca) => (
          <span
            key={marca}
            className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted opacity-50 transition-opacity duration-200 hover:opacity-100"
          >
            {marca}
          </span>
        ))}
      </div>

      <div className="relative flex h-20 items-center overflow-hidden lg:hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex shrink-0 animate-[desliza_30s_linear_infinite] gap-10 pr-10">
          {[...marcas, ...marcas].map((marca, i) => (
            <span
              key={`${marca}-${i}`}
              className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.08em] text-text-muted opacity-50"
            >
              {marca}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes desliza {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
