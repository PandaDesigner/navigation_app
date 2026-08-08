import type { ExpenseRepository } from "./expense-repository";
import type { TaskRepository } from "./task-repository";

export interface RepositoryAdapter {
  taskRepository: TaskRepository;
  expenseRepository: ExpenseRepository;
}
