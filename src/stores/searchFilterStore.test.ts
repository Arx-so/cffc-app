import { useSearchFilterStore } from "@/stores/searchFilterStore";

const initial = {
  positions: [],
  ageMin: null,
  ageMax: null,
  dominantFoot: null,
  minHeight: null,
  maxWeight: null,
  strengths: [],
};

beforeEach(() => useSearchFilterStore.getState().clearFilters());

const state = () => useSearchFilterStore.getState();

describe("estado inicial", () => {
  it("comeca sem nenhum filtro aplicado", () => {
    expect(state()).toMatchObject(initial);
  });

  it("hasActiveFilters e falso no estado inicial", () => {
    expect(state().hasActiveFilters()).toBe(false);
  });
});

describe("setFilters", () => {
  it("aplica um filtro parcial sem apagar os demais", () => {
    state().setFilters({ positions: ["st"] });
    state().setFilters({ ageMin: 16 });
    expect(state().positions).toEqual(["st"]);
    expect(state().ageMin).toBe(16);
  });

  it("sobrescreve um campo ja definido", () => {
    state().setFilters({ dominantFoot: "left" });
    state().setFilters({ dominantFoot: "right" });
    expect(state().dominantFoot).toBe("right");
  });

  it("permite voltar um campo para null", () => {
    state().setFilters({ ageMin: 18 });
    state().setFilters({ ageMin: null });
    expect(state().ageMin).toBeNull();
    expect(state().hasActiveFilters()).toBe(false);
  });

  it("preserva as funcoes da store ao mesclar o estado", () => {
    state().setFilters({ positions: ["gk"] });
    expect(typeof state().clearFilters).toBe("function");
    expect(typeof state().hasActiveFilters).toBe("function");
  });
});

describe("hasActiveFilters", () => {
  it.each([
    ["positions", { positions: ["st"] }],
    ["ageMin", { ageMin: 16 }],
    ["ageMax", { ageMax: 30 }],
    ["dominantFoot", { dominantFoot: "left" }],
    ["minHeight", { minHeight: 180 }],
    ["maxWeight", { maxWeight: 90 }],
    ["strengths", { strengths: ["speed"] }],
  ])("fica verdadeiro quando so %s esta definido", (_label, patch) => {
    state().setFilters(patch as any);
    expect(state().hasActiveFilters()).toBe(true);
  });

  it("continua falso quando as listas ficam vazias", () => {
    state().setFilters({ positions: [], strengths: [] });
    expect(state().hasActiveFilters()).toBe(false);
  });

  it("trata zero como filtro ativo, nao como ausencia de filtro", () => {
    state().setFilters({ ageMin: 0 });
    expect(state().hasActiveFilters()).toBe(true);
  });
});

describe("clearFilters", () => {
  it("volta todos os campos ao estado inicial", () => {
    state().setFilters({
      positions: ["st", "cf"],
      ageMin: 16,
      ageMax: 21,
      dominantFoot: "left",
      minHeight: 175,
      maxWeight: 80,
      strengths: ["speed"],
    });
    expect(state().hasActiveFilters()).toBe(true);

    state().clearFilters();
    expect(state()).toMatchObject(initial);
    expect(state().hasActiveFilters()).toBe(false);
  });

  it("e idempotente", () => {
    state().clearFilters();
    state().clearFilters();
    expect(state().hasActiveFilters()).toBe(false);
  });
});

it("notifica os inscritos a cada mudanca", () => {
  const listener = jest.fn();
  const unsubscribe = useSearchFilterStore.subscribe(listener);

  state().setFilters({ ageMin: 18 });
  expect(listener).toHaveBeenCalledTimes(1);

  state().clearFilters();
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  state().setFilters({ ageMin: 20 });
  expect(listener).toHaveBeenCalledTimes(2);
});
