jest.mock("@/processes/profile", () => ({
  fetchAthleteProfile: jest.fn(),
  fetchProfileVideos: jest.fn(),
  fetchProfilePersonalFields: jest.fn(),
  fetchAthleteProfileData: jest.fn(),
}));
jest.mock("@/processes/feed", () => ({ fetchUserVideoFeed: jest.fn(async () => []) }));
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Spinner } from "@ui-kitten/components";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import {
  fetchAthleteProfile,
  fetchProfileVideos,
  fetchProfilePersonalFields,
  fetchAthleteProfileData,
} from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";
import Profile from "@/Views/Profile/Profile";
import { useProfile } from "@/Views/Profile/useProfile";
import { mockRouter, resetMockRouter } from "@/test/router";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const header = fetchAthleteProfile as jest.Mock;
const videosOf = fetchProfileVideos as jest.Mock;
const personal = fetchProfilePersonalFields as jest.Mock;
const athleteRow = fetchAthleteProfileData as jest.Mock;
const requestPerm = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;
const toast = Toast.show as jest.Mock;

const profile = (over: Record<string, unknown> = {}) => ({
  id: "u1",
  name: "Joao Megale",
  username: "joao",
  avatarUrl: null,
  role: "athlete" as const,
  verified: false,
  city: "Santos",
  state: "SP",
  stats: { videoCount: 9, validationCount: 5, contactCount: 2 },
  ...over,
});

const video = (id: string) => ({ id, url: `u/${id}.mp4`, thumbUrl: null, status: "approved" as const });

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);
const setup = () => renderHook(() => useProfile(), { wrapper });

const setRole = (role: string) =>
  useAuthStore.setState({ user: { id: "u1", email: "a@b.com", name: "Joao" }, role: role as any });

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  header.mockReset().mockResolvedValue(profile());
  videosOf.mockReset().mockResolvedValue([]);
  personal.mockReset().mockResolvedValue({ birth_date: "2008-05-01", phone: "11987654321" });
  athleteRow.mockReset().mockResolvedValue(null);
  requestPerm.mockReset().mockResolvedValue({ granted: true });
  launchLibrary.mockReset().mockResolvedValue({ canceled: true, assets: [] });
  setRole("athlete");
});

describe("useProfile — carregamento por papel", () => {
  it("busca o cabecalho do proprio perfil", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData).not.toBeNull());
    expect(header).toHaveBeenCalledWith("u1");
  });

  it("busca videos e dados de atleta quando o papel e athlete", async () => {
    setup();
    await rhWaitFor(() => expect(videosOf).toHaveBeenCalledWith("u1"));
    expect(athleteRow).toHaveBeenCalledWith("u1");
    expect(personal).toHaveBeenCalledWith("u1");
  });

  it.each(["pro", "club", "admin"])("nao busca videos para o papel %s", async (role) => {
    setRole(role);
    setup();
    await rhWaitFor(() => expect(header).toHaveBeenCalled());
    expect(videosOf).not.toHaveBeenCalled();
    expect(athleteRow).not.toHaveBeenCalled();
  });

  it("busca dados pessoais tambem para o clube", async () => {
    setRole("club");
    setup();
    await rhWaitFor(() => expect(personal).toHaveBeenCalledWith("u1"));
  });

  it.each(["pro", "admin"])("nao busca dados pessoais para o papel %s", async (role) => {
    setRole(role);
    setup();
    await rhWaitFor(() => expect(header).toHaveBeenCalled());
    expect(personal).not.toHaveBeenCalled();
  });

  it("nao busca nada quando nao ha usuario logado", () => {
    useAuthStore.setState({ user: null, role: null });
    setup();
    expect(header).not.toHaveBeenCalled();
  });
});

