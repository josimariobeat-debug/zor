/**
 * Custo unitário "final" de um tecido por metro.
 *
 * O preço cadastrado representa o valor pago ao fornecedor.
 * O custo operacional (frete, taxas, etc.) é somado a esse valor para
 * compor o custo real por metro usado em qualquer cálculo de custo de
 * produção/ficha técnica.
 */
export function getFabricUnitCost(fabric: {
  price_per_meter?: number | null;
  operational_cost?: number | null;
} | null | undefined): number {
  if (!fabric) return 0;
  const price = Number(fabric.price_per_meter ?? 0) || 0;
  const op = Number(fabric.operational_cost ?? 0) || 0;
  return price + op;
}
