jest.mock("@/processes/profile", () => ({ fetchCurrentUserAvatar: jest.fn(async () => null) }));
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

import React from "react";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { render, screen, fireEvent, waitFor, act } from "@/test/renderWithProviders";
import * as ImagePicker from "expo-image-picker";
import { fetchCurrentUserAvatar } from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";
import { RoleGroupTabsLayout } from "@/components/RoleGroupTabsLayout";
import { findScreen, findScreens, navigatorOptions } from "@/test/navigation";
import { mockRouter, resetMockRouter } from "@/test/router";
import { findPressHandlers } from "@/test/rntl";
import { Brand } from "@/constants/theme";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const avatar = fetchCurrentUserAvatar as jest.Mock;
const requestPerm = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

const renderTabs = (props: any = { addVideosMode: "picker" }) =>
  render(<RoleGroupTabsLayout {...props} />);

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  avatar.mockResolvedValue(null);
  requestPerm.mockResolvedValue({ granted: true });
  launchLibrary.mockResolvedValue({ canceled: true, assets: [] });
  useAuthStore.setState({ user: { id: "u1", email: "a@b.com", name: "Joao" } });
});

describe("estrutura das abas", () => {
  it("declara as cinco abas do grupo", () => {
    const { UNSAFE_root } = renderTabs();
    expect(findScreens(UNSAFE_root, "Tabs").map((s) => s.name)).toEqual([
      "add-videos/index",
      "home/index",
      "search/index",
      "favorites/index",
      "profile/index",
    ]);
  });

  it("esconde o cabecalho padrao e os rotulos da barra", () => {
    const { UNSAFE_root } = renderTabs();
    expect(navigatorOptions(UNSAFE_root, "Tabs")).toMatchObject({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: Brand.green,
      tabBarInactiveTintColor: Brand.white,
    });
  });

  it("mostra o proprio cabecalho apenas na aba de perfil", () => {
    const { UNSAFE_root } = renderTabs();
    expect(findScreen(UNSAFE_root, "Tabs", "profile/index")!.options.headerShown).toBe(true);
    expect(findScreen(UNSAFE_root, "Tabs", "home/index")!.options.headerShown).toBeUndefined();
  });
});

describe("abas opcionais", () => {
  it("mostra adicionar videos e favoritos por padrao", () => {
    const { UNSAFE_root } = renderTabs();
    expect(findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options.href).toBeUndefined();
    expect(findScreen(UNSAFE_root, "Tabs", "favorites/index")!.options.href).toBeUndefined();
  });

  it("remove a aba de adicionar videos da barra quando desligada", () => {
    const { UNSAFE_root } = renderTabs({ addVideosMode: "picker", showAddVideos: false });
    expect(findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options).toEqual({ href: null });
  });

  it("remove a aba de favoritos quando desligada", () => {
    const { UNSAFE_root } = renderTabs({ addVideosMode: "picker", showFavorites: false });
    expect(findScreen(UNSAFE_root, "Tabs", "favorites/index")!.options).toEqual({ href: null });
  });

  it("as abas fixas continuam quando as opcionais somem", () => {
    const { UNSAFE_root } = renderTabs({
      addVideosMode: "picker",
      showAddVideos: false,
      showFavorites: false,
    });
    for (const name of ["home/index", "search/index", "profile/index"]) {
      expect(findScreen(UNSAFE_root, "Tabs", name)!.options.href).toBeUndefined();
    }
  });
});

describe("botao de adicionar video — modo navigate", () => {
  it.each(["/(pro)", "/(club)"] as const)("navega para add-videos do grupo %s", async (base) => {
    const { UNSAFE_root } = renderTabs({ addVideosMode: "navigate", groupBasePath: base });
    const botao = findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options.tabBarButton({});
    render(botao);
    await act(async () => {
      fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    });
    expect(mockRouter.push).toHaveBeenCalledWith(`${base}/add-videos`);
  });

  it("nao abre a galeria no modo navigate", async () => {
    const { UNSAFE_root } = renderTabs({ addVideosMode: "navigate", groupBasePath: "/(pro)" });
    const botao = findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options.tabBarButton({});
    render(botao);
    await act(async () => {
      fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    });
    expect(requestPerm).not.toHaveBeenCalled();
  });
});

