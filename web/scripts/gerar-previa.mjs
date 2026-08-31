/**
 * Gera uma prévia navegável do site num arquivo HTML único.
 *
 * O site inteiro — estilos, JavaScript e fontes — vai embutido, então o arquivo
 * abre com dois cliques, sem servidor e sem `npm start`. Serve para mandar para
 * alguém ver como está ficando.
 *
 *   node scripts/gerar-previa.mjs
 *
 * Os vídeos continuam vindo do CDN, então a máquina que abrir precisa de
 * internet. Depois que os arquivos estiverem em `public/video/`, eles entram
 * embutidos como o resto.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(raiz, "out");
const DESTINO = join(raiz, "..", "previa-dm81-next.html");

const MIME = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

/** Constrói em modo estático. O next.config.mjs lê PREVIA e liga `output: export`. */
function exportar() {
  execFileSync("npx", ["next", "build"], {
    cwd: raiz,
    stdio: "inherit",
    env: { ...process.env, PREVIA: "1" },
  });
}

const arquivoDoCaminho = (url) => join(OUT, url.replace(/^\//, "").split("?")[0]);

function comoDataUri(caminho) {
  const arquivo = arquivoDoCaminho(caminho);
  if (!existsSync(arquivo)) return null;
  const mime = MIME[extname(arquivo)] ?? "application/octet-stream";
  return `data:${mime};base64,${readFileSync(arquivo).toString("base64")}`;
}

function juntar() {
  let doc = readFileSync(join(OUT, "index.html"), "utf8");
  const ler = (url) =>
    url.startsWith("/_next/") && existsSync(arquivoDoCaminho(url))
      ? readFileSync(arquivoDoCaminho(url), "utf8")
      : null;

  // As fontes precisam virar data: — em file:// o navegador recusa buscá-las
  // por CORS, e o site abriria com a fonte de sistema.
  const embutirNoCss = (css) =>
    css.replace(/url\((\/_next\/[^)"']+)\)/g, (todo, caminho) => {
      const dado = comoDataUri(caminho);
      return dado ? `url(${dado})` : todo;
    });

  const estilo = (todo, href) => {
    const css = ler(href);
    return css ? `<style>${embutirNoCss(css)}</style>` : "";
  };
  doc = doc.replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g, estilo);
  doc = doc.replace(/<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"[^>]*\/?>/g, estilo);
  doc = doc.replace(/<link[^>]*rel="preload"[^>]*\/_next\/[^>]*\/?>/g, "");

  doc = doc.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (todo, src) => {
    const js = ler(src);
    // Um "</script>" dentro do código fecharia a tag cedo demais.
    return js ? `<script>${js.replaceAll("</script>", "<\\/script>")}</script>` : todo;
  });

  // O runtime do Next injeta <link rel=preload> a partir de caminhos escritos
  // dentro do próprio JS; em file:// eles quebram, então viram data: também.
  doc = doc.replace(/\/_next\/static\/(?:media|css)\/[A-Za-z0-9._-]+/g,
    (caminho) => comoDataUri(caminho) ?? caminho);

  const sobrou = [...new Set(doc.match(/\/_next\/[A-Za-z0-9._/-]+/g) ?? [])];
  if (sobrou.length) {
    console.warn("Referências não resolvidas:", sobrou);
  }

  writeFileSync(DESTINO, doc);
  console.log(`\n${DESTINO}  —  ${Math.round(doc.length / 1024)} KB`);
  console.log("Abra esse arquivo no navegador. Precisa de internet para os vídeos.");
}

exportar();
juntar();
