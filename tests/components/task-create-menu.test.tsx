import { fireEvent, render } from "@testing-library/react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { TaskCreateMenu } from "@/components/task-create-menu";

describe("TaskCreateMenu", () => {
  beforeEach(() => mockPush.mockClear());

  it("opens creation actions and routes New task", async () => {
    const view = await render(<TaskCreateMenu />);
    await fireEvent.press(view.getByLabelText("Create more items"));
    await fireEvent.press(view.getByText("New task"));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/create", params: { kind: "task" } });
    expect(view.queryByText("Reminder")).toBeNull();
  });

  it.each([
    ["Reminder", "reminder"],
    ["Recurring task", "recurring"],
  ])("routes %s using its creation kind", async (label, kind) => {
    const view = await render(<TaskCreateMenu />);
    await fireEvent.press(view.getByLabelText("Create more items"));
    await fireEvent.press(view.getByText(label));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/create", params: { kind } });
  });
});
