import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { budgets, categories } from '@/db/schema';

export type BudgetWithCategory = {
  id: number;
  monthKey: string;
  limitAmount: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryBgColor: string;
  categoryIcon: string;
};

export function useBudgets(): BudgetWithCategory[] {
  const { data } = useLiveQuery(
    db
      .select({
        id: budgets.id,
        monthKey: budgets.monthKey,
        limitAmount: budgets.limitAmount,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryBgColor: categories.bgColor,
        categoryIcon: categories.icon,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
  );

  return data ?? [];
}
