jest.mock("@/processes/auth", () => ({ signInWithApple: jest.fn() }));

import { renderHook, act, waitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { signInWithApple } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useAppleAuth } from "@/hooks/useAppleAuth";

const signIn = signInWithApple as jest.Mock;
const user = { id: "u1", email: "a@b.com", name: "Joao" };

let storeSignIn: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  storeSignIn = jest.fn(async () => {});
  useAuthStore.setState({ signIn: storeSignIn as any });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useAppleAuth", () => {
  it("comeca fora do estado de carregamento", () => {
    const { result } = renderHook(() => useAppleAuth());
    expect(result.current.isLoading).toBe(false);
  });

  it("autentica na store quando o login retorna um usuario", async () => {
    signIn.mockResolvedValue({ token: "jwt", user });
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    expect(signIn).toHaveBeenCalled();
    expect(storeSignIn).toHaveBeenCalledWith(user);
  });

  it("nao mostra erro quando o usuario cancela — o processo devolve null", async () => {
    signIn.mockResolvedValue(null);
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    expect(storeSignIn).not.toHaveBeenCalled();
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it("mostra toast de erro quando o login falha", async () => {
    signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", autoHide: true }),
    );
    expect(storeSignIn).not.toHaveBeenCalled();
  });

  it("registra o erro no console para diagnostico", async () => {
    const erro = new Error("boom");
    signIn.mockRejectedValue(erro);
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    expect(console.error).toHaveBeenCalledWith("[Apple Auth] error:", erro);
  });

  it("encerra o carregamento mesmo quando o login falha", async () => {
    signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("encerra o carregamento no caminho feliz", async () => {
    signIn.mockResolvedValue({ token: "jwt", user });
    const { result } = renderHook(() => useAppleAuth());

    await act(() => result.current.onAppleSignIn());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("mantem a mesma funcao entre renders, para nao remontar o botao", () => {
    const { result, rerender } = renderHook(() => useAppleAuth());
    const first = result.current.onAppleSignIn;
    rerender({});
    expect(result.current.onAppleSignIn).toBe(first);
  });
});
