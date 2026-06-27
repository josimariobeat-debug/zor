/**
 * Custo unitário "final" de um aviamento.
 *
 * O preço cadastrado representa o valor pago ao fornecedor por unidade.
 * O custo operacional (frete, taxas, etc.) é somado a esse valor para
 * compor o custo real por unidade usado em qualquer cálculo de custo de
 * produção/ficha técnica.
 */
export function getTrimUnitCost(trim: {
  price_per_unit?: number | null;
  operational_cost?: number | null;
} | null | undefined): number {
  if (!trim) return 0;
  const price = Number(trim.price_per_unit ?? 0) || 0;
  const op = Number(trim.operational_cost ?? 0) || 0;
  return price + op;
}
