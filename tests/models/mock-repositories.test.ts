import {
  BLOCKED_TRIP_TASK_FIXTURE,
  CANCELLED_TASK_FIXTURE,
  FAMILY_PHONE_PAYMENT_TASK_FIXTURE,
  MOCK_OPERATION_TIMESTAMP,
  PLANNED_BIRTHDAY_EVENT_FIXTURE,
  PRIVATE_PRODUCTIVE_TASK_FIXTURE,
  SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE,
  SUBSCRIPTION_RECURRING_TASK_FIXTURE,
} from "@/mocks/domain-fixtures";
import { createMockExpenseRepository } from "@/mocks/expense-mock-repository";
import { createMockRepositoryAdapter } from "@/mocks/mock-repository-adapter";
import { createMockTaskRepository } from "@/mocks/task-mock-repository";
import { EXPENSE_STATUS, type Expense } from "@/models/expense-models";
import {
  RECURRENCE_FREQUENCY,
  TASK_STATUS,
  TASK_TYPE,
  type RecurringTask,
} from "@/models/task-models";
import { VISIBILITY_SCOPE } from "@/models/user-models";
import type { ExpenseRepository } from "@/repositories/expense-repository";
import type {
  CreateTaskInput,
  GenerateRecurringInstancesInput,
} from "@/repositories/task-repository";

const VALID_TASK_INPUT: CreateTaskInput = {
  ownerId: "user-owner",
  familyId: null,
  visibility: VISIBILITY_SCOPE.PRIVATE,
  sharedWithUserIds: [],
  type: TASK_TYPE.TRIP,
  status: TASK_STATUS.PENDING,
  sortOrder: 70,
  title: "Visit the library",
  description: null,
  dueAt: "2026-08-20T12:00:00.000Z",
  blockedReason: null,
  cancelledReason: null,
  expenseId: null,
  location: {
    destinationName: "Central Library",
    latitude: 6.25,
    longitude: -75.56,
  },
  reminders: [
    {
      scheduledAt: "2026-08-20T11:00:00.000Z",
      notificationTitle: "Library visit",
      notificationBody: "Leave for the library.",
      localNotificationId: null,
      pushNotificationId: null,
    },
  ],
  recurringTaskId: null,
};

const WEEKLY_RECURRING_TASK: RecurringTask = {
  id: "recurring-weekly-planning",
  ownerId: "user-owner",
  familyId: null,
  visibility: VISIBILITY_SCOPE.PRIVATE,
  sharedWithUserIds: [],
  scheduleTemplate: {
    type: TASK_TYPE.PRODUCTIVE,
    title: "Weekly planning",
    description: null,
    frequency: RECURRENCE_FREQUENCY.WEEKLY,
    startsAt: "2026-08-08T13:00:00.000Z",
    endsAt: null,
  },
  nextOccurrenceAt: "2026-08-08T13:00:00.000Z",
  defaultExpenseAmountMinor: null,
  defaultExpenseCurrency: null,
  defaultExpenseCategory: null,
  createdAt: "2026-08-08T12:00:00.000Z",
  updatedAt: "2026-08-08T12:00:00.000Z",
};

const QUARTERLY_RECURRING_TASK: RecurringTask = {
  ...WEEKLY_RECURRING_TASK,
  id: "recurring-quarterly-planning",
  scheduleTemplate: {
    ...WEEKLY_RECURRING_TASK.scheduleTemplate,
    frequency: RECURRENCE_FREQUENCY.QUARTERLY,
  },
};

const ANNUAL_RECURRING_TASK: RecurringTask = {
  ...WEEKLY_RECURRING_TASK,
  id: "recurring-annual-planning",
  scheduleTemplate: {
    ...WEEKLY_RECURRING_TASK.scheduleTemplate,
    frequency: RECURRENCE_FREQUENCY.ANNUALLY,
  },
};

