import { navigationItems } from "@/constant/item-nav";

describe("Task Drawer registration", () => {
  it("registers the nested Task navigator while preserving the public path", () => {
    const task = navigationItems.find((item) => item.id === "task");

    expect(task).toMatchObject({
      href: "/task",
      drawerRoute: "(task)",
    });
  });
});
