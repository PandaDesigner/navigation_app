import { EXPENSE_STATUS } from "@/models/expense-models";

describe("expense status", () => {
  it("tracks payment independently from task workflow", () => {
    expect(EXPENSE_STATUS).toEqual({
      PENDING: "pending",
      PAID: "paid",
      CANCELLED: "cancelled",
    });
  });
});
