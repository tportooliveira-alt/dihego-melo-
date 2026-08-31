/** Formata em real brasileiro, sem centavos (preço de veículo não usa centavo). */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** Separa o cifrão do número — o briefing pede o "R$" em laranja. */
export function partesDoPreco(valor: number): { moeda: string; numero: string } {
  return {
    moeda: "R$",
    numero: valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
  };
}

export function formatarKm(km: number): string {
  return `${km.toLocaleString("pt-BR")} km`;
}
