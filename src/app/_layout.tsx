import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { db } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { useEffectiveScheme } from '@/hooks/use-theme-colors';
import { useCurrencyStore } from '@/stores/currency-store';
import { useProfileStore } from '@/stores/profile-store';
import { useThemeStore } from '@/stores/theme-store';
import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

function arePersistedStoresHydrated() {
  return (
    useCurrencyStore.persist.hasHydrated() &&
    useThemeStore.persist.hasHydrated() &&
    useProfileStore.persist.hasHydrated()
  );
}

/**
 * Persisted zustand stores rehydrate from the SQLite-backed kv-store asynchronously, on a
 * separate connection from the app's main DB migrations. Without this gate, a store write
 * (e.g. changing currency) made before rehydration resolves gets silently overwritten by the
 * stale persisted value once it lands.
 */
function usePersistedStoresReady() {
  const [ready, setReady] = useState(arePersistedStoresHydrated);

  useEffect(() => {
    if (ready) return;
    const recheck = () => setReady(arePersistedStoresHydrated());
    const unsubscribes = [
      useCurrencyStore.persist.onFinishHydration(recheck),
      useThemeStore.persist.onFinishHydration(recheck),
      useProfileStore.persist.onFinishHydration(recheck),
    ];
    recheck();
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [ready]);

  return ready;
}

export default function RootLayout() {
  const colorScheme = useEffectiveScheme();
  const { success, error } = useMigrations(db, migrations);
  const storesReady = usePersistedStoresReady();

  useEffect(() => {
    if (success) {
      seedIfEmpty(db).catch((e) => console.error('Failed to seed database', e));
    }
  }, [success]);

  if (error) {
    throw error;
  }

  if (!success || !storesReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-transaction" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-budget" options={{ presentation: 'modal' }} />
          <Stack.Screen name="manage-categories" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-category" options={{ presentation: 'modal' }} />
          <Stack.Screen name="manage-accounts" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-account" options={{ presentation: 'modal' }} />
          <Stack.Screen name="manage-account-types" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-account-type" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
