export type ItemNav = { id: string; rotulo: string };

/** Os ids batem com o id de cada <section> — o scroll-spy depende disso. */
export const navegacao: ItemNav[] = [
  { id: "inicio", rotulo: "Início" },
  { id: "consorcio", rotulo: "Consórcio" },
  { id: "diferenciais", rotulo: "Diferenciais" },
  { id: "estoque", rotulo: "Estoque" },
  { id: "duvidas", rotulo: "Dúvidas" },
];
