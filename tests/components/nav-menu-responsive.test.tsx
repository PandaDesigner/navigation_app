import { fireEvent, render } from "@testing-library/react-native";
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

import NavMenu from "@/components/nav-menu";

const mockUseNavigation = ExpoRouter.useNavigation as jest.Mock;

describe("NavMenu responsive presentation", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockUseNavigation.mockClear();
  });

  it("shows every web destination with its label", async () => {
    const view = await render(<NavMenu platform="web" />);

    expect(view.getByText("Wallet")).toBeTruthy();
    expect(view.getByText("Home")).toBeTruthy();
    expect(view.getByText("Task")).toBeTruthy();
  });

  it("shows only the active mobile destination label", async () => {
    const view = await render(<NavMenu platform="mobile" />);

    expect(view.getByText("Task")).toBeTruthy();
    expect(view.queryByText("Wallet")).toBeNull();
    expect(view.queryByText("Home")).toBeNull();
  });

  it("opens the parent Drawer from the Menu button", async () => {
    const view = await render(<NavMenu platform="mobile" />);

    fireEvent.press(view.getByLabelText("Open navigation menu"));

    expect(mockUseNavigation).toHaveBeenCalledWith("/(drawer)");
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_DRAWER" });
  });
});
