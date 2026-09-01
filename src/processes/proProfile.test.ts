jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/utils/supabaseStorage", () => ({ getSignedUrl: jest.fn(async () => null) }));

import { ok, fail, count } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { getSignedUrl } from "@/utils/supabaseStorage";
import {
  MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES,
  uploadProfessionalVerifierDocument,
  upsertProfessionalCredentials,
  fetchProProfileScreenData,
  documentDisplayName,
} from "@/processes/proProfile";

const signed = getSignedUrl as jest.Mock;
const BUCKET = "professional-documents";

/** `fetch(uri) -> blob -> arrayBuffer` é como o process lê o arquivo local. */
const stubFetch = () => {
  const buffer = new ArrayBuffer(8);
  (globalThis as any).fetch = jest.fn(async () => ({ blob: async () => "blob-stub" }));
  (globalThis as any).Response = class {
    constructor(public body: unknown) {}
    arrayBuffer = async () => buffer;
  };
  return buffer;
};

beforeEach(() => {
  mock.reset();
  signed.mockReset().mockResolvedValue(null);
  jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  jest.spyOn(Math, "random").mockReturnValue(0.5);
});
afterEach(() => jest.restoreAllMocks());

describe("uploadProfessionalVerifierDocument", () => {
  const pick = { uri: "file:///doc.pdf", name: "diploma.pdf", mimeType: "application/pdf", size: 1000 };

  it("envia o arquivo para o bucket privado de documentos, nunca para media", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", pick);
    expect(mock.client.storage.from).toHaveBeenCalledWith(BUCKET);
    expect(mock.client.storage.from).not.toHaveBeenCalledWith("media");
  });

  it("grava sob um caminho namespaced pelo usuario, com carimbo unico", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", pick);
    const path = mock.storageCalls[0].args[0] as string;
    expect(path).toMatch(/^professional_document\/u1\/\d+-[a-z0-9]+\.pdf$/);
  });

  it("nao sobrescreve arquivo existente e envia o content-type correto", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", pick);
    expect(mock.storageCalls[0].args[2]).toEqual({
      contentType: "application/pdf",
      upsert: false,
    });
  });

  it("registra o documento como pendente de moderacao", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", pick);
    const row = mock.argsOf("professional_document", "insert")![0] as any;
    expect(row).toMatchObject({ profile_id: "u1", type: "document", status: "pending" });
    expect(row.url).toMatch(/^professional_document\/u1\//);
  });

  it.each([
    ["image/jpeg", "foto.jpg", "jpg", "image"],
    ["image/png", "foto.png", "png", "image"],
    ["image/jpg", "foto.jpg", "jpg", "image"],
  ])("classifica %s como imagem com extensao %s", async (mimeType, name, ext, type) => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", { uri: "file:///f", name, mimeType });
    expect(mock.storageCalls[0].args[0]).toMatch(new RegExp(`\\.${ext}$`));
    expect((mock.argsOf("professional_document", "insert")![0] as any).type).toBe(type);
  });

  it("deriva extensao e content-type do nome quando o mimeType nao vem", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", { uri: "file:///f", name: "carteira.PNG" });
    expect(mock.storageCalls[0].args[0]).toMatch(/\.png$/);
    expect((mock.storageCalls[0].args[2] as any).contentType).toBe("image/png");
  });

  it("normaliza jpeg para jpg", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", { uri: "file:///f", name: "foto.jpeg" });
    expect(mock.storageCalls[0].args[0]).toMatch(/\.jpg$/);
  });

  it("cai em pdf quando o nome nao tem extensao reconhecida mas o mime e pdf", async () => {
    stubFetch();
    await uploadProfessionalVerifierDocument("u1", {
      uri: "file:///f",
      name: "sem-extensao",
      mimeType: "application/pdf",
    });
    expect(mock.storageCalls[0].args[0]).toMatch(/\.pdf$/);
  });

  it.each([
    ["uri vazia", { uri: "", name: "a.pdf", mimeType: "application/pdf" }],
    ["uri so espacos", { uri: "   ", name: "a.pdf", mimeType: "application/pdf" }],
  ])("rejeita %s com missing_file", async (_l, bad) => {
    await expect(uploadProfessionalVerifierDocument("u1", bad as any)).rejects.toThrow(
      "missing_file",
    );
    expect(mock.client.storage.from).not.toHaveBeenCalled();
  });

  it("rejeita arquivo acima do limite com too_large", async () => {
    await expect(
      uploadProfessionalVerifierDocument("u1", {
        ...pick,
        size: MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES + 1,
      }),
    ).rejects.toThrow("too_large");
  });

  it("aceita arquivo exatamente no limite", async () => {
    stubFetch();
    await expect(
      uploadProfessionalVerifierDocument("u1", {
        ...pick,
        size: MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES,
      }),
    ).resolves.toBeUndefined();
  });

  it("aceita quando o tamanho e desconhecido", async () => {
    stubFetch();
    await expect(
      uploadProfessionalVerifierDocument("u1", { ...pick, size: null }),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["mimeType nao permitido", { uri: "f", name: "a.exe", mimeType: "application/x-msdownload" }],
    ["sem mime e extensao nao permitida", { uri: "f", name: "virus.exe" }],
  ])("rejeita %s com invalid_type", async (_l, bad) => {
    await expect(uploadProfessionalVerifierDocument("u1", bad as any)).rejects.toThrow(
      "invalid_type",
    );
  });

  it("propaga o erro de upload sem gravar linha no banco", async () => {
    stubFetch();
    mock.queueStorage(fail("bucket full"));
    await expect(uploadProfessionalVerifierDocument("u1", pick)).rejects.toMatchObject({
      message: "bucket full",
    });
    expect(mock.callsFor("professional_document")).toHaveLength(0);
  });

  it("apaga o arquivo do storage quando o insert falha, evitando orfao", async () => {
    stubFetch();
    mock.queueStorage(ok({ path: "x" }));
    mock.queue("professional_document", fail("rls violation"));

    await expect(uploadProfessionalVerifierDocument("u1", pick)).rejects.toMatchObject({
      message: "rls violation",
    });

    const removed = mock.storageCalls.find((c) => c.method === "remove");
    expect(removed).toBeDefined();
    expect((removed!.args[0] as string[])[0]).toBe(mock.storageCalls[0].args[0]);
  });
});

