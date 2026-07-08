import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { categories } from './categories';

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  kind: text('kind', { enum: ['income', 'expense'] }).notNull(),
  amount: integer('amount').notNull(),
  merchant: text('merchant').notNull(),
  note: text('note'),
  accountLabel: text('account_label').notNull().default('Card •• 4821'),
  occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
