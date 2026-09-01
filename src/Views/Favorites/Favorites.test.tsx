jest.mock("@/processes/profile", () => ({ fetchClubShortlist: jest.fn() }));

import React from "react";
import { ActivityIndicator, FlatList, Linking, Platform, Share, TextInput } from "react-native";
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
import { fetchClubShortlist } from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";
import { Favorites } from "@/Views/Favorites/Favorites";
import { useFavorites } from "@/Views/Favorites/useFavorites";
import { mockRouter, resetMockRouter } from "@/test/router";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const shortlist = fetchClubShortlist as jest.Mock;
const toast = Toast.show as jest.Mock;

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
  isShortlisted: true,
  phone: "11987654321",
  ...over,
});

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);
const setup = () => renderHook(() => useFavorites(), { wrapper });

let share: jest.SpyInstance;
let canOpen: jest.SpyInstance;
let openUrl: jest.SpyInstance;
const originalOS = Platform.OS;
const setOS = (os: string) => Object.defineProperty(Platform, "OS", { value: os, configurable: true });

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  shortlist.mockReset().mockResolvedValue([]);
  useAuthStore.setState({ user: { id: "club1", email: "a@b.com", name: "Clube" } });
  share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" } as any);
  canOpen = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
  openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined as any);
  setOS("ios");
});
afterEach(() => {
  jest.restoreAllMocks();
  setOS(originalOS);
});

describe("useFavorites — busca", () => {
  it("carrega a lista do clube logado, sem filtro inicial", async () => {
    shortlist.mockResolvedValue([athlete()]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.athletes).toHaveLength(1));
    expect(shortlist).toHaveBeenCalledWith("club1", "");
  });

  it("refaz a busca quando o filtro muda", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(shortlist).toHaveBeenCalledWith("club1", ""));
    hookAct(() => result.current.setQuery("joa"));
    await rhWaitFor(() => expect(shortlist).toHaveBeenCalledWith("club1", "joa"));
  });

  it("devolve lista vazia enquanto carrega", () => {
    const { result } = setup();
    expect(result.current.athletes).toEqual([]);
  });

  // ACHADO: `enabled: !!clubUserId` impede a busca automática, mas o
  // `useFocusEffect` chama `refetch()`, que ignora `enabled`. Sem clube logado
  // a tela dispara uma consulta com id vazio. Documentado como está hoje.
  it("dispara refetch no foco mesmo sem clube logado, com id vazio", async () => {
    useAuthStore.setState({ user: null });
    setup();
    await rhWaitFor(() => expect(shortlist).toHaveBeenCalledWith("", ""));
  });

  it("expoe o erro da busca", async () => {
    shortlist.mockRejectedValue(new Error("rls"));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useFavorites — abrir perfil", () => {
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

describe("useFavorites — contato", () => {
  const contatar = async (phone: string | null) => {
    const { result } = setup();
    await hookAct(async () => {
      await result.current.handleContact(phone);
    });
  };

  it("nao faz nada quando o atleta nao tem telefone", async () => {
    await contatar(null);
    expect(share).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it("avisa quando o telefone nao tem digito algum", async () => {
    await contatar("(  ) -");
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("favorites.contactUnavailable"),
    });
    expect(share).not.toHaveBeenCalled();
  });

  it("no iOS compartilha o texto junto com o link tel:", async () => {
    await contatar("(11) 98765-4321");
    expect(share).toHaveBeenCalledWith({
      message: `${t("favorites.contactShareText")}\n11987654321`,
      url: "tel:11987654321",
    });
  });

  it("no Android compartilha com titulo, sem url", async () => {
    setOS("android");
    await contatar("11987654321");
    expect(share).toHaveBeenCalledWith({
      message: `${t("favorites.contactShareText")}\n11987654321`,
      title: t("favorites.contactOptions.title"),
    });
  });

  it("cai para a discagem quando o compartilhamento falha", async () => {
    share.mockRejectedValue(new Error("no share sheet"));
    await contatar("11987654321");
    expect(canOpen).toHaveBeenCalledWith("tel:11987654321");
    expect(openUrl).toHaveBeenCalledWith("tel:11987654321");
    expect(toast).not.toHaveBeenCalled();
  });

  it("avisa quando nem compartilhar nem discar funciona", async () => {
    share.mockRejectedValue(new Error("no share sheet"));
    canOpen.mockResolvedValue(false);
    await contatar("11987654321");
    expect(openUrl).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("favorites.contactOpenError"),
    });
  });

  it("avisa quando a propria verificacao de discagem lanca", async () => {
    share.mockRejectedValue(new Error("no share sheet"));
    canOpen.mockRejectedValue(new Error("sem suporte"));
    await contatar("11987654321");
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("favorites.contactOpenError"),
    });
  });

  it("remove a formatacao do telefone antes de discar", async () => {
    share.mockRejectedValue(new Error("x"));
    await contatar("+55 (11) 98765-4321");
    expect(openUrl).toHaveBeenCalledWith("tel:5511987654321");
  });
});