describe("mock payment completion", () => {
  it("marks a linked expense paid when a payment task completes", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.createPaymentTaskWithExpense();

    await tasks.updateStatus({ taskId: task.id, status: TASK_STATUS.COMPLETED });

    await expect(expenses.getById(task.expenseId!)).resolves.toMatchObject({
      status: EXPENSE_STATUS.PAID,
      paidAt: MOCK_OPERATION_TIMESTAMP,
    });
  });

  it("does not pay a linked expense when a non-payment task completes", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.create({
      ...VALID_TASK_INPUT,
      type: TASK_TYPE.PRODUCTIVE,
      expenseId: FAMILY_PHONE_PAYMENT_TASK_FIXTURE.expenseId,
      location: null,
      reminders: [],
    });

    await tasks.updateStatus({
      taskId: task.id,
      status: TASK_STATUS.COMPLETED,
    });

    await expect(
      expenses.getById(FAMILY_PHONE_PAYMENT_TASK_FIXTURE.expenseId!),
    ).resolves.toMatchObject({
      status: EXPENSE_STATUS.PENDING,
      paidAt: null,
    });
  });

  it("rejects completion linked to a cancelled expense without changing the task", async () => {
    const expenses = createMockExpenseRepository();
    const expense = await expenses.create({
      ownerId: "user-owner",
      familyId: null,
      visibility: VISIBILITY_SCOPE.PRIVATE,
      sharedWithUserIds: [],
      amountMinor: 10_000,
      currency: "COP",
      category: "cancelled",
      serviceSubtype: null,
      status: EXPENSE_STATUS.CANCELLED,
      dueAt: null,
      paidAt: null,
    });
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.create({
      ...VALID_TASK_INPUT,
      type: TASK_TYPE.PAYMENT_GOODS,
      expenseId: expense.id,
      location: null,
      reminders: [],
    });

    await expect(
      tasks.updateStatus({
        taskId: task.id,
        status: TASK_STATUS.COMPLETED,
      }),
    ).rejects.toThrow("cancelled");
    await expect(tasks.listByOwner(task.ownerId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: task.id,
          status: TASK_STATUS.PENDING,
        }),
      ]),
    );
  });

  it("rejects completion linked to a missing expense without changing the task", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.create({
      ...VALID_TASK_INPUT,
      type: TASK_TYPE.PAYMENT_SERVICE,
      expenseId: "expense-missing",
      location: null,
      reminders: [],
    });

    await expect(
      tasks.updateStatus({
        taskId: task.id,
        status: TASK_STATUS.COMPLETED,
      }),
    ).rejects.toThrow("Expense not found");
    await expect(tasks.listByOwner(task.ownerId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: task.id,
          status: TASK_STATUS.PENDING,
        }),
      ]),
    );
  });
});

describe("mock repository adapter", () => {
  it("composes task and expense mock repositories behind one boundary", async () => {
    const adapter = createMockRepositoryAdapter();

    await adapter.taskRepository.updateStatus({
      taskId: FAMILY_PHONE_PAYMENT_TASK_FIXTURE.id,
      status: TASK_STATUS.COMPLETED,
    });

    const expenses = await adapter.expenseRepository.listByOwner(
      FAMILY_PHONE_PAYMENT_TASK_FIXTURE.ownerId,
    );
    expect(
      expenses.find(
        (expense) => expense.id === FAMILY_PHONE_PAYMENT_TASK_FIXTURE.expenseId,
      ),
    ).toMatchObject({ status: EXPENSE_STATUS.PAID });
  });

  it("does not expose mock-only helpers through the adapter", () => {
    const adapter = createMockRepositoryAdapter();

    expect(adapter.taskRepository).not.toHaveProperty(
      "createPaymentTaskWithExpense",
    );
    expect(adapter.expenseRepository).not.toHaveProperty("getById");
  });
});