describe("useProfile — contagem de videos", () => {
  it("substitui a contagem do servidor pela lista realmente carregada", async () => {
    videosOf.mockResolvedValue([video("m1"), video("m2")]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData?.stats.videoCount).toBe(2));
  });

  it("preserva as demais estatisticas do servidor", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData).not.toBeNull());
    expect(result.current.profileData!.stats).toMatchObject({
      validationCount: 5,
      contactCount: 2,
    });
  });

  it("zera a contagem quando o atleta nao tem video", async () => {
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData?.stats.videoCount).toBe(0));
  });

  it("devolve profileData null enquanto o cabecalho nao chega", () => {
    const { result } = setup();
    expect(result.current.profileData).toBeNull();
    expect(result.current.videos).toEqual([]);
  });
});

describe("useProfile — extras por papel", () => {
  it("monta o bloco de atleta com nascimento, telefone e linha de atleta", async () => {
    athleteRow.mockResolvedValue({ user_id: "u1", positions: ["st"] });
    const { result } = setup();
    await rhWaitFor(() =>
      expect(result.current.athleteOwnProfileExtra?.athleteProfile).not.toBeNull(),
    );
    expect(result.current.athleteOwnProfileExtra).toMatchObject({
      birthDate: "2008-05-01",
      phone: "11987654321",
      isLoading: false,
    });
    expect(result.current.clubOwnProfileExtra).toBeNull();
  });

  it("monta o bloco de clube reusando birth_date como data de fundacao", async () => {
    setRole("club");
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.clubOwnProfileExtra?.isLoading).toBe(false));
    expect(result.current.clubOwnProfileExtra).toMatchObject({
      foundingDate: "2008-05-01",
      phone: "11987654321",
    });
    expect(result.current.athleteOwnProfileExtra).toBeNull();
  });

  it.each(["pro", "admin"])("nao monta bloco algum para o papel %s", async (role) => {
    setRole(role);
    const { result } = setup();
    await rhWaitFor(() => expect(header).toHaveBeenCalled());
    expect(result.current.athleteOwnProfileExtra).toBeNull();
    expect(result.current.clubOwnProfileExtra).toBeNull();
  });

  it("usa null quando os campos pessoais vem vazios", async () => {
    personal.mockResolvedValue({ birth_date: null, phone: null });
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.athleteOwnProfileExtra?.isLoading).toBe(false));
    expect(result.current.athleteOwnProfileExtra).toMatchObject({
      birthDate: null,
      phone: null,
      athleteProfile: null,
    });
  });
});

