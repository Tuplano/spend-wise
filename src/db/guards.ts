import { count, eq } from 'drizzle-orm';

import { type db as Db } from '@/db/client';
import { accounts, budgets, transactions } from '@/db/schema';

export class DeleteBlockedError extends Error {}

export async function assertCategoryDeletable(db: typeof Db, categoryId: number, categoryName: string) {
  const [{ n: txCount }] = await db
    .select({ n: count() })
    .from(transactions)
    .where(eq(transactions.categoryId, categoryId));
  if (txCount > 0) {
    throw new DeleteBlockedError(`${categoryName} is used by ${txCount} transaction${txCount === 1 ? '' : 's'}`);
  }

  const [{ n: budgetCount }] = await db
    .select({ n: count() })
    .from(budgets)
    .where(eq(budgets.categoryId, categoryId));
  if (budgetCount > 0) {
    throw new DeleteBlockedError(`${categoryName} is used by ${budgetCount} budget${budgetCount === 1 ? '' : 's'}`);
  }
}

export async function assertAccountDeletable(db: typeof Db, accountId: number, accountName: string) {
  const [{ n: txCount }] = await db
    .select({ n: count() })
    .from(transactions)
    .where(eq(transactions.accountId, accountId));
  if (txCount > 0) {
    throw new DeleteBlockedError(`${accountName} is used by ${txCount} transaction${txCount === 1 ? '' : 's'}`);
  }
}

export async function assertAccountTypeDeletable(db: typeof Db, accountTypeId: number, accountTypeName: string) {
  const [{ n: accountCount }] = await db
    .select({ n: count() })
    .from(accounts)
    .where(eq(accounts.typeId, accountTypeId));
  if (accountCount > 0) {
    throw new DeleteBlockedError(
      `${accountTypeName} is used by ${accountCount} account${accountCount === 1 ? '' : 's'}`
    );
  }
}
