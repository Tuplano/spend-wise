import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { accountTypes } from './account-types';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  typeId: integer('type_id')
    .notNull()
    .references(() => accountTypes.id),
  color: text('color').notNull(),
  accountNumber: text('account_number'),
  /** The account's current balance. Kept in sync directly: every income/expense transaction
   * tagged to this account adjusts it on insert/edit/delete (see src/db/balance.ts). */
  balance: integer('balance').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});
