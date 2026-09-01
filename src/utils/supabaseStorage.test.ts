jest.mock("@/config/supabase", () => ({
  supabase: require("@/test/supabaseTestClient").supabaseMock.client,
}));

import { ok, fail } from "@/test/supabaseMock";
import { supabaseMock as mock } from "@/test/supabaseTestClient";
import { getSignedUrl } from "@/utils/supabaseStorage";

const ONE_HOUR = 3600;

beforeEach(() => {
  mock.reset();
  jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("getSignedUrl", () => {
  it("assina o caminho no bucket pedido com validade de 1 hora", async () => {
    mock.queueStorage(ok({ signedUrl: "https://signed.test/a.mp4?token=x" }));

    await expect(getSignedUrl("videos", "user/a.mp4")).resolves.toBe(
      "https://signed.test/a.mp4?token=x",
    );
    expect(mock.client.storage.from).toHaveBeenCalledWith("videos");
    expect(mock.storageCalls[0]).toEqual({
      method: "createSignedUrl",
      args: ["user/a.mp4", ONE_HOUR],
    });
  });

  it("remove espacos nas bordas antes de assinar", async () => {
    mock.queueStorage(ok({ signedUrl: "https://signed.test/b.mp4" }));
    await getSignedUrl("videos", "  user/b.mp4  ");
    expect(mock.storageCalls[0].args[0]).toBe("user/b.mp4");
  });

  it.each([null, undefined, "", "   "])(
    "retorna null sem chamar o storage para o caminho %p",
    async (path) => {
      await expect(getSignedUrl("videos", path)).resolves.toBeNull();
      expect(mock.client.storage.from).not.toHaveBeenCalled();
    },
  );

  it("retorna null quando a assinatura falha (arquivo inexistente)", async () => {
    mock.queueStorage(fail("Object not found"));
    await expect(getSignedUrl("videos", "sumiu.mp4")).resolves.toBeNull();
  });

  it("retorna null quando a resposta vem sem signedUrl", async () => {
    mock.queueStorage(ok({}));
    await expect(getSignedUrl("videos", "vazio.mp4")).resolves.toBeNull();
  });

  it("loga um aviso identificando bucket e caminho quando falha", async () => {
    mock.queueStorage(fail("Object not found"));
    await getSignedUrl("avatars", "u/1.png");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("avatars/u/1.png"),
      "Object not found",
    );
  });

  it("nao loga aviso no caminho feliz", async () => {
    mock.queueStorage(ok({ signedUrl: "https://signed.test/ok.png" }));
    await getSignedUrl("avatars", "u/1.png");
    expect(console.warn).not.toHaveBeenCalled();
  });
});
