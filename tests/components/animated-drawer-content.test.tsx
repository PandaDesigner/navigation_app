import { fireEvent, render } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockCloseDrawer = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@react-navigation/drawer", () => ({
  useDrawerProgress: () => ({ value: 1 }),
}));

import { AnimatedDrawerContent } from "@/components/animated-drawer-content";

describe("AnimatedDrawerContent", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockCloseDrawer.mockClear();
  });

  it("navigates to Task through its public URL", async () => {
    const { getByText } = await render(
      <AnimatedDrawerContent
        navigation={{ closeDrawer: mockCloseDrawer } as never}
        state={{ index: 0, routeNames: ["index", "home", "(task)"] } as never}
        descriptors={{} as never}
      />,
    );

    fireEvent.press(getByText("Task"));

    expect(mockReplace).toHaveBeenCalledWith("/task");
    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
  });
});
