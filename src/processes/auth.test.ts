jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/processes/profile", () => ({ applySignupRoleFromClient: jest.fn(async () => {}) }));
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(({ path }: { path?: string } = {}) =>
    path ? `cffc://${path}` : "cffc://",
  ),
}));
jest.mock("expo-web-browser", () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "raw-nonce"),
  digestStringAsync: jest.fn(async () => "hashed-nonce"),
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
}));
jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: "FULL_NAME", EMAIL: "EMAIL" },
}));

import { fail } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { applySignupRoleFromClient } from "@/processes/profile";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  hasPasswordRecoveryParams,
  login,
  signup,
  deleteAccount,
  signInWithGoogle,
  signInWithApple,
  getPasswordResetRedirectTo,
  requestPasswordReset,
  hasActiveAuthSession,
  startPasswordRecoverySession,
  updatePassword,
} from "@/processes/auth";

const openAuth = WebBrowser.openAuthSessionAsync as jest.Mock;
const appleSignIn = AppleAuthentication.signInAsync as jest.Mock;
const applyRole = applySignupRoleFromClient as jest.Mock;

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

describe("hasPasswordRecoveryParams", () => {
  it.each([
    ["access_token no fragmento", "cffc://reset#access_token=abc"],
    ["token_hash na query", "cffc://reset?token_hash=xyz"],
    ["code na query (PKCE)", "cffc://reset?code=123"],
    ["error", "cffc://reset?error=expired"],
    ["error_description", "cffc://reset?error_description=link%20expirou"],
  ])("reconhece %s", (_l, url) => {
    expect(hasPasswordRecoveryParams(url)).toBe(true);
  });

  it.each([
    ["url limpa", "cffc://reset-password"],
    ["query irrelevante", "cffc://reset?foo=bar"],
    ["fragmento vazio", "cffc://reset#"],
    ["parametro sem valor", "cffc://reset?access_token="],
  ])("nao reconhece %s", (_l, url) => {
    expect(hasPasswordRecoveryParams(url)).toBe(false);
  });

  it("le a query e o fragmento na mesma url", () => {
    expect(hasPasswordRecoveryParams("cffc://reset?foo=1#token_hash=abc")).toBe(true);
  });
});

describe("login", () => {
  const session = {
    data: {
      session: { access_token: "jwt" },
      user: { id: "u1", email: "a@b.com", user_metadata: { name: "Joao" } },
    },
    error: null,
  };

  it("devolve token e usuario no login bem sucedido", async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce(session as any);
    await expect(login({ email: "a@b.com", password: "s3nha" })).resolves.toEqual({
      token: "jwt",
      user: { id: "u1", email: "a@b.com", name: "Joao" },
    });
  });

  it("repassa email e senha ao Supabase", async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce(session as any);
    await login({ email: "a@b.com", password: "s3nha" });
    expect(mock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "s3nha",
    });
  });

  it("usa string vazia quando email ou nome vem ausentes", async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: { access_token: "jwt" }, user: { id: "u1", user_metadata: {} } },
      error: null,
    } as any);
    const res = await login({ email: "a@b.com", password: "x" });
    expect(res.user).toEqual({ id: "u1", email: "", name: "" });
  });

  it("propaga o erro de credencial invalida", async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce(fail("Invalid login credentials") as any);
    await expect(login({ email: "a@b.com", password: "errada" })).rejects.toMatchObject({
      message: "Invalid login credentials",
    });
  });

  it.each([
    ["sem sessao", { session: null, user: { id: "u1" } }],
    ["sem usuario", { session: { access_token: "jwt" }, user: null }],
  ])("lanca Login failed quando a resposta vem %s", async (_l, data) => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({ data, error: null } as any);
    await expect(login({ email: "a@b.com", password: "x" })).rejects.toThrow("Login failed");
  });
});

