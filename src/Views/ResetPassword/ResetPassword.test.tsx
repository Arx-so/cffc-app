jest.mock("@/processes/auth", () => ({
  hasPasswordRecoveryParams: jest.fn(),
  startPasswordRecoverySession: jest.fn(),
  hasActiveAuthSession: jest.fn(),
  updatePassword: jest.fn(),
}));
jest.mock("expo-linking", () => ({ useURL: jest.fn() }));

/** Permite fixar o estado da tela sem depender do timer de resolução do link. */
let mockHookOverride: Record<string, unknown> | null = null;
jest.mock("@/Views/ResetPassword/useResetPassword", () => {
  const actual = jest.requireActual("@/Views/ResetPassword/useResetPassword");
  return { useResetPassword: () => mockHookOverride ?? actual.useResetPassword() };
});

import React from "react";
import { ActivityIndicator, TextInput } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";
import {
  render,
  screen,
  fireEvent,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import {
  hasPasswordRecoveryParams,
  startPasswordRecoverySession,
  hasActiveAuthSession,
  updatePassword,
} from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import ResetPassword from "@/Views/ResetPassword/ResetPassword";
import { useResetPassword } from "@/Views/ResetPassword/useResetPassword";
import { mockRouter, resetMockRouter } from "@/test/router";
import i18n from "@/config/i18n";

const t = (k: string, o?: any) => i18n.t(k, o);
const useURL = Linking.useURL as jest.Mock;
const hasParams = hasPasswordRecoveryParams as jest.Mock;
const startSession = startPasswordRecoverySession as jest.Mock;
const hasSession = hasActiveAuthSession as jest.Mock;
const update = updatePassword as jest.Mock;
const toast = Toast.show as jest.Mock;
let storeSignOut: jest.Mock;

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);
const setup = () => renderHook(() => useResetPassword(), { wrapper });

const LINK = "cffc://reset-password#access_token=at";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  resetMockRouter();
  i18n.changeLanguage("en");
  mockHookOverride = null;
  useURL.mockReturnValue(null);
  hasParams.mockReset().mockReturnValue(true);
  startSession.mockReset().mockResolvedValue(undefined);
  hasSession.mockReset().mockResolvedValue(false);
  update.mockReset().mockResolvedValue(undefined);
  storeSignOut = jest.fn(async () => {});
  useAuthStore.setState({ signOut: storeSignOut as any });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("useResetPassword — validacao do link", () => {
  it("comeca validando", () => {
    const { result } = setup();
    expect(result.current.status).toBe("validating");
  });

  it("abre a sessao de recuperacao com a url recebida", async () => {
    useURL.mockReturnValue(LINK);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("ready"));
    expect(startSession).toHaveBeenCalledWith(LINK);
  });

  it("nao consome a mesma url duas vezes — o token e de uso unico", async () => {
    useURL.mockReturnValue(LINK);
    const { result, rerender } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("ready"));
    rerender({});
    expect(startSession).toHaveBeenCalledTimes(1);
  });

  it("ignora url sem parametro de recuperacao", () => {
    useURL.mockReturnValue("cffc://outra-tela");
    hasParams.mockReturnValue(false);
    setup();
    expect(startSession).not.toHaveBeenCalled();
  });

  it("marca como invalido e guarda a mensagem quando o link falha", async () => {
    useURL.mockReturnValue(LINK);
    startSession.mockRejectedValue(new Error("Link expirou"));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("invalid"));
    expect(result.current.errorMessage).toBe("Link expirou");
  });

  it("nao expoe MISSING_RECOVERY_TOKEN ao usuario", async () => {
    useURL.mockReturnValue(LINK);
    startSession.mockRejectedValue(new Error("MISSING_RECOVERY_TOKEN"));
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("invalid"));
    expect(result.current.errorMessage).toBe("");
  });

  it("usa mensagem vazia quando o erro nao e uma Error", async () => {
    useURL.mockReturnValue(LINK);
    startSession.mockRejectedValue("falha crua");
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("invalid"));
    expect(result.current.errorMessage).toBe("");
  });
});

