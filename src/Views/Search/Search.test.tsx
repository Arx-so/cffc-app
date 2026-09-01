jest.mock("@/processes/profile", () => ({
  searchAthletes: jest.fn(),
  addToClubShortlist: jest.fn(),
}));

import React from "react";
import { ActivityIndicator, FlatList, TextInput } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import { searchAthletes, addToClubShortlist } from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { Search } from "@/Views/Search/Search";
import { useSearch } from "@/Views/Search/useSearch";
import { mockRouter, resetMockRouter } from "@/test/router";
import { Brand } from "@/constants/theme";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const search = searchAthletes as jest.Mock;
const addShortlist = addToClubShortlist as jest.Mock;
const toast = Toast.show as jest.Mock;

const athlete = (over: Record<string, unknown> = {}) => ({
  id: "a1",
  name: "Joao Megale",
  username: "joao",
  avatarUrl: null,
  verified: false,
  positions: ["st"],
  videoCount: 7,
  validationCount: 8,
  contactCount: 9,
  isShortlisted: false,
  ...over,
});

const NO_FILTERS = {
  positions: [],
  ageMin: null,
  ageMax: null,
  dominantFoot: null,
  minHeight: null,
  maxWeight: null,
  strengths: [],
};

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);
const setup = () => renderHook(() => useSearch(), { wrapper });

const setRole = (role: string) =>
  useAuthStore.setState({ user: { id: "u1", email: "a@b.com", name: "Joao" }, role: role as any });

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  search.mockReset().mockResolvedValue([]);
  addShortlist.mockReset().mockResolvedValue(undefined);
  useSearchFilterStore.getState().clearFilters();
  setRole("pro");
});

describe("useSearch — busca", () => {
  it("busca com termo vazio e filtros limpos ao montar", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith("", NO_FILTERS, undefined, "u1");
    expect(result.current.athletes).toEqual([]);
  });

  it("passa o id do clube quando o papel e club", async () => {
    setRole("club");
    setup();
    await rhWaitFor(() => expect(search).toHaveBeenCalledWith("", NO_FILTERS, "u1", "u1"));
  });

  it.each(["athlete", "pro", "admin"])(
    "nao passa id de clube para o papel %s",
    async (role) => {
      setRole(role);
      setup();
      await rhWaitFor(() =>
        expect(search).toHaveBeenCalledWith("", NO_FILTERS, undefined, "u1"),
      );
    },
  );

  it("refaz a busca quando o termo muda", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(search).toHaveBeenCalled());
    hookAct(() => result.current.setQuery("joa"));
    await rhWaitFor(() => expect(search).toHaveBeenCalledWith("joa", NO_FILTERS, undefined, "u1"));
  });

  it("aplica os filtros da store na consulta", async () => {
    useSearchFilterStore.getState().setFilters({ ageMin: 16, dominantFoot: "left" });
    setup();
    await rhWaitFor(() =>
      expect(search).toHaveBeenCalledWith(
        "",
        expect.objectContaining({ ageMin: 16, dominantFoot: "left" }),
        undefined,
        "u1",
      ),
    );
  });

  it("passa viewerProfileId null quando nao ha usuario logado", async () => {
    useAuthStore.setState({ user: null, role: null });
    setup();
    await rhWaitFor(() => expect(search).toHaveBeenCalledWith("", NO_FILTERS, undefined, null));
  });

  it("expoe o erro da busca", async () => {
    search.mockRejectedValue(new Error("rls"));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useSearch — filtros de posicao", () => {
  it("expoe que ha filtro ativo", async () => {
    useSearchFilterStore.getState().setFilters({ ageMin: 16 });
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.hasActiveFilters).toBe(true));
  });

  it("comeca sem filtro ativo", async () => {
    const { result } = setup();
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activePositionFilters).toEqual([]);
  });

  it("aplica um setor de posicao", async () => {
    const { result } = setup();
    hookAct(() => result.current.handlePositionFilterPress("attack"));
    expect(useSearchFilterStore.getState().positions).toEqual(["attack"]);
  });

  it("limpa as posicoes quando o setor e nulo", async () => {
    useSearchFilterStore.getState().setFilters({ positions: ["attack"] });
    const { result } = setup();
    hookAct(() => result.current.handlePositionFilterPress(null));
    expect(useSearchFilterStore.getState().positions).toEqual([]);
  });

  it("substitui o setor anterior em vez de acumular", async () => {
    const { result } = setup();
    hookAct(() => result.current.handlePositionFilterPress("attack"));
    hookAct(() => result.current.handlePositionFilterPress("defense"));
    expect(useSearchFilterStore.getState().positions).toEqual(["defense"]);
  });

  it("abre a tela de filtros", async () => {
    const { result } = setup();
    hookAct(() => result.current.openFilter());
    expect(mockRouter.push).toHaveBeenCalledWith("/search-filter");
  });
});

