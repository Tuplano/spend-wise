import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { accountTypes } from '@/db/schema';

export function useAccountTypes() {
  const { data } = useLiveQuery(db.select().from(accountTypes).orderBy(accountTypes.sortOrder));
  return data ?? [];
}