describe("useResetPassword — sem link resolvido", () => {
  it("aceita quando ja existe sessao de recuperacao ativa", async () => {
    hasSession.mockResolvedValue(true);
    const { result } = setup();
    await hookAct(async () => {
      jest.advanceTimersByTime(1200);
    });
    await rhWaitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("recusa quando nao ha link nem sessao ativa", async () => {
    hasSession.mockResolvedValue(false);
    const { result } = setup();
    await hookAct(async () => {
      jest.advanceTimersByTime(1200);
    });
    await rhWaitFor(() => expect(result.current.status).toBe("invalid"));
  });

  it("nao consulta a sessao quando o link ja foi tratado", async () => {
    useURL.mockReturnValue(LINK);
    const { result } = setup();
    await rhWaitFor(() => expect(result.current.status).toBe("ready"));
    await hookAct(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(hasSession).not.toHaveBeenCalled();
  });

  it("nao decide antes do periodo de graca", () => {
    const { result } = setup();
    hookAct(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.status).toBe("validating");
  });
});

describe("useResetPassword — validacao da senha", () => {
  const submeter = async (password: string, confirmPassword: string) => {
    const { result } = setup();
    hookAct(() => {
      result.current.setPassword(password);
      result.current.setConfirmPassword(confirmPassword);
    });
    await hookAct(async () => result.current.onSubmitPress());
    return result;
  };

  it.each([
    ["senha vazia", "", "s3nha1"],
    ["confirmacao vazia", "s3nha1", ""],
    ["ambas vazias", "", ""],
  ])("recusa %s", async (_l, a, b) => {
    await submeter(a, b);
    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("resetPassword.toasts.requiredFields"),
      autoHide: true,
    });
  });

  it("recusa senha com menos de 6 caracteres", async () => {
    await submeter("12345", "12345");
    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("resetPassword.toasts.passwordTooShort", { min: 6 }),
      autoHide: true,
    });
  });

  it("aceita senha com exatamente 6 caracteres", async () => {
    await submeter("123456", "123456");
    expect(update).toHaveBeenCalledWith("123456");
  });

  it("recusa quando a confirmacao nao bate", async () => {
    await submeter("s3nha1", "s3nha2");
    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("resetPassword.toasts.passwordMismatch"),
      autoHide: true,
    });
  });

  it("nao normaliza a senha", async () => {
    await submeter("  S3nha  ", "  S3nha  ");
    expect(update).toHaveBeenCalledWith("  S3nha  ");
  });
});

describe("useResetPassword — troca de senha", () => {
  const submeterValido = async () => {
    const { result } = setup();
    hookAct(() => {
      result.current.setPassword("nova-senha");
      result.current.setConfirmPassword("nova-senha");
    });
    await hookAct(async () => result.current.onSubmitPress());
    return result;
  };

  it("encerra a sessao e manda para o login apos trocar", async () => {
    await submeterValido();
    await rhWaitFor(() => expect(storeSignOut).toHaveBeenCalledTimes(1));
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("confirma com toast de sucesso", async () => {
    await submeterValido();
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "success",
        text1: t("resetPassword.toasts.passwordUpdated"),
        autoHide: true,
      }),
    );
  });

  it("mostra a mensagem real do erro e nao encerra a sessao", async () => {
    update.mockRejectedValue(new Error("Password should be at least 6 characters"));
    await submeterValido();
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "error",
        text1: "Password should be at least 6 characters",
        autoHide: true,
      }),
    );
    expect(storeSignOut).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("cai na mensagem generica quando o erro nao e uma Error", async () => {
    update.mockRejectedValue("falha crua");
    await submeterValido();
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "error",
        text1: t("resetPassword.toasts.updateFailed"),
        autoHide: true,
      }),
    );
  });
});

describe("useResetPassword — controles", () => {
  it("alterna a visibilidade da senha", () => {
    const { result } = setup();
    expect(result.current.showPassword).toBe(false);
    hookAct(() => result.current.toggleShowPassword());
    expect(result.current.showPassword).toBe(true);
    hookAct(() => result.current.toggleShowPassword());
    expect(result.current.showPassword).toBe(false);
  });

  it("leva para pedir um novo link", () => {
    const { result } = setup();
    hookAct(() => result.current.onRequestNewLinkPress());
    expect(mockRouter.replace).toHaveBeenCalledWith("/forgot-password");
  });
});