describe("botao de adicionar video — modo picker", () => {
  const pressAdd = async () => {
    const { UNSAFE_root } = renderTabs();
    const botao = findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options.tabBarButton({});
    render(botao);
    await act(async () => {
      fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    });
  };

  it("pede permissao da galeria antes de abrir", async () => {
    await pressAdd();
    expect(requestPerm).toHaveBeenCalled();
  });

  it("nao abre a galeria quando a permissao e negada", async () => {
    requestPerm.mockResolvedValue({ granted: false });
    await pressAdd();
    expect(launchLibrary).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("abre a galeria pedindo apenas videos, sem edicao e em qualidade maxima", async () => {
    await pressAdd();
    expect(launchLibrary).toHaveBeenCalledWith({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });
  });

  it("leva o video escolhido para a tela de envio", async () => {
    launchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///meu video.mp4" }],
    });
    await pressAdd();
    expect(mockRouter.push).toHaveBeenCalledWith(
      `/add-video?videoUri=${encodeURIComponent("file:///meu video.mp4")}`,
    );
  });

  it("nao navega quando o usuario cancela a galeria", async () => {
    launchLibrary.mockResolvedValue({ canceled: true, assets: [] });
    await pressAdd();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("nao navega quando a galeria volta sem asset", async () => {
    launchLibrary.mockResolvedValue({ canceled: false, assets: [] });
    await pressAdd();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("icones das abas", () => {
  const iconOf = (root: any, name: string, focused: boolean) => {
    const icon = findScreen(root, "Tabs", name)!.options.tabBarIcon({
      focused,
      color: Brand.white,
    });
    render(icon);
    return screen.UNSAFE_getByType(Ionicons).props;
  };

  it.each([
    ["home/index", "home", "home-outline"],
    ["search/index", "compass", "compass-outline"],
    ["favorites/index", "star", "star-outline"],
  ])("a aba %s troca o icone quando ativa", (name, ativo, inativo) => {
    const { UNSAFE_root } = renderTabs();
    expect(iconOf(UNSAFE_root, name, true).name).toBe(ativo);
    expect(iconOf(UNSAFE_root, name, false).name).toBe(inativo);
  });

  it("repassa a cor recebida da barra para o icone", () => {
    const { UNSAFE_root } = renderTabs();
    expect(iconOf(UNSAFE_root, "home/index", true).color).toBe(Brand.white);
  });

  it("usa o icone de pessoa no perfil enquanto nao ha avatar", () => {
    const { UNSAFE_root } = renderTabs();
    expect(iconOf(UNSAFE_root, "profile/index", true).name).toBe("person");
    expect(iconOf(UNSAFE_root, "profile/index", false).name).toBe("person-outline");
  });

  it("troca o icone do perfil pela foto do usuario quando ela carrega", async () => {
    avatar.mockResolvedValue("https://cdn/av.png");
    const { UNSAFE_root } = renderTabs();

    // `tabBarIcon` devolve um elemento React: dá para ler as props direto, sem
    // renderizar dentro do `waitFor` (o que tornaria a espera refém do timeout).
    await waitFor(() => {
      const icon = findScreen(UNSAFE_root, "Tabs", "profile/index")!.options.tabBarIcon({
        focused: true,
        color: Brand.white,
      });
      expect(icon.type).toBe(Image);
      expect(icon.props.source).toEqual({ uri: "https://cdn/av.png" });
    });
  });

  it("busca o avatar do usuario logado", async () => {
    renderTabs();
    await waitFor(() => expect(avatar).toHaveBeenCalledWith("u1"));
  });

  it("nao busca avatar quando nao ha usuario logado", () => {
    useAuthStore.setState({ user: null });
    renderTabs();
    expect(avatar).not.toHaveBeenCalled();
  });
});

describe("botao de aba", () => {
  const renderTabButton = (name: string, selected: boolean) => {
    const { UNSAFE_root } = renderTabs();
    const botao = findScreen(UNSAFE_root, "Tabs", name)!.options.tabBarButton({
      accessibilityState: { selected },
      onPress: jest.fn(),
    });
    return render(botao);
  };

  it("mostra o rotulo apenas na aba ativa", () => {
    renderTabButton("home/index", true);
    expect(screen.getByText(t("tabs.home"))).toBeTruthy();
  });

  it("esconde o rotulo na aba inativa", () => {
    renderTabButton("home/index", false);
    expect(screen.queryByText(t("tabs.home"))).toBeNull();
  });

  it("aceita aria-selected alem de accessibilityState", () => {
    const { UNSAFE_root } = renderTabs();
    const botao = findScreen(UNSAFE_root, "Tabs", "search/index")!.options.tabBarButton({
      "aria-selected": true,
    });
    render(botao);
    expect(screen.getByText(t("tabs.search"))).toBeTruthy();
  });

  it("encaminha o toque da aba para a navegacao", () => {
    const onPress = jest.fn();
    const { UNSAFE_root } = renderTabs();
    const botao = findScreen(UNSAFE_root, "Tabs", "home/index")!.options.tabBarButton({
      accessibilityState: { selected: false },
      onPress,
    });
    render(botao);
    fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("o botao de adicionar usa o icone de mais sobre o fundo ativo", () => {
    const { UNSAFE_root } = renderTabs();
    render(findScreen(UNSAFE_root, "Tabs", "add-videos/index")!.options.tabBarButton({}));
    const icon = screen.UNSAFE_getByType(Ionicons);
    expect(icon.props).toMatchObject({ name: "add", color: Brand.buttonPrimaryText });
  });
});

describe("cabecalho do perfil", () => {
  it("usa o HeaderBar compacto com o atalho de configuracoes", () => {
    const { UNSAFE_root } = renderTabs();
    render(findScreen(UNSAFE_root, "Tabs", "profile/index")!.options.header());
    fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    expect(mockRouter.push).toHaveBeenCalledWith("/settings");
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("nomeia as abas em %s", (lang) => {
    const { UNSAFE_root } = render(<RoleGroupTabsLayout addVideosMode="picker" />, {
      language: lang,
    });
    const titulo = i18n.t("tabs.home", { lng: lang });
    expect(titulo).not.toBe("tabs.home");
    expect(findScreen(UNSAFE_root, "Tabs", "home/index")!.options.title).toBe(titulo);
  });
});
