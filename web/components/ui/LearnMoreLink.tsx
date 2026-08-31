import { ArrowUpRight } from "lucide-react";

/** Link padrão da página: a seta translada e o texto sublinha no hover. */
export function LearnMoreLink({
  href,
  children,
  externo = false,
}: {
  href: string;
  children: string;
  externo?: boolean;
}) {
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group inline-flex items-center gap-1.5 text-sm text-text-primary"
    >
      <span className="transition-[text-decoration-color] duration-200 underline decoration-transparent underline-offset-4 group-hover:decoration-current">
        {children}
      </span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        aria-hidden
        className="transition-transform duration-200 ease-suave group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
