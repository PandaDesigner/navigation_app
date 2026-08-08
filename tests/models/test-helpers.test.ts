import { createTestId } from "./test-helpers";

describe("createTestId", () => {
  it("prefixes deterministic identifiers", () => {
    expect(createTestId("task", 1)).toBe("task-1");
  });
});
