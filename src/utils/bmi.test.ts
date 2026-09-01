import { bmiFromHeightWeightCmKg } from "@/utils/bmi";

describe("bmiFromHeightWeightCmKg", () => {
  it("calcula o IMC a partir de altura em cm e peso em kg", () => {
    // 75 / 1.80^2 = 23.148...
    expect(bmiFromHeightWeightCmKg(180, 75)).toBe(23.1);
  });

  it("arredonda para uma casa decimal", () => {
    // 60 / 1.70^2 = 20.761... -> 20.8
    expect(bmiFromHeightWeightCmKg(170, 60)).toBe(20.8);
  });

  it("retorna undefined quando a altura nao foi informada", () => {
    expect(bmiFromHeightWeightCmKg(undefined, 75)).toBeUndefined();
  });

  it("retorna undefined quando o peso nao foi informado", () => {
    expect(bmiFromHeightWeightCmKg(180, undefined)).toBeUndefined();
  });

  it.each([
    ["NaN na altura", NaN, 75],
    ["NaN no peso", 180, NaN],
    ["Infinity na altura", Infinity, 75],
    ["Infinity no peso", 180, Infinity],
  ])("retorna undefined com %s", (_label, h, w) => {
    expect(bmiFromHeightWeightCmKg(h, w)).toBeUndefined();
  });

  it.each([
    ["altura zero", 0, 75],
    ["peso zero", 180, 0],
    ["altura negativa", -180, 75],
    ["peso negativo", 180, -75],
  ])("retorna undefined com %s (evita divisao por zero e valores absurdos)", (_l, h, w) => {
    expect(bmiFromHeightWeightCmKg(h, w)).toBeUndefined();
  });
});
