import AsyncStorage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProfileStore = {
  displayName: string;
  email: string;
  setDisplayName: (displayName: string) => void;
  setEmail: (email: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      displayName: 'You',
      email: '',
      setDisplayName: (displayName) => set({ displayName }),
      setEmail: (email) => set({ email }),
    }),
    {
      name: 'profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
