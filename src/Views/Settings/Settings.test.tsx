jest.mock("@/processes/auth", () => ({ deleteAccount: jest.fn() }));
jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn(async () => ({ type: "opened" })) }));

import React from "react";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import * as WebBrowser from "expo-web-browser";
import { render, screen, fireEvent, act } from "@/test/renderWithProviders";
import { deleteAccount } from "@/processes/auth";
import { LegalUrls } from "@/constants/legal";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import Settings from "@/Views/Settings/Settings";
import { useSettings } from "@/Views/Settings/useSettings";
import { mockRouter, resetMockRouter } from "@/test/router";
import { Brand } from "@/constants/theme";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const del = deleteAccount as jest.Mock;
const openBrowser = WebBrowser.openBrowserAsync as jest.Mock;
const toast = Toast.show as jest.Mock;
let storeSignOut: jest.Mock;

const setup = () => renderHook(() => useSettings());

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  del.mockReset().mockResolvedValue(undefined);
  storeSignOut = jest.fn(async () => {});
  useAuthStore.setState({ signOut: storeSignOut as any });
  useLanguageStore.setState({ language: "en" });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useSettings — itens", () => {
  it("lista os seis itens na ordem esperada", () => {
    const { result } = setup();
    expect(result.current.items.map((i) => i.label)).toEqual([
      t("settings.language"),
      t("signup.privacyPolicy"),
      t("signup.termsOfUse"),
      t("settings.support"),
      t("settings.signOut"),
      t("settings.deleteAccount"),
    ]);
  });

  it("marca apenas sair e excluir conta como destrutivos", () => {
    const { result } = setup();
    const destrutivos = result.current.items.filter((i) => i.destructive).map((i) => i.label);
    expect(destrutivos).toEqual([t("settings.signOut"), t("settings.deleteAccount")]);
  });

  it("mostra o idioma atual como valor do item de idioma", () => {
    const { result } = setup();
    expect(result.current.items[0].value).toBe(t("settings.langEn"));
  });

  it.each([
    ["pt-BR", "settings.langPtBr"],
    ["ja", "settings.langJa"],
  ])("acompanha o idioma %s da store", (lang, key) => {
    useLanguageStore.setState({ language: lang as any });
    const { result } = setup();
    expect(result.current.items[0].value).toBe(t(key));
  });

  it("cada item tem um icone", () => {
    const { result } = setup();
    for (const item of result.current.items) expect(item.icon).toBeTruthy();
  });
});

describe("useSettings — links legais", () => {
  it.each([
    [1, LegalUrls.privacyPolicy],
    [2, LegalUrls.termsOfUse],
    [3, LegalUrls.support],
  ])("o item %i abre a url legal correspondente no navegador", async (index, url) => {
    const { result } = setup();
    await hookAct(async () => {
      await result.current.items[index].onPress();
    });
    expect(openBrowser).toHaveBeenCalledWith(url);
  });
});

describe("useSettings — idioma", () => {
  it("a folha de idiomas comeca fechada", () => {
    const { result } = setup();
    expect(result.current.isLanguageSheetOpen).toBe(false);
  });

  it("abre a folha pelo item de idioma", () => {
    const { result } = setup();
    hookAct(() => result.current.items[0].onPress());
    expect(result.current.isLanguageSheetOpen).toBe(true);
  });

  it("oferece os tres idiomas, marcando o ativo", () => {
    useLanguageStore.setState({ language: "ja" });
    const { result } = setup();
    expect(result.current.languageOptions).toEqual([
      { key: "en", label: t("settings.langEn"), selected: false },
      { key: "pt-BR", label: t("settings.langPtBr"), selected: false },
      { key: "ja", label: t("settings.langJa"), selected: true },
    ]);
  });

  it("troca o idioma e fecha a folha", () => {
    const { result } = setup();
    hookAct(() => result.current.items[0].onPress());
    hookAct(() => result.current.selectLanguage("pt-BR"));
    expect(useLanguageStore.getState().language).toBe("pt-BR");
    expect(result.current.isLanguageSheetOpen).toBe(false);
  });

  it("fecha a folha sem trocar o idioma", () => {
    const { result } = setup();
    hookAct(() => result.current.items[0].onPress());
    hookAct(() => result.current.closeLanguageSheet());
    expect(result.current.isLanguageSheetOpen).toBe(false);
    expect(useLanguageStore.getState().language).toBe("en");
  });
});

describe("useSettings — sair", () => {
  it("encerra a sessao e leva para o login", async () => {
    const { result } = setup();
    await hookAct(async () => result.current.items[4].onPress());
    expect(storeSignOut).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });
});

