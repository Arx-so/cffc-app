jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/processes/validationStats", () => ({
  fetchApprovedValidationCountsByAthleteIds: jest.fn(async () => new Map()),
  validationCountsMapGet: jest.fn((map: Map<string, number>, id: string) => map.get(id) ?? 0),
}));
jest.mock("@/utils/supabaseStorage", () => ({ getSignedUrl: jest.fn(async () => null) }));

import { ok, fail, count } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { fetchApprovedValidationCountsByAthleteIds } from "@/processes/validationStats";
import { getSignedUrl } from "@/utils/supabaseStorage";
import {
  hasExistingValidation,
  submitValidation,
  fetchValidatedAthletes,
} from "@/processes/validation";

const counts = fetchApprovedValidationCountsByAthleteIds as jest.Mock;
const signed = getSignedUrl as jest.Mock;

beforeEach(() => {
  mock.reset();
  counts.mockReset().mockResolvedValue(new Map());
  signed.mockReset().mockResolvedValue(null);
});

describe("hasExistingValidation", () => {
  it("e verdadeiro quando ja existe validacao do profissional para o atleta", async () => {
    mock.queue("validation", count(1));
    await expect(hasExistingValidation("a1", "p1")).resolves.toBe(true);
  });

  it("e falso quando a contagem e zero", async () => {
    mock.queue("validation", count(0));
    await expect(hasExistingValidation("a1", "p1")).resolves.toBe(false);
  });

  it("e falso quando o Supabase nao devolve contagem", async () => {
    mock.queue("validation", ok(null));
    await expect(hasExistingValidation("a1", "p1")).resolves.toBe(false);
  });

  it("usa head request com contagem exata, sem trazer linhas", async () => {
    mock.queue("validation", count(0));
    await hasExistingValidation("a1", "p1");
    expect(mock.argsOf("validation", "select")).toEqual(["id", { count: "exact", head: true }]);
  });

  it("filtra pelo par atleta/profissional", async () => {
    mock.queue("validation", count(0));
    await hasExistingValidation("a1", "p1");
    expect(mock.argsOf("validation", "eq", 0)).toEqual(["athlete_user_id", "a1"]);
    expect(mock.argsOf("validation", "eq", 1)).toEqual(["professional_user_id", "p1"]);
  });

  it("propaga o erro em vez de responder falso", async () => {
    mock.queue("validation", fail("rls violation"));
    await expect(hasExistingValidation("a1", "p1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});

describe("submitValidation", () => {
  const params = {
    athleteUserId: "a1",
    professionalUserId: "p1",
    checklist: { yoyo_test: { level: 15 } } as any,
    note: "Bom desempenho",
  };

  it("insere a validacao como pendente, aguardando moderacao", async () => {
    mock.queue("validation", ok(null));
    await submitValidation(params);
    expect(mock.argsOf("validation", "insert")).toEqual([
      {
        athlete_user_id: "a1",
        professional_user_id: "p1",
        professional_role: "pro",
        checklist: { yoyo_test: { level: 15 } },
        note: "Bom desempenho",
        status: "pending",
      },
    ]);
  });

  it("remove espacos nas bordas da nota", async () => {
    mock.queue("validation", ok(null));
    await submitValidation({ ...params, note: "  ok  " });
    expect((mock.argsOf("validation", "insert")![0] as any).note).toBe("ok");
  });

  it.each([
    ["vazia", ""],
    ["so espacos", "   "],
  ])("grava nota null quando a nota e %s", async (_l, note) => {
    mock.queue("validation", ok(null));
    await submitValidation({ ...params, note });
    expect((mock.argsOf("validation", "insert")![0] as any).note).toBeNull();
  });

  it("propaga o erro quando a insercao falha", async () => {
    mock.queue("validation", fail("duplicate"));
    await expect(submitValidation(params)).rejects.toMatchObject({ message: "duplicate" });
  });
});

describe("fetchValidatedAthletes", () => {
  // `pick` respeita `null` explícito no override — com `??` um `null` cairia
  // silenciosamente no default e o teste passaria pelo motivo errado.
  const setup = (over: Record<string, any> = {}) => {
    const pick = (key: string, fallback: unknown) => (key in over ? over[key] : fallback);
    mock.queue("validation", ok(pick("validations", [{ athlete_user_id: "a1", status: "approved" }])));
    mock.queue("profile", ok(pick("profiles", [
      { id: "a1", name: "Joao", username: "joao", avatar_url: "a1/av.png", verified: true },
    ])));
    mock.queue("athlete_profile", ok(pick("athleteProfiles", [{ user_id: "a1", positions: ["st"] }])));
    mock.queue("media", ok(pick("media", [{ athlete_user_id: "a1" }, { athlete_user_id: "a1" }])));
    mock.queue("contact_request", ok(pick("contacts", [{ athlete_user_id: "a1" }])));
  };

  it("monta o card do atleta com dados de perfil, posicoes e contagens", async () => {
    setup();
    counts.mockResolvedValue(new Map([["a1", 4]]));
    signed.mockResolvedValue("https://signed.test/av.png");

    await expect(fetchValidatedAthletes("p1")).resolves.toEqual([
      {
        id: "a1",
        name: "Joao",
        username: "joao",
        avatarUrl: "https://signed.test/av.png",
        verified: true,
        positions: ["st"],
        videoCount: 2,
        validationCount: 4,
        contactCount: 1,
        isShortlisted: false,
        validationStatus: "approved",
      },
    ]);
  });

  it("retorna lista vazia quando o profissional nao validou ninguem", async () => {
    mock.queue("validation", ok([]));
    await expect(fetchValidatedAthletes("p1")).resolves.toEqual([]);
    expect(mock.callsFor("profile")).toHaveLength(0);
  });

  it("retorna lista vazia quando a consulta devolve null", async () => {
    mock.queue("validation", ok(null));
    await expect(fetchValidatedAthletes("p1")).resolves.toEqual([]);
  });

  it("mantem apenas a validacao mais recente por atleta", async () => {
    setup({
      validations: [
        { athlete_user_id: "a1", status: "pending" },
        { athlete_user_id: "a1", status: "approved" },
      ],
    });
    const [athlete] = await fetchValidatedAthletes("p1");
    expect(athlete.validationStatus).toBe("approved");
  });

  it("ordena as validacoes da mais antiga para a mais recente, para o ultimo vencer", async () => {
    setup();
    await fetchValidatedAthletes("p1");
    expect(mock.argsOf("validation", "order")).toEqual(["created_at", { ascending: true }]);
  });

  it("conta apenas videos aprovados do tipo video", async () => {
    setup();
    await fetchValidatedAthletes("p1");
    expect(mock.argsOf("media", "eq", 0)).toEqual(["type", "video"]);
    expect(mock.argsOf("media", "eq", 1)).toEqual(["status", "approved"]);
  });

  it("conta apenas pedidos de contato aceitos", async () => {
    setup();
    await fetchValidatedAthletes("p1");
    expect(mock.argsOf("contact_request", "eq")).toEqual(["status", "accepted"]);
  });

  it("nao conta videos nem contatos de outro atleta", async () => {
    setup({
      media: [{ athlete_user_id: "a1" }, { athlete_user_id: "outro" }],
      contacts: [{ athlete_user_id: "outro" }],
    });
    const [athlete] = await fetchValidatedAthletes("p1");
    expect(athlete.videoCount).toBe(1);
    expect(athlete.contactCount).toBe(0);
  });

  it("usa valores neutros quando o perfil vem incompleto", async () => {
    setup({
      profiles: [{ id: "a1", name: null, username: null, avatar_url: null, verified: null }],
      athleteProfiles: [],
      media: null,
      contacts: null,
    });
    const [athlete] = await fetchValidatedAthletes("p1");
    expect(athlete).toMatchObject({
      name: "",
      username: null,
      verified: false,
      positions: [],
      videoCount: 0,
      contactCount: 0,
    });
  });

  it("usa lista vazia quando athlete_profile vem sem positions", async () => {
    setup({ athleteProfiles: [{ user_id: "a1", positions: null }] });
    const [athlete] = await fetchValidatedAthletes("p1");
    expect(athlete.positions).toEqual([]);
  });

  it("assina o avatar no bucket media", async () => {
    setup();
    await fetchValidatedAthletes("p1");
    expect(signed).toHaveBeenCalledWith("media", "a1/av.png");
  });

  it("propaga o erro da consulta de validacoes", async () => {
    mock.queue("validation", fail("timeout"));
    await expect(fetchValidatedAthletes("p1")).rejects.toMatchObject({ message: "timeout" });
  });

  it("propaga o erro da consulta de perfis", async () => {
    mock.queue("validation", ok([{ athlete_user_id: "a1", status: "approved" }]));
    mock.queue("profile", fail("rls violation"));
    await expect(fetchValidatedAthletes("p1")).rejects.toMatchObject({
      message: "rls violation",
    });
  });
});