describe("useProfile — enviar video", () => {
  it("pede permissao e abre a galeria so de videos", async () => {
    const { result } = setup();
    await hookAct(async () => result.current.handleAddVideoPress());
    expect(requestPerm).toHaveBeenCalled();
    expect(launchLibrary).toHaveBeenCalledWith({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });
  });

  it("avisa e para quando a permissao e negada", async () => {
    requestPerm.mockResolvedValue({ granted: false });
    const { result } = setup();
    await hookAct(async () => result.current.handleAddVideoPress());
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("editProfile.permissionRequired"),
    });
    expect(launchLibrary).not.toHaveBeenCalled();
  });

  it("leva o video escolhido para a tela de envio, com a uri codificada", async () => {
    launchLibrary.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///a b.mp4" }] });
    const { result } = setup();
    await hookAct(async () => result.current.handleAddVideoPress());
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/add-video?videoUri=${encodeURIComponent("file:///a b.mp4")}`,
    );
  });

  it.each([
    ["cancelou", { canceled: true, assets: [] }],
    ["voltou sem asset", { canceled: false, assets: [] }],
  ])("nao navega quando o usuario %s", async (_l, res) => {
    launchLibrary.mockResolvedValue(res);
    const { result } = setup();
    await hookAct(async () => result.current.handleAddVideoPress());
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("useProfile — abrir video", () => {
  it("abre o feed do usuario no indice do video tocado", async () => {
    videosOf.mockResolvedValue([video("m1"), video("m2"), video("m3")]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.videos).toHaveLength(3));

    hookAct(() => result.current.handleVideoPress(video("m2")));
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/user-feed?userId=u1&username=joao&initialIndex=1",
    );
  });

  it("usa indice zero quando o video nao esta na lista", async () => {
    videosOf.mockResolvedValue([video("m1")]);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.videos).toHaveLength(1));
    hookAct(() => result.current.handleVideoPress(video("desconhecido")));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("initialIndex=0"));
  });

  it("codifica o username na rota", async () => {
    header.mockResolvedValue(profile({ username: "joão silva" }));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData).not.toBeNull());
    hookAct(() => result.current.handleVideoPress(video("m1")));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining(`username=${encodeURIComponent("joão silva")}`),
    );
  });

  it("usa username vazio quando o perfil nao tem um", async () => {
    header.mockResolvedValue(profile({ username: null }));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.profileData).not.toBeNull());
    hookAct(() => result.current.handleVideoPress(video("m1")));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("username=&"));
  });
});

describe("useProfile — erro", () => {
  it("expoe isError quando o cabecalho falha", async () => {
    header.mockRejectedValue(new Error("rls"));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("Profile — tela", () => {
  it("mostra o spinner enquanto carrega", async () => {
    // Promessa controlada: uma que nunca resolve deixa a query pendurada e
    // envenena os testes seguintes da mesma suíte.
    let resolver: (v: unknown) => void = () => {};
    header.mockImplementation(() => new Promise((r) => (resolver = r)));
    render(<Profile />);
    expect(screen.UNSAFE_getByType(Spinner)).toBeTruthy();
    await act(async () => resolver(profile()));
  });

  it("oferece tentar de novo quando falha", async () => {
    header.mockRejectedValue(new Error("rls"));
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(t("common.retry"))).toBeTruthy());
  });

  it("mostra o cabecalho do perfil carregado", async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
  });

  // `profile.videos` (rótulo da estatística) e `profile.videosTitle` são ambos
  // "Videos" em inglês. O estado vazio da seção tem texto exclusivo.
  it("mostra a secao de videos para o atleta", async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(t("profile.noVideosTitle"))).toBeTruthy());
    expect(screen.getByText(t("profile.addFirstVideo"))).toBeTruthy();
  });

  it.each(["pro", "club", "admin"])("nao mostra a secao de videos para %s", async (role) => {
    setRole(role);
    header.mockResolvedValue(profile({ role }));
    render(<Profile />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    expect(screen.queryByText(t("profile.noVideosTitle"))).toBeNull();
    expect(screen.queryByText(t("profile.addFirstVideo"))).toBeNull();
  });

  it("mostra o bloco de detalhes do atleta", async () => {
    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText(t("profile.athleteDetailsTitle"))).toBeTruthy(),
    );
  });

  it("mostra o bloco de detalhes do clube quando o papel e club", async () => {
    setRole("club");
    header.mockResolvedValue(profile({ role: "club" }));
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(t("profile.clubDetailsTitle"))).toBeTruthy());
    expect(screen.queryByText(t("profile.athleteDetailsTitle"))).toBeNull();
  });

  it("usa a primeira posicao do atleta como subtitulo", async () => {
    athleteRow.mockResolvedValue({ user_id: "u1", positions: ["st"], strengths: [] });
    render(<Profile />);
    await waitFor(() =>
      expect(screen.getAllByText(t("athlete.positions.st")).length).toBeGreaterThan(0),
    );
  });

  it("cai para o @username no subtitulo quando o atleta nao tem posicao", async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText("@joao")).toBeTruthy());
  });

  it("vai para a edicao de perfil pelo botao do cabecalho", async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText("Joao Megale")).toBeTruthy());
    const { findPressHandlers } = require("@/test/rntl");
    fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    expect(mockRouter.push).toHaveBeenCalledWith("/edit-profile");
  });

  it("abre a galeria pelo botao do estado vazio", async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(t("profile.addFirstVideo"))).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByText(t("profile.addFirstVideo")));
    });
    expect(requestPerm).toHaveBeenCalled();
  });

});

describe("Profile — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", async (lang) => {
    render(<Profile />, { language: lang });
    const rotulo = i18n.t("profile.addFirstVideo", { lng: lang });
    expect(rotulo).not.toBe("profile.addFirstVideo");
    await waitFor(() => expect(screen.getByText(rotulo)).toBeTruthy());
  });
});
