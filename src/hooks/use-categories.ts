import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { categories } from '@/db/schema';

export function useCategories() {
  const { data } = useLiveQuery(db.select().from(categories).orderBy(categories.sortOrder));
  return data ?? [];
}