describe("signup", () => {
  const body = {
    email: "a@b.com",
    password: "s3nha",
    name: "Joao",
    username: "joao",
    role: "athlete" as const,
    birthDate: "2008-05-01",
  };
  const resp = (over: Record<string, unknown> = {}) => ({
    data: {
      user: { id: "u1", email: "a@b.com", email_confirmed_at: null, ...(over.user as object) },
      session: (over.session as object) ?? null,
    },
    error: null,
  });

  const metadataOf = () => (mock.auth.signUp.mock.calls[0][0] as any).options.data;

  it("envia nome, username e role em aliases duplicados que a trigger aceita", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup(body);
    expect(metadataOf()).toMatchObject({
      name: "Joao",
      full_name: "Joao",
      username: "joao",
      user_name: "joao",
      role: "athlete",
      profile_role: "athlete",
      birth_date: "2008-05-01",
    });
  });

  it("normaliza o telefone para so digitos nos dois aliases", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup({ ...body, phone: "(11) 98765-4321" });
    expect(metadataOf()).toMatchObject({ phone: "11987654321", phone_number: "11987654321" });
  });

  it("envia telefone vazio quando nao informado", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup(body);
    expect(metadataOf().phone).toBe("");
  });

  it("aplica os defaults dos campos de atleta que ficaram em branco", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup(body);
    expect(metadataOf()).toMatchObject({
      guardian_email: "",
      city: "",
      state: "",
      state_prov: "",
      athlete_height: null,
      athlete_weight: null,
      athlete_dominant_foot: null,
      athlete_positions: [],
      athlete_strengths: [],
      athlete_current_category: "",
      athlete_availability: "",
      athlete_club_history: [],
      athlete_is_searchable: true,
      athlete_contact_visibility: "clubs_agents",
    });
  });

  it("preserva os campos de atleta quando informados", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup({
      ...body,
      athleteHeight: 180,
      athleteWeight: 75,
      athleteDominantFoot: "left",
      athletePositions: ["st"],
      athleteStrengths: ["speed"],
      athleteIsSearchable: false,
      athleteContactVisibility: "public",
    });
    expect(metadataOf()).toMatchObject({
      athlete_height: 180,
      athlete_weight: 75,
      athlete_dominant_foot: "left",
      athlete_positions: ["st"],
      athlete_strengths: ["speed"],
      athlete_is_searchable: false,
      athlete_contact_visibility: "public",
    });
  });

  it("preserva athlete_is_searchable false, sem cair no default true", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup({ ...body, athleteIsSearchable: false });
    expect(metadataOf().athlete_is_searchable).toBe(false);
  });

  it("envia o estado maiusculizado pelo chamador em ambos os aliases", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup({ ...body, state: "SP" });
    expect(metadataOf()).toMatchObject({ state: "SP", state_prov: "SP" });
  });

  it("corrige o role no banco quando ja ha sessao (confirmacao de email desativada)", async () => {
    mock.auth.signUp.mockResolvedValueOnce(
      resp({ session: { user: { id: "u1" }, access_token: "jwt" } }) as any,
    );
    await signup(body);
    expect(applyRole).toHaveBeenCalledWith("u1", "athlete");
  });

  it("nao corrige o role quando o cadastro ainda aguarda confirmacao de email", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await signup(body);
    expect(applyRole).not.toHaveBeenCalled();
  });

  it("devolve token vazio enquanto o email nao foi confirmado", async () => {
    mock.auth.signUp.mockResolvedValueOnce(
      resp({ session: { user: { id: "u1" }, access_token: "jwt" } }) as any,
    );
    await expect(signup(body)).resolves.toMatchObject({ token: "" });
  });

  it("devolve o token quando o email ja esta confirmado", async () => {
    mock.auth.signUp.mockResolvedValueOnce(
      resp({
        user: { email_confirmed_at: "2026-01-01T00:00:00Z" },
        session: { user: { id: "u1" }, access_token: "jwt" },
      }) as any,
    );
    await expect(signup(body)).resolves.toMatchObject({ token: "jwt" });
  });

  it("devolve token vazio quando confirmado mas sem sessao", async () => {
    mock.auth.signUp.mockResolvedValueOnce(
      resp({ user: { email_confirmed_at: "2026-01-01T00:00:00Z" } }) as any,
    );
    await expect(signup(body)).resolves.toMatchObject({ token: "" });
  });

  it("devolve o nome do formulario, nao o da metadata", async () => {
    mock.auth.signUp.mockResolvedValueOnce(resp() as any);
    await expect(signup(body)).resolves.toMatchObject({
      user: { id: "u1", email: "a@b.com", name: "Joao" },
    });
  });

  it("propaga o erro de email ja cadastrado", async () => {
    mock.auth.signUp.mockResolvedValueOnce(fail("User already registered") as any);
    await expect(signup(body)).rejects.toMatchObject({ message: "User already registered" });
  });

  it("lanca Signup failed quando o Supabase nao devolve usuario", async () => {
    mock.auth.signUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: null } as any);
    await expect(signup(body)).rejects.toThrow("Signup failed");
  });
});

