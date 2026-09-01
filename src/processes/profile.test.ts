jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/processes/validationStats", () => ({
  fetchApprovedValidationCountsByAthleteIds: jest.fn(async () => new Map()),
  validationCountsMapGet: jest.fn((m: Map<string, number>, id: string) => m.get(id) ?? 0),
}));
jest.mock("@/utils/supabaseStorage", () => ({ getSignedUrl: jest.fn(async () => null) }));

import { ok, fail, count } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { fetchApprovedValidationCountsByAthleteIds } from "@/processes/validationStats";
import { getSignedUrl } from "@/utils/supabaseStorage";
import {
  fetchAthleteProfile,
  fetchProfileVideos,
  fetchProfileForEdit,
  fetchCurrentUserAvatar,
  fetchProfilePersonalFields,
  updateProfile,
  fetchAthleteProfileData,
  upsertAthleteProfile,
  syncAthleteProfileRowForRole,
  syncProfessionalProfileRowForRole,
  applySignupRoleFromClient,
  uploadVideo,
  uploadThumb,
  createMediaRecord,
  searchAthletes,
  addToClubShortlist,
  fetchClubShortlist,
  uploadAvatar,
} from "@/processes/profile";

const counts = fetchApprovedValidationCountsByAthleteIds as jest.Mock;
const signed = getSignedUrl as jest.Mock;
const RPC_ATHLETE = "rpc:cffc_sync_athlete_profile_for_role";
const RPC_PRO = "rpc:cffc_sync_professional_profile_for_role";

const stubFetch = () => {
  (globalThis as any).fetch = jest.fn(async () => ({ blob: async () => "blob" }));
  (globalThis as any).Response = class {
    constructor(public b: unknown) {}
    arrayBuffer = async () => new ArrayBuffer(4);
  };
};

beforeEach(() => {
  mock.reset();
  counts.mockReset().mockResolvedValue(new Map());
  signed.mockReset().mockResolvedValue(null);
});
afterEach(() => jest.restoreAllMocks());

// ---------------------------------------------------------------- leitura de perfil

describe("fetchAthleteProfile", () => {
  const setup = (over: Record<string, any> = {}) => {
    const pick = (k: string, fb: unknown) => (k in over ? over[k] : fb);
    mock.queue("profile", ok(pick("profile", {
      id: "a1", name: "Joao", username: "joao", avatar_url: "a1/av.png",
      role: "athlete", verified: true, city: "Santos", state: "SP",
    })));
    mock.queue("media", count(pick("videoCount", 3)));
    mock.queue("contact_request", count(pick("contactCount", 2)));
  };

  it("monta o cabecalho do perfil com as tres estatisticas", async () => {
    setup();
    counts.mockResolvedValue(new Map([["a1", 5]]));
    signed.mockResolvedValue("https://signed.test/av.png");

    await expect(fetchAthleteProfile("a1")).resolves.toEqual({
      id: "a1",
      name: "Joao",
      username: "joao",
      avatarUrl: "https://signed.test/av.png",
      role: "athlete",
      verified: true,
      city: "Santos",
      state: "SP",
      stats: { videoCount: 3, validationCount: 5, contactCount: 2 },
    });
  });

  it("conta somente videos aprovados do tipo video", async () => {
    setup();
    await fetchAthleteProfile("a1");
    expect(mock.argsOf("media", "eq", 0)).toEqual(["athlete_user_id", "a1"]);
    expect(mock.argsOf("media", "eq", 1)).toEqual(["type", "video"]);
    expect(mock.argsOf("media", "eq", 2)).toEqual(["status", "approved"]);
  });

  it("conta somente contatos aceitos", async () => {
    setup();
    await fetchAthleteProfile("a1");
    expect(mock.argsOf("contact_request", "eq", 1)).toEqual(["status", "accepted"]);
  });

  it("zera as contagens quando o Supabase nao devolve count", async () => {
    setup({ videoCount: null, contactCount: null });
    await expect(fetchAthleteProfile("a1")).resolves.toMatchObject({
      stats: { videoCount: 0, validationCount: 0, contactCount: 0 },
    });
  });

  it("usa valores neutros quando o perfil vem incompleto", async () => {
    setup({ profile: { id: "a1", name: null, username: null, avatar_url: null, role: "athlete", verified: null, city: null, state: null } });
    await expect(fetchAthleteProfile("a1")).resolves.toMatchObject({ name: "", verified: false });
  });

  it("lanca Profile not found quando o perfil nao existe", async () => {
    mock.queue("profile", ok(null));
    await expect(fetchAthleteProfile("a1")).rejects.toThrow("Profile not found");
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(fetchAthleteProfile("a1")).rejects.toMatchObject({ message: "rls violation" });
  });
});

