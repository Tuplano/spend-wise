import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { accounts, accountTypes } from '@/db/schema';

export type AccountWithType = {
  id: number;
  name: string;
  color: string;
  accountNumber: string | null;
  balance: number;
  sortOrder: number;
  typeId: number;
  typeName: string;
  typeIcon: string;
};

export function useAccounts(): AccountWithType[] {
  const { data } = useLiveQuery(
    db
      .select({
        id: accounts.id,
        name: accounts.name,
        color: accounts.color,
        accountNumber: accounts.accountNumber,
        balance: accounts.balance,
        sortOrder: accounts.sortOrder,
        typeId: accounts.typeId,
        typeName: accountTypes.name,
        typeIcon: accountTypes.icon,
      })
      .from(accounts)
      .innerJoin(accountTypes, eq(accounts.typeId, accountTypes.id))
      .orderBy(accounts.sortOrder)
  );

  return data ?? [];
}
