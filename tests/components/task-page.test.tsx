import { render } from "@testing-library/react-native";

jest.mock("expo-router", () => ({ usePathname: () => "/task" }));
jest.mock("@/components/nav-menu", () => () => null);
jest.mock("@/components/task-create-menu", () => ({ TaskCreateMenu: () => null }));

import TaskPage from "@/app/(drawer)/(task)/task";

test("renders the Task list with view controls and task cards", async () => {
  const view = await render(<TaskPage />);
  expect(view.getByText("Tareas")).toBeTruthy();
  expect(view.getByPlaceholderText("Buscar tareas")).toBeTruthy();
  expect(view.getByText("Lista")).toBeTruthy();
  expect(view.getByText("Pagar internet")).toBeTruthy();
});