describe("useSearch — favoritar", () => {
  it("adiciona o atleta a lista do clube", async () => {
    setRole("club");
    search.mockResolvedValue([athlete()]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.athletes).toHaveLength(1));

    await hookAct(async () => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() => expect(addShortlist).toHaveBeenCalledWith("a1"));
  });

  it("marca o atleta como favoritado no cache, sem refazer a busca", async () => {
    setRole("club");
    search.mockResolvedValue([athlete()]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.athletes).toHaveLength(1));

    await hookAct(async () => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() => expect(result.current.athletes[0].isShortlisted).toBe(true));
  });

  it("nao marca os demais atletas", async () => {
    setRole("club");
    search.mockResolvedValue([athlete(), athlete({ id: "a2" })]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.athletes).toHaveLength(2));

    await hookAct(async () => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() => expect(result.current.athletes[0].isShortlisted).toBe(true));
    expect(result.current.athletes[1].isShortlisted).toBe(false);
  });

  it("confirma com toast de sucesso", async () => {
    setRole("club");
    const { result } = setup();
    await hookAct(async () => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({ type: "success", text1: t("search.favoriteSuccess") }),
    );
  });

  it("avisa e limpa o estado quando falha", async () => {
    addShortlist.mockRejectedValue(new Error("rls"));
    setRole("club");
    const { result } = setup();
    await hookAct(async () => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({ type: "error", text1: t("search.favoriteError") }),
    );
    expect(result.current.addingAthleteId).toBeNull();
  });

  it("marca qual atleta esta sendo adicionado enquanto a chamada corre", async () => {
    let resolver: (v: unknown) => void = () => {};
    addShortlist.mockImplementation(() => new Promise((r) => (resolver = r)));
    setRole("club");
    const { result } = setup();

    hookAct(() => result.current.handleAddFavorite("a1"));
    await rhWaitFor(() => expect(result.current.addingAthleteId).toBe("a1"));

    await hookAct(async () => resolver(undefined));
    await rhWaitFor(() => expect(result.current.addingAthleteId).toBeNull());
  });
});

