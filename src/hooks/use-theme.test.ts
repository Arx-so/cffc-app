import { renderHook } from "@testing-library/react-native";
import { useTheme } from "@/hooks/use-theme";
import { Colors } from "@/constants/theme";

describe("useTheme", () => {
  it("expoe a paleta completa do app", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe(Colors);
  });

  it("expoe os dois esquemas", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toHaveProperty("light");
    expect(result.current).toHaveProperty("dark");
  });

  it("mantem a mesma referencia entre renders, evitando rerender em cascata", () => {
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });
});
