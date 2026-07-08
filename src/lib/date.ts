const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthKey(key: string) {
  const [year, month] = key.split('-').map(Number);
  return { year, month: month - 1 };
}

export function monthLabel(key: string) {
  const { year, month } = parseMonthKey(key);
  const currentYear = new Date().getFullYear();
  return year === currentYear ? MONTH_NAMES[month] : `${MONTH_NAMES[month]} ${year}`;
}

export function shiftMonthKey(key: string, delta: number) {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month + delta, 1);
  return monthKey(d);
}

export function monthRange(key: string) {
  const { year, month } = parseMonthKey(key);
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return { start, end };
}

export function dayLabel(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function weekOfMonthIndex(date: Date) {
  return Math.floor((date.getDate() - 1) / 7);
}