describe("deleteAccount", () => {
  it("chama a RPC de exclusao da propria conta", async () => {
    mock.queue("rpc:cffc_delete_own_account", { data: null, error: null });
    await deleteAccount();
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_delete_own_account");
  });

  it("propaga o erro da RPC", async () => {
    mock.queue("rpc:cffc_delete_own_account", fail("not authorized"));
    await expect(deleteAccount()).rejects.toMatchObject({ message: "not authorized" });
  });
});

describe("signInWithGoogle", () => {
  const oauthUrl = { data: { url: "https://accounts.google.com/o/oauth2" }, error: null };

  it("abre o consentimento e cria sessao a partir dos tokens do fragmento", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({
      type: "success",
      url: "cffc://#access_token=at&refresh_token=rt",
    });
    mock.auth.setSession.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@b.com", user_metadata: { full_name: "Joao" } } },
      error: null,
    } as any);

    await expect(signInWithGoogle()).resolves.toEqual({
      token: "at",
      user: { id: "u1", email: "a@b.com", name: "Joao" },
    });
    expect(mock.auth.setSession).toHaveBeenCalledWith({
      access_token: "at",
      refresh_token: "rt",
    });
  });

  it("pede o OAuth do google sem redirecionar o browser automaticamente", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "cancel" });
    await signInWithGoogle();
    expect(mock.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "cffc://", skipBrowserRedirect: true },
    });
  });

  it("retorna null quando o usuario cancela o consentimento", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "cancel" });
    await expect(signInWithGoogle()).resolves.toBeNull();
  });

  it("le tokens tambem quando vem na query em vez do fragmento", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://?access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce({
      data: { user: { id: "u1", user_metadata: {} } },
      error: null,
    } as any);
    await expect(signInWithGoogle()).resolves.toMatchObject({ token: "at" });
  });

  it("usa refresh_token vazio quando o redirect nao traz um", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce({
      data: { user: { id: "u1", user_metadata: {} } },
      error: null,
    } as any);
    await signInWithGoogle();
    expect(mock.auth.setSession).toHaveBeenCalledWith({ access_token: "at", refresh_token: "" });
  });

  it("cai para name quando a metadata do google nao traz full_name", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce({
      data: { user: { id: "u1", user_metadata: { name: "Joao M" } } },
      error: null,
    } as any);
    await expect(signInWithGoogle()).resolves.toMatchObject({ user: { name: "Joao M" } });
  });

  it("usa nome vazio quando a metadata nao traz nenhum nome", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce({
      data: { user: { id: "u1", user_metadata: {} } },
      error: null,
    } as any);
    await expect(signInWithGoogle()).resolves.toMatchObject({ user: { name: "", email: "" } });
  });

  it("propaga o erro do signInWithOAuth", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(fail("provider disabled") as any);
    await expect(signInWithGoogle()).rejects.toMatchObject({ message: "provider disabled" });
  });

  it("lanca quando o Supabase nao devolve url de OAuth", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce({ data: { url: null }, error: null } as any);
    await expect(signInWithGoogle()).rejects.toThrow("No OAuth URL returned from Supabase");
  });

  it("lanca quando o redirect volta sem access_token", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#erro=1" });
    await expect(signInWithGoogle()).rejects.toThrow("No access token in OAuth redirect");
  });

  it("propaga o erro de criacao de sessao", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce(fail("invalid token") as any);
    await expect(signInWithGoogle()).rejects.toMatchObject({ message: "invalid token" });
  });

  it("lanca quando a sessao e criada mas nao devolve usuario", async () => {
    mock.auth.signInWithOAuth.mockResolvedValueOnce(oauthUrl as any);
    openAuth.mockResolvedValueOnce({ type: "success", url: "cffc://#access_token=at" });
    mock.auth.setSession.mockResolvedValueOnce({ data: { user: null }, error: null } as any);
    await expect(signInWithGoogle()).rejects.toThrow("Failed to create session from OAuth tokens");
  });
});

