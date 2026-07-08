import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { categories, transactions } from '@/db/schema';

export type TransactionWithCategory = {
  id: number;
  kind: 'income' | 'expense';
  amount: number;
  merchant: string;
  note: string | null;
  occurredAt: Date;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryBgColor: string;
  categoryIcon: string;
};

export function useTransactions(): TransactionWithCategory[] {
  const { data } = useLiveQuery(
    db
      .select({
        id: transactions.id,
        kind: transactions.kind,
        amount: transactions.amount,
        merchant: transactions.merchant,
        note: transactions.note,
        occurredAt: transactions.occurredAt,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryBgColor: categories.bgColor,
        categoryIcon: categories.icon,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.occurredAt))
  );

  return data ?? [];
}
