import {
  TASK_STATUS,
  TASK_TYPE,
  RECURRENCE_FREQUENCY,
  type RecurrenceFrequency,
  type RecurringTask,
  type Task,
  type TaskStatus,
} from "../models/task-models";
import { EXPENSE_STATUS } from "../models/expense-models";
import { VISIBILITY_SCOPE } from "../models/user-models";
import type { ExpenseRepository } from "../repositories/expense-repository";
import type {
  CreateTaskInput,
  GenerateRecurringInstancesInput,
  TaskRepository,
  UpdateTaskStatusInput,
} from "../repositories/task-repository";
import { validateShareTarget } from "../repositories/share-target-validation";
import {
  MOCK_CREATED_AT,
  MOCK_OPERATION_TIMESTAMP,
  RECURRING_TASK_FIXTURES,
  TASK_FIXTURES,
} from "./domain-fixtures";

export interface TaskMockRepository extends TaskRepository {
  createPaymentTaskWithExpense(): Promise<Task>;
}

export interface CreateMockTaskRepositoryOptions {
  recurringTasks?: readonly RecurringTask[];
}

const FOUR_WEEKS_IN_MILLISECONDS = 28 * 24 * 60 * 60 * 1_000;

function cloneTask(task: Task): Task {
  return {
    ...task,
    sharedWithUserIds: [...task.sharedWithUserIds],
    location: task.location ? { ...task.location } : null,
    reminders: task.reminders.map((reminder) => ({ ...reminder })),
  };
}

function cloneRecurringTask(recurringTask: RecurringTask): RecurringTask {
  return {
    ...recurringTask,
    sharedWithUserIds: [...recurringTask.sharedWithUserIds],
    scheduleTemplate: { ...recurringTask.scheduleTemplate },
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

function parseTimestamp(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return timestamp;
}

function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));
  return result;
}

function nextOccurrenceAt(
  occurrenceAt: string,
  frequency: RecurrenceFrequency,
): string {
  const occurrence = new Date(parseTimestamp(occurrenceAt));

  switch (frequency) {
    case RECURRENCE_FREQUENCY.WEEKLY:
      occurrence.setUTCDate(occurrence.getUTCDate() + 7);
      return occurrence.toISOString();
    case RECURRENCE_FREQUENCY.BIWEEKLY:
      occurrence.setUTCDate(occurrence.getUTCDate() + 14);
      return occurrence.toISOString();
    case RECURRENCE_FREQUENCY.MONTHLY:
      return addMonthsClamped(occurrence, 1).toISOString();
    case RECURRENCE_FREQUENCY.QUARTERLY:
      return addMonthsClamped(occurrence, 3).toISOString();
    case RECURRENCE_FREQUENCY.ANNUALLY:
      return addMonthsClamped(occurrence, 12).toISOString();
  }
}

