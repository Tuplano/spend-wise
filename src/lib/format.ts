const CURRENCY_SYMBOL = '₱';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

export function formatCents(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatSignedCents(cents: number, kind: 'income' | 'expense') {
  const amount = formatCents(Math.abs(cents));
  return kind === 'income' ? `+${amount}` : `-${amount}`;
}

export function formatCompactCents(cents: number) {
  const pesos = cents / 100;
  if (Math.abs(pesos) >= 1000) {
    return `${CURRENCY_SYMBOL}${(pesos / 1000).toFixed(pesos % 1000 === 0 ? 0 : 2)}k`;
  }
  return formatCents(cents);
}
