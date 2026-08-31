# Landing page DM81 — dark premium

Landing page em Next.js 15 no padrão "dark premium editorial", construída a
partir do briefing em `PLANO.md`. Deploy na **Vercel**.

## Rodar local

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## Estrutura

- `app/` — layout (fontes e metadata) e a página, que só monta as seções
- `components/sections/` — Hero, BrandStrip, Consorcio, Features, Collection, Faq
- `components/layout/` — Navbar, MobileDrawer, Footer
- `components/ui/` — peças reaproveitadas (Tabs, Accordion, Hotspot, VehicleCard…)
- `data/` — **todo o conteúdo**. Nenhum texto é escrito direto no JSX.
- `app/globals.css` — tokens de cor e tipografia. Nenhuma cor solta no JSX.

## Estoque

`js/data.js`, na raiz do repositório, continua sendo a fonte de verdade.
Depois de editá-lo:

```bash
cd web && node scripts/importar-estoque.mjs
```

Isso regenera `data/vehicles.ts`.

## Vídeos

`data/hero.ts` aponta para os vídeos gerados para a DM81, hoje servidos pelo CDN
de origem. **Para produção**, baixe cada arquivo, salve em `public/video/` e
troque o `src` por `/video/nome.mp4` — o site deixa de depender de um CDN de
terceiros e carrega mais rápido.

Os vídeos aparecem em três lugares:

1. **Hero** — o índice vertical (01–04) troca a mídia com crossfade.
2. **Consórcio e Dúvidas** — fundo das imagens editoriais.
3. **Cards do estoque** — entram a 55% de opacidade **ao passar o mouse**, atrás
   da silhueta. Só carregam nesse momento (`preload="none"`) e são desligados
   para quem usa `prefers-reduced-motion`.

## Imagens dos veículos

A arte de cada card é vetorial e própria (`components/icons/ArteVeiculo.tsx`) —
não simula uma foto do veículo à venda. **Quando o estoque tiver foto real de
cada unidade, ela entra no lugar.** Anúncio com foto genérica engana o comprador.

## Acento laranja

O `--color-accent` aparece em no máximo ~3% da tela: cifrão do preço, ponto da
aba ativa, hover de botão e anel de foco. Se a página começar a parecer colorida,
algo saiu da regra.
