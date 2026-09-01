jest.mock("@/processes/auth", () => ({ requestPasswordReset: jest.fn() }));

/**
 * Os ramos de `isLoading` na tela são estado transitório: afirmá-los depois de um
 * `fireEvent` é uma corrida (e deixa promessa pendurada). Aqui o hook real roda
 * por padrão, e um teste pode substituí-lo para fixar o estado que quer exercitar.
 */
// O nome precisa comecar com `mock`: o babel-jest so permite variaveis assim
// dentro do factory de `jest.mock`, que e icado acima das declaracoes.
let mockHookOverride: Record<string, unknown> | null = null;
jest.mock("@/Views/ForgotPassword/useForgotPassword", () => {
  // `requireActual` resolvido uma vez, fora do caminho de cada render.
  const actual = jest.requireActual("@/Views/ForgotPassword/useForgotPassword");
  return {
    useForgotPassword: () => mockHookOverride ?? actual.useForgotPassword(),
  };
});

import React from "react";
import { ActivityIndicator, TextInput } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act as hookAct, waitFor as rhWaitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import {
  render,
  screen,
  fireEvent,
  act,
  makeTestQueryClient,
} from "@/test/renderWithProviders";
import { requestPasswordReset } from "@/processes/auth";
import ForgotPassword from "@/Views/ForgotPassword/ForgotPassword";
import { useForgotPassword } from "@/Views/ForgotPassword/useForgotPassword";
import { mockRouter, resetMockRouter } from "@/test/router";
import { findScreens } from "@/test/navigation";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const reset = requestPasswordReset as jest.Mock;
const toast = Toast.show as jest.Mock;

const wrapper = ({ children }: any) => (
  <QueryClientProvider client={makeTestQueryClient()}>{children}</QueryClientProvider>
);

const setup = () => {
  const hook = renderHook(() => useForgotPassword(), { wrapper });
  return hook;
};

const submitWith = async (email: string) => {
  const { result } = setup();
  hookAct(() => result.current.setEmail(email));
  await hookAct(async () => result.current.onSubmitPress());
  return result;
};

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  reset.mockReset().mockResolvedValue(undefined);
  mockHookOverride = null;
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useForgotPassword — validacao", () => {
  it("comeca vazio, sem email enviado e sem carregar", () => {
    const { result } = setup();
    expect(result.current).toMatchObject({ email: "", emailSent: false, isLoading: false });
  });

  it.each([
    ["vazio", ""],
    ["so espacos", "   "],
  ])("recusa email %s e avisa, sem chamar o processo", async (_l, email) => {
    await submitWith(email);
    expect(reset).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("forgotPassword.toasts.missingEmail"),
      autoHide: true,
    });
  });

  it.each([
    ["sem arroba", "joaoteste.com"],
    ["sem dominio", "joao@"],
    ["sem tld", "joao@teste"],
    ["com espaco", "joao teste@x.com"],
    ["so arroba", "@"],
    ["dois arrobas", "a@b@c.com"],
  ])("recusa email invalido (%s)", async (_l, email) => {
    await submitWith(email);
    expect(reset).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      type: "error",
      text1: t("forgotPassword.toasts.invalidEmail"),
      autoHide: true,
    });
  });

  it.each(["joao@teste.com", "a.b+tag@sub.dominio.com.br"])(
    "aceita o email valido %s",
    async (email) => {
      await submitWith(email);
      expect(reset).toHaveBeenCalledWith(email);
    },
  );

  it("normaliza o email: sem espacos e em minusculo", async () => {
    await submitWith("  Joao@Teste.COM  ");
    expect(reset).toHaveBeenCalledWith("joao@teste.com");
  });
});

