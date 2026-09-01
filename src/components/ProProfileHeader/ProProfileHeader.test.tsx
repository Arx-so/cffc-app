import React from "react";
import { Avatar, Icon } from "@ui-kitten/components";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { ProProfileHeader } from "@/components/ProProfileHeader/ProProfileHeader";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);

const props = (over: Record<string, unknown> = {}) => ({
  name: "Ana Souza",
  username: "ana",
  avatarUrl: "https://cdn/av.png",
  verified: false,
  specialtyTag: "Fisiologia",
  showActiveBadge: false,
  issuedValidationCount: 12,
  reputationScore: 4.5,
  memberSinceYear: 2024,
  onEditProfilePress: jest.fn(),
  ...over,
});

const hasCheckmark = () =>
  screen.UNSAFE_queryAllByType(Icon).some((i) => i.props.name === "checkmark");

beforeEach(() => {
  jest.clearAllMocks();
  i18n.changeLanguage("en");
});

describe("identidade", () => {
  it("mostra nome e @username", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.getByText("Ana Souza")).toBeTruthy();
    expect(screen.getByText("@ana")).toBeTruthy();
  });

  it("cai para @username quando nao ha nome", () => {
    render(<ProProfileHeader {...props({ name: "  " })} />);
    expect(screen.getAllByText("@ana")).toHaveLength(2);
  });

  it("cai para o rotulo de perfil sem nome", () => {
    render(<ProProfileHeader {...props({ name: "", username: null })} />);
    expect(screen.getByText(t("search.unnamedProfile"))).toBeTruthy();
  });

  it("omite a linha de username quando nao ha username", () => {
    render(<ProProfileHeader {...props({ username: null })} />);
    expect(screen.queryByText("@ana")).toBeNull();
  });
});

describe("avatar", () => {
  it("mostra a foto quando ha url", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.UNSAFE_getByType(Avatar).props.source).toEqual({ uri: "https://cdn/av.png" });
  });

  it.each([
    ["Ana Souza", "AS"],
    ["Ana", "A"],
    ["Ana Paula de Souza", "AS"],
  ])("monta as iniciais de %s como %s", (name, initials) => {
    render(<ProProfileHeader {...props({ name, avatarUrl: null })} />);
    expect(screen.getByText(initials)).toBeTruthy();
  });

  it("usa o username nas iniciais quando nao ha nome", () => {
    render(<ProProfileHeader {...props({ name: "", avatarUrl: null })} />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("mostra ? sem nome nem username", () => {
    render(<ProProfileHeader {...props({ name: "", username: null, avatarUrl: null })} />);
    expect(screen.getByText("?")).toBeTruthy();
  });

  it("mostra o selo de verificado apenas quando verificado", () => {
    render(<ProProfileHeader {...props({ verified: false })} />);
    expect(hasCheckmark()).toBe(false);
    screen.rerender(<ProProfileHeader {...props({ verified: true })} />);
    expect(hasCheckmark()).toBe(true);
  });
});

describe("selos", () => {
  it("mostra a especialidade quando informada", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.getByText("Fisiologia")).toBeTruthy();
  });

  it("omite a especialidade quando nula", () => {
    render(<ProProfileHeader {...props({ specialtyTag: null })} />);
    expect(screen.queryByText("Fisiologia")).toBeNull();
  });

  it("omite a especialidade quando vazia", () => {
    render(<ProProfileHeader {...props({ specialtyTag: "" })} />);
    expect(screen.queryByText("Fisiologia")).toBeNull();
  });

  it("mostra o selo de ativo quando pedido", () => {
    render(<ProProfileHeader {...props({ showActiveBadge: true })} />);
    expect(screen.getByText(t("proProfile.active"))).toBeTruthy();
  });

  it("omite o selo de ativo por padrao", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.queryByText(t("proProfile.active"))).toBeNull();
  });
});

describe("estatisticas", () => {
  it("mostra validacoes emitidas, reputacao e ano de entrada", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("4.5")).toBeTruthy();
    expect(screen.getByText("2024")).toBeTruthy();
  });

  it("usa rotulos em caixa alta", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.getByText(t("profile.validations").toUpperCase())).toBeTruthy();
    expect(screen.getByText(t("proProfile.reputation").toUpperCase())).toBeTruthy();
    expect(screen.getByText(t("proProfile.memberSince").toUpperCase())).toBeTruthy();
  });

  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1k"],
    [1500, "1.5k"],
    [2500, "2.5k"],
  ])("abrevia %i validacoes como %s", (count, expected) => {
    render(<ProProfileHeader {...props({ issuedValidationCount: count })} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it.each([
    ["inteiro", 5, "5"],
    ["uma casa", 4.5, "4.5"],
    ["arredonda duas casas para uma", 4.26, "4.3"],
    // 4.999 arredonda para 5 (inteiro) -> "5". Sem o Math.round prévio o valor
    // continuaria fracionário e sairia "5.0": é o único caso que separa os dois.
    ["quase inteiro vira inteiro", 4.999, "5"],
    ["arredonda para 4.99 e exibe com uma casa", 4.994, "5.0"],
    ["zero", 0, "0"],
  ])("formata a reputacao %s como %s", (_l, score, expected) => {
    render(<ProProfileHeader {...props({ reputationScore: score, issuedValidationCount: 12 })} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["NaN", NaN],
    ["Infinity", Infinity],
  ])("mostra traco quando a reputacao e %s", (_l, score) => {
    render(<ProProfileHeader {...props({ reputationScore: score })} />);
    expect(screen.getByText("—")).toBeTruthy();
  });
});

describe("acao", () => {
  it("oferece editar o perfil", () => {
    render(<ProProfileHeader {...props()} />);
    expect(screen.getByText(t("profile.editProfile"))).toBeTruthy();
  });

  it("dispara a edicao ao tocar", () => {
    const onEditProfilePress = jest.fn();
    render(<ProProfileHeader {...props({ onEditProfilePress })} />);
    fireEvent.press(screen.getByText(t("profile.editProfile")));
    expect(onEditProfilePress).toHaveBeenCalledTimes(1);
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos em %s", (lang) => {
    render(<ProProfileHeader {...props()} />, { language: lang });
    const rotulo = i18n.t("proProfile.reputation", { lng: lang });
    expect(rotulo).not.toBe("proProfile.reputation");
    expect(screen.getByText(rotulo.toUpperCase())).toBeTruthy();
  });
});