describe("signInWithApple", () => {
  const credential = (over: Record<string, unknown> = {}) => ({
    identityToken: "id-token",
    fullName: null,
    ...over,
  });
  const session = (over: Record<string, unknown> = {}) => ({
    data: {
      session: { access_token: "jwt" },
      user: { id: "u1", email: "a@b.com", user_metadata: {}, ...(over.user as object) },
    },
    error: null,
  });

  it("troca o identity token da Apple por uma sessao Supabase", async () => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce(session() as any);

    await expect(signInWithApple()).resolves.toEqual({
      token: "jwt",
      user: { id: "u1", email: "a@b.com", name: "" },
    });
    expect(mock.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "id-token",
      nonce: "raw-nonce",
    });
  });

  it("envia o nonce com hash para a Apple e o cru para o Supabase", async () => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce(session() as any);
    await signInWithApple();
    expect(appleSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: "hashed-nonce" }),
    );
    expect(mock.auth.signInWithIdToken).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: "raw-nonce" }),
    );
  });

  it("persiste o nome que a Apple so devolve na primeira autorizacao", async () => {
    appleSignIn.mockResolvedValueOnce(
      credential({ fullName: { givenName: "Joao", familyName: "Megale" } }),
    );
    mock.auth.signInWithIdToken.mockResolvedValueOnce(session() as any);
    await expect(signInWithApple()).resolves.toMatchObject({ user: { name: "Joao Megale" } });
  });

  it("monta o nome com apenas uma das partes quando a outra falta", async () => {
    appleSignIn.mockResolvedValueOnce(credential({ fullName: { givenName: "Joao" } }));
    mock.auth.signInWithIdToken.mockResolvedValueOnce(session() as any);
    await expect(signInWithApple()).resolves.toMatchObject({ user: { name: "Joao" } });
  });

  it("cai para a metadata quando a Apple nao devolve nome (logins seguintes)", async () => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce(
      session({ user: { user_metadata: { full_name: "Joao Salvo" } } }) as any,
    );
    await expect(signInWithApple()).resolves.toMatchObject({ user: { name: "Joao Salvo" } });
  });

  it("cai para metadata.name quando nao ha full_name", async () => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce(
      session({ user: { user_metadata: { name: "Joao N" } } }) as any,
    );
    await expect(signInWithApple()).resolves.toMatchObject({ user: { name: "Joao N" } });
  });

  it("retorna null quando o usuario fecha a folha da Apple", async () => {
    appleSignIn.mockRejectedValueOnce({ code: "ERR_REQUEST_CANCELED" });
    await expect(signInWithApple()).resolves.toBeNull();
  });

  it("propaga outros erros da Apple em vez de tratar como cancelamento", async () => {
    appleSignIn.mockRejectedValueOnce({ code: "ERR_INVALID_RESPONSE" });
    await expect(signInWithApple()).rejects.toMatchObject({ code: "ERR_INVALID_RESPONSE" });
  });

  it("propaga um erro sem code", async () => {
    appleSignIn.mockRejectedValueOnce(new Error("boom"));
    await expect(signInWithApple()).rejects.toThrow("boom");
  });

  it("lanca quando a Apple nao devolve identity token", async () => {
    appleSignIn.mockResolvedValueOnce(credential({ identityToken: null }));
    await expect(signInWithApple()).rejects.toThrow("No identity token returned from Apple");
  });

  it("propaga o erro do Supabase ao trocar o token", async () => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce(fail("invalid nonce") as any);
    await expect(signInWithApple()).rejects.toMatchObject({ message: "invalid nonce" });
  });

  it.each([
    ["sem sessao", { session: null, user: { id: "u1" } }],
    ["sem usuario", { session: { access_token: "jwt" }, user: null }],
  ])("lanca Apple sign in failed quando a resposta vem %s", async (_l, data) => {
    appleSignIn.mockResolvedValueOnce(credential());
    mock.auth.signInWithIdToken.mockResolvedValueOnce({ data, error: null } as any);
    await expect(signInWithApple()).rejects.toThrow("Apple sign in failed");
  });
});

