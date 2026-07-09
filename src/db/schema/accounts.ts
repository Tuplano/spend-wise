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
  /** The account's real-world balance at the time it was added; transactions tagged to this
   * account are added on top of this to get the current balance. */
  openingBalance: integer('opening_balance').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});
