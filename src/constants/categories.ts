import { Car, Coffee, FileText, HeartPulse, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react-native';

export const CATEGORY_ICONS = {
  'shopping-cart': ShoppingCart,
  coffee: Coffee,
  car: Car,
  'shopping-bag': ShoppingBag,
  'file-text': FileText,
  'heart-pulse': HeartPulse,
  'trending-up': TrendingUp,
} as const;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

export const DEFAULT_CATEGORIES: {
  name: string;
  kind: 'income' | 'expense';
  color: string;
  bgColor: string;
  icon: CategoryIconKey;
  sortOrder: number;
}[] = [
  {
    name: 'Groceries',
    kind: 'expense',
    color: '#2f9e6f',
    bgColor: '#e3f4ec',
    icon: 'shopping-cart',
    sortOrder: 0,
  },
  {
    name: 'Dining',
    kind: 'expense',
    color: '#e08a2b',
    bgColor: '#fbf0df',
    icon: 'coffee',
    sortOrder: 1,
  },
  {
    name: 'Transport',
    kind: 'expense',
    color: '#3b7fd4',
    bgColor: '#e6effb',
    icon: 'car',
    sortOrder: 2,
  },
  {
    name: 'Shopping',
    kind: 'expense',
    color: '#9b6dd6',
    bgColor: '#f0e9fb',
    icon: 'shopping-bag',
    sortOrder: 3,
  },
  {
    name: 'Bills',
    kind: 'expense',
    color: '#d95a6a',
    bgColor: '#fbe7ea',
    icon: 'file-text',
    sortOrder: 4,
  },
  {
    name: 'Health',
    kind: 'expense',
    color: '#2f6bed',
    bgColor: '#e8effe',
    icon: 'heart-pulse',
    sortOrder: 5,
  },
  {
    name: 'Salary',
    kind: 'income',
    color: '#1f9d68',
    bgColor: '#e3f4ec',
    icon: 'trending-up',
    sortOrder: 6,
  },
];
