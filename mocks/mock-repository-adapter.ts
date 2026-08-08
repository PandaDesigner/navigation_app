import type { RepositoryAdapter } from "../repositories/repository-adapter";
import {
  createMockExpenseRepository,
  type ExpenseMockRepository,
} from "./expense-mock-repository";
import {
  createMockTaskRepository,
  type TaskMockRepository,
} from "./task-mock-repository";

export interface MockRepositoryAdapter extends RepositoryAdapter {
  taskRepository: TaskMockRepository;
  expenseRepository: ExpenseMockRepository;
}

export function createMockRepositoryAdapter(): MockRepositoryAdapter {
  const expenseRepository = createMockExpenseRepository();
  const taskRepository = createMockTaskRepository(expenseRepository);

  return {
    taskRepository,
    expenseRepository,
  };
}
