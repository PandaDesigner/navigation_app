import { describe, expect, it } from "vitest";

import {
  BLOCKED_TRIP_TASK_FIXTURE,
  CANCELLED_TASK_FIXTURE,
  FAMILY_PHONE_PAYMENT_TASK_FIXTURE,
  PLANNED_BIRTHDAY_EVENT_FIXTURE,
  PRIVATE_PRODUCTIVE_TASK_FIXTURE,
  SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE,
  SUBSCRIPTION_RECURRING_TASK_FIXTURE,
} from "@/mocks/domain-fixtures";
import { createMockExpenseRepository } from "@/mocks/expense-mock-repository";
import { createMockRepositoryAdapter } from "@/mocks/mock-repository-adapter";
import { createMockTaskRepository } from "@/mocks/task-mock-repository";
import { EXPENSE_STATUS } from "@/models/expense-models";
import {
  RECURRENCE_FREQUENCY,
  TASK_STATUS,
  TASK_TYPE,
} from "@/models/task-models";
import { VISIBILITY_SCOPE } from "@/models/user-models";

describe("mock payment completion", () => {
  it("marks a linked expense paid when a payment task completes", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.createPaymentTaskWithExpense();

    await tasks.updateStatus({ taskId: task.id, status: TASK_STATUS.COMPLETED });

    await expect(expenses.getById(task.expenseId!)).resolves.toMatchObject({
      status: EXPENSE_STATUS.PAID,
    });
  });
});

describe("mock repository adapter", () => {
  it("composes task and expense mock repositories behind one boundary", async () => {
    const adapter = createMockRepositoryAdapter();
    const paymentTask = await adapter.taskRepository.createPaymentTaskWithExpense();

    await adapter.taskRepository.updateStatus({
      taskId: paymentTask.id,
      status: TASK_STATUS.COMPLETED,
    });

    await expect(
      adapter.expenseRepository.getById(paymentTask.expenseId!),
    ).resolves.toMatchObject({ status: EXPENSE_STATUS.PAID });
  });
});

describe("mock task status validation", () => {
  it("rejects blocked status without a non-empty reason", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);

    await expect(
      tasks.updateStatus({
        taskId: PRIVATE_PRODUCTIVE_TASK_FIXTURE.id,
        status: TASK_STATUS.BLOCKED,
      }),
    ).rejects.toThrow("blockedReason");
  });

  it("rejects cancelled status without a non-empty reason", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);

    await expect(
      tasks.updateStatus({
        taskId: PRIVATE_PRODUCTIVE_TASK_FIXTURE.id,
        status: TASK_STATUS.CANCELLED,
        cancelledReason: "   ",
      }),
    ).rejects.toThrow("cancelledReason");
  });

  it("stores the reason for a valid blocked transition", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);

    await expect(
      tasks.updateStatus({
        taskId: PRIVATE_PRODUCTIVE_TASK_FIXTURE.id,
        status: TASK_STATUS.BLOCKED,
        blockedReason: "Waiting for approval",
      }),
    ).resolves.toMatchObject({
      status: TASK_STATUS.BLOCKED,
      blockedReason: "Waiting for approval",
      cancelledReason: null,
    });
  });
});

describe("domain fixtures", () => {
  it("covers the required task and expense scenarios", () => {
    expect(PRIVATE_PRODUCTIVE_TASK_FIXTURE).toMatchObject({
      type: TASK_TYPE.PRODUCTIVE,
      status: TASK_STATUS.BACKLOG,
      visibility: VISIBILITY_SCOPE.PRIVATE,
    });
    expect(FAMILY_PHONE_PAYMENT_TASK_FIXTURE).toMatchObject({
      type: TASK_TYPE.PAYMENT_SERVICE,
      visibility: VISIBILITY_SCOPE.FAMILY,
    });
    expect(SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE).toMatchObject({
      visibility: VISIBILITY_SCOPE.MEMBERS,
      status: EXPENSE_STATUS.PENDING,
    });
    expect(SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE.sharedWithUserIds).not.toHaveLength(
      0,
    );
    expect(BLOCKED_TRIP_TASK_FIXTURE).toMatchObject({
      type: TASK_TYPE.TRIP,
      status: TASK_STATUS.BLOCKED,
      location: {
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      },
    });
    expect(PLANNED_BIRTHDAY_EVENT_FIXTURE).toMatchObject({
      type: TASK_TYPE.EVENT,
      status: TASK_STATUS.PLANNED,
    });
    expect(PLANNED_BIRTHDAY_EVENT_FIXTURE.reminders).toHaveLength(1);
    expect(CANCELLED_TASK_FIXTURE).toMatchObject({
      status: TASK_STATUS.CANCELLED,
      cancelledReason: expect.any(String),
    });
    expect(SUBSCRIPTION_RECURRING_TASK_FIXTURE.scheduleTemplate.frequency).toBe(
      RECURRENCE_FREQUENCY.ANNUALLY,
    );
  });

  it("isolates in-memory task and expense state between factory calls", async () => {
    const firstExpenses = createMockExpenseRepository();
    const firstTasks = createMockTaskRepository(firstExpenses);
    const secondExpenses = createMockExpenseRepository();
    const secondTasks = createMockTaskRepository(secondExpenses);

    await firstTasks.updateStatus({
      taskId: FAMILY_PHONE_PAYMENT_TASK_FIXTURE.id,
      status: TASK_STATUS.COMPLETED,
    });

    await expect(
      firstExpenses.getById(FAMILY_PHONE_PAYMENT_TASK_FIXTURE.expenseId!),
    ).resolves.toMatchObject({ status: EXPENSE_STATUS.PAID });
    await expect(
      secondExpenses.getById(FAMILY_PHONE_PAYMENT_TASK_FIXTURE.expenseId!),
    ).resolves.toMatchObject({ status: EXPENSE_STATUS.PENDING });
    await expect(
      secondTasks.listByOwner(FAMILY_PHONE_PAYMENT_TASK_FIXTURE.ownerId),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: FAMILY_PHONE_PAYMENT_TASK_FIXTURE.id,
          status: TASK_STATUS.PENDING,
        }),
      ]),
    );
  });
});
