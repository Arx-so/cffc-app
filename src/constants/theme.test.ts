import { Colors, Fonts, Spacing, Brand, BottomTabInset, MaxContentWidth } from "@/constants/theme";
import { contrastRatio, AA_NORMAL, AA_LARGE } from "@/test/contrast";

describe("Colors", () => {
  it("define os mesmos tokens em light e dark", () => {
    expect(Object.keys(Colors.light).sort()).toEqual(Object.keys(Colors.dark).sort());
  });

  it.each(["light", "dark"] as const)("texto sobre fundo passa em AA no tema %s", (scheme) => {
    expect(contrastRatio(Colors[scheme].text, Colors[scheme].background)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(["light", "dark"] as const)("texto secundario passa em AA no tema %s", (scheme) => {
    expect(
      contrastRatio(Colors[scheme].textSecondary, Colors[scheme].background),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

describe("Brand — contraste", () => {
  const SURFACES = ["bg", "card", "cardAlt", "surface"] as const;

  it.each(SURFACES)("texto branco passa em AA sobre %s", (surface) => {
    expect(contrastRatio(Brand.white, Brand[surface])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  // O comentario em theme.ts registra que `gray` foi clareado de #8FA39E porque
  // o original falhava AA (4.17:1). Este teste impede o retrocesso.
  it.each(SURFACES)("cinza secundario passa em AA sobre %s", (surface) => {
    expect(contrastRatio(Brand.gray, Brand[surface])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("o cinza atual e mais claro que o #8FA39E que falhava", () => {
    expect(contrastRatio(Brand.gray, Brand.card)).toBeGreaterThan(
      contrastRatio("#8FA39E", Brand.card),
    );
  });

  it("verde de marca sobre o fundo escuro passa em AA", () => {
    expect(contrastRatio(Brand.green, Brand.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("texto do botao primario passa em AA sobre o fundo do botao", () => {
    expect(
      contrastRatio(Brand.buttonPrimaryText, Brand.buttonPrimaryBg),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("texto do botao secundario passa em AA", () => {
    expect(
      contrastRatio(Brand.buttonSecondaryText, Brand.buttonSecondaryBg),
    ).toBeGreaterThanOrEqual(AA_LARGE);
  });

  // O comentario registra que formInputPlaceholder foi escurecido de #838D95,
  // que so alcancava 3.04:1 sobre o fundo claro do formulario.
  it("placeholder do formulario passa em AA sobre o fundo claro", () => {
    expect(
      contrastRatio(Brand.formInputPlaceholder, Brand.formInputBg),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("texto do input do formulario passa em AA", () => {
    expect(contrastRatio(Brand.formInputText, Brand.formInputBg)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(SURFACES)("danger passa em AA sobre %s, como o comentario promete", (surface) => {
    expect(contrastRatio(Brand.danger, Brand[surface])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  // O comentario avisa: nunca usar `error` como texto sobre fundo escuro (~1.4:1).
  // Este teste fixa o motivo — se alguem "consertar" o token sem ler o comentario,
  // o par error/errorBg abaixo e quem deve mudar.
  it("error e escuro por design, para uso sobre errorBg claro", () => {
    expect(contrastRatio(Brand.error, Brand.errorBg)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(Brand.error, Brand.bg)).toBeLessThan(AA_NORMAL);
  });

  it.each([
    ["success", "successBg"],
    ["warning", "warningBg"],
  ] as const)("%s passa em AA sobre %s", (fg, bg) => {
    expect(contrastRatio(Brand[fg], Brand[bg])).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("aba ativa tem contraste suficiente entre texto e fundo", () => {
    expect(contrastRatio(Brand.tabBarText, Brand.tabBarActiveBg)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });
});

describe("Brand — formato dos tokens", () => {
  it("todo token e hex de 6 digitos ou rgba", () => {
    for (const [name, value] of Object.entries(Brand)) {
      expect(`${name}: ${value}`).toMatch(/: (#[0-9A-Fa-f]{6}|rgba\(.+\))$/);
    }
  });

  it("nao tem token duplicado com nome diferente e mesmo papel semantico", () => {
    expect(Brand.bg).toBe(Brand.black);
  });
});

describe("Spacing", () => {
  it("cresce monotonicamente", () => {
    const values = Object.values(Spacing);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("nao tem valor repetido nem negativo", () => {
    const values = Object.values(Spacing);
    expect(new Set(values).size).toBe(values.length);
    expect(values.every((v) => v > 0)).toBe(true);
  });
});

describe("outros tokens", () => {
  it("Fonts resolve para a plataforma de teste com as quatro familias", () => {
    expect(Object.keys(Fonts!).sort()).toEqual(["mono", "rounded", "sans", "serif"]);
  });

  it("BottomTabInset e um numero nao negativo", () => {
    expect(BottomTabInset).toBeGreaterThanOrEqual(0);
  });

  it("MaxContentWidth limita a largura em telas grandes", () => {
    expect(MaxContentWidth).toBeGreaterThan(0);
  });
});
