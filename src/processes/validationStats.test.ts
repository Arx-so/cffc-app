jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));

import { ok, fail } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import {
  fetchApprovedValidationCountsByAthleteIds,
  validationCountsMapGet,
} from "@/processes/validationStats";

const RPC = "rpc:cffc_public_approved_validation_counts";

beforeEach(() => mock.reset());

describe("fetchApprovedValidationCountsByAthleteIds", () => {
  it("monta o mapa de id para contagem a partir do retorno da RPC", async () => {
    mock.queue(RPC, ok([
      { athlete_user_id: "a1", approved_count: 3 },
      { athlete_user_id: "a2", approved_count: 0 },
    ]));

    const map = await fetchApprovedValidationCountsByAthleteIds(["a1", "a2"]);
    expect(map.get("a1")).toBe(3);
    expect(map.get("a2")).toBe(0);
  });

  it("chama a RPC de contagens aprovadas com os ids pedidos", async () => {
    mock.queue(RPC, ok([]));
    await fetchApprovedValidationCountsByAthleteIds(["a1"]);
    expect(mock.client.rpc).toHaveBeenCalledWith("cffc_public_approved_validation_counts", {
      p_athlete_ids: ["a1"],
    });
  });

  it("nao chama a RPC quando a lista de atletas esta vazia", async () => {
    const map = await fetchApprovedValidationCountsByAthleteIds([]);
    expect(map.size).toBe(0);
    expect(mock.client.rpc).not.toHaveBeenCalled();
  });

  it("converte contagem em string para numero (a RPC pode devolver bigint)", async () => {
    mock.queue(RPC, ok([{ athlete_user_id: "a1", approved_count: "7" }]));
    const map = await fetchApprovedValidationCountsByAthleteIds(["a1"]);
    expect(map.get("a1")).toBe(7);
    expect(typeof map.get("a1")).toBe("number");
  });

  it("normaliza a chave para minusculo, evitando divergencia de casing com a RPC", async () => {
    mock.queue(RPC, ok([{ athlete_user_id: "A1-UUID" }]));
    const map = await fetchApprovedValidationCountsByAthleteIds(["A1-UUID"]);
    expect(map.has("a1-uuid")).toBe(true);
  });

  it("retorna mapa vazio quando a RPC devolve null", async () => {
    mock.queue(RPC, ok(null));
    const map = await fetchApprovedValidationCountsByAthleteIds(["a1"]);
    expect(map.size).toBe(0);
  });

  it("propaga o erro da RPC", async () => {
    mock.queue(RPC, fail("function does not exist", "42883"));
    await expect(fetchApprovedValidationCountsByAthleteIds(["a1"])).rejects.toMatchObject({
      code: "42883",
    });
  });
});

describe("validationCountsMapGet", () => {
  it("le a contagem usando a mesma normalizacao da escrita", async () => {
    mock.queue(RPC, ok([{ athlete_user_id: "A1-UUID", approved_count: 5 }]));
    const map = await fetchApprovedValidationCountsByAthleteIds(["A1-UUID"]);

    // O chamador pode ter o id em qualquer casing; a leitura tem que bater.
    expect(validationCountsMapGet(map, "A1-UUID")).toBe(5);
    expect(validationCountsMapGet(map, "a1-uuid")).toBe(5);
    expect(validationCountsMapGet(map, "  A1-UUID  ")).toBe(5);
  });

  it("retorna 0 para atleta ausente do mapa, em vez de undefined", () => {
    expect(validationCountsMapGet(new Map(), "desconhecido")).toBe(0);
  });

  it("preserva o zero explicito", () => {
    expect(validationCountsMapGet(new Map([["a1", 0]]), "a1")).toBe(0);
  });
});
