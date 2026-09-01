jest.mock("@/processes/auth", () => ({ login: jest.fn() }));
jest.mock("@/hooks/useGoogleAuth", () => ({ useGoogleAuth: jest.fn() }));
jest.mock("@/hooks/useAppleAuth", () => ({ useAppleAuth: jest.fn() }));
jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Button = (props: any) => React.createElement(View, { ...props, testID: "AppleButton" });
  Button.displayName = "AppleAuthenticationButton";
  return {
    AppleAuthenticationButton: Button,
    AppleAuthenticationButtonType: { SIGN_IN: "SIGN_IN" },
    AppleAuthenticationButtonStyle: { WHITE: "WHITE" },
  };
});

import React from "react";
import { ActivityIndicator, Platform, TextInput } from "react-native";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import {
  render,
  screen,
  fireEvent,
  act,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import { login } from "@/processes/auth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useAuthStore } from "@/stores/authStore";
import Login from "@/Views/Login/Login";
import { useLogin } from "@/Views/Login/useLogin";
import { mockRouter, resetMockRouter } from "@/test/router";
import { findScreens } from "@/test/navigation";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const loginProcess = login as jest.Mock;
const toast = Toast.show as jest.Mock;
const onGoogleSignIn = jest.fn();
const onAppleSignIn = jest.fn();
let storeSignIn: jest.Mock;

// `makeTestQueryClient` zera o gcTime; um client com o default deixa timers de
// coleta pendurados e o worker do jest não encerra sozinho.
const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);

const setSocialHooks = (over: { googleLoading?: boolean; appleLoading?: boolean } = {}) => {
  (useGoogleAuth as jest.Mock).mockReturnValue({
    onGoogleSignIn,
    isLoading: over.googleLoading ?? false,
  });
  (useAppleAuth as jest.Mock).mockReturnValue({
    onAppleSignIn,
    isLoading: over.appleLoading ?? false,
  });
};

const session = { token: "jwt", user: { id: "u1", email: "a@b.com", name: "Joao" } };

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  setSocialHooks();
  // mockReset, não clearAllMocks: implementações setadas por um teste (promessa
  // pendente) vazariam para o seguinte e o deixariam falhando por ordem.
  loginProcess.mockReset().mockResolvedValue(session);
  storeSignIn = jest.fn(async () => {});
  useAuthStore.setState({ signIn: storeSignIn as any });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useLogin", () => {
  it("comeca com os campos vazios e sem carregar", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    expect(result.current).toMatchObject({ email: "", password: "", isLoading: false });
  });

  it("normaliza o email antes de enviar: sem espacos e em minusculo", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("  Joao@Teste.COM  ");
      result.current.setPassword("s3nha");
    });
    await hookAct(() => result.current.onLoginPress());
    expect(loginProcess).toHaveBeenCalledWith({ email: "joao@teste.com", password: "s3nha" });
  });

  it("nao normaliza a senha", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("  S3nha  ");
    });
    await hookAct(() => result.current.onLoginPress());
    expect(loginProcess).toHaveBeenCalledWith(expect.objectContaining({ password: "  S3nha  " }));
  });

  it("autentica na store com o usuario retornado", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("s3nha");
    });
    await hookAct(() => result.current.onLoginPress());
    await rhWaitFor(() => expect(storeSignIn).toHaveBeenCalledWith(session.user));
  });

  it.each([
    ["email vazio", "", "s3nha"],
    ["email so espacos", "   ", "s3nha"],
    ["senha vazia", "a@b.com", ""],
    ["ambos vazios", "", ""],
  ])("recusa e avisa quando %s, sem chamar o processo", async (_l, email, password) => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail(email);
      result.current.setPassword(password);
    });
    await hookAct(() => result.current.onLoginPress());
    expect(loginProcess).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("login.toasts.missingCredentials"),
      autoHide: true,
    });
  });

  it("mostra a mensagem real do erro de autenticacao", async () => {
    loginProcess.mockRejectedValue(new Error("Invalid login credentials"));
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("errada");
    });
    await hookAct(async () => {
      await result.current.onLoginPress().catch(() => {});
    });
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: "Invalid login credentials",
      autoHide: true,
    });
  });

  it("cai na mensagem generica quando o erro nao e uma Error", async () => {
    loginProcess.mockRejectedValue("falha crua");
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("x");
    });
    await hookAct(async () => {
      await result.current.onLoginPress().catch(() => {});
    });
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("login.toasts.loginFailed"),
      autoHide: true,
    });
  });

  it("expoe isLoading enquanto a mutacao esta pendente", async () => {
    let resolver: (v: unknown) => void = () => {};
    loginProcess.mockImplementation(() => new Promise((r) => (resolver = r)));

    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("s3nha");
    });
    hookAct(() => {
      void result.current.onLoginPress();
    });

    await rhWaitFor(() => expect(result.current.isLoading).toBe(true));

    await hookAct(async () => resolver(session));
    await rhWaitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("nao autentica na store quando o login falha", async () => {
    loginProcess.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useLogin(), { wrapper });
    hookAct(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("x");
    });
    await hookAct(async () => {
      await result.current.onLoginPress().catch(() => {});
    });
    expect(storeSignIn).not.toHaveBeenCalled();
  });
});

