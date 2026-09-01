jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/processes/profile", () => ({
  syncAthleteProfileRowForRole: jest.fn(async () => {}),
  syncProfessionalProfileRowForRole: jest.fn(async () => {}),
}));

import { ok } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import {
  syncAthleteProfileRowForRole,
  syncProfessionalProfileRowForRole,
} from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";

const state = () => useAuthStore.getState();

/** Sessão mínima do Supabase, com metadata opcional do provedor social. */
const session = (metadata: Record<string, unknown> = {}) => ({
  data: {
    session: {
      user: { id: "u1", email: "atleta@teste.com", user_metadata: metadata },
    },
  },
  error: null,
});

/**
 * `checkAuth` consulta `profile` nesta ordem:
 *   1. select dos campos a completar  2. update (só se houver algo a gravar)
 *   3. select do role (para alinhar athlete_profile)  4. fetchUserRole
 */
const queueProfileReads = (
  current: Record<string, unknown>,
  role: string | null,
  withUpdate: boolean,
) => {
  mock.queue("profile", ok(current));
  if (withUpdate) mock.queue("profile", ok(null));
  mock.queue("profile", ok({ role }), ok({ role }));
};

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
  useAuthStore.setState({ isAuthenticated: false, isLoading: true, user: null, role: null });
});

describe("estado inicial", () => {
  it("comeca deslogado e carregando", () => {
    expect(state()).toMatchObject({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      role: null,
    });
  });
});

describe("checkAuth sem sessao", () => {
  it("marca como deslogado e encerra o carregamento", async () => {
    mock.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null } as any);
    await state().checkAuth();
    expect(state()).toMatchObject({
      isAuthenticated: false,
      user: null,
      role: null,
      isLoading: false,
    });
  });

  it("nao consulta a tabela profile quando nao ha sessao", async () => {
    mock.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null } as any);
    await state().checkAuth();
    expect(mock.callsFor("profile")).toHaveLength(0);
  });
});

describe("checkAuth com sessao", () => {
  it("autentica e expoe id, email e nome vindos da sessao", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({ name: "Joao" }) as any);
    queueProfileReads({ name: "Joao", role: "athlete" }, "athlete", false);

    await state().checkAuth();

    expect(state()).toMatchObject({
      isAuthenticated: true,
      isLoading: false,
      role: "athlete",
      user: { id: "u1", email: "atleta@teste.com", name: "Joao" },
    });
  });

  it("usa string vazia quando a sessao vem sem email ou nome", async () => {
    mock.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: "u1", user_metadata: {} } } },
      error: null,
    } as any);
    queueProfileReads({ name: "x", role: "pro" }, "pro", false);

    await state().checkAuth();
    expect(state().user).toEqual({ id: "u1", email: "", name: "" });
  });

  it("encerra o carregamento e limpa o estado quando o Supabase lanca", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mock.auth.getSession.mockRejectedValueOnce(new Error("rede caiu"));

    await state().checkAuth();

    expect(state()).toMatchObject({
      isAuthenticated: false,
      user: null,
      role: null,
      isLoading: false,
    });
    expect(console.error).toHaveBeenCalledWith("Error checking auth:", expect.any(Error));
  });

  it("nao sincroniza nada quando o perfil ainda nao existe na tabela", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({ name: "Joao" }) as any);
    mock.queue("profile", ok(null), ok({ role: "athlete" }));

    await state().checkAuth();

    expect(syncAthleteProfileRowForRole).not.toHaveBeenCalled();
    expect(state().role).toBe("athlete");
  });
});

