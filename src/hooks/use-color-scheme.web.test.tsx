/**
 * `jest.requireActual("react-native")` espalhado com `...` dispara todos os
 * getters lazy do RN e provoca require circular. Um Proxy sobrescreve só o
 * export que interessa, deixando os demais getters intactos.
 */
const mockUseColorScheme = jest.fn(() => "dark" as string | null);

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return new Proxy(actual, {
    get: (target, prop) =>
      prop === "useColorScheme" ? mockUseColorScheme : Reflect.get(target, prop),
  });
});

import { renderHook } from "@testing-library/react-native";
import { useColorScheme } from "@/hooks/use-color-scheme.web";

beforeEach(() => mockUseColorScheme.mockReturnValue("dark"));

describe("useColorScheme na web", () => {
  it("devolve o esquema real do sistema depois de hidratar", () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe("dark");
  });

  it("acompanha a troca do esquema do sistema", () => {
    const { result, rerender } = renderHook(() => useColorScheme());
    mockUseColorScheme.mockReturnValue("light");
    rerender({});
    expect(result.current).toBe("light");
  });

  it("nao quebra quando o sistema nao informa esquema", () => {
    mockUseColorScheme.mockReturnValue(null);
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeNull();
  });

  it("consulta o hook do react-native", () => {
    renderHook(() => useColorScheme());
    expect(mockUseColorScheme).toHaveBeenCalled();
  });
});
