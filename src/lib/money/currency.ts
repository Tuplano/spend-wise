export type CurrencyCode = 'PHP' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; locale: string; symbol: string }[] = [
  { code: 'PHP', label: 'Philippine Peso', locale: 'en-PH', symbol: '₱' },
  { code: 'USD', label: 'US Dollar', locale: 'en-US', symbol: '$' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE', symbol: '€' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', locale: 'ja-JP', symbol: '¥' },
];

export function currencyOption(code: CurrencyCode) {
  return CURRENCY_OPTIONS.find((option) => option.code === code) ?? CURRENCY_OPTIONS[0];
}
