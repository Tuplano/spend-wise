import { useEffect, useState } from 'react';

import {
  formatCents as formatBaseCents,
  formatCompactCents as formatBaseCompactCents,
  formatSignedCents as formatBaseSignedCents,
} from '@/lib/format';
import { BASE_CURRENCY, ensureRates, getCachedRate, getRatesFetchedAt } from '@/lib/money/exchange-rates';
import { useCurrencyStore } from '@/stores/currency-store';

/**
 * The app's single display currency, live-converted from the fixed storage currency (BASE_CURRENCY).
 * Transactions and budgets are always entered/stored in BASE_CURRENCY; this hook only affects how
 * amounts are *shown*.
 */
export function useDisplayMoney() {
  const currency = useCurrencyStore((s) => s.currency);

  const [rate, setRate] = useState<number | null>(getCachedRate(currency));
  const [fetchedAt, setFetchedAt] = useState<number | null>(getRatesFetchedAt());
  const [trackedCurrency, setTrackedCurrency] = useState(currency);

  // Snap to whatever's already cached the instant the display currency changes,
  // instead of showing a stale rate from the previous currency for a frame.
  if (currency !== trackedCurrency) {
    setTrackedCurrency(currency);
    setRate(getCachedRate(currency));
  }

  useEffect(() => {
    let cancelled = false;

    ensureRates().then((cache) => {
      if (cancelled) return;
      setRate(cache.rates[currency] ?? (currency === BASE_CURRENCY ? 1 : null));
      setFetchedAt(cache.fetchedAt || null);
    });

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const effectiveRate = rate ?? 1;
  const isConverted = currency !== BASE_CURRENCY;
  const isLive = currency === BASE_CURRENCY || rate !== null;

  function formatCents(baseCents: number) {
    return formatBaseCents(Math.round(baseCents * effectiveRate), currency);
  }

  function formatSignedCents(baseCents: number, kind: 'income' | 'expense') {
    return formatBaseSignedCents(Math.round(baseCents * effectiveRate), kind, currency);
  }

  function formatCompactCents(baseCents: number) {
    return formatBaseCompactCents(Math.round(baseCents * effectiveRate), currency);
  }

  return {
    currency,
    rate: effectiveRate,
    isConverted,
    isLive,
    fetchedAt,
    formatCents,
    formatSignedCents,
    formatCompactCents,
  };
}
