import type {
  RecurringTask,
  Task,
  TaskStatus,
} from "../models/task-models";
import type { ShareTarget } from "../models/user-models";

export interface CreateTaskLocationInput {
  destinationName: string;
  latitude: number;
  longitude: number;
}

export interface CreateTaskReminderInput {
  scheduledAt: string;
  notificationTitle: string;
  notificationBody: string;
  localNotificationId: string | null;
  pushNotificationId: string | null;
}

export interface CreateTaskInput extends ShareTarget {
  type: Task["type"];
  status: TaskStatus;
  sortOrder: number;
  title: string;
  description: string | null;
  dueAt: string | null;
  blockedReason: string | null;
  cancelledReason: string | null;
  expenseId: string | null;
  location: CreateTaskLocationInput | null;
  reminders: readonly CreateTaskReminderInput[];
  recurringTaskId: string | null;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: TaskStatus;
  blockedReason?: string;
  cancelledReason?: string;
}

export interface GenerateRecurringInstancesInput {
  ownerId: string;
  asOf: string;
}

export interface TaskRepository {
  listByOwner(ownerId: string): Promise<readonly Task[]>;
  listRecurringByOwner(ownerId: string): Promise<readonly RecurringTask[]>;
  create(input: CreateTaskInput): Promise<Task>;
  updateStatus(input: UpdateTaskStatusInput): Promise<Task>;
  generateRecurringInstances(
    input: GenerateRecurringInstancesInput,
  ): Promise<readonly Task[]>;
}
