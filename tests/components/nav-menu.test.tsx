import { render } from "@testing-library/react-native";
import * as ExpoRouter from "expo-router";

const mockDispatch = jest.fn();

jest.mock("expo-router", () => ({
  useNavigation: jest.fn(() => ({ dispatch: mockDispatch })),
  usePathname: () => "/task",
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("@react-navigation/native", () => ({
  DrawerActions: { openDrawer: () => ({ type: "OPEN_DRAWER" }) },
}));

jest.mock("@/components/tab-buttons", () => ({
  TabButton: () => null,
}));

import NavMenu from "@/components/nav-menu";

const mockUseNavigation = ExpoRouter.useNavigation as jest.Mock;

describe("NavMenu", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockUseNavigation.mockClear();
  });

  it("opens the enclosing Drawer from a Task route", async () => {
    const { getByRole } = await render(<NavMenu />);

    expect(() => getByRole("button", { name: "Open navigation menu" })).toThrow();
    expect(mockUseNavigation).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
