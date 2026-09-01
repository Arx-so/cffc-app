import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Spinner } from "@ui-kitten/components";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { AthleteOwnDetailsCard } from "@/components/AthleteOwnDetailsCard/AthleteOwnDetailsCard";
import { AVAILABILITY_VALUE_BY_TRANSLATION_KEY } from "@/constants/athleteAvailability";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);

const athleteRow = (over: Record<string, unknown> = {}) => ({
  user_id: "a1",
  height: 180,
  weight: 75,
  dominant_foot: "right",
  positions: ["st"],
  strengths: ["speed"],
  current_category: "sub20",
  availability: AVAILABILITY_VALUE_BY_TRANSLATION_KEY.availabilityLookingForClub,
  club_history: [],
  is_searchable: true,
  contact_visibility: "public",
  ...over,
});

const props = (over: Record<string, unknown> = {}) => ({
  city: "Santos",
  state: "SP",
  birthDate: "2008-05-01",
  phone: "11987654321",
  athleteRow: athleteRow(),
  isLoading: false,
  ...over,
});

const toggle = () => fireEvent.press(screen.getByText(t("profile.athleteDetailsTitle")));

beforeEach(() => i18n.changeLanguage("en"));

describe("carregamento", () => {
  it("mostra spinner e esconde o conteudo", () => {
    render(<AthleteOwnDetailsCard {...props({ isLoading: true })} />);
    expect(screen.UNSAFE_getByType(Spinner)).toBeTruthy();
    expect(screen.queryByText(t("profile.athleteDetailsTitle"))).toBeNull();
  });
});

describe("expansao", () => {
  it("comeca recolhido com a seta para baixo", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    expect(screen.queryByText(t("editProfile.personalData"))).toBeNull();
    expect(screen.UNSAFE_getByType(Ionicons).props.name).toBe("chevron-down");
  });

  it("expande e recolhe", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText(t("editProfile.personalData"))).toBeTruthy();
    toggle();
    expect(screen.queryByText(t("editProfile.personalData"))).toBeNull();
  });

  it("expoe estado e rotulo de acessibilidade coerentes", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    expect(screen.getByRole("button").props.accessibilityLabel).toBe(
      t("profile.detailsExpandA11y"),
    );
    toggle();
    expect(screen.getByRole("button").props.accessibilityState).toMatchObject({
      expanded: true,
    });
    expect(screen.getByRole("button").props.accessibilityLabel).toBe(
      t("profile.detailsCollapseA11y"),
    );
  });
});

describe("resumo", () => {
  it("junta altura e peso com separador", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("180 cm · 75 kg")).toBeTruthy();
  });

  it.each([
    ["altura ausente", { height: null }, "75 kg"],
    ["peso ausente", { weight: null }, "180 cm"],
    ["altura zero", { height: 0 }, "75 kg"],
    ["peso zero", { weight: 0 }, "180 cm"],
  ])("mostra so a medida disponivel quando %s", (_l, patch, expected) => {
    render(<AthleteOwnDetailsCard {...props({ athleteRow: athleteRow(patch) })} />);
    toggle();
    // Aparece duas vezes: no resumo e na linha detalhada correspondente.
    expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
  });

  it("lista ate tres posicoes no resumo", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ positions: ["st", "cf", "am"] }) })}
      />,
    );
    toggle();
    const esperado = ["st", "cf", "am"].map((p) => t(`athlete.positions.${p}`)).join(", ");
    // Resumo e secção tática mostram a mesma lista quando há exatamente 3 posições.
    expect(screen.getAllByText(esperado)).toHaveLength(2);
  });

  it("indica com reticencias quando ha mais de tres posicoes", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ positions: ["st", "cf", "am", "cm"] }) })}
      />,
    );
    toggle();
    const esperado =
      ["st", "cf", "am"].map((p) => t(`athlete.positions.${p}`)).join(", ") + "…";
    expect(screen.getByText(esperado)).toBeTruthy();
  });

  it("prefere a categoria a disponibilidade no resumo", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getAllByText("sub20").length).toBeGreaterThan(0);
  });

  it("cai para a disponibilidade quando nao ha categoria", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ current_category: "" }) })}
      />,
    );
    toggle();
    expect(
      screen.getAllByText(t("editProfile.availabilityLookingForClub")).length,
    ).toBeGreaterThan(0);
  });
});

describe("dados pessoais", () => {
  it("junta cidade e estado", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("Santos — SP")).toBeTruthy();
  });

  it("formata a data de nascimento sem deslocar o dia", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("May 01, 2008")).toBeTruthy();
  });

  it("formata o telefone no padrao brasileiro", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText("(11) 98765-4321")).toBeTruthy();
  });
});