describe("useSearch — abrir perfil", () => {
  it("monta a rota com id, username e nome codificados", async () => {
    const { result } = setup();
    hookAct(() => result.current.handleViewProfile(athlete({ name: "Joao & Silva" }) as any));
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/visitor-profile?userId=a1&username=joao&name=${encodeURIComponent("Joao & Silva")}`,
    );
  });

  it("usa username vazio quando o atleta nao tem", async () => {
    const { result } = setup();
    hookAct(() => result.current.handleViewProfile(athlete({ username: null }) as any));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("username=&"));
  });
});

describe("Search — tela", () => {
  it("mostra o campo de busca configurado", () => {
    render(<Search />);
    expect(screen.UNSAFE_getByType(TextInput).props).toMatchObject({
      placeholder: t("search.placeholder"),
      autoCorrect: false,
      autoCapitalize: "none",
    });
  });

  it("mostra as cinco abas de setor", () => {
    render(<Search />);
    for (const key of ["all", "attackers", "midfielders", "defenders", "goalkeepers"]) {
      expect(screen.getByText(t(`search.filterTabs.${key}`))).toBeTruthy();
    }
  });

  it("marca a aba Todos como ativa quando nao ha filtro de posicao", () => {
    render(<Search />);
    const todos = screen.getByText(t("search.filterTabs.all"));
    const atacantes = screen.getByText(t("search.filterTabs.attackers"));
    expect(JSON.stringify(todos.props.style)).not.toBe(JSON.stringify(atacantes.props.style));
  });

  it("aplica o setor ao tocar na aba", () => {
    render(<Search />);
    fireEvent.press(screen.getByText(t("search.filterTabs.attackers")));
    expect(useSearchFilterStore.getState().positions).toEqual(["attack"]);
  });

  it("limpa o setor ao tocar em Todos", () => {
    useSearchFilterStore.getState().setFilters({ positions: ["attack"] });
    render(<Search />);
    fireEvent.press(screen.getByText(t("search.filterTabs.all")));
    expect(useSearchFilterStore.getState().positions).toEqual([]);
  });

  it("abre a tela de filtros pelo icone", () => {
    render(<Search />);
    const icone = screen
      .UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)
      .find((i) => i.props.name === "options-outline")!;
    fireEvent.press(icone.parent!);
    expect(mockRouter.push).toHaveBeenCalledWith("/search-filter");
  });

  it("destaca o icone de filtro quando ha filtro ativo", () => {
    useSearchFilterStore.getState().setFilters({ ageMin: 16 });
    render(<Search />);
    const icone = screen
      .UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)
      .find((i) => i.props.name === "options-outline")!;
    expect(icone.props.color).toBe(Brand.green);
  });

  it("nao destaca o icone sem filtro ativo", () => {
    render(<Search />);
    const icone = screen
      .UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)
      .find((i) => i.props.name === "options-outline")!;
    expect(icone.props.color).toBe(Brand.neutralText);
  });

  it("mostra indicador enquanto carrega", () => {
    render(<Search />);
    expect(screen.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it("mostra a mensagem de nenhum resultado", async () => {
    render(<Search />);
    await waitFor(() => expect(screen.getByText(t("search.noResults"))).toBeTruthy());
  });

  it("lista os atletas encontrados", async () => {
    search.mockResolvedValue([athlete()]);
    render(<Search />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
  });

  it("usa o id como chave da lista", async () => {
    search.mockResolvedValue([athlete()]);
    render(<Search />);
    await waitFor(() =>
      expect(screen.UNSAFE_getByType(FlatList).props.keyExtractor(athlete())).toBe("a1"),
    );
  });

  it("busca pelo campo de texto", async () => {
    render(<Search />);
    await waitFor(() => expect(search).toHaveBeenCalled());
    fireEvent.changeText(screen.UNSAFE_getByType(TextInput), "joa");
    await waitFor(() =>
      expect(search).toHaveBeenCalledWith("joa", NO_FILTERS, undefined, "u1"),
    );
  });

  it("oferece tentar de novo quando falha", async () => {
    search.mockRejectedValue(new Error("rls"));
    render(<Search />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
  });

  it("refaz a busca ao tocar em tentar de novo", async () => {
    search.mockRejectedValue(new Error("rls"));
    render(<Search />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
    search.mockClear();
    fireEvent.press(screen.getByText(t("common.retry")));
    await waitFor(() => expect(search).toHaveBeenCalled());
  });

  it("abre o perfil ao tocar no card", async () => {
    search.mockResolvedValue([athlete()]);
    render(<Search />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    fireEvent.press(screen.getByText("Joao Megale"));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("userId=a1"));
  });

  it("usa o card compacto, sem as acoes do card completo", async () => {
    search.mockResolvedValue([athlete()]);
    render(<Search />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    expect(screen.queryByText(t("search.viewProfile"))).toBeNull();
  });
});

describe("Search — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos das abas em %s", (lang) => {
    render(<Search />, { language: lang });
    const rotulo = i18n.t("search.filterTabs.attackers", { lng: lang });
    expect(rotulo).not.toBe("search.filterTabs.attackers");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
