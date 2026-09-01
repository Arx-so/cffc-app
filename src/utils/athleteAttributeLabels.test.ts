import {
  positionLabel,
  strengthLabel,
  positionLabels,
  strengthLabels,
} from "@/utils/athleteAttributeLabels";

/** Stand-in for i18next's `t`: echoes the key so the test can see which key was asked for. */
const t = (key: string) => `[${key}]`;

describe("positionLabel", () => {
  it("traduz uma posicao conhecida pela chave do namespace de posicoes", () => {
    expect(positionLabel(t, "gk")).toBe("[athlete.positions.gk]");
    expect(positionLabel(t, "st")).toBe("[athlete.positions.st]");
  });

  it("cobre todas as posicoes dos quatro setores", () => {
    for (const p of ["gk", "cb", "rb", "lb", "dm", "cm", "am", "rw", "lw", "st", "cf"]) {
      expect(positionLabel(t, p)).toBe(`[athlete.positions.${p}]`);
    }
  });

  it("devolve o valor cru quando a posicao e desconhecida, em vez de uma chave quebrada", () => {
    expect(positionLabel(t, "libero")).toBe("libero");
    expect(positionLabel(t, "")).toBe("");
  });

  it("nao trata o nome do setor como posicao", () => {
    expect(positionLabel(t, "defense")).toBe("defense");
  });
});

describe("strengthLabel", () => {
  it("devolve o valor cru quando a caracteristica e desconhecida", () => {
    expect(strengthLabel(t, "teleporte")).toBe("teleporte");
  });

  it("traduz uma caracteristica conhecida", () => {
    const { ATHLETE_STRENGTHS } = require("@/constants/athleteAttributes");
    const known = ATHLETE_STRENGTHS[0] as string;
    expect(strengthLabel(t, known)).toBe(`[athlete.strengths.${known}]`);
  });
});

describe("positionLabels / strengthLabels", () => {
  it("mapeiam a lista preservando a ordem", () => {
    expect(positionLabels(t, ["st", "gk"])).toEqual([
      "[athlete.positions.st]",
      "[athlete.positions.gk]",
    ]);
  });

  it("misturam conhecidos e desconhecidos sem quebrar", () => {
    expect(positionLabels(t, ["gk", "libero"])).toEqual(["[athlete.positions.gk]", "libero"]);
  });

  it("retornam lista vazia para entrada vazia", () => {
    expect(positionLabels(t, [])).toEqual([]);
    expect(strengthLabels(t, [])).toEqual([]);
  });
});
