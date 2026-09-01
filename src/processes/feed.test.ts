jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));
jest.mock("@/processes/moderation", () => ({ fetchBlockedUserIds: jest.fn(async () => []) }));
jest.mock("@/utils/supabaseStorage", () => ({ getSignedUrl: jest.fn(async () => null) }));

import { ok, fail } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { fetchBlockedUserIds } from "@/processes/moderation";
import { getSignedUrl } from "@/utils/supabaseStorage";
import { fetchVideoFeed, fetchUserVideoFeed } from "@/processes/feed";

const blocked = fetchBlockedUserIds as jest.Mock;
const signed = getSignedUrl as jest.Mock;

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "m1",
  athlete_user_id: "a1",
  title: "Golaco",
  url: "a1/video.mp4",
  created_at: "2026-01-01T00:00:00Z",
  athlete: { username: "joao" },
  ...over,
});

beforeEach(() => {
  mock.reset();
  blocked.mockReset().mockResolvedValue([]);
  signed.mockReset().mockResolvedValue(null);
});

describe("fetchVideoFeed", () => {
  it("mapeia a linha do banco para o formato do feed", async () => {
    mock.queue("media", ok([row()]));
    signed.mockResolvedValue("https://signed.test/v.mp4");

    await expect(fetchVideoFeed()).resolves.toEqual([
      {
        id: "m1",
        athleteUserId: "a1",
        username: "joao",
        title: "Golaco",
        url: "https://signed.test/v.mp4",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);
  });

  it("filtra apenas videos aprovados, mais recentes primeiro, limitado a 50", async () => {
    mock.queue("media", ok([]));
    await fetchVideoFeed();
    expect(mock.argsOf("media", "eq", 0)).toEqual(["type", "video"]);
    expect(mock.argsOf("media", "eq", 1)).toEqual(["status", "approved"]);
    expect(mock.argsOf("media", "order")).toEqual(["created_at", { ascending: false }]);
    expect(mock.argsOf("media", "limit")).toEqual([50]);
  });

  it("remove do feed os videos de usuarios bloqueados", async () => {
    mock.queue("media", ok([row(), row({ id: "m2", athlete_user_id: "bloqueado" })]));
    blocked.mockResolvedValue(["bloqueado"]);

    const feed = await fetchVideoFeed();
    expect(feed.map((v) => v.id)).toEqual(["m1"]);
  });

  it("nao derruba o feed quando a consulta de bloqueios falha", async () => {
    mock.queue("media", ok([row()]));
    blocked.mockRejectedValue(new Error("rls"));
    await expect(fetchVideoFeed()).resolves.toHaveLength(1);
  });

  it("assina a url de cada video no bucket media", async () => {
    mock.queue("media", ok([row(), row({ id: "m2", url: "a1/outro.mp4" })]));
    await fetchVideoFeed();
    expect(signed).toHaveBeenCalledWith("media", "a1/video.mp4");
    expect(signed).toHaveBeenCalledWith("media", "a1/outro.mp4");
  });

  it("cai para a url crua quando a assinatura falha, em vez de entregar video quebrado", async () => {
    mock.queue("media", ok([row()]));
    signed.mockResolvedValue(null);
    const [video] = await fetchVideoFeed();
    expect(video.url).toBe("a1/video.mp4");
  });

  it("usa username null quando o join devolve array (relacao ambigua do PostgREST)", async () => {
    mock.queue("media", ok([row({ athlete: [{ username: "joao" }] })]));
    const [video] = await fetchVideoFeed();
    expect(video.username).toBeNull();
  });

  it.each([
    ["athlete null", null],
    ["athlete ausente", undefined],
  ])("usa username null quando %s", async (_l, athlete) => {
    mock.queue("media", ok([row({ athlete })]));
    const [video] = await fetchVideoFeed();
    expect(video.username).toBeNull();
  });

  it("retorna lista vazia quando data vem null", async () => {
    mock.queue("media", ok(null));
    await expect(fetchVideoFeed()).resolves.toEqual([]);
  });

  it("propaga o erro da consulta de midia", async () => {
    mock.queue("media", fail("timeout"));
    await expect(fetchVideoFeed()).rejects.toMatchObject({ message: "timeout" });
  });
});

describe("fetchUserVideoFeed", () => {
  it("filtra pelo atleta pedido, alem de tipo e status", async () => {
    mock.queue("media", ok([]));
    await fetchUserVideoFeed("a7");
    expect(mock.argsOf("media", "eq", 0)).toEqual(["type", "video"]);
    expect(mock.argsOf("media", "eq", 1)).toEqual(["status", "approved"]);
    expect(mock.argsOf("media", "eq", 2)).toEqual(["athlete_user_id", "a7"]);
  });

  it("nao aplica limite de pagina, diferente do feed geral", async () => {
    mock.queue("media", ok([]));
    await fetchUserVideoFeed("a7");
    expect(mock.argsOf("media", "limit")).toBeUndefined();
  });

  it("nao filtra por bloqueio — sao os proprios videos do usuario", async () => {
    mock.queue("media", ok([row()]));
    await fetchUserVideoFeed("a1");
    expect(blocked).not.toHaveBeenCalled();
  });

  it("mapeia e assina igual ao feed geral", async () => {
    mock.queue("media", ok([row()]));
    signed.mockResolvedValue("https://signed.test/u.mp4");
    const [video] = await fetchUserVideoFeed("a1");
    expect(video).toMatchObject({ id: "m1", username: "joao", url: "https://signed.test/u.mp4" });
  });

  it("retorna lista vazia quando o atleta nao tem video aprovado", async () => {
    mock.queue("media", ok(null));
    await expect(fetchUserVideoFeed("a1")).resolves.toEqual([]);
  });

  it("propaga o erro da consulta", async () => {
    mock.queue("media", fail("timeout"));
    await expect(fetchUserVideoFeed("a1")).rejects.toMatchObject({ message: "timeout" });
  });
});
