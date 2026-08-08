import { EXPENSE_STATUS, type Expense } from "../models/expense-models";
import {
  RECURRENCE_FREQUENCY,
  TASK_STATUS,
  TASK_TYPE,
  type RecurringTask,
  type Task,
} from "../models/task-models";
import { VISIBILITY_SCOPE } from "../models/user-models";

export const MOCK_CREATED_AT = "2026-08-08T12:00:00.000Z";
export const MOCK_UPDATED_AT = "2026-08-08T12:00:00.000Z";
export const MOCK_OPERATION_TIMESTAMP = "2026-08-08T13:00:00.000Z";

const OWNER_ID = "user-owner";
const FAMILY_ID = "family-home";
const CHILD_ID = "user-child";

export const FAMILY_PHONE_EXPENSE_FIXTURE: Expense = {
  id: "expense-phone-service",
  ownerId: OWNER_ID,
  familyId: FAMILY_ID,
  visibility: VISIBILITY_SCOPE.FAMILY,
  sharedWithUserIds: [],
  amountMinor: 89_900,
  currency: "COP",
  category: "utilities",
  serviceSubtype: "phone",
  status: EXPENSE_STATUS.PENDING,
  dueAt: "2026-08-15T23:59:59.000Z",
  paidAt: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE: Expense = {
  id: "expense-allowance",
  ownerId: OWNER_ID,
  familyId: FAMILY_ID,
  visibility: VISIBILITY_SCOPE.MEMBERS,
  sharedWithUserIds: [CHILD_ID],
  amountMinor: 50_000,
  currency: "COP",
  category: "allowance",
  serviceSubtype: null,
  status: EXPENSE_STATUS.PENDING,
  dueAt: "2026-08-20T12:00:00.000Z",
  paidAt: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const PRIVATE_PRODUCTIVE_TASK_FIXTURE: Task = {
  id: "task-private-productive",
  ownerId: OWNER_ID,
  familyId: null,
  visibility: VISIBILITY_SCOPE.PRIVATE,
  sharedWithUserIds: [],
  type: TASK_TYPE.PRODUCTIVE,
  status: TASK_STATUS.BACKLOG,
  sortOrder: 10,
  title: "Review monthly goals",
  description: "Prepare the next set of personal goals.",
  dueAt: null,
  blockedReason: null,
  cancelledReason: null,
  expenseId: null,
  location: null,
  reminders: [],
  recurringTaskId: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const FAMILY_PHONE_PAYMENT_TASK_FIXTURE: Task = {
  id: "task-phone-service",
  ownerId: OWNER_ID,
  familyId: FAMILY_ID,
  visibility: VISIBILITY_SCOPE.FAMILY,
  sharedWithUserIds: [],
  type: TASK_TYPE.PAYMENT_SERVICE,
  status: TASK_STATUS.PENDING,
  sortOrder: 20,
  title: "Pay family phone service",
  description: "Pay the household phone bill before its due date.",
  dueAt: FAMILY_PHONE_EXPENSE_FIXTURE.dueAt,
  blockedReason: null,
  cancelledReason: null,
  expenseId: FAMILY_PHONE_EXPENSE_FIXTURE.id,
  location: null,
  reminders: [],
  recurringTaskId: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const BLOCKED_TRIP_TASK_FIXTURE: Task = {
  id: "task-blocked-trip",
  ownerId: OWNER_ID,
  familyId: FAMILY_ID,
  visibility: VISIBILITY_SCOPE.MEMBERS,
  sharedWithUserIds: [CHILD_ID],
  type: TASK_TYPE.TRIP,
  status: TASK_STATUS.BLOCKED,
  sortOrder: 30,
  title: "Plan family trip to Medellin",
  description: "Confirm transportation and accommodation.",
  dueAt: "2026-09-01T14:00:00.000Z",
  blockedReason: "Waiting for school calendar confirmation",
  cancelledReason: null,
  expenseId: null,
  location: {
    id: "location-medellin",
    taskId: "task-blocked-trip",
    destinationName: "Medellin, Colombia",
    latitude: 6.2442,
    longitude: -75.5812,
    createdAt: MOCK_CREATED_AT,
    updatedAt: MOCK_UPDATED_AT,
  },
  reminders: [],
  recurringTaskId: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const PLANNED_BIRTHDAY_EVENT_FIXTURE: Task = {
  id: "task-birthday-event",
  ownerId: OWNER_ID,
  familyId: FAMILY_ID,
  visibility: VISIBILITY_SCOPE.FAMILY,
  sharedWithUserIds: [],
  type: TASK_TYPE.EVENT,
  status: TASK_STATUS.PLANNED,
  sortOrder: 40,
  title: "Plan birthday dinner",
  description: "Book a table and confirm the guest count.",
  dueAt: "2026-10-10T23:00:00.000Z",
  blockedReason: null,
  cancelledReason: null,
  expenseId: null,
  location: null,
  reminders: [
    {
      id: "reminder-birthday-event",
      taskId: "task-birthday-event",
      scheduledAt: "2026-10-03T14:00:00.000Z",
      notificationTitle: "Birthday dinner planning",
      notificationBody: "Book the restaurant and confirm the guest count.",
      localNotificationId: null,
      pushNotificationId: null,
      createdAt: MOCK_CREATED_AT,
      updatedAt: MOCK_UPDATED_AT,
    },
  ],
  recurringTaskId: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const CANCELLED_TASK_FIXTURE: Task = {
  id: "task-cancelled-activity",
  ownerId: OWNER_ID,
  familyId: null,
  visibility: VISIBILITY_SCOPE.PRIVATE,
  sharedWithUserIds: [],
  type: TASK_TYPE.ACTIVITY,
  status: TASK_STATUS.CANCELLED,
  sortOrder: 50,
  title: "Attend outdoor class",
  description: null,
  dueAt: "2026-08-09T15:00:00.000Z",
  blockedReason: null,
  cancelledReason: "Class cancelled because of severe weather",
  expenseId: null,
  location: null,
  reminders: [],
  recurringTaskId: null,
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const SUBSCRIPTION_RECURRING_TASK_FIXTURE: RecurringTask = {
  id: "recurring-annual-subscription",
  ownerId: OWNER_ID,
  familyId: null,
  visibility: VISIBILITY_SCOPE.PRIVATE,
  sharedWithUserIds: [],
  scheduleTemplate: {
    type: TASK_TYPE.PAYMENT_SERVICE,
    title: "Renew annual subscription",
    description: "Review the plan before renewing.",
    frequency: RECURRENCE_FREQUENCY.ANNUALLY,
    startsAt: "2026-11-01T12:00:00.000Z",
    endsAt: null,
  },
  nextOccurrenceAt: "2026-11-01T12:00:00.000Z",
  defaultExpenseAmountMinor: 249_900,
  defaultExpenseCurrency: "COP",
  defaultExpenseCategory: "subscriptions",
  createdAt: MOCK_CREATED_AT,
  updatedAt: MOCK_UPDATED_AT,
};

export const TASK_FIXTURES: readonly Task[] = [
  PRIVATE_PRODUCTIVE_TASK_FIXTURE,
  FAMILY_PHONE_PAYMENT_TASK_FIXTURE,
  BLOCKED_TRIP_TASK_FIXTURE,
  PLANNED_BIRTHDAY_EVENT_FIXTURE,
  CANCELLED_TASK_FIXTURE,
];

export const EXPENSE_FIXTURES: readonly Expense[] = [
  FAMILY_PHONE_EXPENSE_FIXTURE,
  SELECTED_MEMBER_ALLOWANCE_EXPENSE_FIXTURE,
];

export const RECURRING_TASK_FIXTURES: readonly RecurringTask[] = [
  SUBSCRIPTION_RECURRING_TASK_FIXTURE,
];
