import { create } from 'zustand';

import { monthKey, shiftMonthKey } from '@/lib/date';

type MonthStore = {
  selectedMonthKey: string;
  nextMonth: () => void;
  prevMonth: () => void;
  setMonthKey: (key: string) => void;
};

export const useMonthStore = create<MonthStore>((set) => ({
  selectedMonthKey: monthKey(new Date()),
  nextMonth: () => set((state) => ({ selectedMonthKey: shiftMonthKey(state.selectedMonthKey, 1) })),
  prevMonth: () => set((state) => ({ selectedMonthKey: shiftMonthKey(state.selectedMonthKey, -1) })),
  setMonthKey: (key) => set({ selectedMonthKey: key }),
}));