export function createMockTaskRepository(
  expenseRepository: ExpenseRepository,
  options: CreateMockTaskRepositoryOptions = {},
): TaskMockRepository {
  let tasks = TASK_FIXTURES.map(cloneTask);
  let recurringTasks = (
    options.recurringTasks ?? RECURRING_TASK_FIXTURES
  ).map(cloneRecurringTask);
  let createdTaskCount = 0;
  let generatedRecurringTaskCount = 0;

  async function create(input: CreateTaskInput): Promise<Task> {
    validateShareTarget(input);
    requireStatusReason(
      input.status,
      input.blockedReason,
      input.cancelledReason,
    );
    createdTaskCount += 1;
    const taskId = `task-created-${createdTaskCount}`;
    const task: Task = {
      ...input,
      sharedWithUserIds: [...input.sharedWithUserIds],
      location: input.location
        ? {
            ...input.location,
            id: `location-${taskId}`,
            taskId,
            createdAt: MOCK_CREATED_AT,
            updatedAt: MOCK_CREATED_AT,
          }
        : null,
      reminders: input.reminders.map((reminder, index) => ({
        ...reminder,
        id: `reminder-${taskId}-${index + 1}`,
        taskId,
        createdAt: MOCK_CREATED_AT,
        updatedAt: MOCK_CREATED_AT,
      })),
      id: taskId,
      createdAt: MOCK_CREATED_AT,
      updatedAt: MOCK_CREATED_AT,
    };

    tasks = [...tasks, task];
    return cloneTask(task);
  }

  async function generateRecurringInstances(
    input: GenerateRecurringInstancesInput,
    recurringTaskId?: string,
  ): Promise<readonly Task[]> {
    const asOfTimestamp = parseTimestamp(input.asOf);
    const lookAheadTimestamp = asOfTimestamp + FOUR_WEEKS_IN_MILLISECONDS;
    const generated: Task[] = [];

    for (const recurringTask of recurringTasks) {
      if (
        recurringTask.ownerId !== input.ownerId ||
        (recurringTaskId && recurringTask.id !== recurringTaskId)
      ) {
        continue;
      }

      const occurrenceTimestamp = parseTimestamp(
        recurringTask.nextOccurrenceAt,
      );
      const endsAtTimestamp = recurringTask.scheduleTemplate.endsAt
        ? parseTimestamp(recurringTask.scheduleTemplate.endsAt)
        : null;
      const hasUnexpiredInstance = tasks.some(
        (task) =>
          task.recurringTaskId === recurringTask.id &&
          task.status !== TASK_STATUS.COMPLETED &&
          task.status !== TASK_STATUS.CANCELLED &&
          task.dueAt !== null &&
          parseTimestamp(task.dueAt) > asOfTimestamp,
      );

      if (
        occurrenceTimestamp > lookAheadTimestamp ||
        (endsAtTimestamp !== null && occurrenceTimestamp > endsAtTimestamp) ||
        hasUnexpiredInstance
      ) {
        continue;
      }

      generatedRecurringTaskCount += 1;
      const generatedTask: Task = {
        id: `task-recurring-${generatedRecurringTaskCount}`,
        ownerId: recurringTask.ownerId,
        familyId: recurringTask.familyId,
        visibility: recurringTask.visibility,
        sharedWithUserIds: [...recurringTask.sharedWithUserIds],
        type: recurringTask.scheduleTemplate.type,
        status: TASK_STATUS.PLANNED,
        sortOrder: 0,
        title: recurringTask.scheduleTemplate.title,
        description: recurringTask.scheduleTemplate.description,
        dueAt: recurringTask.nextOccurrenceAt,
        blockedReason: null,
        cancelledReason: null,
        expenseId: null,
        location: null,
        reminders: [],
        recurringTaskId: recurringTask.id,
        createdAt: input.asOf,
        updatedAt: input.asOf,
      };
      tasks = [...tasks, generatedTask];
      generated.push(cloneTask(generatedTask));

      const nextAt = nextOccurrenceAt(
        recurringTask.nextOccurrenceAt,
        recurringTask.scheduleTemplate.frequency,
      );
      recurringTasks = recurringTasks.map((candidate) =>
        candidate.id === recurringTask.id
          ? {
              ...candidate,
              nextOccurrenceAt: nextAt,
              updatedAt: input.asOf,
            }
          : candidate,
      );
    }

    return generated;
  }

  return {
    async listByOwner(ownerId) {
      return tasks.filter((task) => task.ownerId === ownerId).map(cloneTask);
    },

    async listRecurringByOwner(ownerId) {
      return recurringTasks
        .filter((task) => task.ownerId === ownerId)
        .map(cloneRecurringTask);
    },

    create,

    generateRecurringInstances,

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

      if (
        input.status === TASK_STATUS.COMPLETED &&
        currentTask.recurringTaskId
      ) {
        await generateRecurringInstances(
          {
            ownerId: currentTask.ownerId,
            asOf: MOCK_OPERATION_TIMESTAMP,
          },
          currentTask.recurringTaskId,
        );
      }

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
