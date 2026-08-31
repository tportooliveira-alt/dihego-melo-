# PLANO — Landing page DM81 (dark premium editorial)

Landing page de concessionária no padrão dark premium, seguindo o briefing.
A marca é a **DM81 Consultoria & Finanças** — nenhuma identidade de terceiros é
reproduzida; o que se replica é o padrão de layout, tipografia e ritmo visual.

## Decisões de adaptação ao negócio real

| Briefing genérico | DM81 |
| --- | --- |
| Marca "BOSSHE" | DM81 Consultoria & Finanças |
| Carros de luxo / supercarros | Carros, motos, pick-ups, caminhões, ônibus, carretas e tratores |
| Tabs "Popular / Large / Small / Exclusive" | Destaques · Carros · Motos · Pesados |
| Localização em cidades genéricas | São Paulo — a loja é uma só (placeholder até o endereço real) |
| Seção "Liderança" | Consórcios e cartas contempladas (a novidade real do negócio) |

O acento laranja `#FF6B2C` do briefing coincide com o laranja do panfleto oficial
da DM81 (`#FF6B35`) — mantido como está, agora é a cor da marca de verdade.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4 com tokens em `app/globals.css` (`@theme`) — sem cor solta no JSX
- Framer Motion (`motion`) para entradas e microinterações
- `next/image` em toda imagem; `lucide-react` nos ícones (traço 1.5px)
- Fontes por `next/font/google`: Archivo (display) + Inter (corpo)
- Zero biblioteca de UI pronta — componentes escritos à mão

## Árvore de arquivos

```
web/
├── PLANO.md
├── next.config.ts            remotePatterns para as fotos
├── tsconfig.json             strict
├── package.json
├── app/
│   ├── layout.tsx            fontes, metadata, lang="pt-BR"
│   ├── page.tsx              monta as seções, sem markup solto
│   └── globals.css           reset + tokens (@theme do Tailwind v4)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        sticky, blur ao rolar, scroll-spy
│   │   ├── MobileDrawer.tsx  full-screen, trava scroll, fecha no ESC
│   │   └── Footer.tsx        4 colunas + newsletter + barra inferior
│   ├── sections/
│   │   ├── Hero.tsx          split 35/65, hotspots, índice vertical, card de vídeo
│   │   ├── BrandStrip.tsx    faixa de marcas, marquee no mobile
│   │   ├── Consorcio.tsx     grid assimétrico 5/1/6 + imagem editorial com parallax
│   │   ├── Features.tsx      3 colunas numeradas, tipografia pura
│   │   ├── Collection.tsx    tabs deslizantes + grid de veículos
│   │   └── Faq.tsx           accordion + imagem
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── LearnMoreLink.tsx seta 45° que translada no hover
│   │   ├── VehicleCard.tsx   card do veículo (preço, cidade, botão)
│   │   ├── Tabs.tsx          barra ativa com layoutId, setas do teclado
│   │   ├── Accordion.tsx     altura animada, um aberto por vez
│   │   ├── Hotspot.tsx       pulso infinito + tooltip
│   │   ├── SectionHeading.tsx
│   │   └── Reveal.tsx        entrada whileInView reaproveitável
│   └── icons/
│       └── brands.tsx        SVG monocromático das montadoras
├── data/
│   ├── nav.ts       vehicles.ts   features.ts
│   ├── faq.ts       brands.ts     hero.ts       site.ts
└── lib/
    ├── utils.ts          cn()
    └── formatCurrency.ts pt-BR, tabular
```

Regra do briefing respeitada: **nenhum texto de conteúdo escrito direto no JSX** —
tudo vem de `data/`.

## Ordem das seções

1. Navbar (sticky)
2. Hero split 35/65
3. Faixa de marcas
4. Consórcios (texto + imagem editorial)
5. Features (3 colunas numeradas)
6. Coleção (tabs + grid)
7. FAQ (accordion + imagem)
8. Footer

## Riscos conhecidos

- **Fotos dos veículos**: o estoque real ainda não tem foto. Uso imagens do
  Unsplash com tratamento consistente (`saturate(.9)`, contraste alto) como
  placeholder declarado. Anúncio de venda precisa de foto do veículo real —
  está anotado no README.
- **Hospedagem**: Next.js não roda no GitHub Pages. Vai para Vercel ou Node na
  VPS, ao lado da API Python que já existe.