describe("mock creation boundaries", () => {
  it("assigns persisted identity and timestamps to task child records", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);

    const task = await tasks.create(VALID_TASK_INPUT);

    expect(task.location).toMatchObject({
      id: "location-task-created-1",
      taskId: task.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(task.reminders).toEqual([
      expect.objectContaining({
        id: "reminder-task-created-1-1",
        taskId: task.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    ]);
  });

  it.each([
    {
      label: "private tasks shared with members",
      familyId: null,
      visibility: VISIBILITY_SCOPE.PRIVATE,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "family tasks without a family",
      familyId: null,
      visibility: VISIBILITY_SCOPE.FAMILY,
      sharedWithUserIds: [],
    },
    {
      label: "family tasks with selected members",
      familyId: "family-home",
      visibility: VISIBILITY_SCOPE.FAMILY,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "member tasks without a family",
      familyId: null,
      visibility: VISIBILITY_SCOPE.MEMBERS,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "member tasks without selected members",
      familyId: "family-home",
      visibility: VISIBILITY_SCOPE.MEMBERS,
      sharedWithUserIds: [],
    },
  ])("rejects $label", async ({ familyId, visibility, sharedWithUserIds }) => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);

    await expect(
      tasks.create({
        ...VALID_TASK_INPUT,
        familyId,
        visibility,
        sharedWithUserIds,
      }),
    ).rejects.toThrow("sharing");
  });

  it.each([
    {
      label: "private expenses shared with members",
      familyId: null,
      visibility: VISIBILITY_SCOPE.PRIVATE,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "family expenses without a family",
      familyId: null,
      visibility: VISIBILITY_SCOPE.FAMILY,
      sharedWithUserIds: [],
    },
    {
      label: "family expenses with selected members",
      familyId: "family-home",
      visibility: VISIBILITY_SCOPE.FAMILY,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "member expenses without a family",
      familyId: null,
      visibility: VISIBILITY_SCOPE.MEMBERS,
      sharedWithUserIds: ["user-child"],
    },
    {
      label: "member expenses without selected members",
      familyId: "family-home",
      visibility: VISIBILITY_SCOPE.MEMBERS,
      sharedWithUserIds: [],
    },
  ])("rejects $label", async ({ familyId, visibility, sharedWithUserIds }) => {
    const expenses = createMockExpenseRepository();

    await expect(
      expenses.create({
        ownerId: "user-owner",
        familyId,
        visibility,
        sharedWithUserIds,
        amountMinor: 10_000,
        currency: "COP",
        category: "test",
        serviceSubtype: null,
        status: EXPENSE_STATUS.PENDING,
        dueAt: null,
        paidAt: null,
      }),
    ).rejects.toThrow("sharing");
  });
});

