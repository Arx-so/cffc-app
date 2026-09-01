/**
 * `secureStorage` resolve web-vs-native no momento do import (`Platform.OS === "web"`),
 * então cada bloco reimporta o módulo com o Platform trocado. Sem isso só um dos
 * dois ramos seria exercitado.
 */

const loadWith = (os: string) => {
  let mod: typeof import("@/utils/secureStorage");
  jest.isolateModules(() => {
    jest.doMock("react-native", () => ({ Platform: { OS: os } }));
    mod = require("@/utils/secureStorage");
  });
  return mod!.secureStorage;
};

afterEach(() => {
  jest.dontMock("react-native");
  jest.resetModules();
});

describe("no native", () => {
  it("delega para o SecureStore do Expo", async () => {
    const SecureStore = require("expo-secure-store");
    const storage = loadWith("ios");

    await storage.setItem("k", "v");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("k", "v");

    await expect(storage.getItem("k")).resolves.toBe("v");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("k");

    await storage.removeItem("k");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("k");
    await expect(storage.getItem("k")).resolves.toBeNull();
  });

  it("usa a mesma implementacao no android", async () => {
    const SecureStore = require("expo-secure-store");
    const storage = loadWith("android");
    await storage.setItem("android-key", "x");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("android-key", "x");
  });
});

describe("na web com localStorage disponivel", () => {
  let original: Storage | undefined;

  beforeEach(() => {
    original = (globalThis as any).localStorage;
    const backing = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: jest.fn((k: string) => backing.get(k) ?? null),
      setItem: jest.fn((k: string, v: string) => void backing.set(k, v)),
      removeItem: jest.fn((k: string) => void backing.delete(k)),
    };
  });

  afterEach(() => {
    if (original === undefined) delete (globalThis as any).localStorage;
    else (globalThis as any).localStorage = original;
  });

  it("faz round-trip pelo localStorage", async () => {
    const storage = loadWith("web");
    await storage.setItem("token", "abc");
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("token", "abc");
    await expect(storage.getItem("token")).resolves.toBe("abc");
    await storage.removeItem("token");
    await expect(storage.getItem("token")).resolves.toBeNull();
  });

  it("nao toca no SecureStore nativo", async () => {
    const SecureStore = require("expo-secure-store");
    (SecureStore.setItemAsync as jest.Mock).mockClear();
    const storage = loadWith("web");
    await storage.setItem("token", "abc");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("retorna null para chave inexistente", async () => {
    const storage = loadWith("web");
    await expect(storage.getItem("nunca-gravada")).resolves.toBeNull();
  });
});

describe("na web sem localStorage (SSR / ambiente restrito)", () => {
  let original: Storage;

  beforeEach(() => {
    original = (globalThis as any).localStorage;
    delete (globalThis as any).localStorage;
  });

  afterEach(() => {
    (globalThis as any).localStorage = original;
  });

  it("cai no store em memoria e ainda faz round-trip", async () => {
    const storage = loadWith("web");
    await expect(storage.getItem("k")).resolves.toBeNull();
    await storage.setItem("k", "memoria");
    await expect(storage.getItem("k")).resolves.toBe("memoria");
    await storage.removeItem("k");
    await expect(storage.getItem("k")).resolves.toBeNull();
  });

  it("nao lanca ao remover chave inexistente", async () => {
    const storage = loadWith("web");
    await expect(storage.removeItem("fantasma")).resolves.toBeUndefined();
  });
});
