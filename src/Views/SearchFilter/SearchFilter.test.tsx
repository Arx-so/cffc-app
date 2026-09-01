import React from "react";
import { TextInput } from "react-native";
import { renderHook, act as hookAct } from "@testing-library/react-native";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import {
  ATHLETE_POSITIONS,
  ATHLETE_STRENGTHS,
  POSITION_SECTORS,
} from "@/constants/athleteAttributes";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { SearchFilter } from "@/Views/SearchFilter/SearchFilter";
import { useSearchFilter } from "@/Views/SearchFilter/useSearchFilter";
import { mockRouter, resetMockRouter } from "@/test/router";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);
const store = () => useSearchFilterStore.getState();
const setup = () => renderHook(() => useSearchFilter());

const CLEAN = {
  positions: [],
  ageMin: null,
  ageMax: null,
  dominantFoot: null,
  minHeight: null,
  maxWeight: null,
  strengths: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  resetMockRouter();
  i18n.changeLanguage("en");
  store().clearFilters();
});

describe("useSearchFilter — estado inicial", () => {
  it("comeca em branco quando a store esta limpa", () => {
    const { result } = setup();
    expect(result.current).toMatchObject({
      positions: [],
      ageMin: "",
      ageMax: "",
      dominantFoot: null,
      minHeight: "",
      maxWeight: "",
      strengths: [],
    });
  });

  it("hidrata do que ja estava aplicado, convertendo numeros em texto", () => {
    store().setFilters({
      positions: ["st"],
      ageMin: 16,
      ageMax: 21,
      dominantFoot: "left",
      minHeight: 175,
      maxWeight: 80,
      strengths: ["speed"],
    });
    const { result } = setup();
    expect(result.current).toMatchObject({
      positions: ["st"],
      ageMin: "16",
      ageMax: "21",
      dominantFoot: "left",
      minHeight: "175",
      maxWeight: "80",
      strengths: ["speed"],
    });
  });

  it("hidrata zero como texto, nao como campo vazio", () => {
    store().setFilters({ ageMin: 0 });
    const { result } = setup();
    expect(result.current.ageMin).toBe("0");
  });
});

describe("useSearchFilter — selecao", () => {
  it("liga e desliga uma posicao", () => {
    const { result } = setup();
    hookAct(() => result.current.togglePosition("st"));
    expect(result.current.positions).toEqual(["st"]);
    hookAct(() => result.current.togglePosition("st"));
    expect(result.current.positions).toEqual([]);
  });

  it("acumula posicoes, diferente das abas da busca", () => {
    const { result } = setup();
    hookAct(() => result.current.togglePosition("st"));
    hookAct(() => result.current.togglePosition("gk"));
    expect(result.current.positions).toEqual(["st", "gk"]);
  });

  it("remove apenas a posicao desmarcada", () => {
    const { result } = setup();
    hookAct(() => result.current.togglePosition("st"));
    hookAct(() => result.current.togglePosition("gk"));
    hookAct(() => result.current.togglePosition("st"));
    expect(result.current.positions).toEqual(["gk"]);
  });

  it("liga e desliga uma caracteristica", () => {
    const { result } = setup();
    hookAct(() => result.current.toggleStrength("speed"));
    expect(result.current.strengths).toEqual(["speed"]);
    hookAct(() => result.current.toggleStrength("speed"));
    expect(result.current.strengths).toEqual([]);
  });

  it("nao aplica nada na store enquanto o usuario edita", () => {
    const { result } = setup();
    hookAct(() => result.current.togglePosition("st"));
    hookAct(() => result.current.setAgeMin("16"));
    expect(store()).toMatchObject(CLEAN);
  });
});

describe("useSearchFilter — aplicar", () => {
  it("grava os filtros na store e volta", () => {
    const { result } = setup();
    hookAct(() => {
      result.current.togglePosition("st");
      result.current.toggleStrength("speed");
      result.current.setAgeMin("16");
      result.current.setAgeMax("21");
      result.current.setDominantFoot("left");
      result.current.setMinHeight("175");
      result.current.setMaxWeight("80");
    });
    hookAct(() => result.current.handleApply());

    expect(store()).toMatchObject({
      positions: ["st"],
      strengths: ["speed"],
      ageMin: 16,
      ageMax: 21,
      dominantFoot: "left",
      minHeight: 175,
      maxWeight: 80,
    });
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ageMin", "setAgeMin"],
    ["ageMax", "setAgeMax"],
    ["minHeight", "setMinHeight"],
    ["maxWeight", "setMaxWeight"],
  ])("grava null quando o campo %s fica vazio", (campo, setter) => {
    const { result } = setup();
    hookAct(() => (result.current as any)[setter](""));
    hookAct(() => result.current.handleApply());
    expect((store() as any)[campo]).toBeNull();
  });

  it("converte texto numerico para numero", () => {
    const { result } = setup();
    hookAct(() => result.current.setAgeMin("16"));
    hookAct(() => result.current.handleApply());
    expect(store().ageMin).toBe(16);
    expect(typeof store().ageMin).toBe("number");
  });

  it("preserva zero em vez de tratar como vazio", () => {
    const { result } = setup();
    hookAct(() => result.current.setAgeMin("0"));
    hookAct(() => result.current.handleApply());
    expect(store().ageMin).toBe(0);
  });

  it("aplicar sem mexer em nada mantem a store limpa", () => {
    const { result } = setup();
    hookAct(() => result.current.handleApply());
    expect(store()).toMatchObject(CLEAN);
  });
});

