import { saveToken, getToken, removeToken } from "@/utils/storage";
import { secureStorage } from "@/utils/secureStorage";

jest.mock("@/utils/secureStorage", () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mocked = secureStorage as jest.Mocked<typeof secureStorage>;

beforeEach(() => jest.clearAllMocks());

describe("saveToken", () => {
  it("grava sob a chave auth_token", async () => {
    await saveToken("jwt-123");
    expect(mocked.setItem).toHaveBeenCalledWith("auth_token", "jwt-123");
  });

  it("propaga a falha do storage em vez de engolir", async () => {
    mocked.setItem.mockRejectedValueOnce(new Error("keychain indisponivel"));
    await expect(saveToken("jwt-123")).rejects.toThrow("keychain indisponivel");
  });
});

describe("getToken", () => {
  it("le a mesma chave usada na escrita", async () => {
    mocked.getItem.mockResolvedValueOnce("jwt-123");
    await expect(getToken()).resolves.toBe("jwt-123");
    expect(mocked.getItem).toHaveBeenCalledWith("auth_token");
  });

  it("retorna null quando nao ha token guardado", async () => {
    mocked.getItem.mockResolvedValueOnce(null);
    await expect(getToken()).resolves.toBeNull();
  });
});

describe("removeToken", () => {
  it("remove a mesma chave usada na escrita", async () => {
    await removeToken();
    expect(mocked.removeItem).toHaveBeenCalledWith("auth_token");
  });
});

it("save -> get -> remove -> get devolve o token e depois null", async () => {
  const store = new Map<string, string>();
  mocked.setItem.mockImplementation(async (k, v) => void store.set(k, v));
  mocked.getItem.mockImplementation(async (k) => store.get(k) ?? null);
  mocked.removeItem.mockImplementation(async (k) => void store.delete(k));

  await saveToken("jwt-abc");
  await expect(getToken()).resolves.toBe("jwt-abc");
  await removeToken();
  await expect(getToken()).resolves.toBeNull();
});
