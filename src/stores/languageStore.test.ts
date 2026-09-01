jest.mock("@/config/i18n", () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn(), language: "en" },
}));

import i18n from "@/config/i18n";
import { useLanguageStore } from "@/stores/languageStore";

const changeLanguage = (i18n as any).changeLanguage as jest.Mock;
const state = () => useLanguageStore.getState();

beforeEach(() => {
  changeLanguage.mockClear();
  useLanguageStore.setState({ language: "en" });
});

describe("estado inicial", () => {
  it("comeca em ingles", () => {
    expect(state().language).toBe("en");
  });
});

describe("setLanguage", () => {
  it.each([
    ["ja", "ja"],
    ["pt-BR", "pt-BR"],
    ["en", "en"],
  ])("guarda %s como %s", (input, expected) => {
    state().setLanguage(input as any);
    expect(state().language).toBe(expected);
  });

  it("normaliza pt-br minusculo para pt-BR, a tag suportada pelo i18n", () => {
    state().setLanguage("pt-br" as any);
    expect(state().language).toBe("pt-BR");
  });

  it("cai em ingles para qualquer idioma nao suportado", () => {
    state().setLanguage("de" as any);
    expect(state().language).toBe("en");
    state().setLanguage("" as any);
    expect(state().language).toBe("en");
  });

  it("troca o idioma do i18n com o valor ja normalizado", () => {
    state().setLanguage("pt-br" as any);
    expect(changeLanguage).toHaveBeenCalledWith("pt-BR");
  });

  it("nao propaga a tag crua para o i18n", () => {
    state().setLanguage("de" as any);
    expect(changeLanguage).toHaveBeenCalledWith("en");
    expect(changeLanguage).not.toHaveBeenCalledWith("de");
  });
});

describe("rehidratacao do storage persistido", () => {
  /** Reproduz o callback que o middleware `persist` invoca ao reidratar. */
  const rehydrate = (persisted: unknown) => {
    const options = (useLanguageStore as any).persist.getOptions();
    options.onRehydrateStorage()(persisted);
  };

  it("reaplica no i18n o idioma que veio do disco", () => {
    rehydrate({ language: "ja", setLanguage: jest.fn() });
    expect(changeLanguage).toHaveBeenCalledWith("ja");
  });

  it("corrige um valor legado pt-br gravado por versoes antigas", () => {
    const setLanguage = jest.fn();
    rehydrate({ language: "pt-br", setLanguage });
    expect(changeLanguage).toHaveBeenCalledWith("pt-BR");
    // reescreve no disco para o valor normalizado
    expect(setLanguage).toHaveBeenCalledWith("pt-BR");
  });

  it("nao reescreve quando o valor no disco ja esta normalizado", () => {
    const setLanguage = jest.fn();
    rehydrate({ language: "pt-BR", setLanguage });
    expect(setLanguage).not.toHaveBeenCalled();
  });

  it("nao quebra quando a rehidratacao falha e entrega estado indefinido", () => {
    expect(() => rehydrate(undefined)).not.toThrow();
    expect(changeLanguage).not.toHaveBeenCalled();
  });

  it("persiste sob a chave language-store", () => {
    expect((useLanguageStore as any).persist.getOptions().name).toBe("language-store");
  });
});
