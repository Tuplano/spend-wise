import { eq, sql } from 'drizzle-orm';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { db } from '@/db/client';
import { accounts, accountTypes, budgets, categories, transactions } from '@/db/schema';
import type { CurrencyCode } from '@/lib/money/currency';
import { useCurrencyStore } from '@/stores/currency-store';
import { useProfileStore } from '@/stores/profile-store';
import { type ThemePreference, useThemeStore } from '@/stores/theme-store';

export const BACKUP_SCHEMA_VERSION = 2;

type SettingsExport = {
  displayName: string;
  email: string;
  currency: CurrencyCode;
  themePreference: ThemePreference;
};

type AccountTypeExport = { id: number; name: string; icon: string; sortOrder: number };

type AccountExport = {
  id: number;
  name: string;
  typeId: number;
  color: string;
  accountNumber: string | null;
  balance: number;
  sortOrder: number;
};

/** Legacy (schemaVersion 1) shape: only captured the opening snapshot, not the running balance. */
type AccountExportV1 = Omit<AccountExport, 'balance'> & { openingBalance: number };

type CategoryExport = {
  id: number;
  name: string;
  kind: 'income' | 'expense';
  color: string;
  bgColor: string;
  icon: string;
  sortOrder: number;
};

type TransactionExport = {
  id: number;
  categoryId: number;
  accountId: number | null;
  kind: 'income' | 'expense';
  amount: number;
  merchant: string;
  note: string | null;
  occurredAt: number;
  createdAt: number;
};

type BudgetExport = { id: number; categoryId: number; monthKey: string; limitAmount: number };

export type BackupFileV2 = {
  app: 'spend-wise';
  schemaVersion: 2;
  exportedAt: string;
  data: {
    settings: SettingsExport;
    accountTypes: AccountTypeExport[];
    accounts: AccountExport[];
    categories: CategoryExport[];
    transactions: TransactionExport[];
    budgets: BudgetExport[];
  };
};

/** Backups created before accounts.balance became a stored running total. */
type BackupFileV1 = Omit<BackupFileV2, 'schemaVersion' | 'data'> & {
  schemaVersion: 1;
  data: Omit<BackupFileV2['data'], 'accounts'> & { accounts: AccountExportV1[] };
};

export type BackupFile = BackupFileV1 | BackupFileV2;

function todayStamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

async function ensureSharingAvailable() {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
}

function writeAndShare(fileName: string, content: string, mimeType: string, uti: string) {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  return Sharing.shareAsync(file.uri, { mimeType, UTI: uti });
}

async function buildBackup(): Promise<BackupFileV2> {
  const accountTypeRows = await db.select().from(accountTypes);
  const accountRows = await db.select().from(accounts);
  const categoryRows = await db.select().from(categories);
  const transactionRows = await db.select().from(transactions);
  const budgetRows = await db.select().from(budgets);

  return {
    app: 'spend-wise',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      settings: {
        displayName: useProfileStore.getState().displayName,
        email: useProfileStore.getState().email,
        currency: useCurrencyStore.getState().currency,
        themePreference: useThemeStore.getState().preference,
      },
      accountTypes: accountTypeRows.map((row) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        sortOrder: row.sortOrder,
      })),
      accounts: accountRows.map((row) => ({
        id: row.id,
        name: row.name,
        typeId: row.typeId,
        color: row.color,
        accountNumber: row.accountNumber,
        balance: row.balance,
        sortOrder: row.sortOrder,
      })),
      categories: categoryRows.map((row) => ({
        id: row.id,
        name: row.name,
        kind: row.kind,
        color: row.color,
        bgColor: row.bgColor,
        icon: row.icon,
        sortOrder: row.sortOrder,
      })),
      transactions: transactionRows.map((row) => ({
        id: row.id,
        categoryId: row.categoryId,
        accountId: row.accountId,
        kind: row.kind,
        amount: row.amount,
        merchant: row.merchant,
        note: row.note,
        occurredAt: row.occurredAt.getTime(),
        createdAt: row.createdAt.getTime(),
      })),
      budgets: budgetRows.map((row) => ({
        id: row.id,
        categoryId: row.categoryId,
        monthKey: row.monthKey,
        limitAmount: row.limitAmount,
      })),
    },
  };
}

