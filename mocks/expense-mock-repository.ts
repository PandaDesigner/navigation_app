import {
  EXPENSE_STATUS,
  type Expense,
} from "../models/expense-models";
import type {
  CreateExpenseInput,
  ExpenseRepository,
} from "../repositories/expense-repository";
import {
  EXPENSE_FIXTURES,
  MOCK_CREATED_AT,
} from "./domain-fixtures";

export interface ExpenseMockRepository extends ExpenseRepository {
  getById(expenseId: string): Promise<Expense>;
}

function cloneExpense(expense: Expense): Expense {
  return {
    ...expense,
    sharedWithUserIds: [...expense.sharedWithUserIds],
  };
}

export function createMockExpenseRepository(): ExpenseMockRepository {
  let expenses = EXPENSE_FIXTURES.map(cloneExpense);
  let createdExpenseCount = 0;

  return {
    async listByOwner(ownerId) {
      return expenses
        .filter((expense) => expense.ownerId === ownerId)
        .map(cloneExpense);
    },

    async getById(expenseId) {
      const expense = expenses.find((candidate) => candidate.id === expenseId);

      if (!expense) {
        throw new Error(`Expense not found: ${expenseId}`);
      }

      return cloneExpense(expense);
    },

    async create(input: CreateExpenseInput) {
      createdExpenseCount += 1;
      const expense: Expense = {
        ...input,
        sharedWithUserIds: [...input.sharedWithUserIds],
        id: `expense-created-${createdExpenseCount}`,
        createdAt: MOCK_CREATED_AT,
        updatedAt: MOCK_CREATED_AT,
      };

      expenses = [...expenses, expense];
      return cloneExpense(expense);
    },

    async markPaid(expenseId, paidAt) {
      const expenseIndex = expenses.findIndex(
        (candidate) => candidate.id === expenseId,
      );

      if (expenseIndex === -1) {
        throw new Error(`Expense not found: ${expenseId}`);
      }

      const paidExpense: Expense = {
        ...expenses[expenseIndex],
        status: EXPENSE_STATUS.PAID,
        paidAt,
        updatedAt: paidAt,
      };
      expenses = expenses.map((expense, index) =>
        index === expenseIndex ? paidExpense : expense,
      );

      return cloneExpense(paidExpense);
    },
  };
}
