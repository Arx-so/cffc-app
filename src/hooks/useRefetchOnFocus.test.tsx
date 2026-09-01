import React from "react";
import { renderHook } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

/** O mock do expo-router deixa `useFocusEffect` inerte; aqui rodamos o callback. */
const focusEffect = useFocusEffect as jest.Mock;

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

let resetQueries: jest.SpyInstance;

beforeEach(() => {
  focusEffect.mockReset().mockImplementation((cb: () => void) => cb());
  resetQueries = jest.spyOn(client, "resetQueries").mockImplementation(() => Promise.resolve());
});
afterEach(() => jest.restoreAllMocks());

describe("useRefetchOnFocus", () => {
  it("reseta a query informada quando a tela ganha foco", () => {
    renderHook(() => useRefetchOnFocus(["profile", "u1"]), { wrapper });
    expect(resetQueries).toHaveBeenCalledWith({ queryKey: ["profile", "u1"] });
  });

  it("reseta todas as chaves informadas", () => {
    renderHook(() => useRefetchOnFocus(["profile", "u1"], ["profileVideos", "u1"]), { wrapper });
    expect(resetQueries).toHaveBeenCalledTimes(2);
    expect(resetQueries).toHaveBeenNthCalledWith(1, { queryKey: ["profile", "u1"] });
    expect(resetQueries).toHaveBeenNthCalledWith(2, { queryKey: ["profileVideos", "u1"] });
  });

  it("nao faz nada quando nenhuma chave e passada", () => {
    renderHook(() => useRefetchOnFocus(), { wrapper });
    expect(resetQueries).not.toHaveBeenCalled();
  });

  it("usa resetQueries, nao invalidateQueries — a tela precisa voltar ao estado de loading", () => {
    const invalidate = jest.spyOn(client, "invalidateQueries");
    renderHook(() => useRefetchOnFocus(["profile"]), { wrapper });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("registra o efeito no ciclo de foco da navegacao", () => {
    renderHook(() => useRefetchOnFocus(["profile"]), { wrapper });
    expect(focusEffect).toHaveBeenCalledWith(expect.any(Function));
  });

  it("mantem o mesmo callback quando as chaves nao mudam, evitando refetch em loop", () => {
    const { rerender } = renderHook(({ id }) => useRefetchOnFocus(["profile", id]), {
      wrapper,
      initialProps: { id: "u1" },
    });
    const first = focusEffect.mock.calls[0][0];
    rerender({ id: "u1" });
    expect(focusEffect.mock.calls[1][0]).toBe(first);
  });

  it("troca o callback quando as chaves mudam", () => {
    const { rerender } = renderHook(({ id }) => useRefetchOnFocus(["profile", id]), {
      wrapper,
      initialProps: { id: "u1" },
    });
    const first = focusEffect.mock.calls[0][0];
    rerender({ id: "u2" });
    expect(focusEffect.mock.calls[1][0]).not.toBe(first);
  });
});
