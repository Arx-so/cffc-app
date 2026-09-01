import React from "react";
import { ActivityIndicator, Image, Text as RNText } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { AthleteSearchCard } from "@/components/AthleteSearchCard/AthleteSearchCard";
import { Brand } from "@/constants/theme";
import { findHostByStyleValue } from "@/test/rntl";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);

const athlete = (over: Record<string, unknown> = {}) => ({
  id: "a1",
  name: "Joao Megale",
  username: "joao",
  avatarUrl: "https://cdn/av.png",
  verified: true,
  positions: ["st"],
  videoCount: 3,
  validationCount: 5,
  contactCount: 2,
  isShortlisted: false,
  ...over,
});

const stars = () => screen.UNSAFE_queryAllByType(Ionicons).filter((i) => i.props.name === "star");

beforeEach(() => i18n.changeLanguage("en"));

describe("variante card (padrao)", () => {
  it("mostra nome, posicao e as tres estatisticas", () => {
    render(<AthleteSearchCard athlete={athlete()} />);
    expect(screen.getByText("Joao Megale")).toBeTruthy();
    expect(screen.getByText(t("athlete.positions.st"))).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("mostra o selo de verificado", () => {
    render(<AthleteSearchCard athlete={athlete({ verified: true })} />);
    expect(screen.getByText(t("search.verified"))).toBeTruthy();
  });

  it("omite o selo quando nao verificado", () => {
    render(<AthleteSearchCard athlete={athlete({ verified: false })} />);
    expect(screen.queryByText(t("search.verified"))).toBeNull();
  });

  it("traduz a posicao conhecida e preserva a desconhecida", () => {
    render(<AthleteSearchCard athlete={athlete({ positions: ["libero"] })} />);
    expect(screen.getByText("libero")).toBeTruthy();
  });

  it("usa apenas a primeira posicao", () => {
    render(<AthleteSearchCard athlete={athlete({ positions: ["st", "cf"] })} />);
    expect(screen.queryByText(t("athlete.positions.cf"))).toBeNull();
  });

  it("omite a linha de posicao quando o atleta nao tem nenhuma", () => {
    render(<AthleteSearchCard athlete={athlete({ positions: [] })} />);
    expect(screen.queryByText(t("athlete.positions.st"))).toBeNull();
  });

  it("mostra a foto quando disponivel", () => {
    render(<AthleteSearchCard athlete={athlete()} />);
    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: "https://cdn/av.png" });
  });

  it.each([
    ["Joao Megale", "JM"],
    ["Joao", "J"],
    ["Joao da Silva Megale", "JD"],
  ])("monta as iniciais de %s como %s (duas primeiras palavras)", (name, expected) => {
    render(<AthleteSearchCard athlete={athlete({ name, avatarUrl: null })} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it("usa o username nas iniciais quando nao ha nome", () => {
    render(
      <AthleteSearchCard athlete={athlete({ name: "", username: "joao", avatarUrl: null })} />,
    );
    expect(screen.getByText("J")).toBeTruthy();
  });

  it("mostra ? quando nao ha nome nem username", () => {
    render(
      <AthleteSearchCard athlete={athlete({ name: "", username: null, avatarUrl: null })} />,
    );
    expect(screen.getByText("?")).toBeTruthy();
  });

  it("cai para @username no nome quando nao ha nome", () => {
    render(<AthleteSearchCard athlete={athlete({ name: "   " })} />);
    expect(screen.getByText("@joao")).toBeTruthy();
  });

  it("cai para o rotulo de perfil sem nome", () => {
    render(<AthleteSearchCard athlete={athlete({ name: "", username: null })} />);
    expect(screen.getByText(t("search.unnamedProfile"))).toBeTruthy();
  });
});

describe("acoes do card", () => {
  it("abre o perfil pelo cabecalho e pelo botao", () => {
    const onViewProfile = jest.fn();
    render(<AthleteSearchCard athlete={athlete()} onViewProfile={onViewProfile} />);
    fireEvent.press(screen.getByText(t("search.viewProfile")));
    fireEvent.press(screen.getByText("Joao Megale"));
    expect(onViewProfile).toHaveBeenCalledTimes(2);
  });

  it("nao mostra o botao de favoritar quando nao ha handler", () => {
    render(<AthleteSearchCard athlete={athlete()} />);
    expect(screen.queryByText(t("search.addFavorite"))).toBeNull();
  });

  it("mostra o botao de favoritar quando ha handler", () => {
    render(<AthleteSearchCard athlete={athlete()} onAddFavorite={jest.fn()} />);
    expect(screen.getByText(t("search.addFavorite"))).toBeTruthy();
  });

  it("favorita ao tocar", () => {
    const onAddFavorite = jest.fn();
    render(<AthleteSearchCard athlete={athlete()} onAddFavorite={onAddFavorite} />);
    fireEvent.press(screen.getByText(t("search.addFavorite")));
    expect(onAddFavorite).toHaveBeenCalledTimes(1);
  });

  it("indica que ja esta na lista e bloqueia novo toque", () => {
    const onAddFavorite = jest.fn();
    render(<AthleteSearchCard athlete={athlete()} onAddFavorite={onAddFavorite} isShortlisted />);
    expect(screen.getByText(t("search.favoriteAdded"))).toBeTruthy();
    fireEvent.press(screen.getByText(t("search.favoriteAdded")));
    expect(onAddFavorite).not.toHaveBeenCalled();
  });

  it("mostra indicador durante a adicao e bloqueia o toque", () => {
    const onAddFavorite = jest.fn();
    render(
      <AthleteSearchCard athlete={athlete()} onAddFavorite={onAddFavorite} isAddingToShortlist />,
    );
    const spinner = screen.UNSAFE_getByType(ActivityIndicator);
    expect(spinner.props.color).toBe(Brand.buttonPrimaryText);
    fireEvent.press(spinner);
    expect(onAddFavorite).not.toHaveBeenCalled();
  });

  it("mostra estrela cheia quando ja favoritado e vazada quando nao", () => {
    const { rerender } = render(
      <AthleteSearchCard athlete={athlete()} onAddFavorite={jest.fn()} />,
    );
    expect(
      screen.UNSAFE_getAllByType(Ionicons).some((i) => i.props.name === "star-outline"),
    ).toBe(true);
    rerender(<AthleteSearchCard athlete={athlete()} onAddFavorite={jest.fn()} isShortlisted />);
    expect(screen.UNSAFE_getAllByType(Ionicons).some((i) => i.props.name === "star")).toBe(true);
  });

  it("marca com estrela o atleta ja na lista", () => {
    render(<AthleteSearchCard athlete={athlete()} isShortlisted />);
    expect(stars().length).toBeGreaterThan(0);
    expect(stars()[0].props.color).toBe(Brand.green);
  });

  it("nao marca com estrela quem nao esta na lista", () => {
    render(<AthleteSearchCard athlete={athlete()} />);
    expect(stars()).toHaveLength(0);
  });
});

describe("slots customizados", () => {
  it("renderiza o badge junto das estatisticas", () => {
    render(<AthleteSearchCard athlete={athlete()} badge={<RNText>Novo</RNText>} />);
    expect(screen.getByText("Novo")).toBeTruthy();
  });

  it("substitui o rodape padrao quando footer e informado", () => {
    render(<AthleteSearchCard athlete={athlete()} footer={<RNText>Rodape</RNText>} />);
    expect(screen.getByText("Rodape")).toBeTruthy();
    expect(screen.queryByText(t("search.viewProfile"))).toBeNull();
  });

  it("aceita footer nulo para esconder as acoes", () => {
    render(<AthleteSearchCard athlete={athlete()} footer={null} />);
    expect(screen.queryByText(t("search.viewProfile"))).toBeNull();
  });
});

describe("variante compact", () => {
  it("mostra nome, contagem de videos e posicao", () => {
    render(<AthleteSearchCard athlete={athlete()} variant="compact" />);
    expect(screen.getByText("Joao Megale")).toBeTruthy();
    expect(screen.getByText(`3 ${t("search.stats.videos").toLocaleLowerCase()}`)).toBeTruthy();
    expect(screen.getByText(t("athlete.positions.st"))).toBeTruthy();
  });

  it("nao mostra as acoes do card", () => {
    render(<AthleteSearchCard athlete={athlete()} variant="compact" />);
    expect(screen.queryByText(t("search.viewProfile"))).toBeNull();
  });

  it("abre o perfil ao tocar na linha", () => {
    const onViewProfile = jest.fn();
    render(
      <AthleteSearchCard athlete={athlete()} variant="compact" onViewProfile={onViewProfile} />,
    );
    fireEvent.press(screen.getByText("Joao Megale"));
    expect(onViewProfile).toHaveBeenCalledTimes(1);
  });

  it("nao reage ao toque quando nao ha handler", () => {
    render(<AthleteSearchCard athlete={athlete()} variant="compact" />);
    expect(() => fireEvent.press(screen.getByText("Joao Megale"))).not.toThrow();
  });

  it("omite a posicao quando o atleta nao tem nenhuma", () => {
    render(<AthleteSearchCard athlete={athlete({ positions: [] })} variant="compact" />);
    expect(screen.queryByText(t("athlete.positions.st"))).toBeNull();
  });

  it("mostra iniciais quando nao ha foto", () => {
    render(<AthleteSearchCard athlete={athlete({ avatarUrl: null })} variant="compact" />);
    expect(screen.getByText("JM")).toBeTruthy();
  });

  it("marca com estrela menor quem ja esta na lista", () => {
    render(<AthleteSearchCard athlete={athlete()} variant="compact" isShortlisted />);
    expect(stars()[0].props.size).toBe(16);
  });
});

describe("variante shortlist", () => {
  it("mantem o conteudo do card", () => {
    render(<AthleteSearchCard athlete={athlete()} variant="shortlist" />);
    expect(screen.getByText("Joao Megale")).toBeTruthy();
    expect(screen.getByText(t("search.viewProfile"))).toBeTruthy();
  });

  it("usa o fundo escuro de shortlist em vez do fundo de card", () => {
    const { UNSAFE_root } = render(<AthleteSearchCard athlete={athlete()} variant="shortlist" />);
    expect(findHostByStyleValue(UNSAFE_root, Brand.inputBg).length).toBeGreaterThan(0);
  });

  it("o card padrao nao usa o fundo de shortlist", () => {
    const { UNSAFE_root } = render(<AthleteSearchCard athlete={athlete()} />);
    expect(findHostByStyleValue(UNSAFE_root, Brand.inputBg)).toHaveLength(0);
    expect(findHostByStyleValue(UNSAFE_root, Brand.card).length).toBeGreaterThan(0);
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos em %s", (lang) => {
    render(<AthleteSearchCard athlete={athlete()} />, { language: lang });
    const rotulo = i18n.t("search.viewProfile", { lng: lang });
    expect(rotulo).not.toBe("search.viewProfile");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
