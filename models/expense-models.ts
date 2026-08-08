import type { ShareTarget } from "./user-models";

export const EXPENSE_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

export type ExpenseStatus =
  (typeof EXPENSE_STATUS)[keyof typeof EXPENSE_STATUS];

export interface Expense extends ShareTarget {
  id: string;
  amountMinor: number;
  currency: string;
  category: string;
  serviceSubtype: string | null;
  status: ExpenseStatus;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