describe("Login — formulario", () => {
  const inputs = () => screen.UNSAFE_getAllByType(TextInput);

  it("mostra a chamada e os rotulos dos campos", () => {
    render(<Login />);
    expect(screen.getByText(t("login.heroSubtitle"))).toBeTruthy();
    expect(screen.getByText(t("login.heroTitleHighlight"))).toBeTruthy();
    expect(screen.getByText(t("auth.email"))).toBeTruthy();
    expect(screen.getByText(t("auth.password"))).toBeTruthy();
  });

  it("configura o campo de email para endereco, sem autocapitalizar", () => {
    render(<Login />);
    expect(inputs()[0].props).toMatchObject({
      keyboardType: "email-address",
      autoCapitalize: "none",
      textContentType: "emailAddress",
      placeholder: t("auth.emailPlaceholder"),
    });
  });

  it("esconde a senha por padrao", () => {
    render(<Login />);
    expect(inputs()[1].props.secureTextEntry).toBe(true);
  });

  it("revela e esconde a senha pelo olho", () => {
    render(<Login />);
    const olho = screen.UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)[0];
    expect(olho.props.name).toBe("eye-outline");
    fireEvent.press(olho.parent!);
    expect(inputs()[1].props.secureTextEntry).toBe(false);
  });

  it("guarda o que o usuario digita", () => {
    render(<Login />);
    fireEvent.changeText(inputs()[0], "a@b.com");
    fireEvent.changeText(inputs()[1], "s3nha");
    expect(inputs()[0].props.value).toBe("a@b.com");
    expect(inputs()[1].props.value).toBe("s3nha");
  });

  it("define o titulo da tela na navegacao", () => {
    const { UNSAFE_root } = render(<Login />);
    expect(findScreens(UNSAFE_root, "Stack")[0].options.title).toBe(t("login.title"));
  });
});

describe("Login — submissao", () => {
  it("envia as credenciais normalizadas", async () => {
    render(<Login />);
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "  A@B.com ");
    fireEvent.changeText(inputs[1], "s3nha");
    await act(async () => {
      fireEvent.press(screen.getByText(`${t("login.submitButton")} →`));
    });
    expect(loginProcess).toHaveBeenCalledWith({ email: "a@b.com", password: "s3nha" });
  });



  // `busy` combina três fontes. A do próprio login é coberta no hook (isLoading);
  // aqui ficam as duas sociais, que são props e portanto determinísticas.
  it("mantem os campos editaveis quando nada esta em andamento", () => {
    render(<Login />);
    expect(screen.UNSAFE_getAllByType(TextInput)[0].props.editable).toBe(true);
  });

  it.each([
    ["login com Google em andamento", { googleLoading: true }],
    ["login com Apple em andamento", { appleLoading: true }],
  ])("bloqueia os campos quando ha %s", (_l, over) => {
    setSocialHooks(over);
    render(<Login />);
    for (const input of screen.UNSAFE_getAllByType(TextInput)) {
      expect(input.props.editable).toBe(false);
    }
  });

  it("desabilita o botao de enviar quando ha login social em andamento", () => {
    setSocialHooks({ googleLoading: true });
    render(<Login />);
    fireEvent.press(screen.getByText(`${t("login.submitButton")} →`));
    expect(loginProcess).not.toHaveBeenCalled();
  });
});

describe("Login — social e navegacao", () => {
  it("dispara o login com Google", () => {
    render(<Login />);
    fireEvent.press(screen.getByText(t("login.googleButton")));
    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it("troca o rotulo do Google por indicador enquanto carrega", () => {
    setSocialHooks({ googleLoading: true });
    render(<Login />);
    expect(screen.queryByText(t("login.googleButton"))).toBeNull();
  });

  const originalOS = Platform.OS;
  const setOS = (os: string) =>
    Object.defineProperty(Platform, "OS", { value: os, configurable: true });
  afterEach(() => setOS(originalOS));

  it("mostra o botao da Apple apenas no iOS", () => {
    setOS("ios");
    render(<Login />);
    expect(screen.getByTestId("AppleButton")).toBeTruthy();
    setOS("android");
    screen.rerender(<Login />);
    expect(screen.queryByTestId("AppleButton")).toBeNull();
  });

  it("dispara o login com Apple", () => {
    setOS("ios");
    render(<Login />);
    screen.getByTestId("AppleButton").props.onPress();
    expect(onAppleSignIn).toHaveBeenCalledTimes(1);
  });

  it("vai para recuperacao de senha", () => {
    render(<Login />);
    fireEvent.press(screen.getByText(t("login.forgotPassword")));
    expect(mockRouter.push).toHaveBeenCalledWith("/forgot-password");
  });

  it("vai para o cadastro", () => {
    render(<Login />);
    fireEvent.press(screen.getByText(t("auth.createAccount")));
    expect(mockRouter.push).toHaveBeenCalledWith("/signup");
  });

  it("nao navega enquanto ha login em andamento", () => {
    setSocialHooks({ googleLoading: true });
    render(<Login />);
    fireEvent.press(screen.getByText(t("login.forgotPassword")));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe("Login — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<Login />, { language: lang });
    const rotulo = i18n.t("auth.email", { lng: lang });
    expect(rotulo).not.toBe("auth.email");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
