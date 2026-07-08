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
  sortOrder: integer('sort_order').notNull().default(0),
});
