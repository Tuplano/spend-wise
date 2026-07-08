import {
  Banknote,
  CircleEllipsis,
  Coins,
  CreditCard,
  Landmark,
  PiggyBank,
  Smartphone,
  Wallet,
} from 'lucide-react-native';

export const ACCOUNT_TYPE_ICONS = {
  wallet: Wallet,
  landmark: Landmark,
  'credit-card': CreditCard,
  smartphone: Smartphone,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  coins: Coins,
  'circle-ellipsis': CircleEllipsis,
} as const;

export type AccountTypeIconKey = keyof typeof ACCOUNT_TYPE_ICONS;

export const ACCOUNT_COLOR_PRESETS = [
  '#2f6bed',
  '#2f9e6f',
  '#e08a2b',
  '#9b6dd6',
  '#d95a6a',
  '#3b7fd4',
  '#1f9d68',
];

export const DEFAULT_ACCOUNT_TYPES: { name: string; icon: AccountTypeIconKey; sortOrder: number }[] = [
  { name: 'Cash', icon: 'wallet', sortOrder: 0 },
  { name: 'Bank', icon: 'landmark', sortOrder: 1 },
  { name: 'Credit card', icon: 'credit-card', sortOrder: 2 },
  { name: 'E-wallet', icon: 'smartphone', sortOrder: 3 },
  { name: 'Other', icon: 'circle-ellipsis', sortOrder: 4 },
];
