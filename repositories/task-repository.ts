import type { Task, TaskStatus } from "../models/task-models";
import type { ShareTarget } from "../models/user-models";

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
  location: Task["location"];
  reminders: Task["reminders"];
  recurringTaskId: string | null;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: TaskStatus;
  blockedReason?: string;
  cancelledReason?: string;
}

export interface TaskRepository {
  listByOwner(ownerId: string): Promise<readonly Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  updateStatus(input: UpdateTaskStatusInput): Promise<Task>;
}
