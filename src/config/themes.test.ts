import { lightTheme, darkTheme } from "@/config/themes";
import { contrastRatio, AA_NORMAL } from "@/test/contrast";

const brandKeys = (theme: Record<string, unknown>) =>
  Object.keys(theme).filter((k) => k.startsWith("color-") || k.startsWith("background-") || k.startsWith("text-"));

describe("temas do UI Kitten", () => {
  it("light e dark definem a escala primaria completa", () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const step of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(theme[`color-primary-${step}`]).toBeDefined();
      }
    }
  });

  it("a escala primaria e invertida entre os temas", () => {
    expect(lightTheme["color-primary-100"]).toBe(darkTheme["color-primary-900"]);
    expect(lightTheme["color-primary-900"]).toBe(darkTheme["color-primary-100"]);
  });

  it("o tom de marca 500 e o mesmo nos dois temas", () => {
    expect(lightTheme["color-primary-500"]).toBe("#D4FF00");
    expect(darkTheme["color-primary-500"]).toBe("#D4FF00");
  });

  it("herdam a base do eva design em vez de definir tudo do zero", () => {
    expect(Object.keys(lightTheme).length).toBeGreaterThan(brandKeys(lightTheme).length);
  });

  it("o tema escuro define os tokens de superficie que o app usa", () => {
    for (const key of [
      "background-basic-color-1",
      "text-basic-color",
      "text-hint-color",
      "border-basic-color-1",
      "input-basic-background-color",
    ]) {
      expect(darkTheme[key]).toBeDefined();
    }
  });

  it("texto basico do tema escuro passa em AA sobre o fundo basico", () => {
    expect(
      contrastRatio(darkTheme["text-basic-color"] as string, darkTheme["background-basic-color-1"] as string),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("texto do input passa em AA sobre o fundo do input no tema escuro", () => {
    expect(
      contrastRatio(
        darkTheme["input-basic-text-color"] as string,
        darkTheme["input-basic-background-color"] as string,
      ),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("os pares de status usam o mesmo fundo claro nos dois temas", () => {
    for (const status of ["success", "warning", "danger"]) {
      expect(lightTheme[`color-${status}-100`]).toBe(darkTheme[`color-${status}-100`]);
    }
  });

  it.each(["success", "warning", "danger"])(
    "o par %s-500 sobre %s-100 passa em AA",
    (status) => {
      expect(
        contrastRatio(darkTheme[`color-${status}-500`] as string, darkTheme[`color-${status}-100`] as string),
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    },
  );

  it("todo token e uma cor literal ou uma referencia $ a outro token", () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const key of brandKeys(theme)) {
        expect(`${key}: ${theme[key]}`).toMatch(
          /: (#[0-9A-Fa-f]{3,8}|rgba?\(.+\)|\$[\w-]+|transparent)$/,
        );
      }
    }
  });

  // Uma referencia `$token` apontando para um token inexistente quebra o tema
  // em runtime, e o Eva nao valida isso no build.
  it.each([
    ["light", lightTheme],
    ["dark", darkTheme],
  ])("nenhuma referencia $ fica orfa no tema %s", (_name, theme) => {
    const orphans = Object.entries(theme)
      .filter(([, v]) => typeof v === "string" && v.startsWith("$"))
      .map(([k, v]) => [k, (v as string).slice(1)] as const)
      .filter(([, target]) => !(target in theme))
      .map(([k, target]) => `${k} -> $${target}`);
    expect(orphans).toEqual([]);
  });

  it("as nossas sobrescritas de marca sao sempre literais, nunca referencias", () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const step of [100, 500, 900]) {
        expect(theme[`color-primary-${step}`]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});