export async function exportBackup(): Promise<void> {
  const backup = await buildBackup();
  await ensureSharingAvailable();
  await writeAndShare(
    `spend-wise-backup-${todayStamp()}.json`,
    JSON.stringify(backup, null, 2),
    'application/json',
    'public.json'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export type BackupValidationResult = { ok: true; data: BackupFile } | { ok: false; error: string };

/** Validates a parsed backup file's shape and referential integrity before anything touches the database. */
export function validateBackup(raw: unknown): BackupValidationResult {
  if (!isRecord(raw)) return { ok: false, error: 'File is not a valid backup (not a JSON object).' };
  if (raw.app !== 'spend-wise') return { ok: false, error: 'File is not a Spend Wise backup.' };
  if (typeof raw.schemaVersion !== 'number') {
    return { ok: false, error: 'Backup is missing a schema version.' };
  }
  if (raw.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: 'This backup was created by a newer version of Spend Wise. Please update the app.' };
  }
  if (!isRecord(raw.data)) return { ok: false, error: 'Backup is missing its data section.' };

  const {
    settings: settingsRaw,
    accountTypes: accountTypesRaw,
    accounts: accountsRaw,
    categories: categoriesRaw,
    transactions: transactionsRaw,
    budgets: budgetsRaw,
  } = raw.data;

  if (
    !isRecord(settingsRaw) ||
    !Array.isArray(accountTypesRaw) ||
    !Array.isArray(accountsRaw) ||
    !Array.isArray(categoriesRaw) ||
    !Array.isArray(transactionsRaw) ||
    !Array.isArray(budgetsRaw)
  ) {
    return { ok: false, error: 'Backup data is malformed.' };
  }

  const accountTypeIds = new Set<number>();
  for (const accountType of accountTypesRaw) {
    if (!isRecord(accountType) || typeof accountType.id !== 'number' || typeof accountType.name !== 'string') {
      return { ok: false, error: 'An account type entry is malformed.' };
    }
    accountTypeIds.add(accountType.id);
  }

  const accountIds = new Set<number>();
  for (const account of accountsRaw) {
    if (!isRecord(account) || typeof account.id !== 'number' || typeof account.name !== 'string') {
      return { ok: false, error: 'An account entry is malformed.' };
    }
    if (typeof account.typeId !== 'number' || !accountTypeIds.has(account.typeId)) {
      return { ok: false, error: 'An account references an account type that does not exist in the backup.' };
    }
    accountIds.add(account.id);
  }

  const categoryIds = new Set<number>();
  for (const category of categoriesRaw) {
    if (
      !isRecord(category) ||
      typeof category.id !== 'number' ||
      typeof category.name !== 'string' ||
      (category.kind !== 'income' && category.kind !== 'expense')
    ) {
      return { ok: false, error: 'A category entry is malformed.' };
    }
    categoryIds.add(category.id);
  }

  for (const transaction of transactionsRaw) {
    if (
      !isRecord(transaction) ||
      typeof transaction.id !== 'number' ||
      typeof transaction.categoryId !== 'number' ||
      (transaction.kind !== 'income' && transaction.kind !== 'expense') ||
      typeof transaction.amount !== 'number' ||
      typeof transaction.merchant !== 'string' ||
      typeof transaction.occurredAt !== 'number'
    ) {
      return { ok: false, error: 'A transaction entry is malformed.' };
    }
    if (!categoryIds.has(transaction.categoryId)) {
      return { ok: false, error: 'A transaction references a category that does not exist in the backup.' };
    }
    if (
      transaction.accountId !== null &&
      transaction.accountId !== undefined &&
      !accountIds.has(transaction.accountId as number)
    ) {
      return { ok: false, error: 'A transaction references an account that does not exist in the backup.' };
    }
  }

  for (const budget of budgetsRaw) {
    if (
      !isRecord(budget) ||
      typeof budget.id !== 'number' ||
      typeof budget.categoryId !== 'number' ||
      typeof budget.monthKey !== 'string' ||
      typeof budget.limitAmount !== 'number'
    ) {
      return { ok: false, error: 'A budget entry is malformed.' };
    }
    if (!categoryIds.has(budget.categoryId)) {
      return { ok: false, error: 'A budget references a category that does not exist in the backup.' };
    }
  }

  return { ok: true, data: raw as unknown as BackupFile };
}

/** Wipes every table and restores it from the backup, preserving original ids, then restores the
 * device-local preferences (name, email, currency, theme) into their respective stores. */
export async function importBackup(backup: BackupFile): Promise<void> {
  db.transaction((tx) => {
    tx.delete(transactions).run();
    tx.delete(budgets).run();
    tx.delete(accounts).run();
    tx.delete(categories).run();
    tx.delete(accountTypes).run();

    if (backup.data.accountTypes.length > 0) {
      tx.insert(accountTypes).values(backup.data.accountTypes).run();
    }

    if (backup.data.categories.length > 0) {
      tx.insert(categories).values(backup.data.categories).run();
    }

    if (backup.data.accounts.length > 0) {
      if (backup.schemaVersion === 1) {
        // Legacy backups only captured the opening snapshot, not the full running balance.
        tx.insert(accounts)
          .values(backup.data.accounts.map(({ openingBalance, ...rest }) => ({ ...rest, balance: openingBalance })))
          .run();
      } else {
        tx.insert(accounts).values(backup.data.accounts).run();
      }
    }

    if (backup.data.transactions.length > 0) {
      tx.insert(transactions)
        .values(
          backup.data.transactions.map((transaction) => ({
            ...transaction,
            occurredAt: new Date(transaction.occurredAt),
            createdAt: new Date(transaction.createdAt),
          }))
        )
        .run();
    }

    if (backup.data.budgets.length > 0) {
      tx.insert(budgets).values(backup.data.budgets).run();
    }

    if (backup.schemaVersion === 1) {
      // Roll each account's transaction history forward into the newly-inserted balance,
      // mirroring the one-time migration that converted opening_balance into balance.
      for (const account of backup.data.accounts) {
        const net = backup.data.transactions
          .filter((t) => t.accountId === account.id)
          .reduce((sum, t) => sum + (t.kind === 'income' ? t.amount : -t.amount), 0);
        if (net !== 0) {
          tx.update(accounts)
            .set({ balance: sql`${accounts.balance} + ${net}` })
            .where(eq(accounts.id, account.id))
            .run();
        }
      }
    }
  });

  useProfileStore.getState().setDisplayName(backup.data.settings.displayName);
  useProfileStore.getState().setEmail(backup.data.settings.email);
  useCurrencyStore.getState().setCurrency(backup.data.settings.currency);
  useThemeStore.getState().setPreference(backup.data.settings.themePreference);
}
