jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));

import { ok, fail } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { fetchBlockedUserIds, blockUser, reportContent } from "@/processes/moderation";

beforeEach(() => mock.reset());

describe("fetchBlockedUserIds", () => {
  it("extrai apenas os ids da coluna blocked_id", async () => {
    mock.queue("user_block", ok([{ blocked_id: "u1" }, { blocked_id: "u2" }]));
    await expect(fetchBlockedUserIds()).resolves.toEqual(["u1", "u2"]);
  });

  it("consulta a tabela user_block selecionando blocked_id", async () => {
    mock.queue("user_block", ok([]));
    await fetchBlockedUserIds();
    expect(mock.client.from).toHaveBeenCalledWith("user_block");
    expect(mock.argsOf("user_block", "select")).toEqual(["blocked_id"]);
  });

  it("retorna lista vazia quando o usuario nao bloqueou ninguem", async () => {
    mock.queue("user_block", ok([]));
    await expect(fetchBlockedUserIds()).resolves.toEqual([]);
  });

  it("retorna lista vazia quando data vem null", async () => {
    mock.queue("user_block", ok(null));
    await expect(fetchBlockedUserIds()).resolves.toEqual([]);
  });

  it("propaga o erro do Supabase em vez de devolver lista vazia", async () => {
    mock.queue("user_block", fail("permission denied", "42501"));
    await expect(fetchBlockedUserIds()).rejects.toMatchObject({ message: "permission denied" });
  });
});

describe("blockUser", () => {
  it("insere o bloqueio com o id informado", async () => {
    mock.queue("user_block", ok(null));
    await blockUser("u9");
    expect(mock.argsOf("user_block", "insert")).toEqual([{ blocked_id: "u9" }]);
  });

  it("propaga o erro quando a insercao falha", async () => {
    mock.queue("user_block", fail("duplicate key", "23505"));
    await expect(blockUser("u9")).rejects.toMatchObject({ code: "23505" });
  });
});

describe("reportContent", () => {
  it("mapeia os campos do corpo para as colunas da tabela", async () => {
    mock.queue("content_report", ok(null));
    await reportContent({ reportedUserId: "u5", mediaId: "m1", reason: "spam" } as any);
    expect(mock.argsOf("content_report", "insert")).toEqual([
      { reported_user_id: "u5", media_id: "m1", reason: "spam" },
    ]);
  });

  it("grava media_id null quando a denuncia e do perfil, nao de um video", async () => {
    mock.queue("content_report", ok(null));
    await reportContent({ reportedUserId: "u5", reason: "abuse" } as any);
    expect((mock.argsOf("content_report", "insert")![0] as any).media_id).toBeNull();
  });

  it("propaga o erro quando a denuncia falha", async () => {
    mock.queue("content_report", fail("rls violation"));
    await expect(
      reportContent({ reportedUserId: "u5", reason: "spam" } as any),
    ).rejects.toMatchObject({ message: "rls violation" });
  });
});