describe("Favorites — tela", () => {
  it("mostra o titulo e o total", async () => {
    // Estatísticas escolhidas para não colidirem com o "2" do total.
    const stats = { videoCount: 7, validationCount: 8, contactCount: 9 };
    shortlist.mockResolvedValue([athlete(stats), athlete({ id: "a2", ...stats })]);
    render(<Favorites />);
    expect(screen.getByText(t("favorites.title"))).toBeTruthy();
    await waitFor(() => expect(screen.getByText("2")).toBeTruthy());
    expect(screen.getByText(t("favorites.total"))).toBeTruthy();
  });

  it("mostra indicador no total enquanto carrega", () => {
    render(<Favorites />);
    expect(screen.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it("mostra a mensagem de lista vazia", async () => {
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("favorites.noFavorites"))).toBeTruthy());
  });

  it("lista os atletas favoritados", async () => {
    shortlist.mockResolvedValue([athlete()]);
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
  });

  it("usa o id como chave da lista", async () => {
    shortlist.mockResolvedValue([athlete()]);
    render(<Favorites />);
    await waitFor(() =>
      expect(screen.UNSAFE_getByType(FlatList).props.keyExtractor(athlete())).toBe("a1"),
    );
  });

  it("filtra pelo campo de busca", async () => {
    render(<Favorites />);
    await waitFor(() => expect(shortlist).toHaveBeenCalledWith("club1", ""));
    fireEvent.changeText(screen.UNSAFE_getByType(TextInput), "joa");
    await waitFor(() => expect(shortlist).toHaveBeenCalledWith("club1", "joa"));
  });

  it("configura a busca sem autocorrecao nem maiusculas", () => {
    render(<Favorites />);
    expect(screen.UNSAFE_getByType(TextInput).props).toMatchObject({
      autoCorrect: false,
      autoCapitalize: "none",
      placeholder: t("favorites.searchPlaceholder"),
    });
  });

  it("oferece tentar de novo quando a busca falha", async () => {
    shortlist.mockRejectedValue(new Error("rls"));
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
  });

  it("refaz a busca ao tocar em tentar de novo", async () => {
    shortlist.mockRejectedValue(new Error("rls"));
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
    shortlist.mockClear();
    fireEvent.press(screen.getByText(t("common.retry")));
    await waitFor(() => expect(shortlist).toHaveBeenCalled());
  });

  it("abre o perfil ao tocar no card", async () => {
    shortlist.mockResolvedValue([athlete()]);
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    fireEvent.press(screen.getByText("Joao Megale"));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("userId=a1"));
  });
});

describe("Favorites — rodape de contato", () => {
  it("oferece contatar quando ha telefone", async () => {
    shortlist.mockResolvedValue([athlete()]);
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("favorites.contactAthlete"))).toBeTruthy());
  });

  it("compartilha o contato ao tocar", async () => {
    shortlist.mockResolvedValue([athlete()]);
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("favorites.contactAthlete"))).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByText(t("favorites.contactAthlete")));
    });
    expect(share).toHaveBeenCalled();
  });

  it("indica ausencia de telefone e desabilita o botao", async () => {
    shortlist.mockResolvedValue([athlete({ phone: null })]);
    render(<Favorites />);
    await waitFor(() => expect(screen.getByText(t("favorites.noPhone"))).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByText(t("favorites.noPhone")));
    });
    expect(share).not.toHaveBeenCalled();
  });
});

describe("Favorites — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<Favorites />, { language: lang });
    const titulo = i18n.t("favorites.title", { lng: lang });
    expect(titulo).not.toBe("favorites.title");
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
