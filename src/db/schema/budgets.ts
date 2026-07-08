import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { categories } from './categories';

export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  monthKey: text('month_key').notNull(),
  limitAmount: integer('limit_amount').notNull(),
});
