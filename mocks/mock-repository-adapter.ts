import type { RepositoryAdapter } from "../repositories/repository-adapter";
import type { ExpenseRepository } from "../repositories/expense-repository";
import type { TaskRepository } from "../repositories/task-repository";
import { createMockExpenseRepository } from "./expense-mock-repository";
import { createMockTaskRepository } from "./task-mock-repository";

export function createMockRepositoryAdapter(): RepositoryAdapter {
  const expenseMock = createMockExpenseRepository();
  const taskMock = createMockTaskRepository(expenseMock);
  const expenseRepository: ExpenseRepository = {
    listByOwner: expenseMock.listByOwner,
    create: expenseMock.create,
    markPaid: expenseMock.markPaid,
  };
  const taskRepository: TaskRepository = {
    listByOwner: taskMock.listByOwner,
    listRecurringByOwner: taskMock.listRecurringByOwner,
    create: taskMock.create,
    updateStatus: taskMock.updateStatus,
    generateRecurringInstances: taskMock.generateRecurringInstances,
  };

  return {
    taskRepository,
    expenseRepository,
  };
}