describe("ResetPassword — estados da tela", () => {
  const comEstado = (over: Record<string, unknown>) => {
    mockHookOverride = {
      status: "ready",
      errorMessage: "",
      password: "",
      confirmPassword: "",
      setPassword: jest.fn(),
      setConfirmPassword: jest.fn(),
      showPassword: false,
      toggleShowPassword: jest.fn(),
      onSubmitPress: jest.fn(),
      onRequestNewLinkPress: jest.fn(),
      isLoading: false,
      ...over,
    };
    return render(<ResetPassword />);
  };

  it("mostra o indicador enquanto valida o link", () => {
    comEstado({ status: "validating" });
    expect(screen.getByText(t("resetPassword.validating"))).toBeTruthy();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("mostra a descricao padrao quando o link e invalido sem mensagem", () => {
    comEstado({ status: "invalid" });
    expect(screen.getByText(t("resetPassword.invalidTitle"))).toBeTruthy();
    expect(screen.getByText(t("resetPassword.invalidDescription"))).toBeTruthy();
  });

  it("prefere a mensagem de erro real quando existe", () => {
    comEstado({ status: "invalid", errorMessage: "Link expirou" });
    expect(screen.getByText("Link expirou")).toBeTruthy();
    expect(screen.queryByText(t("resetPassword.invalidDescription"))).toBeNull();
  });

  it("oferece pedir um novo link no estado invalido", () => {
    const onRequestNewLinkPress = jest.fn();
    comEstado({ status: "invalid", onRequestNewLinkPress });
    fireEvent.press(screen.getByText(t("resetPassword.requestNewLink")));
    expect(onRequestNewLinkPress).toHaveBeenCalledTimes(1);
  });

  it("mostra o formulario quando o link e valido", () => {
    comEstado({});
    expect(screen.getByText(t("resetPassword.newPassword"))).toBeTruthy();
    expect(screen.getByText(t("auth.confirmPassword"))).toBeTruthy();
    expect(screen.getByText(t("resetPassword.passwordHint"))).toBeTruthy();
  });

  it("esconde as duas senhas por padrao", () => {
    comEstado({});
    for (const input of screen.UNSAFE_getAllByType(TextInput)) {
      expect(input.props.secureTextEntry).toBe(true);
    }
  });

  it("revela as duas senhas juntas", () => {
    comEstado({ showPassword: true });
    for (const input of screen.UNSAFE_getAllByType(TextInput)) {
      expect(input.props.secureTextEntry).toBe(false);
    }
  });

  it("alterna a visibilidade pelo olho", () => {
    const toggleShowPassword = jest.fn();
    comEstado({ toggleShowPassword });
    const olho = screen
      .UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)
      .find((i) => i.props.name === "eye-outline")!;
    fireEvent.press(olho.parent!);
    expect(toggleShowPassword).toHaveBeenCalledTimes(1);
  });

  it("envia pelo botao", () => {
    const onSubmitPress = jest.fn();
    comEstado({ onSubmitPress });
    fireEvent.press(screen.getByText(`${t("resetPassword.submitButton")} →`));
    expect(onSubmitPress).toHaveBeenCalledTimes(1);
  });

  it("envia pelo teclado no campo de confirmacao", () => {
    const onSubmitPress = jest.fn();
    comEstado({ onSubmitPress });
    fireEvent(screen.UNSAFE_getAllByType(TextInput)[1], "submitEditing");
    expect(onSubmitPress).toHaveBeenCalledTimes(1);
  });

  it("troca o rotulo por indicador e bloqueia os campos durante o envio", () => {
    comEstado({ isLoading: true });
    expect(screen.queryByText(`${t("resetPassword.submitButton")} →`)).toBeNull();
    expect(screen.UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
    for (const input of screen.UNSAFE_getAllByType(TextInput)) {
      expect(input.props.editable).toBe(false);
    }
  });

  it("nao envia quando o botao esta desabilitado", () => {
    const onSubmitPress = jest.fn();
    comEstado({ isLoading: true, onSubmitPress });
    fireEvent.press(screen.UNSAFE_getByType(ActivityIndicator));
    expect(onSubmitPress).not.toHaveBeenCalled();
  });

  it("propaga o que o usuario digita", () => {
    const setPassword = jest.fn();
    const setConfirmPassword = jest.fn();
    comEstado({ setPassword, setConfirmPassword });
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "nova");
    fireEvent.changeText(inputs[1], "nova");
    expect(setPassword).toHaveBeenCalledWith("nova");
    expect(setConfirmPassword).toHaveBeenCalledWith("nova");
  });
});

describe("ResetPassword — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    mockHookOverride = null;
    render(<ResetPassword />, { language: lang });
    const texto = i18n.t("resetPassword.validating", { lng: lang });
    expect(texto).not.toBe("resetPassword.validating");
    expect(screen.getByText(texto)).toBeTruthy();
  });
});
