import AsyncStorage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CurrencyCode } from '@/lib/money/currency';

type CurrencyStore = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'PHP',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-preference',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
