jest.mock("@/processes/auth", () => ({ signInWithGoogle: jest.fn() }));

import { renderHook, act, waitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { signInWithGoogle } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const signIn = signInWithGoogle as jest.Mock;
const user = { id: "u1", email: "a@b.com", name: "Joao" };

let storeSignIn: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  storeSignIn = jest.fn(async () => {});
  useAuthStore.setState({ signIn: storeSignIn as any });
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("useGoogleAuth", () => {
  it("comeca fora do estado de carregamento", () => {
    const { result } = renderHook(() => useGoogleAuth());
    expect(result.current.isLoading).toBe(false);
  });

  it("autentica na store quando o login retorna um usuario", async () => {
    signIn.mockResolvedValue({ token: "jwt", user });
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    expect(signIn).toHaveBeenCalled();
    expect(storeSignIn).toHaveBeenCalledWith(user);
  });

  it("nao mostra erro quando o usuario cancela — o processo devolve null", async () => {
    signIn.mockResolvedValue(null);
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    expect(storeSignIn).not.toHaveBeenCalled();
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it("mostra toast de erro quando o login falha", async () => {
    signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", autoHide: true }),
    );
    expect(storeSignIn).not.toHaveBeenCalled();
  });

  it("registra o erro no console para diagnostico", async () => {
    const erro = new Error("boom");
    signIn.mockRejectedValue(erro);
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    expect(console.error).toHaveBeenCalledWith("[Google Auth] error:", erro);
  });

  it("encerra o carregamento mesmo quando o login falha", async () => {
    signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("encerra o carregamento no caminho feliz", async () => {
    signIn.mockResolvedValue({ token: "jwt", user });
    const { result } = renderHook(() => useGoogleAuth());

    await act(() => result.current.onGoogleSignIn());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("mantem a mesma funcao entre renders, para nao remontar o botao", () => {
    const { result, rerender } = renderHook(() => useGoogleAuth());
    const first = result.current.onGoogleSignIn;
    rerender({});
    expect(result.current.onGoogleSignIn).toBe(first);
  });
});
