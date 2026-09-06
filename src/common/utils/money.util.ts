/**
 * Utilitário para arredondamento financeiro e precisão de ponto flutuante em JavaScript.
 * Evita problemas como 0.1 + 0.2 = 0.30000000000000004
 */
export function roundMoney(val: number): number {
  if (val === undefined || val === null || isNaN(val)) return 0;
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}
