import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from '@/db/schema';

export const expoDb = openDatabaseSync('budgetwise.db', { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });
