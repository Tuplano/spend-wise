import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountTypes = sqliteTable('account_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});
