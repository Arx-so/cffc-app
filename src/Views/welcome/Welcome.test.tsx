jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Button = (props: any) => React.createElement(View, { ...props, testID: "AppleButton" });
  Button.displayName = "AppleAuthenticationButton";
  return {
    AppleAuthenticationButton: Button,
    AppleAuthenticationButtonType: { SIGN_IN: "SIGN_IN" },
    AppleAuthenticationButtonStyle: { WHITE: "WHITE" },
    AppleAuthenticationScope: { FULL_NAME: "FULL_NAME", EMAIL: "EMAIL" },
    signInAsync: jest.fn(),
  };
});
jest.mock("@/hooks/useGoogleAuth", () => ({ useGoogleAuth: jest.fn() }));
jest.mock("@/hooks/useAppleAuth", () => ({ useAppleAuth: jest.fn() }));

import React from "react";
import { ActivityIndicator, Platform } from "react-native";
import { renderHook } from "@testing-library/react-native";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import Welcome from "@/Views/welcome/Welcome";
import { useWelcome } from "@/Views/welcome/useWelcome";
import { mockRouter, resetMockRouter } from "@/test/router";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const onGoogleSignIn = jest.fn();
const onAppleSignIn = jest.fn();

const setHooks = (over: { googleLoading?: boolean; appleLoading?: boolean } = {}) => {
  (useGoogleAuth as jest.Mock).mockReturnValue({
    onGoogleSignIn,
    isLoading: over.googleLoading ?? false,
  });
  (useAppleAuth as jest.Mock).mockReturnValue({
    onAppleSignIn,
    isLoading: over.appleLoading ?? false,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  setHooks();
});

describe("useWelcome", () => {
  it("navega para o login", () => {
    const { result } = renderHook(() => useWelcome());
    result.current.onLoginPress();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("navega para o cadastro", () => {
    const { result } = renderHook(() => useWelcome());
    result.current.onSignupPress();
    expect(mockRouter.push).toHaveBeenCalledWith("/signup");
  });

  it("mantem as funcoes estaveis entre renders", () => {
    const { result, rerender } = renderHook(() => useWelcome());
    const first = result.current;
    rerender({});
    expect(result.current.onLoginPress).toBe(first.onLoginPress);
    expect(result.current.onSignupPress).toBe(first.onSignupPress);
  });
});

describe("Welcome — conteudo", () => {
  it("mostra a marca e a chamada principal", () => {
    render(<Welcome />);
    expect(screen.getByText(t("welcome.brandName"))).toBeTruthy();
    expect(screen.getByText(t("welcome.heroSubtitle"))).toBeTruthy();
    expect(screen.getByText(t("welcome.heroTitleHighlight"))).toBeTruthy();
    expect(screen.getByText(t("welcome.tagline"))).toBeTruthy();
  });

  it("esconde o cabecalho de navegacao", () => {
    const { UNSAFE_root } = render(<Welcome />);
    const { findScreens } = require("@/test/navigation");
    expect(findScreens(UNSAFE_root, "Stack")[0].options).toEqual({ headerShown: false });
  });

  it("oferece entrar e criar conta", () => {
    render(<Welcome />);
    expect(screen.getByText(t("welcome.signIn"))).toBeTruthy();
    expect(screen.getByText(t("auth.createAccount"))).toBeTruthy();
    expect(screen.getByText(t("welcome.noAccountPrefix"))).toBeTruthy();
  });
});

describe("Welcome — navegacao", () => {
  it("vai para o login pelo botao principal", () => {
    render(<Welcome />);
    fireEvent.press(screen.getByText(t("welcome.signIn")));
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("vai para o cadastro", () => {
    render(<Welcome />);
    fireEvent.press(screen.getByText(t("auth.createAccount")));
    expect(mockRouter.push).toHaveBeenCalledWith("/signup");
  });
});

describe("Welcome — login com Google", () => {
  it("dispara o login ao tocar", () => {
    render(<Welcome />);
    fireEvent.press(screen.getByText(t("welcome.googleButton")));
    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it("troca o rotulo por um indicador enquanto carrega", () => {
    setHooks({ googleLoading: true });
    render(<Welcome />);
    expect(screen.queryByText(t("welcome.googleButton"))).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("bloqueia toque repetido enquanto carrega", () => {
    setHooks({ googleLoading: true });
    render(<Welcome />);
    fireEvent.press(screen.UNSAFE_getByType(ActivityIndicator));
    expect(onGoogleSignIn).not.toHaveBeenCalled();
  });
});

describe("Welcome — login com Apple", () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalOS, configurable: true });
  });
  const setOS = (os: string) =>
    Object.defineProperty(Platform, "OS", { value: os, configurable: true });

  it("mostra o botao da Apple no iOS", () => {
    setOS("ios");
    render(<Welcome />);
    expect(screen.getByTestId("AppleButton")).toBeTruthy();
  });

  it("nao mostra o botao da Apple no Android", () => {
    setOS("android");
    render(<Welcome />);
    expect(screen.queryByTestId("AppleButton")).toBeNull();
  });

  it("dispara o login da Apple", () => {
    setOS("ios");
    render(<Welcome />);
    screen.getByTestId("AppleButton").props.onPress();
    expect(onAppleSignIn).toHaveBeenCalledTimes(1);
  });

  it("bloqueia o toque enquanto carrega", () => {
    setOS("ios");
    setHooks({ appleLoading: true });
    const { UNSAFE_root } = render(<Welcome />);
    const wrap = UNSAFE_root
      .findAll(() => true, { deep: true })
      .find((n) => typeof n.type === "string" && n.props?.pointerEvents === "none" && n.props?.style);
    expect(wrap).toBeTruthy();
  });
});

describe("Welcome — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<Welcome />, { language: lang });
    const texto = i18n.t("welcome.signIn", { lng: lang });
    expect(texto).not.toBe("welcome.signIn");
    expect(screen.getByText(texto)).toBeTruthy();
  });
});
