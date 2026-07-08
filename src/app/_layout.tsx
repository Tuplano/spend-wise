import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { db } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { useEffectiveScheme } from '@/hooks/use-theme-colors';
import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useEffectiveScheme();
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
      seedIfEmpty(db).catch((e) => console.error('Failed to seed database', e));
    }
  }, [success]);

  if (error) {
    throw error;
  }

  if (!success) {
    return null;
  }

  return (
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
  );
}
