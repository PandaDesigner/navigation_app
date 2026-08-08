import {
  TASK_STATUS,
  TASK_TYPE,
  type Task,
  type TaskStatus,
} from "../models/task-models";
import { EXPENSE_STATUS } from "../models/expense-models";
import { VISIBILITY_SCOPE } from "../models/user-models";
import type { ExpenseRepository } from "../repositories/expense-repository";
import type {
  CreateTaskInput,
  TaskRepository,
  UpdateTaskStatusInput,
} from "../repositories/task-repository";
import {
  MOCK_CREATED_AT,
  MOCK_OPERATION_TIMESTAMP,
  TASK_FIXTURES,
} from "./domain-fixtures";

export interface TaskMockRepository extends TaskRepository {
  createPaymentTaskWithExpense(): Promise<Task>;
}

function cloneTask(task: Task): Task {
  return {
    ...task,
    sharedWithUserIds: [...task.sharedWithUserIds],
    location: task.location ? { ...task.location } : null,
    reminders: task.reminders.map((reminder) => ({ ...reminder })),
  };
}

function requireStatusReason(
  status: TaskStatus,
  blockedReason?: string | null,
  cancelledReason?: string | null,
): void {
  if (status === TASK_STATUS.BLOCKED && !blockedReason?.trim()) {
    throw new Error("A blocked task requires blockedReason.");
  }

  if (status === TASK_STATUS.CANCELLED && !cancelledReason?.trim()) {
    throw new Error("A cancelled task requires cancelledReason.");
  }
}

function isPaymentTask(task: Task): boolean {
  return (
    task.type === TASK_TYPE.PAYMENT_SERVICE ||
    task.type === TASK_TYPE.PAYMENT_GOODS
  );
}

export function createMockTaskRepository(
  expenseRepository: ExpenseRepository,
): TaskMockRepository {
  let tasks = TASK_FIXTURES.map(cloneTask);
  let createdTaskCount = 0;

  async function create(input: CreateTaskInput): Promise<Task> {
    requireStatusReason(
      input.status,
      input.blockedReason,
      input.cancelledReason,
    );
    createdTaskCount += 1;
    const task: Task = {
      ...input,
      sharedWithUserIds: [...input.sharedWithUserIds],
      location: input.location ? { ...input.location } : null,
      reminders: input.reminders.map((reminder) => ({ ...reminder })),
      id: `task-created-${createdTaskCount}`,
      createdAt: MOCK_CREATED_AT,
      updatedAt: MOCK_CREATED_AT,
    };

    tasks = [...tasks, task];
    return cloneTask(task);
  }

  return {
    async listByOwner(ownerId) {
      return tasks.filter((task) => task.ownerId === ownerId).map(cloneTask);
    },

    create,

    async updateStatus(input: UpdateTaskStatusInput) {
      requireStatusReason(
        input.status,
        input.blockedReason,
        input.cancelledReason,
      );
      const taskIndex = tasks.findIndex(
        (candidate) => candidate.id === input.taskId,
      );

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${input.taskId}`);
      }

      const currentTask = tasks[taskIndex];

      if (
        input.status === TASK_STATUS.COMPLETED &&
        currentTask.expenseId &&
        isPaymentTask(currentTask)
      ) {
        await expenseRepository.markPaid(
          currentTask.expenseId,
          MOCK_OPERATION_TIMESTAMP,
        );
      }

      const updatedTask: Task = {
        ...currentTask,
        status: input.status,
        blockedReason:
          input.status === TASK_STATUS.BLOCKED
            ? (input.blockedReason?.trim() ?? null)
            : null,
        cancelledReason:
          input.status === TASK_STATUS.CANCELLED
            ? (input.cancelledReason?.trim() ?? null)
            : null,
        updatedAt: MOCK_OPERATION_TIMESTAMP,
      };
      tasks = tasks.map((task, index) =>
        index === taskIndex ? updatedTask : task,
      );

      return cloneTask(updatedTask);
    },

    async createPaymentTaskWithExpense() {
      const expense = await expenseRepository.create({
        ownerId: "user-owner",
        familyId: "family-home",
        visibility: VISIBILITY_SCOPE.FAMILY,
        sharedWithUserIds: [],
        amountMinor: 109_900,
        currency: "COP",
        category: "utilities",
        serviceSubtype: "phone",
        status: EXPENSE_STATUS.PENDING,
        dueAt: "2026-09-15T23:59:59.000Z",
        paidAt: null,
      });

      return create({
        ownerId: expense.ownerId,
        familyId: expense.familyId,
        visibility: expense.visibility,
        sharedWithUserIds: [...expense.sharedWithUserIds],
        type: TASK_TYPE.PAYMENT_SERVICE,
        status: TASK_STATUS.PENDING,
        sortOrder: 60,
        title: "Pay phone service",
        description: "Mock payment task with a linked expense.",
        dueAt: expense.dueAt,
        blockedReason: null,
        cancelledReason: null,
        expenseId: expense.id,
        location: null,
        reminders: [],
        recurringTaskId: null,
      });
    },
  };
}