describe("upsertProfessionalCredentials", () => {
  const payload = {
    specialty: "  Fisiologia  ",
    registration_number: " CREF-123 ",
    institution: " USP ",
  } as any;

  it("atualiza a linha existente sem tocar em reputation_score", async () => {
    mock.queue("professional_profile", ok({ user_id: "u1" }));
    await upsertProfessionalCredentials("u1", payload);
    const row = mock.argsOf("professional_profile", "update")![0] as any;
    expect(row).toEqual({
      specialty: "Fisiologia",
      registration_number: "CREF-123",
      institution: "USP",
    });
    expect(row).not.toHaveProperty("reputation_score");
  });

  it("nao insere quando a linha ja existe", async () => {
    mock.queue("professional_profile", ok({ user_id: "u1" }));
    await upsertProfessionalCredentials("u1", payload);
    expect(mock.argsOf("professional_profile", "insert")).toBeUndefined();
  });

  it("insere quando o profissional ainda nao tem linha", async () => {
    mock.queue("professional_profile", ok(null), ok(null));
    await upsertProfessionalCredentials("u1", payload);
    expect(mock.argsOf("professional_profile", "insert")![0]).toEqual({
      user_id: "u1",
      specialty: "Fisiologia",
      registration_number: "CREF-123",
      institution: "USP",
    });
  });

  it.each([
    ["string vazia", ""],
    ["so espacos", "   "],
    ["undefined", undefined],
  ])("grava null quando o campo vem como %s", async (_l, value) => {
    mock.queue("professional_profile", ok({ user_id: "u1" }));
    await upsertProfessionalCredentials("u1", { specialty: value } as any);
    expect((mock.argsOf("professional_profile", "update")![0] as any).specialty).toBeNull();
  });

  it("propaga o erro do update", async () => {
    mock.queue("professional_profile", fail("rls violation"));
    await expect(upsertProfessionalCredentials("u1", payload)).rejects.toMatchObject({
      message: "rls violation",
    });
  });

  it("propaga o erro do insert de fallback", async () => {
    mock.queue("professional_profile", ok(null), fail("duplicate key"));
    await expect(upsertProfessionalCredentials("u1", payload)).rejects.toMatchObject({
      message: "duplicate key",
    });
  });
});

