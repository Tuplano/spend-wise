import { currencyOption, type CurrencyCode } from '@/lib/money/currency';

function formatterFor(currency: CurrencyCode) {
  const option = currencyOption(currency);
  return new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: option.code,
  });
}

export function formatCents(cents: number, currency: CurrencyCode = 'PHP') {
  return formatterFor(currency).format(cents / 100);
}

export function formatSignedCents(cents: number, kind: 'income' | 'expense', currency: CurrencyCode = 'PHP') {
  const amount = formatCents(Math.abs(cents), currency);
  return kind === 'income' ? `+${amount}` : `-${amount}`;
}

export function formatCompactCents(cents: number, currency: CurrencyCode = 'PHP') {
  const value = cents / 100;
  if (Math.abs(value) >= 1000) {
    const symbol = currencyOption(currency).symbol;
    return `${symbol}${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)}k`;
  }
  return formatCents(cents, currency);
}
