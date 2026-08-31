import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: ReactNode;
  variante?: "solido" | "contorno";
  larguraTotal?: boolean;
  externo?: boolean;
  className?: string;
};

/** Primário = fundo branco, texto escuro. No hover vira laranja. */
export function Button({
  href,
  children,
  variante = "solido",
  larguraTotal = false,
  externo = false,
  className,
}: Props) {
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-6",
        "text-sm font-semibold transition-colors duration-200 ease-suave",
        larguraTotal && "w-full",
        variante === "solido"
          ? "bg-surface-invert text-bg-base hover:bg-accent hover:text-text-primary"
          : "border border-border-strong text-text-primary hover:border-accent hover:text-accent",
        className,
      )}
    >
      {children}
    </a>
  );
}