describe("sincronizacao de metadata para a tabela profile", () => {
  const runWith = async (metadata: Record<string, unknown>, current: Record<string, unknown>) => {
    mock.auth.getSession.mockResolvedValueOnce(session(metadata) as any);
    queueProfileReads(current, "athlete", true);
    await state().checkAuth();
    return mock.argsOf("profile", "update", 0)?.[0] as Record<string, unknown> | undefined;
  };

  it("preenche o nome quando o perfil esta sem nome", async () => {
    expect(await runWith({ name: "Joao" }, { name: null })).toMatchObject({ name: "Joao" });
  });

  it("aceita full_name como alternativa a name", async () => {
    expect(await runWith({ full_name: "Joao Megale" }, { name: null })).toMatchObject({
      name: "Joao Megale",
    });
  });

  it("nao sobrescreve um nome ja preenchido", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({ name: "Novo" }) as any);
    queueProfileReads({ name: "Existente" }, "athlete", false);
    await state().checkAuth();
    expect(mock.argsOf("profile", "update", 0)).toBeUndefined();
  });

  it("remove o arroba e minusculiza o username", async () => {
    expect(await runWith({ username: "@JoaoM" }, { username: null })).toMatchObject({
      username: "joaom",
    });
  });

  it("maiusculiza a sigla do estado", async () => {
    expect(await runWith({ state: "sp" }, { state: null })).toMatchObject({ state: "SP" });
  });

  it("aceita state_prov como alternativa a state", async () => {
    expect(await runWith({ state_prov: "rj" }, { state: null })).toMatchObject({ state: "RJ" });
  });

  it("aceita phone_number como alternativa a phone", async () => {
    expect(await runWith({ phone_number: "11999" }, { phone: null })).toMatchObject({
      phone: "11999",
    });
  });

  it("copia cidade, data de nascimento e email do responsavel", async () => {
    const updates = await runWith(
      { city: "Santos", birth_date: "2008-05-01", guardian_email: "mae@teste.com" },
      { city: null, birth_date: null, guardian_email: null },
    );
    expect(updates).toMatchObject({
      city: "Santos",
      birth_date: "2008-05-01",
      guardian_email: "mae@teste.com",
    });
  });

  it("corrige o role quando a metadata diverge do que esta gravado", async () => {
    expect(await runWith({ role: "pro" }, { role: "athlete" })).toMatchObject({ role: "pro" });
  });

  it("aceita profile_role com precedencia sobre role", async () => {
    expect(
      await runWith({ profile_role: "club", role: "athlete" }, { role: "athlete" }),
    ).toMatchObject({ role: "club" });
  });

  it("ignora um role invalido vindo da metadata", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({ role: "superadmin" }) as any);
    queueProfileReads({ role: "athlete" }, "athlete", false);
    await state().checkAuth();
    expect(mock.argsOf("profile", "update", 0)).toBeUndefined();
  });

  it("nao grava nada quando o role da metadata ja e o gravado", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({ role: "athlete" }) as any);
    queueProfileReads({ role: "athlete" }, "athlete", false);
    await state().checkAuth();
    expect(mock.argsOf("profile", "update", 0)).toBeUndefined();
  });

  it.each([
    ["string vazia", ""],
    ["so espacos", "   "],
    ["numero", 42],
    ["null", null],
  ])("ignora metadata invalida (%s) em vez de gravar lixo", async (_label, value) => {
    mock.auth.getSession.mockResolvedValueOnce(session({ name: value }) as any);
    queueProfileReads({ name: null }, "athlete", false);
    await state().checkAuth();
    expect(mock.argsOf("profile", "update", 0)).toBeUndefined();
  });

  it("alinha athlete_profile e professional_profile ao role realmente gravado", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({}) as any);
    queueProfileReads({ role: "pro" }, "pro", false);
    await state().checkAuth();
    expect(syncAthleteProfileRowForRole).toHaveBeenCalledWith("u1", "pro");
    expect(syncProfessionalProfileRowForRole).toHaveBeenCalledWith("u1", "pro");
  });

  it("passa null adiante quando o perfil esta sem role", async () => {
    mock.auth.getSession.mockResolvedValueOnce(session({}) as any);
    mock.queue("profile", ok({ role: null }), ok(null), ok({ role: null }));
    await state().checkAuth();
    expect(syncAthleteProfileRowForRole).toHaveBeenCalledWith("u1", null);
  });
});

describe("signIn", () => {
  const user = { id: "u1", email: "a@b.com", name: "Joao" };

  it("autentica e resolve o role do perfil", async () => {
    mock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", user_metadata: {} } },
      error: null,
    } as any);
    queueProfileReads({ role: "club" }, "club", false);

    await state().signIn(user);

    expect(state()).toMatchObject({ isAuthenticated: true, user, role: "club" });
  });

  it("autentica mesmo quando getUser nao devolve usuario", async () => {
    mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null } as any);
    mock.queue("profile", ok({ role: "athlete" }));

    await state().signIn(user);

    expect(state().isAuthenticated).toBe(true);
    expect(state().role).toBe("athlete");
  });

  it("define role null quando o perfil nao tem role", async () => {
    mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null } as any);
    mock.queue("profile", ok(null));
    await state().signIn(user);
    expect(state().role).toBeNull();
  });
});

describe("signOut", () => {
  it("encerra a sessao no Supabase e zera o estado", async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", email: "a@b.com", name: "Joao" },
      role: "athlete",
    });

    await state().signOut();

    expect(mock.auth.signOut).toHaveBeenCalled();
    expect(state()).toMatchObject({ isAuthenticated: false, user: null, role: null });
  });
});

describe("setAuthenticated", () => {
  it("alterna a flag sem tocar em user nem role", () => {
    useAuthStore.setState({ user: { id: "u1", email: "a@b.com", name: "J" }, role: "pro" });
    state().setAuthenticated(true);
    expect(state()).toMatchObject({ isAuthenticated: true, role: "pro" });
    state().setAuthenticated(false);
    expect(state()).toMatchObject({ isAuthenticated: false, role: "pro" });
    expect(state().user).not.toBeNull();
  });
});
