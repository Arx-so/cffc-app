jest.mock("@/processes/validation", () => ({ fetchValidatedAthletes: jest.fn(async () => []) }));

import React from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { renderHook, waitFor as rhWaitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import { fetchValidatedAthletes } from "@/processes/validation";
import { useAuthStore } from "@/stores/authStore";
import { ProValidationHistory } from "@/Views/ProValidationHistory/ProValidationHistory";
import { useProValidationHistory } from "@/Views/ProValidationHistory/useProValidationHistory";
import { mockRouter, resetMockRouter } from "@/test/router";
import { Brand } from "@/constants/theme";
import { findHostByStyleValue } from "@/test/rntl";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const fetchAthletes = fetchValidatedAthletes as jest.Mock;

const athlete = (over: Record<string, unknown> = {}) => ({
  id: "a1",
  name: "Joao Megale",
  username: "joao",
  avatarUrl: null,
  verified: false,
  positions: ["st"],
  videoCount: 1,
  validationCount: 2,
  contactCount: 0,
  isShortlisted: false,
  validationStatus: "approved" as const,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  fetchAthletes.mockResolvedValue([]);
  useAuthStore.setState({ user: { id: "p1", email: "a@b.com", name: "Ana" } });
});

describe("useProValidationHistory", () => {
  const wrapper = ({ children }: any) => (
    <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
  );

  it("busca os atletas validados pelo profissional logado", async () => {
    fetchAthletes.mockResolvedValue([athlete()]);
    const { result } = renderHook(() => useProValidationHistory(), { wrapper });
    await rhWaitFor(() => expect(result.current.athletes).toHaveLength(1));
    expect(fetchAthletes).toHaveBeenCalledWith("p1");
  });

  it("devolve lista vazia enquanto carrega, em vez de undefined", () => {
    const { result } = renderHook(() => useProValidationHistory(), { wrapper });
    expect(result.current.athletes).toEqual([]);
  });

  it("nao busca quando nao ha profissional logado", () => {
    useAuthStore.setState({ user: null });
    renderHook(() => useProValidationHistory(), { wrapper });
    expect(fetchAthletes).not.toHaveBeenCalled();
  });

  it("nao busca de novo ao focar quando nao ha usuario logado", async () => {
    useAuthStore.setState({ user: null });
    renderHook(() => useProValidationHistory(), { wrapper });
    await rhWaitFor(() => expect(fetchAthletes).not.toHaveBeenCalled());
  });

  it("monta a rota do perfil com id, username e nome codificados", async () => {
    const { result } = renderHook(() => useProValidationHistory(), { wrapper });
    result.current.handleViewProfile(athlete({ name: "Joao & Silva" }));
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/visitor-profile?userId=a1&username=joao&name=${encodeURIComponent("Joao & Silva")}`,
    );
  });

  it("usa username vazio quando o atleta nao tem um", () => {
    const { result } = renderHook(() => useProValidationHistory(), { wrapper });
    result.current.handleViewProfile(athlete({ username: null }));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("username=&"));
  });

  it("expoe o estado de erro", async () => {
    fetchAthletes.mockRejectedValue(new Error("rls"));
    const { result } = renderHook(() => useProValidationHistory(), { wrapper });
    await rhWaitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("ProValidationHistory — tela", () => {
  it("mostra o titulo da tela", async () => {
    render(<ProValidationHistory />);
    expect(screen.getByText(t("proValidationHistory.title"))).toBeTruthy();
  });

  it("mostra um indicador enquanto carrega", async () => {
    // Promessa pendente controlada: `new Promise(() => {})` deixaria um handle aberto.
    let resolver: (v: unknown) => void = () => {};
    fetchAthletes.mockImplementation(() => new Promise((r) => (resolver = r)));
    render(<ProValidationHistory />);
    expect(screen.UNSAFE_getByType(ActivityIndicator).props.color).toBe(Brand.green);
    await act(async () => resolver([]));
  });

  it("mostra a mensagem de lista vazia", async () => {
    render(<ProValidationHistory />);
    await waitFor(() => expect(screen.getByText(t("proValidationHistory.empty"))).toBeTruthy());
  });

  it("lista os atletas validados", async () => {
    fetchAthletes.mockResolvedValue([athlete(), athlete({ id: "a2", name: "Pedro" })]);
    render(<ProValidationHistory />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    expect(screen.getByText("Pedro")).toBeTruthy();
  });

  it("usa o id do atleta como chave da lista", async () => {
    fetchAthletes.mockResolvedValue([athlete()]);
    render(<ProValidationHistory />);
    await waitFor(() =>
      expect(screen.UNSAFE_getByType(FlatList).props.keyExtractor(athlete())).toBe("a1"),
    );
  });

  it("abre o perfil ao tocar no card", async () => {
    fetchAthletes.mockResolvedValue([athlete()]);
    render(<ProValidationHistory />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    fireEvent.press(screen.getByText(t("search.viewProfile")));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("userId=a1"));
  });

  it("oferece tentar de novo quando a busca falha", async () => {
    fetchAthletes.mockRejectedValue(new Error("rls"));
    render(<ProValidationHistory />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
  });

  it("refaz a busca ao tocar em tentar de novo", async () => {
    fetchAthletes.mockRejectedValue(new Error("rls"));
    render(<ProValidationHistory />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
    fetchAthletes.mockClear();
    fireEvent.press(screen.getByText(t("common.retry")));
    await waitFor(() => expect(fetchAthletes).toHaveBeenCalled());
  });
});

describe("selo de status da validacao", () => {
  it.each([
    ["approved", Brand.green],
    ["pending", Brand.amber],
    ["rejected", Brand.danger],
  ])("colore o selo de %s", async (status, color) => {
    fetchAthletes.mockResolvedValue([athlete({ validationStatus: status })]);
    const { UNSAFE_root } = render(<ProValidationHistory />);
    await waitFor(() =>
      expect(screen.getByText(t(`proProfile.validationStatus.${status}`))).toBeTruthy(),
    );
    expect(findHostByStyleValue(UNSAFE_root, color).length).toBeGreaterThan(0);
  });

  it("trata status ausente como pendente", async () => {
    fetchAthletes.mockResolvedValue([athlete({ validationStatus: undefined })]);
    render(<ProValidationHistory />);
    await waitFor(() =>
      expect(screen.getByText(t("proProfile.validationStatus.pending"))).toBeTruthy(),
    );
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<ProValidationHistory />, { language: lang });
    const titulo = i18n.t("proValidationHistory.title", { lng: lang });
    expect(titulo).not.toBe("proValidationHistory.title");
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