describe("useForgotPassword — envio", () => {
  it("marca como enviado no sucesso", async () => {
    const result = await submitWith("joao@teste.com");
    await rhWaitFor(() => expect(result.current.emailSent).toBe(true));
  });

  it("nao marca como enviado quando falha", async () => {
    reset.mockRejectedValue(new Error("rate limited"));
    const result = await submitWith("joao@teste.com");
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "error",
        text1: "rate limited",
        autoHide: true,
      }),
    );
    expect(result.current.emailSent).toBe(false);
  });

  it("cai na mensagem generica quando o erro nao e uma Error", async () => {
    reset.mockRejectedValue("falha crua");
    await submitWith("joao@teste.com");
    await rhWaitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "error",
        text1: t("forgotPassword.toasts.requestFailed"),
        autoHide: true,
      }),
    );
  });

  it("expoe isLoading enquanto a requisicao esta pendente", async () => {
    let resolver: (v: unknown) => void = () => {};
    reset.mockImplementation(() => new Promise((r) => (resolver = r)));

    const { result } = setup();
    hookAct(() => result.current.setEmail("joao@teste.com"));
    hookAct(() => result.current.onSubmitPress());

    await rhWaitFor(() => expect(result.current.isLoading).toBe(true));
    await hookAct(async () => resolver(undefined));
    await rhWaitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

describe("useForgotPassword — reenvio e volta", () => {
  it("confirma o reenvio e dispara a requisicao de novo", async () => {
    const { result } = setup();
    hookAct(() => result.current.setEmail("joao@teste.com"));
    await hookAct(async () => result.current.onResendPress());

    expect(toast).toHaveBeenCalledWith({
      type: "success",
      text1: t("forgotPassword.toasts.emailResent"),
      autoHide: true,
    });
    expect(reset).toHaveBeenCalledWith("joao@teste.com");
  });

  it("o reenvio ainda valida o email", async () => {
    const { result } = setup();
    hookAct(() => result.current.setEmail("invalido"));
    await hookAct(async () => result.current.onResendPress());
    expect(reset).not.toHaveBeenCalled();
  });

  it("volta na pilha quando ha para onde voltar", () => {
    mockRouter.canGoBack.mockReturnValue(true);
    const { result } = setup();
    hookAct(() => result.current.onBackToLoginPress());
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("vai direto para o login quando a pilha esta vazia (aberto por deep link)", () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const { result } = setup();
    hookAct(() => result.current.onBackToLoginPress());
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});

describe("ForgotPassword — formulario", () => {
  const input = () => screen.UNSAFE_getByType(TextInput);

  it("mostra a chamada, a descricao e o campo de email", () => {
    render(<ForgotPassword />);
    expect(screen.getByText(t("forgotPassword.heroSubtitle"))).toBeTruthy();
    expect(screen.getByText(t("forgotPassword.heroTitleHighlight"))).toBeTruthy();
    expect(screen.getByText(t("forgotPassword.description"))).toBeTruthy();
    expect(screen.getByText(t("auth.email"))).toBeTruthy();
  });

  it("configura o campo para endereco de email, sem correcao automatica", () => {
    render(<ForgotPassword />);
    expect(input().props).toMatchObject({
      keyboardType: "email-address",
      autoCapitalize: "none",
      autoCorrect: false,
      textContentType: "emailAddress",
      returnKeyType: "send",
    });
  });

  it("envia pelo botao", async () => {
    render(<ForgotPassword />);
    fireEvent.changeText(input(), "joao@teste.com");
    await act(async () => {
      fireEvent.press(screen.getByText(`${t("forgotPassword.submitButton")} →`));
    });
    expect(reset).toHaveBeenCalledWith("joao@teste.com");
  });

  it("envia pelo teclado, sem precisar tocar no botao", async () => {
    render(<ForgotPassword />);
    fireEvent.changeText(input(), "joao@teste.com");
    await act(async () => {
      fireEvent(input(), "submitEditing");
    });
    expect(reset).toHaveBeenCalledWith("joao@teste.com");
  });

  it("define o titulo da tela na navegacao", () => {
    const { UNSAFE_root } = render(<ForgotPassword />);
    expect(findScreens(UNSAFE_root, "Stack")[0].options.title).toBe(t("forgotPassword.title"));
  });

  it("volta para o login pelo link do rodape", () => {
    mockRouter.canGoBack.mockReturnValue(true);
    render(<ForgotPassword />);
    fireEvent.press(screen.getByText(t("forgotPassword.rememberedPrefix"), { exact: false }));
    expect(mockRouter.back).toHaveBeenCalled();
  });
});

describe("ForgotPassword — tela de sucesso", () => {
  const enviar = async () => {
    render(<ForgotPassword />);
    fireEvent.changeText(screen.UNSAFE_getByType(TextInput), "  Joao@Teste.COM ");
    await act(async () => {
      fireEvent.press(screen.getByText(`${t("forgotPassword.submitButton")} →`));
    });
  };

  it("troca o formulario pela confirmacao apos o envio", async () => {
    await enviar();
    expect(screen.getByText(t("forgotPassword.successTitle"))).toBeTruthy();
    expect(screen.queryByText(t("forgotPassword.description"))).toBeNull();
  });

  it("mostra o email normalizado que recebeu a mensagem", async () => {
    await enviar();
    expect(screen.getByText("joao@teste.com")).toBeTruthy();
  });

  it("oferece voltar ao login e reenviar", async () => {
    await enviar();
    expect(screen.getByText(t("forgotPassword.backToLogin"))).toBeTruthy();
    expect(screen.getByText(t("forgotPassword.resendEmail"))).toBeTruthy();
  });

  it("reenvia ao tocar", async () => {
    await enviar();
    reset.mockClear();
    await act(async () => {
      fireEvent.press(screen.getByText(t("forgotPassword.resendEmail")));
    });
    expect(reset).toHaveBeenCalledWith("joao@teste.com");
  });

  it("volta ao login pelo botao principal", async () => {
    mockRouter.canGoBack.mockReturnValue(true);
    await enviar();
    fireEvent.press(screen.getByText(t("forgotPassword.backToLogin")));
    expect(mockRouter.back).toHaveBeenCalled();
  });

});

describe("ForgotPassword — estados de carregamento", () => {
  const comEstado = (over: Record<string, unknown>) => {
    mockHookOverride = {
      email: "joao@teste.com",
      setEmail: jest.fn(),
      emailSent: false,
      onSubmitPress: jest.fn(),
      onResendPress: jest.fn(),
      onBackToLoginPress: jest.fn(),
      isLoading: false,
      ...over,
    };
    return render(<ForgotPassword />);
  };

  it("troca o rotulo de enviar por um indicador", () => {
    comEstado({ isLoading: true });
    expect(screen.queryByText(`${t("forgotPassword.submitButton")} →`)).toBeNull();
    expect(screen.UNSAFE_getAllByType(ActivityIndicator).length).toBe(1);
  });

  it("bloqueia o campo de email durante o envio", () => {
    comEstado({ isLoading: true });
    expect(screen.UNSAFE_getByType(TextInput).props.editable).toBe(false);
  });

  it("nao dispara o envio quando o botao esta desabilitado", () => {
    const onSubmitPress = jest.fn();
    comEstado({ isLoading: true, onSubmitPress });
    fireEvent.press(screen.UNSAFE_getAllByType(ActivityIndicator)[0]);
    expect(onSubmitPress).not.toHaveBeenCalled();
  });

  it("troca o rotulo de reenviar por um indicador na tela de sucesso", () => {
    comEstado({ isLoading: true, emailSent: true });
    expect(screen.queryByText(t("forgotPassword.resendEmail"))).toBeNull();
    expect(screen.UNSAFE_getAllByType(ActivityIndicator).length).toBe(1);
  });

  it("nao reenvia quando o botao esta desabilitado", () => {
    const onResendPress = jest.fn();
    comEstado({ isLoading: true, emailSent: true, onResendPress });
    fireEvent.press(screen.UNSAFE_getAllByType(ActivityIndicator)[0]);
    expect(onResendPress).not.toHaveBeenCalled();
  });
});

describe("ForgotPassword — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<ForgotPassword />, { language: lang });
    const texto = i18n.t("forgotPassword.description", { lng: lang });
    expect(texto).not.toBe("forgotPassword.description");
    expect(screen.getByText(texto)).toBeTruthy();
  });
});
