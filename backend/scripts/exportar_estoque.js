// Lê o estoque de js/data.js (a fonte de verdade do site) e grava
// backend/data/estoque.json, que o backend importa para o SQLite ao subir.
//
// Rode na raiz do projeto sempre que editar js/data.js:
//   node backend/scripts/exportar_estoque.js

const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..", "..");
const origem = path.join(raiz, "js", "data.js");
const destino = path.join(raiz, "backend", "data", "estoque.json");

const fonte = fs.readFileSync(origem, "utf8");

// Avalia o arquivo num escopo isolado e devolve as duas constantes.
// Mais seguro que regex: o parser é o próprio JavaScript.
const extrair = new Function(fonte + "\n; return { VEICULOS, LOJA };");
const { VEICULOS, LOJA } = extrair();

if (!Array.isArray(VEICULOS) || !VEICULOS.length) {
  console.error("Não encontrei a lista VEICULOS em js/data.js");
  process.exit(1);
}

const veiculos = VEICULOS.map((v) => ({
  id: v.id,
  tipo: v.tipo,
  marca: v.marca,
  modelo: v.modelo,
  versao: v.versao ?? null,
  ano: v.ano ?? null,
  km: v.km ?? null,
  horas: v.horas ?? null,
  preco: v.preco,
  combustivel: v.combustivel ?? null,
  cambio: v.cambio ?? null,
  cor: v.cor ?? null,
  portas: v.portas ?? null,
  destaque: Boolean(v.destaque),
  descricao: v.descricao ?? null,
  opcionais: v.opcionais ?? [],
}));

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(
  destino,
  JSON.stringify({ loja: LOJA, veiculos }, null, 2) + "\n",
  "utf8"
);

console.log(`estoque.json atualizado: ${veiculos.length} veículos`);
