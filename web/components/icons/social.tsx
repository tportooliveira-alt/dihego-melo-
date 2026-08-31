/**
 * Marcas sociais desenhadas à mão — a lucide-react removeu os ícones de marca.
 * Traço/preenchimento em currentColor para herdar a cor do link.
 */

type Props = { size?: number; className?: string };

export function IconeWhatsapp({ size = 18, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 5.1 5.2-1.4A9.8 9.8 0 1 0 12 2.2Zm5 13.9c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-2.9-.6-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.8-2c.2-.2.5-.3.6-.3h.5c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.3 0 .5l-.3.4-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1.9 2 1.2 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.2.6.4.1.1.1.7-.4 1.1Z" />
    </svg>
  );
}

export function IconeInstagram({ size = 18, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconeFacebook({ size = 18, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M15.5 3.5h-2A3.5 3.5 0 0 0 10 7v3H8v3h2v8h3v-8h2.4l.6-3H13V7.2c0-.5.3-.7.8-.7h1.7Z" />
    </svg>
  );
}