describe("fetchProProfileScreenData", () => {
  const setup = (over: Record<string, any> = {}) => {
    const pick = (k: string, fb: unknown) => (k in over ? over[k] : fb);
    mock.queue("profile", ok(pick("profile", {
      id: "p1", name: "Dra. Ana", username: "ana", avatar_url: "p1/av.png",
      verified: true, created_at: "2024-03-10T00:00:00Z",
    })));
    mock.queue("professional_profile", ok(pick("professional", {
      specialty: "Fisiologia", registration_number: "CREF-1",
      institution: "USP", reputation_score: 4.5,
    })));
    mock.queue("validation", count(pick("validationCount", 7)));
    mock.queue("professional_document", ok(pick("approvedDoc", null)));
    mock.queue("professional_document", ok(pick("latestDoc", null)));
    mock.queue("validation", ok(pick("validations", [])));
    if ("athleteNames" in over) mock.queue("profile", ok(over.athleteNames));
  };

  it("monta a tela do profissional com perfil, credenciais e contagem", async () => {
    setup();
    signed.mockResolvedValue("https://signed.test/av.png");

    await expect(fetchProProfileScreenData("p1")).resolves.toMatchObject({
      id: "p1",
      name: "Dra. Ana",
      username: "ana",
      avatarUrl: "https://signed.test/av.png",
      verified: true,
      memberSinceYear: 2024,
      issuedValidationCount: 7,
      reputationScore: 4.5,
      credentials: {
        specialty: "Fisiologia",
        registration_number: "CREF-1",
        institution: "USP",
      },
      document: null,
      documentSignedUrl: null,
      recentValidations: [],
    });
  });

  it("conta apenas validacoes aprovadas emitidas pelo profissional", async () => {
    setup();
    await fetchProProfileScreenData("p1");
    expect(mock.argsOf("validation", "eq", 0)).toEqual(["professional_user_id", "p1"]);
    expect(mock.argsOf("validation", "eq", 1)).toEqual(["status", "approved"]);
  });

  it("usa zero quando a contagem nao vem", async () => {
    setup({ validationCount: null });
    await expect(fetchProProfileScreenData("p1")).resolves.toMatchObject({
      issuedValidationCount: 0,
    });
  });

  it("usa valores neutros quando o perfil vem incompleto", async () => {
    setup({ profile: { id: "p1", name: null, username: null, avatar_url: null, verified: null, created_at: null } });
    const data = await fetchProProfileScreenData("p1");
    expect(data).toMatchObject({ name: "", username: null, verified: false });
    expect(data.memberSinceYear).toBe(new Date().getFullYear());
  });

  it("usa credenciais nulas quando nao ha linha de professional_profile", async () => {
    setup({ professional: null });
    await expect(fetchProProfileScreenData("p1")).resolves.toMatchObject({
      credentials: { specialty: null, registration_number: null, institution: null },
      reputationScore: null,
    });
  });

  it.each([
    ["string numerica (numeric do Postgres)", "4.25", 4.25],
    ["numero", 3, 3],
    ["null", null, null],
    ["texto invalido", "N/A", null],
  ])("interpreta reputation_score %s", async (_l, raw, expected) => {
    setup({ professional: { reputation_score: raw } });
    await expect(fetchProProfileScreenData("p1")).resolves.toMatchObject({
      reputationScore: expected,
    });
  });

  it("prefere o documento aprovado ao mais recente", async () => {
    setup({
      approvedDoc: { id: "d1", url: "professional_document/p1/ok.pdf", status: "approved", created_at: "2026-01-01" },
      latestDoc: { id: "d2", url: "professional_document/p1/novo.pdf", status: "pending", created_at: "2026-02-01" },
    });
    const data = await fetchProProfileScreenData("p1");
    expect(data.document).toMatchObject({ id: "d1", status: "approved" });
  });

  it("cai para o documento mais recente quando nenhum foi aprovado", async () => {
    setup({
      latestDoc: { id: "d2", url: "professional_document/p1/novo.pdf", status: "pending", created_at: "2026-02-01" },
    });
    const data = await fetchProProfileScreenData("p1");
    expect(data.document).toMatchObject({ id: "d2", status: "pending" });
  });

  it("assina o documento no bucket privado", async () => {
    setup({ approvedDoc: { id: "d1", url: "professional_document/p1/ok.pdf", status: "approved", created_at: "x" } });
    signed.mockResolvedValueOnce("https://signed.test/doc.pdf");
    const data = await fetchProProfileScreenData("p1");
    expect(signed).toHaveBeenCalledWith("professional-documents", "professional_document/p1/ok.pdf");
    expect(data.documentSignedUrl).toBe("https://signed.test/doc.pdf");
  });

  it("tenta o bucket media para caminhos antigos, anteriores a politica por papel", async () => {
    setup({ approvedDoc: { id: "d1", url: "legado/doc.pdf", status: "approved", created_at: "x" } });
    signed
      .mockResolvedValueOnce(null) // bucket novo
      .mockResolvedValueOnce("https://signed.test/legado.pdf"); // bucket media
    const data = await fetchProProfileScreenData("p1");
    expect(signed).toHaveBeenNthCalledWith(2, "media", "legado/doc.pdf");
    expect(data.documentSignedUrl).toBe("https://signed.test/legado.pdf");
  });

  it("nao assina quando o documento nao tem caminho", async () => {
    setup({ approvedDoc: { id: "d1", url: null, status: "pending", created_at: "x" } });
    const data = await fetchProProfileScreenData("p1");
    expect(data.documentSignedUrl).toBeNull();
  });

  it("resolve o nome do atleta em cada validacao recente", async () => {
    setup({
      validations: [
        { id: "v1", status: "approved", created_at: "2026-01-02", athlete_user_id: "a1" },
        { id: "v2", status: "pending", created_at: "2026-01-01", athlete_user_id: "a2" },
      ],
      athleteNames: [{ id: "a1", name: "Joao" }, { id: "a2", name: "Pedro" }],
    });
    const data = await fetchProProfileScreenData("p1");
    expect(data.recentValidations).toEqual([
      { id: "v1", status: "approved", created_at: "2026-01-02", athleteName: "Joao" },
      { id: "v2", status: "pending", created_at: "2026-01-01", athleteName: "Pedro" },
    ]);
  });

  it("deduplica os ids antes de buscar nomes", async () => {
    setup({
      validations: [
        { id: "v1", status: "approved", created_at: "x", athlete_user_id: "a1" },
        { id: "v2", status: "pending", created_at: "y", athlete_user_id: "a1" },
      ],
      athleteNames: [{ id: "a1", name: "Joao" }],
    });
    await fetchProProfileScreenData("p1");
    expect(mock.argsOf("profile", "in")).toEqual(["id", ["a1"]]);
  });

  it("usa nome vazio quando o atleta some do banco", async () => {
    setup({
      validations: [{ id: "v1", status: "approved", created_at: "x", athlete_user_id: "sumiu" }],
      athleteNames: [],
    });
    const data = await fetchProProfileScreenData("p1");
    expect(data.recentValidations[0].athleteName).toBe("");
  });

  it("nao consulta nomes quando nao ha validacao recente", async () => {
    setup();
    await fetchProProfileScreenData("p1");
    expect(mock.callsFor("profile")).toHaveLength(1);
  });

  it("limita o historico recente a 10 validacoes", async () => {
    setup();
    await fetchProProfileScreenData("p1");
    expect(mock.argsOf("validation", "limit")).toEqual([10]);
  });

  it("lanca Profile not found quando o perfil nao existe", async () => {
    setup({ profile: null });
    await expect(fetchProProfileScreenData("p1")).rejects.toThrow("Profile not found");
  });

  it.each([
    ["profile", 0],
    ["professional_profile", 1],
  ])("propaga o erro da consulta de %s", async (table, _i) => {
    setup();
    mock.reset();
    if (table === "profile") {
      mock.queue("profile", fail("rls violation"));
    } else {
      mock.queue("profile", ok({ id: "p1", created_at: "2024-01-01" }));
      mock.queue("professional_profile", fail("rls violation"));
    }
    mock.queue("validation", count(0));
    mock.queue("professional_document", ok(null), ok(null));
    mock.queue("validation", ok([]));
    await expect(fetchProProfileScreenData("p1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });

  it("propaga o erro da busca de nomes de atletas", async () => {
    // sem `athleteNames`: a segunda leitura de `profile` (a dos nomes) pega o erro.
    setup({ validations: [{ id: "v1", status: "approved", created_at: "x", athlete_user_id: "a1" }] });
    mock.queue("profile", fail("rls violation"));
    await expect(fetchProProfileScreenData("p1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("documentDisplayName", () => {
  it("mostra apenas o nome do arquivo, sem o caminho do bucket", () => {
    expect(
      documentDisplayName(
        { id: "d1", storagePath: "professional_document/u1/123-abc.pdf" } as any,
        "fallback",
      ),
    ).toBe("123-abc.pdf");
  });

  it.each([
    ["documento null", null],
    ["sem storagePath", { id: "d1", storagePath: null }],
    ["storagePath vazio", { id: "d1", storagePath: "" }],
  ])("usa o fallback quando %s", (_l, doc) => {
    expect(documentDisplayName(doc as any, "Nenhum documento")).toBe("Nenhum documento");
  });

  it("tolera caminho com barras duplicadas", () => {
    expect(
      documentDisplayName({ id: "d1", storagePath: "a//b//arquivo.pdf" } as any, "fb"),
    ).toBe("arquivo.pdf");
  });

  it("devolve o proprio valor quando nao ha barra alguma", () => {
    expect(documentDisplayName({ id: "d1", storagePath: "arquivo.pdf" } as any, "fb")).toBe(
      "arquivo.pdf",
    );
  });
});
