import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { accounts, categories, transactions } from '@/db/schema';

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
  accountId: number | null;
  accountName: string | null;
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
        accountId: transactions.accountId,
        accountName: accounts.name,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .orderBy(desc(transactions.occurredAt))
  );

  return data ?? [];
}
