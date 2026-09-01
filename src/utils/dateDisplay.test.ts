import { formatIsoDateOnlyForLocale } from "@/utils/dateDisplay";

describe("formatIsoDateOnlyForLocale", () => {
  it("formata em portugues quando a linguagem e pt-br", () => {
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt-br")).toBe("01 de jan. de 2026");
  });

  it("aceita qualquer variante de portugues", () => {
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt")).toBe("01 de jan. de 2026");
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt-PT")).toBe("01 de jan. de 2026");
  });

  it("formata em japones quando a linguagem e ja", () => {
    expect(formatIsoDateOnlyForLocale("2026-01-01", "ja")).toBe("2026年1月01日");
  });

  it("cai em ingles para qualquer outra linguagem", () => {
    expect(formatIsoDateOnlyForLocale("2026-01-01", "en")).toBe("Jan 01, 2026");
    expect(formatIsoDateOnlyForLocale("2026-01-01", "de")).toBe("Jan 01, 2026");
  });

  it("nao desloca o dia por timezone (o bug classico de new Date(iso))", () => {
    // Em America/Sao_Paulo (UTC-3), new Date("2026-01-01") cairia em 31/12/2025.
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt-br")).toContain("01");
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt-br")).toContain("2026");
    expect(formatIsoDateOnlyForLocale("2026-01-01", "pt-br")).not.toContain("2025");
  });

  it("ignora a parte de hora quando vem um timestamp completo", () => {
    expect(formatIsoDateOnlyForLocale("2026-01-01T00:00:00Z", "pt-br")).toBe("01 de jan. de 2026");
  });

  it.each([null, undefined, "", "   "])("retorna vazio para %p", (input) => {
    expect(formatIsoDateOnlyForLocale(input, "pt-br")).toBe("");
  });

  it("devolve o valor original quando o formato nao e reconhecido", () => {
    expect(formatIsoDateOnlyForLocale("01/01/2026", "pt-br")).toBe("01/01/2026");
    expect(formatIsoDateOnlyForLocale("nao-e-data", "en")).toBe("nao-e-data");
  });

  it.each([
    ["mes zero", "2026-00-10"],
    ["mes acima de 12", "2026-13-10"],
    ["dia zero", "2026-01-00"],
    ["dia acima de 31", "2026-01-32"],
  ])("devolve a parte de data crua quando o valor e fora de faixa: %s", (_label, iso) => {
    expect(formatIsoDateOnlyForLocale(iso, "pt-br")).toBe(iso);
  });

  it("formata corretamente o ultimo dia do ano", () => {
    expect(formatIsoDateOnlyForLocale("2026-12-31", "en")).toBe("Dec 31, 2026");
  });
});
