import { type db as Db } from '@/db/client';
import { budgets, categories, transactions } from '@/db/schema';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { monthKey } from '@/lib/date';

function daysAgoAt(days: number, hours: number, minutes: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const BUDGET_LIMITS: Record<string, number> = {
  Groceries: 40000,
  Dining: 15000,
  Transport: 20000,
  Bills: 70000,
};

const SEED_TRANSACTIONS: {
  category: string;
  kind: 'income' | 'expense';
  merchant: string;
  cents: number;
  daysAgo: number;
  hour: number;
  minute: number;
}[] = [
  { category: 'Groceries', kind: 'expense', merchant: 'Whole Foods', cents: 4230, daysAgo: 0, hour: 9, minute: 24 },
  { category: 'Transport', kind: 'expense', merchant: 'Uber', cents: 1875, daysAgo: 0, hour: 8, minute: 10 },
  { category: 'Bills', kind: 'expense', merchant: 'Netflix', cents: 1599, daysAgo: 1, hour: 18, minute: 0 },
  { category: 'Dining', kind: 'expense', merchant: 'Coffee Bar', cents: 540, daysAgo: 1, hour: 15, minute: 40 },
  { category: 'Salary', kind: 'income', merchant: 'Salary', cents: 320000, daysAgo: 2, hour: 9, minute: 0 },
  { category: 'Groceries', kind: 'expense', merchant: "Trader Joe's", cents: 6850, daysAgo: 3, hour: 11, minute: 15 },
  { category: 'Transport', kind: 'expense', merchant: 'Shell Gas', cents: 4200, daysAgo: 4, hour: 17, minute: 5 },
  { category: 'Dining', kind: 'expense', merchant: 'Chipotle', cents: 1850, daysAgo: 5, hour: 12, minute: 30 },
  { category: 'Bills', kind: 'expense', merchant: 'Electric Co', cents: 15600, daysAgo: 6, hour: 10, minute: 0 },
  { category: 'Shopping', kind: 'expense', merchant: 'Amazon', cents: 5400, daysAgo: 7, hour: 20, minute: 12 },
  { category: 'Bills', kind: 'expense', merchant: 'Rent', cents: 42000, daysAgo: 9, hour: 9, minute: 0 },
  { category: 'Groceries', kind: 'expense', merchant: "Trader Joe's", cents: 5200, daysAgo: 10, hour: 16, minute: 45 },
  { category: 'Health', kind: 'expense', merchant: 'Pharmacy', cents: 2200, daysAgo: 11, hour: 13, minute: 20 },
  { category: 'Dining', kind: 'expense', merchant: 'Bar Tab', cents: 3200, daysAgo: 12, hour: 22, minute: 0 },
  { category: 'Groceries', kind: 'expense', merchant: 'Costco', cents: 11200, daysAgo: 14, hour: 14, minute: 0 },
  { category: 'Salary', kind: 'income', merchant: 'Salary', cents: 310000, daysAgo: 33, hour: 9, minute: 0 },
  { category: 'Groceries', kind: 'expense', merchant: 'Whole Foods', cents: 8000, daysAgo: 34, hour: 9, minute: 30 },
  { category: 'Bills', kind: 'expense', merchant: 'Netflix', cents: 1599, daysAgo: 36, hour: 18, minute: 0 },
  { category: 'Dining', kind: 'expense', merchant: 'Coffee Bar', cents: 620, daysAgo: 38, hour: 15, minute: 10 },
  { category: 'Transport', kind: 'expense', merchant: 'Uber', cents: 2200, daysAgo: 40, hour: 8, minute: 20 },
];

export async function seedIfEmpty(db: typeof Db) {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length > 0) return;

  const insertedCategories = await db.insert(categories).values(DEFAULT_CATEGORIES).returning();
  const categoryIdByName = new Map(insertedCategories.map((c) => [c.name, c.id]));

  const currentMonthKey = monthKey(new Date());
  await db.insert(budgets).values(
    Object.entries(BUDGET_LIMITS).map(([name, limitAmount]) => ({
      categoryId: categoryIdByName.get(name)!,
      monthKey: currentMonthKey,
      limitAmount,
    }))
  );

  await db.insert(transactions).values(
    SEED_TRANSACTIONS.map((t) => ({
      categoryId: categoryIdByName.get(t.category)!,
      kind: t.kind,
      amount: t.cents,
      merchant: t.merchant,
      occurredAt: daysAgoAt(t.daysAgo, t.hour, t.minute),
    }))
  );
}
