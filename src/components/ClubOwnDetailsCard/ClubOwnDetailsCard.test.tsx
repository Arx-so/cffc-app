import React from "react";
import { LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "@ui-kitten/components";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { ClubOwnDetailsCard } from "@/components/ClubOwnDetailsCard/ClubOwnDetailsCard";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);

const props = (over: Record<string, unknown> = {}) => ({
  city: "Santos",
  state: "SP",
  foundingDate: "1912-04-14",
  phone: "11987654321",
  isLoading: false,
  ...over,
});

const toggle = () => fireEvent.press(screen.getByText(t("profile.clubDetailsTitle")));

beforeEach(() => i18n.changeLanguage("en"));

describe("carregamento", () => {
  it("mostra spinner enquanto carrega", () => {
    render(<ClubOwnDetailsCard {...props({ isLoading: true })} />);
    expect(screen.UNSAFE_getByType(Spinner)).toBeTruthy();
  });

  it("nao mostra o conteudo enquanto carrega", () => {
    render(<ClubOwnDetailsCard {...props({ isLoading: true })} />);
    expect(screen.queryByText(t("profile.clubDetailsTitle"))).toBeNull();
  });
});

describe("cabecalho", () => {
  it("mostra titulo e subtitulo", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    expect(screen.getByText(t("profile.clubDetailsTitle"))).toBeTruthy();
    expect(screen.getByText(t("profile.clubDetailsSubtitle"))).toBeTruthy();
  });

  it("comeca recolhido", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    expect(screen.queryByText(t("editProfile.city"))).toBeNull();
    expect(screen.UNSAFE_getByType(Ionicons).props.name).toBe("chevron-down");
  });

  it("expande ao tocar no cabecalho", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText(t("editProfile.city"))).toBeTruthy();
    expect(screen.UNSAFE_getByType(Ionicons).props.name).toBe("chevron-up");
  });

  it("recolhe ao tocar de novo", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    toggle();
    expect(screen.queryByText(t("editProfile.city"))).toBeNull();
  });

  it("anima a mudanca de altura", () => {
    const configureNext = jest.spyOn(LayoutAnimation, "configureNext");
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(configureNext).toHaveBeenCalledWith(LayoutAnimation.Presets.easeInEaseOut);
    configureNext.mockRestore();
  });
});

describe("acessibilidade", () => {
  const botao = () => screen.getByRole("button");

  it("expoe o estado de expansao para o leitor de tela", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    expect(botao().props.accessibilityState).toMatchObject({ expanded: false });
    toggle();
    expect(botao().props.accessibilityState).toMatchObject({ expanded: true });
  });

  it("troca o rotulo entre expandir e recolher", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    expect(botao().props.accessibilityLabel).toBe(t("profile.detailsExpandA11yClub"));
    toggle();
    expect(botao().props.accessibilityLabel).toBe(t("profile.detailsCollapseA11yClub"));
  });
});

describe("conteudo expandido", () => {
  it("junta cidade e estado com travessao", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("Santos — SP")).toBeTruthy();
  });

  it("mostra so a cidade quando nao ha estado", () => {
    render(<ClubOwnDetailsCard {...props({ state: null })} />);
    toggle();
    expect(screen.getByText("Santos")).toBeTruthy();
  });

  it("mostra so o estado quando nao ha cidade", () => {
    render(<ClubOwnDetailsCard {...props({ city: null })} />);
    toggle();
    expect(screen.getByText("SP")).toBeTruthy();
  });

  it("formata a data de fundacao no idioma corrente, sem deslocar o dia", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("Apr 14, 1912")).toBeTruthy();
  });

  it("formata o telefone no padrao brasileiro", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("(11) 98765-4321")).toBeTruthy();
  });

  it("mostra 'nao informado' em cada campo vazio", () => {
    render(
      <ClubOwnDetailsCard
        {...props({ city: null, state: null, foundingDate: null, phone: null })}
      />,
    );
    toggle();
    expect(screen.getAllByText(t("profile.notInformed"))).toHaveLength(3);
  });

  it("trata string vazia como nao informado", () => {
    render(<ClubOwnDetailsCard {...props({ city: "", state: "", phone: "" })} />);
    toggle();
    expect(screen.getAllByText(t("profile.notInformed")).length).toBeGreaterThanOrEqual(2);
  });

  it("mostra os tres rotulos de campo", () => {
    render(<ClubOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText(t("editProfile.city"))).toBeTruthy();
    expect(screen.getByText(t("signup.foundingDateLabel"))).toBeTruthy();
    expect(screen.getByText(t("editProfile.phone"))).toBeTruthy();
  });
});

describe("i18n", () => {
  it("formata a data conforme o idioma ativo", () => {
    render(<ClubOwnDetailsCard {...props()} />, { language: "pt-BR" });
    toggle();
    expect(screen.getByText("14 de abr. de 1912")).toBeTruthy();
  });

  it.each(["en", "pt-BR", "ja"])("resolve os rotulos em %s", (lang) => {
    render(<ClubOwnDetailsCard {...props()} />, { language: lang });
    const titulo = i18n.t("profile.clubDetailsTitle", { lng: lang });
    expect(titulo).not.toBe("profile.clubDetailsTitle");
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