describe("fetchProfileVideos", () => {
  it("mapeia e assina video e thumbnail", async () => {
    mock.queue("media", ok([{ id: "m1", url: "a1/v.mp4", thumb_url: "a1/t.jpg", status: "approved" }]));
    signed
      .mockResolvedValueOnce("https://signed.test/v.mp4")
      .mockResolvedValueOnce("https://signed.test/t.jpg");

    await expect(fetchProfileVideos("a1")).resolves.toEqual([
      { id: "m1", url: "https://signed.test/v.mp4", thumbUrl: "https://signed.test/t.jpg", status: "approved" },
    ]);
  });

  it("traz os 6 mais recentes, incluindo pendentes e rejeitados (e o proprio perfil)", async () => {
    mock.queue("media", ok([]));
    await fetchProfileVideos("a1");
    expect(mock.argsOf("media", "eq", 0)).toEqual(["athlete_user_id", "a1"]);
    expect(mock.argsOf("media", "eq", 1)).toEqual(["type", "video"]);
    expect(mock.argsOf("media", "order")).toEqual(["created_at", { ascending: false }]);
    expect(mock.argsOf("media", "limit")).toEqual([6]);
  });

  it("cai para a url crua quando a assinatura do video falha", async () => {
    mock.queue("media", ok([{ id: "m1", url: "a1/v.mp4", thumb_url: null, status: "pending" }]));
    const [v] = await fetchProfileVideos("a1");
    expect(v.url).toBe("a1/v.mp4");
    expect(v.thumbUrl).toBeNull();
  });

  it("retorna lista vazia quando data vem null", async () => {
    mock.queue("media", ok(null));
    await expect(fetchProfileVideos("a1")).resolves.toEqual([]);
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("media", fail("timeout"));
    await expect(fetchProfileVideos("a1")).rejects.toMatchObject({ message: "timeout" });
  });
});

describe("fetchProfileForEdit", () => {
  const row = {
    id: "a1", name: "Joao", username: "joao", avatar_url: "a1/av.png",
    city: "Santos", state: "SP", birth_date: "2008-05-01", phone: "11987654321",
  };

  it("devolve os campos do formulario com o avatar ja assinado", async () => {
    mock.queue("profile", ok(row));
    signed.mockResolvedValue("https://signed.test/av.png");
    await expect(fetchProfileForEdit("a1")).resolves.toEqual({
      ...row,
      avatar_url: "https://signed.test/av.png",
    });
  });

  it("devolve avatar null quando o perfil nao tem foto", async () => {
    mock.queue("profile", ok({ ...row, avatar_url: null }));
    await expect(fetchProfileForEdit("a1")).resolves.toMatchObject({ avatar_url: null });
  });

  it("lanca Profile not found quando o perfil nao existe", async () => {
    mock.queue("profile", ok(null));
    await expect(fetchProfileForEdit("a1")).rejects.toThrow("Profile not found");
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(fetchProfileForEdit("a1")).rejects.toMatchObject({ message: "rls violation" });
  });
});

describe("fetchCurrentUserAvatar", () => {
  it("assina o avatar do usuario", async () => {
    mock.queue("profile", ok({ avatar_url: "a1/av.png" }));
    signed.mockResolvedValue("https://signed.test/av.png");
    await expect(fetchCurrentUserAvatar("a1")).resolves.toBe("https://signed.test/av.png");
    expect(signed).toHaveBeenCalledWith("media", "a1/av.png");
  });

  it("passa null adiante quando o perfil nao tem avatar", async () => {
    mock.queue("profile", ok({ avatar_url: null }));
    await expect(fetchCurrentUserAvatar("a1")).resolves.toBeNull();
    expect(signed).toHaveBeenCalledWith("media", null);
  });

  it("passa null adiante quando o perfil nao vem", async () => {
    mock.queue("profile", ok(null));
    await expect(fetchCurrentUserAvatar("a1")).resolves.toBeNull();
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(fetchCurrentUserAvatar("a1")).rejects.toMatchObject({ message: "rls violation" });
  });
});

