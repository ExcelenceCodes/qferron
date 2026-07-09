// Mock in-memory data for UI phase. Swap for Cloud queries in backend phase.

export type AccountType = "cash" | "bank" | "mobile" | "wallet" | "card" | "shared";
export type TxDirection = "in" | "out";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  shared?: boolean;
  members?: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  direction: TxDirection;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  note?: string;
  date: string;
}

export interface Rule {
  id: string;
  name: string;
  match: string;
  action: string;
  enabled: boolean;
  hits: number;
}

export interface Asset {
  id: string;
  name: string;
  kind: "property" | "vehicle" | "equity" | "crypto" | "other";
  value: number;
  currency: string;
  acquiredAt: string;
}

export const ACCOUNTS: Account[] = [
  { id: "a1", name: "Everyday Checking", type: "bank", currency: "USD", balance: 6420.55, updatedAt: "2026-07-08" },
  { id: "a2", name: "Emergency Fund", type: "bank", currency: "USD", balance: 12000, updatedAt: "2026-07-01" },
  { id: "a3", name: "M-Pesa Wallet", type: "mobile", currency: "KES", balance: 48210, updatedAt: "2026-07-09" },
  { id: "a4", name: "Wise EUR", type: "wallet", currency: "EUR", balance: 1830.4, updatedAt: "2026-07-07" },
  { id: "a5", name: "Cash on Hand", type: "cash", currency: "USD", balance: 220, updatedAt: "2026-07-05" },
  { id: "a6", name: "Family Rent Pool", type: "shared", currency: "USD", balance: 3200, shared: true, members: 4, updatedAt: "2026-07-06" },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", accountId: "a1", direction: "out", amount: 82.4, currency: "USD", category: "Groceries", merchant: "Whole Foods", date: "2026-07-08" },
  { id: "t2", accountId: "a1", direction: "in", amount: 4200, currency: "USD", category: "Salary", merchant: "Acme Inc.", date: "2026-07-01" },
  { id: "t3", accountId: "a3", direction: "out", amount: 1500, currency: "KES", category: "Transport", merchant: "Uber", date: "2026-07-07" },
  { id: "t4", accountId: "a4", direction: "out", amount: 12.5, currency: "EUR", category: "Software", merchant: "GitHub", date: "2026-07-06" },
  { id: "t5", accountId: "a1", direction: "out", amount: 34.2, currency: "USD", category: "Dining", merchant: "Blue Bottle", date: "2026-07-05" },
  { id: "t6", accountId: "a6", direction: "in", amount: 800, currency: "USD", category: "Contribution", merchant: "Alex", date: "2026-07-04" },
  { id: "t7", accountId: "a2", direction: "in", amount: 500, currency: "USD", category: "Transfer", merchant: "Everyday Checking", date: "2026-07-01" },
  { id: "t8", accountId: "a1", direction: "out", amount: 129, currency: "USD", category: "Utilities", merchant: "ConEd", date: "2026-06-30" },
];

export const RULES: Rule[] = [
  { id: "r1", name: "Categorize Whole Foods as Groceries", match: "merchant contains 'Whole Foods'", action: "set category = Groceries", enabled: true, hits: 42 },
  { id: "r2", name: "Auto-split rent 4 ways", match: "account = Family Rent Pool AND category = Rent", action: "split evenly across members", enabled: true, hits: 6 },
  { id: "r3", name: "Flag transactions over $500", match: "amount > 500", action: "notify + tag 'review'", enabled: false, hits: 3 },
];

export const ASSETS: Asset[] = [
  { id: "as1", name: "Downtown Apartment", kind: "property", value: 340000, currency: "USD", acquiredAt: "2022-04-11" },
  { id: "as2", name: "Toyota Prius 2021", kind: "vehicle", value: 18500, currency: "USD", acquiredAt: "2023-08-02" },
  { id: "as3", name: "Index ETF portfolio", kind: "equity", value: 62400, currency: "USD", acquiredAt: "2020-01-05" },
  { id: "as4", name: "BTC + ETH", kind: "crypto", value: 8900, currency: "USD", acquiredAt: "2021-11-19" },
];

// Admin mock
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Team";
  status: "active" | "suspended";
  joinedAt: string;
  country: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Amina Yusuf", email: "amina@ferron.app", plan: "Pro", status: "active", joinedAt: "2026-01-14", country: "KE" },
  { id: "u2", name: "Diego Alvarez", email: "diego@ferron.app", plan: "Free", status: "active", joinedAt: "2026-02-22", country: "MX" },
  { id: "u3", name: "Priya Nair", email: "priya@ferron.app", plan: "Team", status: "active", joinedAt: "2025-11-03", country: "IN" },
  { id: "u4", name: "Jonas Weber", email: "jonas@ferron.app", plan: "Pro", status: "suspended", joinedAt: "2025-09-30", country: "DE" },
  { id: "u5", name: "Sara Okafor", email: "sara@ferron.app", plan: "Free", status: "active", joinedAt: "2026-05-18", country: "NG" },
];

export interface FeedbackItem {
  id: string;
  from: string;
  subject: string;
  body: string;
  status: "new" | "in_review" | "closed";
  submittedAt: string;
}

export const FEEDBACK: FeedbackItem[] = [
  { id: "f1", from: "amina@ferron.app", subject: "Add PDF export for reports", body: "Would love branded PDF exports for monthly summaries.", status: "new", submittedAt: "2026-07-06" },
  { id: "f2", from: "diego@ferron.app", subject: "Splitting recurring bills", body: "Auto-split for monthly Netflix across 3 people please.", status: "in_review", submittedAt: "2026-07-02" },
  { id: "f3", from: "priya@ferron.app", subject: "Great AI chat!", body: "The AI created my accounts in seconds. Loved it.", status: "closed", submittedAt: "2026-06-28" },
];