describe("useSettings — excluir conta", () => {
  it("o dialogo comeca fechado", () => {
    const { result } = setup();
    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(result.current.isDeletingAccount).toBe(false);
  });

  it("pede confirmacao antes de excluir", () => {
    const { result } = setup();
    hookAct(() => result.current.items[5].onPress());
    expect(result.current.isDeleteConfirmOpen).toBe(true);
    expect(del).not.toHaveBeenCalled();
  });

  it("exclui, encerra a sessao e leva para o login", async () => {
    const { result } = setup();
    hookAct(() => result.current.items[5].onPress());
    await hookAct(async () => result.current.confirmDeleteAccount());
    expect(del).toHaveBeenCalledTimes(1);
    expect(storeSignOut).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("avisa e nao encerra a sessao quando a exclusao falha", async () => {
    del.mockRejectedValue(new Error("not authorized"));
    const { result } = setup();
    await hookAct(async () => result.current.confirmDeleteAccount());
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("settings.deleteAccountError"),
    });
    expect(storeSignOut).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("fecha o dialogo mesmo quando a exclusao falha", async () => {
    del.mockRejectedValue(new Error("boom"));
    const { result } = setup();
    hookAct(() => result.current.items[5].onPress());
    await hookAct(async () => result.current.confirmDeleteAccount());
    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(result.current.isDeletingAccount).toBe(false);
  });

  it("fecha o dialogo ao cancelar, sem excluir", () => {
    const { result } = setup();
    hookAct(() => result.current.items[5].onPress());
    hookAct(() => result.current.closeDeleteConfirm());
    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(del).not.toHaveBeenCalled();
  });

  it("troca o rotulo e neutraliza o toque durante a exclusao", async () => {
    let resolver: (v: unknown) => void = () => {};
    del.mockImplementation(() => new Promise((r) => (resolver = r)));

    const { result } = setup();
    hookAct(() => {
      void result.current.confirmDeleteAccount();
    });

    await rhWaitFor(() => expect(result.current.isDeletingAccount).toBe(true));
    expect(result.current.items[5].label).toBe(t("settings.deleteAccountInProgress"));

    // Enquanto exclui, o item vira no-op: tocar não reabre o diálogo.
    hookAct(() => result.current.items[5].onPress());
    expect(result.current.isDeleteConfirmOpen).toBe(false);

    await hookAct(async () => resolver(undefined));
  });

  it("expoe os textos do dialogo de confirmacao", () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
      deleteConfirmTitle: t("settings.deleteAccountConfirmTitle"),
      deleteConfirmMessage: t("settings.deleteAccountConfirmMessage"),
      deleteConfirmCancelLabel: t("common.cancel"),
      deleteConfirmButtonLabel: t("settings.deleteAccountConfirmButton"),
      languageSheetTitle: t("settings.language"),
      languageSheetCancelLabel: t("common.cancel"),
    });
  });
});

describe("Settings — tela", () => {
  it("lista todos os itens", () => {
    render(<Settings />);
    for (const label of [
      t("settings.language"),
      t("signup.privacyPolicy"),
      t("signup.termsOfUse"),
      t("settings.support"),
      t("settings.signOut"),
      t("settings.deleteAccount"),
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it("mostra o idioma atual ao lado do item", () => {
    render(<Settings />);
    expect(screen.getByText(t("settings.langEn"))).toBeTruthy();
  });

  it("colore de vermelho os itens destrutivos", () => {
    render(<Settings />);
    expect(JSON.stringify(screen.getByText(t("settings.signOut")).props.style)).toContain(
      Brand.danger,
    );
    expect(JSON.stringify(screen.getByText(t("settings.language")).props.style)).not.toContain(
      Brand.danger,
    );
  });

  it("mostra chevron so nos itens nao destrutivos", () => {
    render(<Settings />);
    const chevrons = screen
      .UNSAFE_getAllByType(require("@ui-kitten/components").Icon)
      .filter((i) => i.props.name === "chevron-right-outline");
    expect(chevrons).toHaveLength(4);
  });

  it("abre a folha de idiomas ao tocar", () => {
    render(<Settings />);
    fireEvent.press(screen.getByText(t("settings.language")));
    expect(screen.getByText(t("settings.langPtBr"))).toBeTruthy();
    expect(screen.getByText(t("settings.langJa"))).toBeTruthy();
  });

  it("troca o idioma pela folha", () => {
    render(<Settings />);
    fireEvent.press(screen.getByText(t("settings.language")));
    fireEvent.press(screen.getByText(t("settings.langPtBr")));
    expect(useLanguageStore.getState().language).toBe("pt-BR");
  });

  it("abre o dialogo de exclusao ao tocar em excluir conta", () => {
    render(<Settings />);
    fireEvent.press(screen.getByText(t("settings.deleteAccount")));
    // Em inglês o item da lista e o título do diálogo têm o mesmo texto.
    expect(screen.getAllByText(t("settings.deleteAccountConfirmTitle"))).toHaveLength(2);
    expect(screen.getByText(t("settings.deleteAccountConfirmMessage"))).toBeTruthy();
  });

  it("exclui a conta ao confirmar", async () => {
    render(<Settings />);
    fireEvent.press(screen.getByText(t("settings.deleteAccount")));
    await act(async () => {
      fireEvent.press(screen.getByText(t("settings.deleteAccountConfirmButton")));
    });
    expect(del).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("cancela a exclusao sem chamar o processo", () => {
    render(<Settings />);
    fireEvent.press(screen.getByText(t("settings.deleteAccount")));
    fireEvent.press(screen.getByText(t("common.cancel")));
    expect(del).not.toHaveBeenCalled();
  });

  it("encerra a sessao pelo item sair", async () => {
    render(<Settings />);
    await act(async () => {
      fireEvent.press(screen.getByText(t("settings.signOut")));
    });
    expect(storeSignOut).toHaveBeenCalledTimes(1);
  });

  it("abre a politica de privacidade no navegador", async () => {
    render(<Settings />);
    await act(async () => {
      fireEvent.press(screen.getByText(t("signup.privacyPolicy")));
    });
    expect(openBrowser).toHaveBeenCalledWith(LegalUrls.privacyPolicy);
  });
});

describe("Settings — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos em %s", (lang) => {
    useLanguageStore.setState({ language: lang as any });
    render(<Settings />, { language: lang });
    const rotulo = i18n.t("settings.support", { lng: lang });
    expect(rotulo).not.toBe("settings.support");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