describe("dados fisicos e taticos", () => {
  it.each([
    ["right", "editProfile.footRight"],
    ["left", "editProfile.footLeft"],
    ["both", "editProfile.footBoth"],
  ])("traduz o pe dominante %s", (foot, key) => {
    render(<AthleteOwnDetailsCard {...props({ athleteRow: athleteRow({ dominant_foot: foot }) })} />);
    toggle();
    expect(screen.getByText(t(key))).toBeTruthy();
  });

  it("preserva um pe dominante desconhecido em vez de sumir com o dado", () => {
    render(
      <AthleteOwnDetailsCard {...props({ athleteRow: athleteRow({ dominant_foot: "ambos" }) })} />,
    );
    toggle();
    expect(screen.getByText("ambos")).toBeTruthy();
  });

  it("lista todas as posicoes traduzidas na secao tatica", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ positions: ["st", "gk"] }) })}
      />,
    );
    toggle();
    expect(
      screen.getAllByText(`${t("athlete.positions.st")}, ${t("athlete.positions.gk")}`).length,
    ).toBeGreaterThan(0);
  });

  it("lista as caracteristicas traduzidas", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getByText(t("athlete.strengths.speed"))).toBeTruthy();
  });
});

describe("disponibilidade", () => {
  it.each(Object.entries(AVAILABILITY_VALUE_BY_TRANSLATION_KEY))(
    "traduz a chave %s a partir do valor gravado",
    (key, stored) => {
      render(<AthleteOwnDetailsCard {...props({ athleteRow: athleteRow({ availability: stored }) })} />);
      toggle();
      expect(screen.getAllByText(t(`editProfile.${key}`)).length).toBeGreaterThan(0);
    },
  );

  it("mostra cru um valor de disponibilidade nao mapeado", () => {
    render(
      <AthleteOwnDetailsCard {...props({ athleteRow: athleteRow({ availability: "Aposentado" }) })} />,
    );
    toggle();
    expect(screen.getAllByText("Aposentado").length).toBeGreaterThan(0);
  });
});

describe("historico de clubes", () => {
  const entry = (over: Record<string, unknown> = {}) => ({
    club: "Santos FC",
    category: "sub20",
    start: "2020",
    end: "2022",
    ...over,
  });

  it("lista cada passagem com clube, categoria e periodo", () => {
    render(
      <AthleteOwnDetailsCard {...props({ athleteRow: athleteRow({ club_history: [entry()] }) })} />,
    );
    toggle();
    expect(screen.getByText("Santos FC")).toBeTruthy();
    expect(screen.getByText(`${t("profile.clubBaseCategoryLabel")} / SUB20`)).toBeTruthy();
    expect(screen.getByText("2020 — 2022")).toBeTruthy();
  });

  it("mostra so o inicio quando a passagem esta em aberto", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ club_history: [entry({ end: "" })] }) })}
      />,
    );
    toggle();
    expect(screen.getByText("2020")).toBeTruthy();
  });

  it("omite a linha de categoria quando nao ha categoria", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ club_history: [entry({ category: "" })] }) })}
      />,
    );
    toggle();
    expect(screen.queryByText(new RegExp(t("profile.clubBaseCategoryLabel")))).toBeNull();
  });

  it("usa 'nao informado' quando o clube esta em branco", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: athleteRow({ club_history: [entry({ club: "  " })] }) })}
      />,
    );
    toggle();
    expect(screen.getAllByText(t("profile.notInformed")).length).toBeGreaterThan(0);
  });

  it("lista mais de uma passagem", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({
          athleteRow: athleteRow({
            club_history: [entry(), entry({ club: "Corinthians", start: "2022", end: "" })],
          }),
        })}
      />,
    );
    toggle();
    expect(screen.getByText("Santos FC")).toBeTruthy();
    expect(screen.getByText("Corinthians")).toBeTruthy();
  });

  it("mostra 'nao informado' quando nao ha historico", () => {
    render(<AthleteOwnDetailsCard {...props()} />);
    toggle();
    expect(screen.getAllByText(t("profile.notInformed")).length).toBeGreaterThan(0);
  });
});

describe("perfil sem linha de atleta", () => {
  it("renderiza todos os campos como nao informado", () => {
    render(
      <AthleteOwnDetailsCard
        {...props({ athleteRow: null, city: null, state: null, birthDate: null, phone: null })}
      />,
    );
    toggle();
    // 3 pessoais + 3 fisicos + 2 taticos + 2 status + historico + 3 do resumo
    expect(screen.getAllByText(t("profile.notInformed")).length).toBe(14);
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos em %s", (lang) => {
    render(<AthleteOwnDetailsCard {...props()} />, { language: lang });
    const titulo = i18n.t("profile.athleteDetailsTitle", { lng: lang });
    expect(titulo).not.toBe("profile.athleteDetailsTitle");
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
