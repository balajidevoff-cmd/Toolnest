/**
 * Percentage calculation utilities with error validation.
 */

export function calculatePercentOf(percent: number, total: number): number {
  if (isNaN(percent) || isNaN(total)) throw new Error('Inputs must be valid numbers');
  return (percent / 100) * total;
}

export function calculatePercentageChange(fromValue: number, toValue: number): {
  changePercent: number;
  type: 'increase' | 'decrease' | 'no-change';
} {
  if (isNaN(fromValue) || isNaN(toValue)) throw new Error('Inputs must be valid numbers');
  if (fromValue === 0) {
    if (toValue === 0) return { changePercent: 0, type: 'no-change' };
    throw new Error('Initial value cannot be zero when computing percentage change');
  }

  const diff = toValue - fromValue;
  const pct = (diff / Math.abs(fromValue)) * 100;
  return {
    changePercent: parseFloat(pct.toFixed(2)),
    type: pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'no-change',
  };
}

export function calculatePercentageWhatIs(x: number, y: number): number {
  if (isNaN(x) || isNaN(y)) throw new Error('Inputs must be valid numbers');
  if (y === 0) throw new Error('Total value cannot be zero');
  return parseFloat(((x / y) * 100).toFixed(2));
}
