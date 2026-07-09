/** Stylized card looks for banks and e-wallets commonly used in the Philippines. Matched against
 * the account's name (e.g. "BDO Savings") so no extra field is needed when adding an account. */
export type BankPreset = {
  id: string;
  label: string;
  match: RegExp;
  kind: 'bank' | 'ewallet';
  /** Gradient stops for the card background, light -> base -> dark. */
  gradient: [string, string, string];
  /** Color for the name/number/balance text. */
  textColor: string;
  /** Color for the bank wordmark specifically; defaults to textColor when unset. */
  wordmarkColor?: string;
};

export const BANK_PRESETS: BankPreset[] = [
  {
    id: 'bdo',
    label: 'BDO',
    match: /\bbdo\b/i,
    kind: 'bank',
    gradient: ['#1d4fc4', '#0a2f9e', '#051a5c'],
    textColor: '#ffffff',
  },
  {
    id: 'bpi',
    label: 'BPI',
    match: /\bbpi\b/i,
    kind: 'bank',
    gradient: ['#e23c4e', '#c8102e', '#7a0a1c'],
    textColor: '#ffffff',
  },
  {
    id: 'unionbank',
    label: 'UnionBank',
    match: /union\s*bank/i,
    kind: 'bank',
    gradient: ['#ffab3d', '#f7941d', '#a8600a'],
    textColor: '#1a1a1a',
  },
  {
    id: 'securitybank',
    label: 'Security Bank',
    match: /security\s*bank/i,
    kind: 'bank',
    gradient: ['#164a7a', '#0a2c4d', '#03121f'],
    textColor: '#ffffff',
  },
  {
    id: 'eastwest',
    label: 'EastWest',
    match: /east\s*west(\s*bank)?/i,
    kind: 'bank',
    gradient: ['#f14b52', '#d81e27', '#7a0d13'],
    textColor: '#ffffff',
  },
  {
    id: 'metrobank',
    label: 'Metrobank',
    match: /metro\s*bank/i,
    kind: 'bank',
    gradient: ['#155ec9', '#08316e', '#031836'],
    textColor: '#ffffff',
  },
  {
    id: 'gcash',
    label: 'GCash',
    match: /g\s*-?\s*cash/i,
    kind: 'ewallet',
    gradient: ['#2ba0ff', '#0072ce', '#00447f'],
    textColor: '#ffffff',
  },
  {
    id: 'maya',
    label: 'Maya',
    match: /\bmaya\b|paymaya/i,
    kind: 'ewallet',
    gradient: ['#262626', '#131313', '#000000'],
    textColor: '#ffffff',
    wordmarkColor: '#6FDD54',
  },
  {
    id: 'gotyme',
    label: 'GoTyme',
    match: /go\s*tyme/i,
    kind: 'ewallet',
    gradient: ['#a855f7', '#7b2ff7', '#450d99'],
    textColor: '#ffffff',
  },
];

export function matchBankPreset(name: string): BankPreset | null {
  return BANK_PRESETS.find((p) => p.match.test(name)) ?? null;
}