describe("lazy recurring task generation", () => {
  const initialGeneration: GenerateRecurringInstancesInput = {
    ownerId: WEEKLY_RECURRING_TASK.ownerId,
    asOf: "2026-07-11T13:00:00.000Z",
  };

  it("generates only the next occurrence within four weeks and advances the template", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [WEEKLY_RECURRING_TASK],
    });

    const generated = await tasks.generateRecurringInstances(initialGeneration);
    const generatedAgain = await tasks.generateRecurringInstances(initialGeneration);
    const templates = await tasks.listRecurringByOwner(
      WEEKLY_RECURRING_TASK.ownerId,
    );

    expect(generated).toHaveLength(1);
    expect(generated[0]).toMatchObject({
      recurringTaskId: WEEKLY_RECURRING_TASK.id,
      dueAt: WEEKLY_RECURRING_TASK.nextOccurrenceAt,
    });
    expect(generatedAgain).toEqual([]);
    expect(templates).toEqual([
      expect.objectContaining({
        id: WEEKLY_RECURRING_TASK.id,
        nextOccurrenceAt: "2026-08-15T13:00:00.000Z",
      }),
    ]);
  });

  it("generates the next occurrence after the current one completes", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [WEEKLY_RECURRING_TASK],
    });
    const [current] = await tasks.generateRecurringInstances(initialGeneration);

    await tasks.updateStatus({
      taskId: current.id,
      status: TASK_STATUS.COMPLETED,
    });

    const ownerTasks = await tasks.listByOwner(WEEKLY_RECURRING_TASK.ownerId);
    expect(
      ownerTasks.filter(
        (task) => task.recurringTaskId === WEEKLY_RECURRING_TASK.id,
      ),
    ).toEqual([
      expect.objectContaining({
        id: current.id,
        status: TASK_STATUS.COMPLETED,
      }),
      expect.objectContaining({
        dueAt: "2026-08-15T13:00:00.000Z",
        status: TASK_STATUS.PLANNED,
      }),
    ]);
  });

  it("generates the next occurrence after the current one expires", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [WEEKLY_RECURRING_TASK],
    });
    await tasks.generateRecurringInstances(initialGeneration);

    const generated = await tasks.generateRecurringInstances({
      ownerId: WEEKLY_RECURRING_TASK.ownerId,
      asOf: WEEKLY_RECURRING_TASK.nextOccurrenceAt,
    });

    expect(generated).toEqual([
      expect.objectContaining({
        dueAt: "2026-08-15T13:00:00.000Z",
        recurringTaskId: WEEKLY_RECURRING_TASK.id,
      }),
    ]);
  });

  it("generates a quarterly next occurrence on completion beyond the proactive horizon", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [QUARTERLY_RECURRING_TASK],
    });
    const [current] = await tasks.generateRecurringInstances({
      ...initialGeneration,
      ownerId: QUARTERLY_RECURRING_TASK.ownerId,
    });

    await tasks.updateStatus({
      taskId: current.id,
      status: TASK_STATUS.COMPLETED,
    });

    const ownerTasks = await tasks.listByOwner(QUARTERLY_RECURRING_TASK.ownerId);
    expect(
      ownerTasks.filter(
        (task) => task.recurringTaskId === QUARTERLY_RECURRING_TASK.id,
      ),
    ).toEqual([
      expect.objectContaining({
        id: current.id,
        status: TASK_STATUS.COMPLETED,
      }),
      expect.objectContaining({
        dueAt: "2026-11-08T13:00:00.000Z",
        status: TASK_STATUS.PLANNED,
      }),
    ]);
  });

  it("generates an annual next occurrence on expiry beyond the proactive horizon", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [ANNUAL_RECURRING_TASK],
    });
    await tasks.generateRecurringInstances({
      ...initialGeneration,
      ownerId: ANNUAL_RECURRING_TASK.ownerId,
    });

    const generated = await tasks.generateRecurringInstances({
      ownerId: ANNUAL_RECURRING_TASK.ownerId,
      asOf: ANNUAL_RECURRING_TASK.nextOccurrenceAt,
    });

    expect(generated).toEqual([
      expect.objectContaining({
        dueAt: "2027-08-08T13:00:00.000Z",
        recurringTaskId: ANNUAL_RECURRING_TASK.id,
      }),
    ]);
  });

  it("keeps the four-week horizon for proactive annual generation", async () => {
    const expenses = createMockExpenseRepository();
    const futureAnnualTask: RecurringTask = {
      ...ANNUAL_RECURRING_TASK,
      nextOccurrenceAt: "2027-08-08T13:00:00.000Z",
    };
    const tasks = createMockTaskRepository(expenses, {
      recurringTasks: [futureAnnualTask],
    });

    await expect(
      tasks.generateRecurringInstances({
        ownerId: futureAnnualTask.ownerId,
        asOf: "2026-08-08T13:00:00.000Z",
      }),
    ).resolves.toEqual([]);
  });
});

describe("payment completion failure consistency", () => {
  it("does not change task state when marking the linked expense paid fails", async () => {
    const paymentFailure = new Error("Payment persistence failed");
    const failingExpenses: ExpenseRepository = {
      async listByOwner(): Promise<readonly Expense[]> {
        return [];
      },
      async create(): Promise<Expense> {
        throw new Error("Not used");
      },
      async markPaid(): Promise<Expense> {
        throw paymentFailure;
      },
    };
    const tasks = createMockTaskRepository(failingExpenses);

    await expect(
      tasks.updateStatus({
        taskId: FAMILY_PHONE_PAYMENT_TASK_FIXTURE.id,
        status: TASK_STATUS.COMPLETED,
      }),
    ).rejects.toBe(paymentFailure);
    await expect(
      tasks.listByOwner(FAMILY_PHONE_PAYMENT_TASK_FIXTURE.ownerId),
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
