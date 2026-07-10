export interface DebtRecord {
  id: string;
  kind: "debt" | "credit"; // debt = you owe, credit = owed to you
  counterparty: string;
  principal: number;
  outstanding: number;
  currency: string;
  interestPct?: number;
  dueDate: string;
  status: "current" | "overdue" | "paid";
  note?: string;
}

export const DEBTS: DebtRecord[] = [
  { id: "d1", kind: "debt", counterparty: "Coop Bank Loan", principal: 8000, outstanding: 5200, currency: "USD", interestPct: 12, dueDate: "2026-09-15", status: "current", note: "Small business loan" },
  { id: "d2", kind: "credit", counterparty: "Priya (roommate)", principal: 320, outstanding: 320, currency: "USD", dueDate: "2026-07-07", status: "overdue", note: "Split airbnb" },
  { id: "d3", kind: "debt", counterparty: "Diego", principal: 150, outstanding: 150, currency: "USD", dueDate: "2026-07-20", status: "current" },
  { id: "d4", kind: "credit", counterparty: "Freelance client — Acme", principal: 2400, outstanding: 1200, currency: "USD", dueDate: "2026-08-01", status: "current", note: "50% paid" },
  { id: "d5", kind: "debt", counterparty: "Family loan — Mom", principal: 5000, outstanding: 0, currency: "USD", dueDate: "2026-06-01", status: "paid" },
  { id: "d6", kind: "credit", counterparty: "Sara", principal: 80, outstanding: 80, currency: "USD", dueDate: "2026-07-04", status: "overdue" },
];
