import type { Expense, ExpenseStatus } from "../models/expense-models";
import type { ShareTarget } from "../models/user-models";

export interface CreateExpenseInput extends ShareTarget {
  amountMinor: number;
  currency: string;
  category: string;
  serviceSubtype: string | null;
  status: ExpenseStatus;
  dueAt: string | null;
  paidAt: string | null;
}

export interface ExpenseRepository {
  listByOwner(ownerId: string): Promise<readonly Expense[]>;
  create(input: CreateExpenseInput): Promise<Expense>;
  markPaid(expenseId: string, paidAt: string): Promise<Expense>;
}
