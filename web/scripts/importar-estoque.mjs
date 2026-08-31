// Gera data/vehicles.ts a partir de ../js/data.js — a fonte de verdade do estoque.
// Rode na pasta web/ sempre que o estoque mudar:  node scripts/importar-estoque.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "..", "..");

const fonte = fs.readFileSync(path.join(raiz, "js", "data.js"), "utf8");
const { VEICULOS } = new Function(fonte + "; return { VEICULOS };")();

const CATEGORIA = {
  carro: "carros", utilitario: "carros",
  moto: "motos",
  caminhao: "pesados", onibus: "pesados", carreta: "pesados", trator: "pesados",
};

const linhas = VEICULOS.map((v) => {
  const campos = [
    `    id: ${v.id}`,
    `    nome: ${JSON.stringify(`${v.marca} ${v.modelo}`)}`,
    `    versao: ${JSON.stringify(v.versao ?? "")}`,
    `    tipo: ${JSON.stringify(v.tipo)}`,
    `    categoria: ${JSON.stringify(CATEGORIA[v.tipo] ?? "carros")}`,
    `    ano: ${v.ano ?? "null"}`,
    v.km != null ? `    km: ${v.km}` : null,
    v.horas != null ? `    horas: ${v.horas}` : null,
    `    preco: ${v.preco}`,
    `    cambio: ${JSON.stringify(v.cambio ?? "")}`,
    `    combustivel: ${JSON.stringify(v.combustivel ?? "")}`,
    `    destaque: ${Boolean(v.destaque)}`,
    `    arte: { g1: ${JSON.stringify(v.g1)}, icone: ${JSON.stringify(v.icone)} }`,
  ].filter(Boolean);
  return `  {\n${campos.join(",\n")},\n  }`;
}).join(",\n");

const cabecalho = fs.readFileSync(path.join(aqui, "..", "data", "vehicles.ts"), "utf8")
  .split("export const veiculos")[0];

const rodape = fs.readFileSync(path.join(aqui, "..", "data", "vehicles.ts"), "utf8")
  .split("];\n")[1];

fs.writeFileSync(
  path.join(aqui, "..", "data", "vehicles.ts"),
  `${cabecalho}export const veiculos: Veiculo[] = [\n${linhas},\n];\n${rodape}`,
  "utf8",
);
console.log(`data/vehicles.ts: ${VEICULOS.length} veículos`);
