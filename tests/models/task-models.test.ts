import {
  RECURRENCE_FREQUENCY,
  TASK_STATUS,
  TASK_TYPE,
} from "@/models/task-models";

describe("task domain constants", () => {
  it("includes payment, travel, event, and reminder types", () => {
    expect(Object.values(TASK_TYPE)).toContain("payment_service");
    expect(Object.values(TASK_TYPE)).toContain("trip");
    expect(Object.values(TASK_TYPE)).toContain("event");
    expect(Object.values(TASK_TYPE)).toContain("reminder");
  });

  it("includes Kanban backlog and resolution states", () => {
    expect(Object.values(TASK_STATUS)).toEqual([
      "backlog",
      "planned",
      "pending",
      "in_progress",
      "blocked",
      "completed",
      "cancelled",
    ]);
  });

  it("includes every supported recurrence frequency", () => {
    expect(Object.values(RECURRENCE_FREQUENCY)).toEqual([
      "weekly",
      "biweekly",
      "monthly",
      "quarterly",
      "annually",
    ]);
  });
});