describe("recuperacao de senha", () => {
  it("getPasswordResetRedirectTo aponta para a rota reset-password do app", () => {
    expect(getPasswordResetRedirectTo()).toBe("cffc://reset-password");
  });

  it("requestPasswordReset envia o email com o deep link de retorno", async () => {
    await requestPasswordReset("a@b.com");
    expect(mock.auth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.com", {
      redirectTo: "cffc://reset-password",
    });
  });

  it("requestPasswordReset propaga o erro do Supabase", async () => {
    mock.auth.resetPasswordForEmail.mockResolvedValueOnce(fail("rate limited") as any);
    await expect(requestPasswordReset("a@b.com")).rejects.toMatchObject({
      message: "rate limited",
    });
  });

  it("hasActiveAuthSession e verdadeiro quando ha sessao", async () => {
    mock.auth.getSession.mockResolvedValueOnce({
      data: { session: { access_token: "jwt" } },
      error: null,
    } as any);
    await expect(hasActiveAuthSession()).resolves.toBe(true);
  });

  it("hasActiveAuthSession e falso sem sessao", async () => {
    mock.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null } as any);
    await expect(hasActiveAuthSession()).resolves.toBe(false);
  });

  it("updatePassword troca a senha do usuario logado", async () => {
    await updatePassword("nova-senha");
    expect(mock.auth.updateUser).toHaveBeenCalledWith({ password: "nova-senha" });
  });

  it("updatePassword propaga o erro", async () => {
    mock.auth.updateUser.mockResolvedValueOnce(fail("weak password") as any);
    await expect(updatePassword("123")).rejects.toMatchObject({ message: "weak password" });
  });
});

describe("startPasswordRecoverySession", () => {
  it("cria sessao a partir de access_token no fragmento", async () => {
    mock.auth.setSession.mockResolvedValueOnce({ data: {}, error: null } as any);
    await startPasswordRecoverySession("cffc://reset#access_token=at&refresh_token=rt");
    expect(mock.auth.setSession).toHaveBeenCalledWith({
      access_token: "at",
      refresh_token: "rt",
    });
  });

  it("usa refresh_token vazio quando o link nao traz um", async () => {
    mock.auth.setSession.mockResolvedValueOnce({ data: {}, error: null } as any);
    await startPasswordRecoverySession("cffc://reset#access_token=at");
    expect(mock.auth.setSession).toHaveBeenCalledWith({ access_token: "at", refresh_token: "" });
  });

  it("verifica o otp quando o link traz token_hash", async () => {
    mock.auth.verifyOtp.mockResolvedValueOnce({ data: {}, error: null } as any);
    await startPasswordRecoverySession("cffc://reset?token_hash=th");
    expect(mock.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "th", type: "recovery" });
  });

  it("troca o code por sessao no fluxo PKCE", async () => {
    mock.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: null } as any);
    await startPasswordRecoverySession("cffc://reset?code=abc");
    expect(mock.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("prefere access_token quando o link traz mais de uma forma", async () => {
    mock.auth.setSession.mockResolvedValueOnce({ data: {}, error: null } as any);
    await startPasswordRecoverySession("cffc://reset?code=abc#access_token=at");
    expect(mock.auth.setSession).toHaveBeenCalled();
    expect(mock.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("lanca a descricao do erro quando o link ja veio com erro", async () => {
    await expect(
      startPasswordRecoverySession("cffc://reset?error=expired&error_description=Link%20expirou"),
    ).rejects.toThrow("Link expirou");
  });

  it("lanca o codigo do erro quando nao ha descricao", async () => {
    await expect(startPasswordRecoverySession("cffc://reset?error=expired")).rejects.toThrow(
      "expired",
    );
  });

  it("lanca MISSING_RECOVERY_TOKEN quando o link nao tem nada acionavel", async () => {
    await expect(startPasswordRecoverySession("cffc://reset")).rejects.toThrow(
      "MISSING_RECOVERY_TOKEN",
    );
  });

  it.each([
    ["setSession", "cffc://reset#access_token=at", "setSession"],
    ["verifyOtp", "cffc://reset?token_hash=th", "verifyOtp"],
    ["exchangeCodeForSession", "cffc://reset?code=abc", "exchangeCodeForSession"],
  ])("propaga o erro de %s", async (_l, url, method) => {
    (mock.auth as any)[method].mockResolvedValueOnce(fail("token invalido"));
    await expect(startPasswordRecoverySession(url)).rejects.toMatchObject({
      message: "token invalido",
    });
  });
});
