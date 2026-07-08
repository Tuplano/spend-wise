const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatCents(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatSignedCents(cents: number, kind: 'income' | 'expense') {
  const amount = formatCents(Math.abs(cents));
  return kind === 'income' ? `+${amount}` : `-${amount}`;
}

export function formatCompactCents(cents: number) {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars % 1000 === 0 ? 0 : 2)}k`;
  }
  return formatCents(cents);
}
