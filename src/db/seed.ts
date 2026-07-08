import { type db as Db } from '@/db/client';
import { accountTypes, categories } from '@/db/schema';
import { DEFAULT_ACCOUNT_TYPES } from '@/constants/accounts';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

export async function seedIfEmpty(db: typeof Db) {
  const existingCategories = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existingCategories.length === 0) {
    await db.insert(categories).values(DEFAULT_CATEGORIES);
  }

  const existingAccountTypes = await db.select({ id: accountTypes.id }).from(accountTypes).limit(1);
  if (existingAccountTypes.length === 0) {
    await db.insert(accountTypes).values(DEFAULT_ACCOUNT_TYPES);
  }
}
