import type { ShareTarget } from "./user-models";

export const TASK_TYPE = {
  PAYMENT_SERVICE: "payment_service",
  PAYMENT_GOODS: "payment_goods",
  PRODUCTIVE: "productive",
  ACTIVITY: "activity",
  TRIP: "trip",
  EVENT: "event",
  REMINDER: "reminder",
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];

export const TASK_STATUS = {
  BACKLOG: "backlog",
  PLANNED: "planned",
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const RECURRENCE_FREQUENCY = {
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUALLY: "annually",
} as const;

export type RecurrenceFrequency =
  (typeof RECURRENCE_FREQUENCY)[keyof typeof RECURRENCE_FREQUENCY];

export interface TaskReminder {
  id: string;
  taskId: string;
  scheduledAt: string;
  notificationTitle: string;
  notificationBody: string;
  localNotificationId: string | null;
  pushNotificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLocation {
  id: string;
  taskId: string;
  destinationName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task extends ShareTarget {
  id: string;
  type: TaskType;
  status: TaskStatus;
  sortOrder: number;
  title: string;
  description: string | null;
  dueAt: string | null;
  blockedReason: string | null;
  cancelledReason: string | null;
  expenseId: string | null;
  location: TaskLocation | null;
  reminders: readonly TaskReminder[];
  recurringTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTaskScheduleTemplate {
  type: TaskType;
  title: string;
  description: string | null;
  frequency: RecurrenceFrequency;
  startsAt: string;
  endsAt: string | null;
}

export interface RecurringTask extends ShareTarget {
  id: string;
  scheduleTemplate: RecurringTaskScheduleTemplate;
  nextOccurrenceAt: string;
  defaultExpenseAmountMinor: number | null;
  defaultExpenseCurrency: string | null;
  defaultExpenseCategory: string | null;
  createdAt: string;
  updatedAt: string;
}