describe("useSearchFilter — limpar", () => {
  it("zera os filtros aplicados e volta", () => {
    store().setFilters({ positions: ["st"], ageMin: 16 });
    const { result } = setup();
    hookAct(() => result.current.handleClear());
    expect(store()).toMatchObject(CLEAN);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("descarta as edicoes nao aplicadas", () => {
    const { result } = setup();
    hookAct(() => result.current.togglePosition("st"));
    hookAct(() => result.current.handleClear());
    expect(store().positions).toEqual([]);
  });
});

describe("SearchFilter — tela", () => {
  const inputs = () => screen.UNSAFE_getAllByType(TextInput);

  it("mostra o titulo e as cinco secoes", () => {
    render(<SearchFilter />);
    for (const key of [
      "title",
      "position",
      "age",
      "dominantFoot",
      "physicalTraits",
      "technicalAttributes",
    ]) {
      expect(screen.getByText(t(`searchFilter.${key}`))).toBeTruthy();
    }
  });

  it("mostra um chip por setor de posicao", () => {
    render(<SearchFilter />);
    for (const sector of POSITION_SECTORS) {
      expect(screen.getByText(t(`athlete.positionSectors.${sector}`))).toBeTruthy();
    }
  });

  it("mostra um chip por posicao especifica", () => {
    render(<SearchFilter />);
    for (const position of ATHLETE_POSITIONS) {
      expect(screen.getByText(t(`athlete.positions.${position}`))).toBeTruthy();
    }
  });

  it("mostra um chip por caracteristica", () => {
    render(<SearchFilter />);
    for (const str of ATHLETE_STRENGTHS) {
      expect(screen.getByText(t(`athlete.strengths.${str}`))).toBeTruthy();
    }
  });

  it("destaca o chip selecionado", () => {
    render(<SearchFilter />);
    const chip = screen.getByText(t("athlete.positions.st"));
    const antes = JSON.stringify(chip.props.style);
    fireEvent.press(chip);
    expect(JSON.stringify(screen.getByText(t("athlete.positions.st")).props.style)).not.toBe(antes);
  });

  it("aplica a posicao escolhida ao confirmar", () => {
    render(<SearchFilter />);
    fireEvent.press(screen.getByText(t("athlete.positions.st")));
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store().positions).toEqual(["st"]);
  });

  it("aplica a caracteristica escolhida", () => {
    render(<SearchFilter />);
    fireEvent.press(screen.getByText(t("athlete.strengths.speed")));
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store().strengths).toEqual(["speed"]);
  });

  it("mostra as tres opcoes de pe dominante", () => {
    render(<SearchFilter />);
    for (const key of ["right", "left", "both"]) {
      expect(screen.getByText(t(`searchFilter.${key}`))).toBeTruthy();
    }
  });

  it("seleciona o pe dominante", () => {
    render(<SearchFilter />);
    fireEvent.press(screen.getByText(t("searchFilter.left")));
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store().dominantFoot).toBe("left");
  });

  // Render novo, não `rerender`: o estado local do hook sobrevive ao rerender e
  // o segundo toque cairia sobre o estado do caso anterior.
  it("desmarca o pe dominante no segundo toque", () => {
    render(<SearchFilter />);
    fireEvent.press(screen.getByText(t("searchFilter.left")));
    fireEvent.press(screen.getByText(t("searchFilter.left")));
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store().dominantFoot).toBeNull();
  });

  it("os quatro campos numericos limitam a tres digitos", () => {
    render(<SearchFilter />);
    expect(inputs()).toHaveLength(4);
    for (const input of inputs()) {
      expect(input.props.keyboardType).toBe("numeric");
      expect(input.props.maxLength).toBe(3);
    }
  });

  it("aplica idade minima e maxima digitadas", () => {
    render(<SearchFilter />);
    fireEvent.changeText(inputs()[0], "16");
    fireEvent.changeText(inputs()[1], "21");
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store()).toMatchObject({ ageMin: 16, ageMax: 21 });
  });

  it("aplica altura minima e peso maximo digitados", () => {
    render(<SearchFilter />);
    fireEvent.changeText(inputs()[2], "175");
    fireEvent.changeText(inputs()[3], "80");
    fireEvent.press(screen.getByText(t("searchFilter.applyFilters")));
    expect(store()).toMatchObject({ minHeight: 175, maxWeight: 80 });
  });

  it("limpa tudo pelo botao do rodape", () => {
    store().setFilters({ positions: ["st"], ageMin: 16 });
    render(<SearchFilter />);
    fireEvent.press(screen.getByText(t("searchFilter.clearAll")));
    expect(store()).toMatchObject(CLEAN);
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("fecha pelo X do cabecalho, limpando os filtros", () => {
    store().setFilters({ ageMin: 16 });
    render(<SearchFilter />);
    const fechar = screen
      .UNSAFE_getAllByType(require("@expo/vector-icons").Ionicons)
      .find((i) => i.props.name === "close")!;
    fireEvent.press(fechar.parent!);
    expect(store().ageMin).toBeNull();
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("mostra os campos ja preenchidos quando ha filtro aplicado", () => {
    store().setFilters({ ageMin: 16, minHeight: 175 });
    render(<SearchFilter />);
    expect(inputs()[0].props.value).toBe("16");
    expect(inputs()[2].props.value).toBe("175");
  });
});

describe("SearchFilter — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<SearchFilter />, { language: lang });
    const rotulo = i18n.t("searchFilter.applyFilters", { lng: lang });
    expect(rotulo).not.toBe("searchFilter.applyFilters");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