describe("fetchProfilePersonalFields", () => {
  it("le apenas nascimento e telefone, sem assinar avatar", async () => {
    mock.queue("profile", ok({ birth_date: "2008-05-01", phone: "11987654321" }));
    await expect(fetchProfilePersonalFields("a1")).resolves.toEqual({
      birth_date: "2008-05-01",
      phone: "11987654321",
    });
    expect(mock.argsOf("profile", "select")).toEqual(["birth_date, phone"]);
    expect(signed).not.toHaveBeenCalled();
  });

  it("preserva nulls", async () => {
    mock.queue("profile", ok({ birth_date: null, phone: null }));
    await expect(fetchProfilePersonalFields("a1")).resolves.toEqual({
      birth_date: null,
      phone: null,
    });
  });

  it("lanca Profile not found quando o perfil nao existe", async () => {
    mock.queue("profile", ok(null));
    await expect(fetchProfilePersonalFields("a1")).rejects.toThrow("Profile not found");
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(fetchProfilePersonalFields("a1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("updateProfile", () => {
  it("grava o payload no perfil do usuario", async () => {
    mock.queue("profile", ok(null));
    await updateProfile("a1", { name: "Novo Nome", city: "Santos" } as any);
    expect(mock.argsOf("profile", "update")).toEqual([{ name: "Novo Nome", city: "Santos" }]);
    expect(mock.argsOf("profile", "eq")).toEqual(["id", "a1"]);
  });

  it("aceita payload vazio sem quebrar", async () => {
    mock.queue("profile", ok(null));
    await expect(updateProfile("a1", {})).resolves.toBeUndefined();
  });

  it("propaga o erro do update", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(updateProfile("a1", { name: "x" } as any)).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

// ---------------------------------------------------------------- athlete_profile

describe("fetchAthleteProfileData", () => {
  it("mapeia a linha do atleta", async () => {
    mock.queue("athlete_profile", ok({
      user_id: "a1", height: 180, weight: 75, dominant_foot: "right",
      positions: ["st"], strengths: ["speed"], current_category: "sub20",
      availability: "immediate", club_history: [{ club: "X" }],
      is_searchable: true, contact_visibility: "public",
    }));
    await expect(fetchAthleteProfileData("a1")).resolves.toMatchObject({
      user_id: "a1", height: 180, positions: ["st"], strengths: ["speed"],
      club_history: [{ club: "X" }], is_searchable: true,
    });
  });

  it("retorna null quando o atleta ainda nao tem linha", async () => {
    mock.queue("athlete_profile", ok(null));
    await expect(fetchAthleteProfileData("a1")).resolves.toBeNull();
  });

  it("usa listas vazias e is_searchable true como defaults", async () => {
    mock.queue("athlete_profile", ok({
      user_id: "a1", positions: null, strengths: null, club_history: null, is_searchable: null,
    }));
    await expect(fetchAthleteProfileData("a1")).resolves.toMatchObject({
      positions: [], strengths: [], club_history: [], is_searchable: true,
    });
  });

  it("preserva is_searchable false", async () => {
    mock.queue("athlete_profile", ok({ user_id: "a1", is_searchable: false }));
    await expect(fetchAthleteProfileData("a1")).resolves.toMatchObject({ is_searchable: false });
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("athlete_profile", fail("rls violation"));
    await expect(fetchAthleteProfileData("a1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("upsertAthleteProfile", () => {
  it("faz upsert por user_id carimbando updated_at", async () => {
    jest.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-08-31T00:00:00.000Z");
    mock.queue("athlete_profile", ok(null));
    await upsertAthleteProfile("a1", { height: 180 } as any);
    expect(mock.argsOf("athlete_profile", "upsert")).toEqual([
      { user_id: "a1", height: 180, updated_at: "2026-08-31T00:00:00.000Z" },
      { onConflict: "user_id" },
    ]);
  });

  it("propaga o erro do upsert", async () => {
    mock.queue("athlete_profile", fail("rls violation"));
    await expect(upsertAthleteProfile("a1", {} as any)).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

// ---------------------------------------------------------------- sync por papel

describe("syncAthleteProfileRowForRole", () => {
  it("nao faz nada quando o papel e desconhecido", async () => {
    await syncAthleteProfileRowForRole("u1", null);
    expect(mock.client.rpc).not.toHaveBeenCalled();
  });

  it("prefere a RPC SECURITY DEFINER, que funciona mesmo com RLS bloqueando o delete", async () => {
    mock.queue(RPC_ATHLETE, ok(null));
    await syncAthleteProfileRowForRole("u1", "athlete");
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_sync_athlete_profile_for_role", {
      p_user_id: "u1",
      p_role: "athlete",
    });
    expect(mock.callsFor("athlete_profile")).toHaveLength(0);
  });

  it.each([
    ["PGRST202", { code: "PGRST202", message: "x" }],
    ["42883", { code: "42883", message: "x" }],
    ["could not find na mensagem", { message: "Could not find the function" }],
    ["schema cache na mensagem", { message: "Not in schema cache" }],
  ])("cai no fallback direto quando a RPC nao existe (%s)", async (_l, error) => {
    mock.queue(RPC_ATHLETE, { data: null, error: error as any });
    mock.queue("athlete_profile", ok(null));
    await syncAthleteProfileRowForRole("u1", "athlete");
    expect(mock.argsOf("athlete_profile", "upsert")).toEqual([
      { user_id: "u1" },
      { onConflict: "user_id" },
    ]);
  });

  it("propaga erros reais da RPC em vez de mascarar com o fallback", async () => {
    mock.queue(RPC_ATHLETE, fail("permission denied", "42501"));
    await expect(syncAthleteProfileRowForRole("u1", "athlete")).rejects.toMatchObject({
      code: "42501",
    });
    expect(mock.callsFor("athlete_profile")).toHaveLength(0);
  });

  it.each(["pro", "club", "admin"])(
    "no fallback, apaga a linha de atleta para o papel %s",
    async (role) => {
      mock.queue(RPC_ATHLETE, fail("could not find"));
      mock.queue("athlete_profile", ok(null));
      await syncAthleteProfileRowForRole("u1", role as any);
      const steps = mock.callsFor("athlete_profile")[0].steps.map((s) => s.method);
      expect(steps).toContain("delete");
      expect(mock.argsOf("athlete_profile", "eq")).toEqual(["user_id", "u1"]);
    },
  );

  it("propaga o erro do upsert de fallback", async () => {
    mock.queue(RPC_ATHLETE, fail("could not find"));
    mock.queue("athlete_profile", fail("rls violation"));
    await expect(syncAthleteProfileRowForRole("u1", "athlete")).rejects.toMatchObject({
      message: "rls violation",
    });
  });

  it("propaga o erro do delete de fallback", async () => {
    mock.queue(RPC_ATHLETE, fail("could not find"));
    mock.queue("athlete_profile", fail("rls violation"));
    await expect(syncAthleteProfileRowForRole("u1", "pro")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("syncProfessionalProfileRowForRole", () => {
  it("nao faz nada quando o papel e desconhecido", async () => {
    await syncProfessionalProfileRowForRole("u1", null);
    expect(mock.client.rpc).not.toHaveBeenCalled();
  });

  it("usa a RPC quando disponivel", async () => {
    mock.queue(RPC_PRO, ok(null));
    await syncProfessionalProfileRowForRole("u1", "pro");
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_sync_professional_profile_for_role", {
      p_user_id: "u1",
      p_role: "pro",
    });
  });

  it("no fallback, cria a linha para o papel pro", async () => {
    mock.queue(RPC_PRO, fail("could not find"));
    mock.queue("professional_profile", ok(null));
    await syncProfessionalProfileRowForRole("u1", "pro");
    expect(mock.argsOf("professional_profile", "upsert")).toEqual([
      { user_id: "u1" },
      { onConflict: "user_id" },
    ]);
  });

  it.each(["athlete", "club", "admin"])(
    "no fallback, apaga a linha profissional para o papel %s",
    async (role) => {
      mock.queue(RPC_PRO, fail("could not find"));
      mock.queue("professional_profile", ok(null));
      await syncProfessionalProfileRowForRole("u1", role as any);
      const steps = mock.callsFor("professional_profile")[0].steps.map((s) => s.method);
      expect(steps).toContain("delete");
    },
  );

  it("propaga erros reais da RPC", async () => {
    mock.queue(RPC_PRO, fail("permission denied", "42501"));
    await expect(syncProfessionalProfileRowForRole("u1", "pro")).rejects.toMatchObject({
      code: "42501",
    });
  });

  it("propaga o erro do fallback", async () => {
    mock.queue(RPC_PRO, fail("could not find"));
    mock.queue("professional_profile", fail("rls violation"));
    await expect(syncProfessionalProfileRowForRole("u1", "club")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("applySignupRoleFromClient", () => {
  it("grava o papel e alinha as duas tabelas dependentes", async () => {
    mock.queue("profile", ok(null));
    mock.queue(RPC_ATHLETE, ok(null));
    mock.queue(RPC_PRO, ok(null));

    await applySignupRoleFromClient("u1", "athlete");

    expect(mock.argsOf("profile", "update")).toEqual([{ role: "athlete" }]);
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_sync_athlete_profile_for_role", {
      p_user_id: "u1", p_role: "athlete",
    });
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_sync_professional_profile_for_role", {
      p_user_id: "u1", p_role: "athlete",
    });
  });

  it("nao sincroniza quando a gravacao do papel falha", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(applySignupRoleFromClient("u1", "athlete")).rejects.toMatchObject({
      message: "rls violation",
    });
    expect(mock.client.rpc).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------- uploads

describe("uploadVideo", () => {
  beforeEach(stubFetch);

  it("envia para um caminho namespaced pelo usuario e devolve o caminho", async () => {
    const path = await uploadVideo("u1", "file:///filme.mp4");
    expect(path).toMatch(/^url\/u1\/\d+-[a-z0-9]+\.mp4$/);
    expect(mock.storageCalls[0].args[0]).toBe(path);
  });

  it("nao sobrescreve e usa content-type derivado da extensao", async () => {
    await uploadVideo("u1", "file:///filme.mov");
    expect(mock.storageCalls[0].args[2]).toEqual({ contentType: "video/mov", upsert: false });
  });

  // BUG conhecido: `uri.split(".").pop() ?? "mp4"` nunca cai no fallback —
  // `split` sempre devolve ao menos um elemento, então `pop()` nunca é undefined.
  // Uma uri sem extensão vira caminho e content-type lixo.
  it.failing("cai para mp4 quando a uri nao tem extensao", async () => {
    expect(await uploadVideo("u1", "file:///semextensao")).toMatch(/\.mp4$/);
  });

  it("comportamento atual: usa a uri inteira como extensao (documenta o bug acima)", async () => {
    const path = await uploadVideo("u1", "file:///semextensao");
    expect(path).toBe(path.replace(/[^.]+$/, "") + "file:///semextensao");
    expect(mock.storageCalls[0].args[2]).toEqual({
      contentType: "video/file:///semextensao",
      upsert: false,
    });
  });

  it("propaga o erro do upload", async () => {
    mock.queueStorage(fail("bucket full"));
    await expect(uploadVideo("u1", "file:///f.mp4")).rejects.toMatchObject({
      message: "bucket full",
    });
  });
});

describe("uploadThumb", () => {
  beforeEach(stubFetch);

  it("envia a miniatura para o caminho de thumbs", async () => {
    const path = await uploadThumb("u1", "file:///t.jpg");
    expect(path).toMatch(/^thumb_url\/u1\/\d+-[a-z0-9]+\.jpg$/);
    expect(mock.storageCalls[0].args[2]).toEqual({ contentType: "image/jpg", upsert: false });
  });

  it.failing("cai para jpg quando a uri nao tem extensao", async () => {
    expect(await uploadThumb("u1", "file:///semextensao")).toMatch(/\.jpg$/);
  });

  it("propaga o erro do upload", async () => {
    mock.queueStorage(fail("bucket full"));
    await expect(uploadThumb("u1", "file:///t.jpg")).rejects.toMatchObject({
      message: "bucket full",
    });
  });
});

describe("createMediaRecord", () => {
  it("registra o video como pendente de moderacao", async () => {
    mock.queue("media", ok(null));
    await createMediaRecord("u1", "url/u1/v.mp4", "Meu golaco", "thumb_url/u1/t.jpg");
    expect(mock.argsOf("media", "insert")).toEqual([{
      athlete_user_id: "u1",
      type: "video",
      status: "pending",
      url: "url/u1/v.mp4",
      title: "Meu golaco",
      thumb_url: "thumb_url/u1/t.jpg",
    }]);
  });

  it("grava titulo null quando a legenda esta vazia", async () => {
    mock.queue("media", ok(null));
    await createMediaRecord("u1", "url/u1/v.mp4", "");
    const row = mock.argsOf("media", "insert")![0] as any;
    expect(row.title).toBeNull();
    expect(row.thumb_url).toBeNull();
  });

  it("propaga o erro do insert", async () => {
    mock.queue("media", fail("rls violation"));
    await expect(createMediaRecord("u1", "p", "c")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("uploadAvatar", () => {
  beforeEach(stubFetch);

  it("sobrescreve o avatar, aponta o perfil para ele e devolve a url assinada", async () => {
    mock.queue("profile", ok(null));
    signed.mockResolvedValue("https://signed.test/av.jpg");

    await expect(uploadAvatar("u1", "file:///foto.jpg")).resolves.toBe(
      "https://signed.test/av.jpg",
    );
    expect(mock.storageCalls[0].args[0]).toBe("avatar_url/u1.jpg");
    expect(mock.storageCalls[0].args[2]).toEqual({ contentType: "image/jpg", upsert: true });
    expect(mock.argsOf("profile", "update")).toEqual([{ avatar_url: "avatar_url/u1.jpg" }]);
  });

  it.failing("cai para jpg quando a uri nao tem extensao", async () => {
    mock.queue("profile", ok(null));
    await uploadAvatar("u1", "file:///semextensao");
    expect(mock.storageCalls[0].args[0]).toBe("avatar_url/u1.jpg");
  });

  it("devolve string vazia quando a assinatura falha", async () => {
    mock.queue("profile", ok(null));
    await expect(uploadAvatar("u1", "file:///foto.jpg")).resolves.toBe("");
  });

  it("nao atualiza o perfil quando o upload falha", async () => {
    mock.queueStorage(fail("bucket full"));
    await expect(uploadAvatar("u1", "file:///foto.jpg")).rejects.toMatchObject({
      message: "bucket full",
    });
    expect(mock.callsFor("profile")).toHaveLength(0);
  });

  it("propaga o erro ao apontar o perfil para o novo avatar", async () => {
    mock.queue("profile", fail("rls violation"));
    await expect(uploadAvatar("u1", "file:///foto.jpg")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

// ---------------------------------------------------------------- busca

describe("searchAthletes", () => {
  const NO_FILTERS = {
    positions: [], ageMin: null, ageMax: null, dominantFoot: null,
    minHeight: null, maxWeight: null, strengths: [],
  } as any;

  const setup = (over: Record<string, any> = {}) => {
    const pick = (k: string, fb: unknown) => (k in over ? over[k] : fb);
    mock.auth.getUser.mockResolvedValue({
      data: { user: pick("authUser", { id: "viewer" }) },
      error: null,
    } as any);
    mock.queue("profile", ok(pick("profiles", [
      { id: "a1", name: "Joao", username: "joao", avatar_url: "a1/av.png", verified: true },
    ])));
    mock.queue("athlete_profile", ok(pick("athleteProfiles", [
      { user_id: "a1", positions: ["st"], strengths: ["speed"], is_searchable: true },
    ])));
    mock.queue("media", ok(pick("media", [{ athlete_user_id: "a1" }])));
    mock.queue("contact_request", ok(pick("contacts", [])));
    if ("shortlist" in over) mock.queue("club_shortlist", ok(over.shortlist));
  };

  it("monta o card de busca com contagens e posicoes", async () => {
    setup();
    counts.mockResolvedValue(new Map([["a1", 2]]));
    signed.mockResolvedValue("https://signed.test/av.png");

    await expect(searchAthletes("", NO_FILTERS)).resolves.toEqual([
      {
        id: "a1", name: "Joao", username: "joao",
        avatarUrl: "https://signed.test/av.png", verified: true,
        positions: ["st"], videoCount: 1, validationCount: 2, contactCount: 0,
        isShortlisted: false,
      },
    ]);
  });

  it("busca somente perfis com papel de atleta", async () => {
    setup();
    await searchAthletes("", NO_FILTERS);
    expect(mock.argsOf("profile", "eq")).toEqual(["role", "athlete"]);
  });

  it("exclui o proprio usuario logado dos resultados", async () => {
    setup();
    await searchAthletes("", NO_FILTERS);
    expect(mock.argsOf("profile", "neq")).toEqual(["id", "viewer"]);
  });

  it("prefere o id passado explicitamente ao da sessao", async () => {
    setup();
    await searchAthletes("", NO_FILTERS, undefined, "outro-viewer");
    expect(mock.argsOf("profile", "neq")).toEqual(["id", "outro-viewer"]);
  });

  it("nao exclui ninguem quando nao ha usuario logado nem id informado", async () => {
    setup({ authUser: null });
    await searchAthletes("", NO_FILTERS, undefined, null);
    expect(mock.argsOf("profile", "neq")).toBeUndefined();
  });

  it("so aplica busca textual a partir de 3 caracteres", async () => {
    setup();
    await searchAthletes("jo", NO_FILTERS);
    expect(mock.argsOf("profile", "ilike")).toBeUndefined();
  });

  it("aplica ilike no nome a partir de 3 caracteres", async () => {
    setup();
    await searchAthletes("joa", NO_FILTERS);
    expect(mock.argsOf("profile", "ilike")).toEqual(["name", "%joa%"]);
  });

  it("traduz idade minima em data de nascimento maxima", async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 31));
    setup();
    await searchAthletes("", { ...NO_FILTERS, ageMin: 18 });
    expect(mock.argsOf("profile", "lte")).toEqual(["birth_date", "2008-08-31"]);
    jest.useRealTimers();
  });

  it("traduz idade maxima em data de nascimento minima", async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 31));
    setup();
    await searchAthletes("", { ...NO_FILTERS, ageMax: 21 });
    expect(mock.argsOf("profile", "gte")).toEqual(["birth_date", "2005-08-31"]);
    jest.useRealTimers();
  });

  it("limita a 20 perfis", async () => {
    setup();
    await searchAthletes("", NO_FILTERS);
    expect(mock.argsOf("profile", "limit")).toEqual([20]);
  });

  it.each([
    ["lista vazia", []],
    ["null", null],
  ])("retorna vazio e nao consulta mais nada quando o perfil vem %s", async (_l, profiles) => {
    setup({ profiles });
    await expect(searchAthletes("", NO_FILTERS)).resolves.toEqual([]);
    expect(mock.callsFor("athlete_profile")).toHaveLength(0);
  });

  it("filtra somente atletas que aceitam aparecer na busca", async () => {
    setup();
    await searchAthletes("", NO_FILTERS);
    expect(mock.argsOf("athlete_profile", "eq", 0)).toEqual(["is_searchable", true]);
  });

  it("remove do resultado quem nao esta na busca (sem linha searchable)", async () => {
    setup({ athleteProfiles: [] });
    await expect(searchAthletes("", NO_FILTERS)).resolves.toEqual([]);
  });

  it.each([
    ["pe dominante", { dominantFoot: "left" }, "eq", ["dominant_foot", "left"]],
    ["altura minima", { minHeight: 180 }, "gte", ["height", 180]],
    ["peso maximo", { maxWeight: 80 }, "lte", ["weight", 80]],
  ])("aplica o filtro de %s na consulta de atletas", async (_l, patch, method, expected) => {
    setup();
    await searchAthletes("", { ...NO_FILTERS, ...patch });
    const args = mock
      .callsFor("athlete_profile")[0]
      .steps.filter((s) => s.method === method)
      .map((s) => s.args);
    expect(args).toContainEqual(expected);
  });

  it("filtra por posicao, expandindo o setor para as posicoes que ele cobre", async () => {
    setup({
      profiles: [
        { id: "a1", name: "Atacante", avatar_url: null, verified: true },
        { id: "a2", name: "Goleiro", avatar_url: null, verified: true },
      ],
      athleteProfiles: [
        { user_id: "a1", positions: ["st"], strengths: [], is_searchable: true },
        { user_id: "a2", positions: ["gk"], strengths: [], is_searchable: true },
      ],
    });
    const res = await searchAthletes("", { ...NO_FILTERS, positions: ["attack"] });
    expect(res.map((r) => r.id)).toEqual(["a1"]);
  });

  it("filtra por caracteristica", async () => {
    setup({
      profiles: [
        { id: "a1", name: "Rapido", avatar_url: null, verified: true },
        { id: "a2", name: "Forte", avatar_url: null, verified: true },
      ],
      athleteProfiles: [
        { user_id: "a1", positions: [], strengths: ["speed"], is_searchable: true },
        { user_id: "a2", positions: [], strengths: ["strength"], is_searchable: true },
      ],
    });
    const res = await searchAthletes("", { ...NO_FILTERS, strengths: ["speed"] });
    expect(res.map((r) => r.id)).toEqual(["a1"]);
  });

  it("marca como shortlisted quando o clube ja adicionou o atleta", async () => {
    setup({ shortlist: [{ athlete_user_id: "a1" }] });
    const [r] = await searchAthletes("", NO_FILTERS, "club1");
    expect(r.isShortlisted).toBe(true);
    expect(mock.argsOf("club_shortlist", "eq")).toEqual(["club_user_id", "club1"]);
  });

  it("nao consulta shortlist quando o buscador nao e clube", async () => {
    setup();
    await searchAthletes("", NO_FILTERS);
    expect(mock.callsFor("club_shortlist")).toHaveLength(0);
  });

  it("usa listas vazias quando athlete_profile vem sem posicoes/caracteristicas", async () => {
    setup({ athleteProfiles: [{ user_id: "a1", positions: null, strengths: null, is_searchable: true }] });
    const [r] = await searchAthletes("", NO_FILTERS);
    expect(r.positions).toEqual([]);
  });

  it("usa valores neutros quando o perfil vem incompleto", async () => {
    setup({ profiles: [{ id: "a1", name: null, username: null, avatar_url: null, verified: null }] });
    const [r] = await searchAthletes("", NO_FILTERS);
    expect(r).toMatchObject({ name: "", username: null, verified: false });
  });

  it("usa os filtros padrao quando nenhum e informado", async () => {
    setup();
    await expect(searchAthletes("")).resolves.toHaveLength(1);
  });

  it("propaga o erro da consulta de perfis", async () => {
    mock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null } as any);
    mock.queue("profile", fail("rls violation"));
    await expect(searchAthletes("", NO_FILTERS)).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

// ---------------------------------------------------------------- shortlist do clube

describe("addToClubShortlist", () => {
  it("adiciona o atleta a lista do clube logado, sem duplicar", async () => {
    mock.auth.getUser.mockResolvedValue({ data: { user: { id: "club1" } }, error: null } as any);
    mock.queue("club_shortlist", ok(null));

    await addToClubShortlist("a1");

    expect(mock.argsOf("club_shortlist", "upsert")).toEqual([
      { club_user_id: "club1", athlete_user_id: "a1" },
      { onConflict: "club_user_id,athlete_user_id" },
    ]);
  });

  it("recusa quando nao ha usuario autenticado", async () => {
    mock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null } as any);
    await expect(addToClubShortlist("a1")).rejects.toThrow("Not authenticated");
    expect(mock.callsFor("club_shortlist")).toHaveLength(0);
  });

  it("propaga o erro do upsert", async () => {
    mock.auth.getUser.mockResolvedValue({ data: { user: { id: "club1" } }, error: null } as any);
    mock.queue("club_shortlist", fail("rls violation"));
    await expect(addToClubShortlist("a1")).rejects.toMatchObject({ message: "rls violation" });
  });
});

describe("fetchClubShortlist", () => {
  const setup = (over: Record<string, any> = {}) => {
    const pick = (k: string, fb: unknown) => (k in over ? over[k] : fb);
    mock.queue("club_shortlist", ok(pick("shortlist", [{ athlete_user_id: "a1" }])));
    mock.queue("profile", ok(pick("profiles", [
      { id: "a1", name: "Joao", username: "joao", avatar_url: "a1/av.png", verified: true, phone: "11999" },
    ])));
    mock.queue("athlete_profile", ok(pick("athleteProfiles", [{ user_id: "a1", positions: ["st"] }])));
    mock.queue("media", ok(pick("media", [{ athlete_user_id: "a1" }, { athlete_user_id: "a1" }])));
    mock.queue("contact_request", ok(pick("contacts", [{ athlete_user_id: "a1" }])));
  };

  it("monta a lista com telefone e marca todos como shortlisted", async () => {
    setup();
    counts.mockResolvedValue(new Map([["a1", 3]]));
    signed.mockResolvedValue("https://signed.test/av.png");

    await expect(fetchClubShortlist("club1")).resolves.toEqual([
      {
        id: "a1", name: "Joao", username: "joao",
        avatarUrl: "https://signed.test/av.png", verified: true,
        positions: ["st"], videoCount: 2, validationCount: 3, contactCount: 1,
        isShortlisted: true, phone: "11999",
      },
    ]);
  });

  it("le a lista do clube pedido", async () => {
    setup();
    await fetchClubShortlist("club1");
    expect(mock.argsOf("club_shortlist", "eq")).toEqual(["club_user_id", "club1"]);
  });

  it.each([
    ["vazia", []],
    ["null", null],
  ])("retorna vazio quando a lista esta %s, sem consultar perfis", async (_l, shortlist) => {
    setup({ shortlist });
    await expect(fetchClubShortlist("club1")).resolves.toEqual([]);
    expect(mock.callsFor("profile")).toHaveLength(0);
  });

  it("so aplica busca textual a partir de 2 caracteres", async () => {
    setup();
    await fetchClubShortlist("club1", "j");
    expect(mock.argsOf("profile", "or")).toBeUndefined();
  });

  it("busca por nome ou username a partir de 2 caracteres", async () => {
    setup();
    await fetchClubShortlist("club1", "jo");
    expect(mock.argsOf("profile", "or")).toEqual(["name.ilike.%jo%,username.ilike.%jo%"]);
  });

  it.each([
    ["vazia", []],
    ["null", null],
  ])("retorna vazio quando a busca nao acha perfil (%s)", async (_l, profiles) => {
    setup({ profiles });
    await expect(fetchClubShortlist("club1", "zzz")).resolves.toEqual([]);
  });

  it("usa valores neutros quando o perfil vem incompleto", async () => {
    setup({
      profiles: [{ id: "a1", name: null, username: null, avatar_url: null, verified: false, phone: null }],
      athleteProfiles: [],
      media: null,
      contacts: null,
    });
    const [r] = await fetchClubShortlist("club1");
    expect(r).toMatchObject({
      name: "", username: null, phone: null, positions: [], videoCount: 0, contactCount: 0,
    });
  });

  it("nao conta video nem contato de outro atleta", async () => {
    setup({
      media: [{ athlete_user_id: "a1" }, { athlete_user_id: "outro" }],
      contacts: [{ athlete_user_id: "outro" }],
    });
    const [r] = await fetchClubShortlist("club1");
    expect(r.videoCount).toBe(1);
    expect(r.contactCount).toBe(0);
  });

  it("propaga o erro da consulta de shortlist", async () => {
    mock.queue("club_shortlist", fail("rls violation"));
    await expect(fetchClubShortlist("club1")).rejects.toMatchObject({ message: "rls violation" });
  });

  it("propaga o erro da consulta de perfis", async () => {
    mock.queue("club_shortlist", ok([{ athlete_user_id: "a1" }]));
    mock.queue("profile", fail("rls violation"));
    await expect(fetchClubShortlist("club1")).rejects.toMatchObject({ message: "rls violation" });
  });
});
