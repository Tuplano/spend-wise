import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { accounts, categories, transactions } from '@/db/schema';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function signedAmount(kind: 'income' | 'expense', amount: number) {
  return kind === 'income' ? amount : -amount;
}

/** Adjusts an account's stored balance by `deltaCents` inside an existing `db.transaction`. */
export function adjustAccountBalance(tx: Tx, accountId: number | null, deltaCents: number) {
  if (accountId == null || deltaCents === 0) return;
  tx.update(accounts)
    .set({ balance: sql`${accounts.balance} + ${deltaCents}` })
    .where(eq(accounts.id, accountId))
    .run();
}

const ADJUSTMENT_CATEGORY_NAME = 'Balance adjustment';

function getOrCreateAdjustmentCategory(tx: Tx, kind: 'income' | 'expense'): number {
  const existing = tx
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.name, ADJUSTMENT_CATEGORY_NAME), eq(categories.kind, kind)))
    .get();
  if (existing) return existing.id;

  const { lastInsertRowId } = tx
    .insert(categories)
    .values({
      name: ADJUSTMENT_CATEGORY_NAME,
      kind,
      color: '#6b7280',
      bgColor: '#eceef1',
      icon: 'wrench',
      sortOrder: 999,
    })
    .run();
  return lastInsertRowId;
}

/**
 * Reconciles an account's stored balance to `newBalanceCents` by logging the difference as a
 * visible "Balance adjustment" transaction (rather than silently overwriting the balance), so the
 * account's balance always stays equal to the sum of its transaction history.
 */
export function reconcileAccountBalance(tx: Tx, accountId: number, newBalanceCents: number, currentBalanceCents: number) {
  const delta = newBalanceCents - currentBalanceCents;
  if (delta === 0) return;

  const kind: 'income' | 'expense' = delta > 0 ? 'income' : 'expense';
  const categoryId = getOrCreateAdjustmentCategory(tx, kind);
  tx.insert(transactions)
    .values({
      categoryId,
      accountId,
      kind,
      amount: Math.abs(delta),
      merchant: ADJUSTMENT_CATEGORY_NAME,
      occurredAt: new Date(),
    })
    .run();
  adjustAccountBalance(tx, accountId, delta);
}
