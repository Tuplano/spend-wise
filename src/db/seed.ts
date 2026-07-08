import { type db as Db } from '@/db/client';
import { categories } from '@/db/schema';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

export async function seedIfEmpty(db: typeof Db) {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length > 0) return;

  await db.insert(categories).values(DEFAULT_CATEGORIES);
}
