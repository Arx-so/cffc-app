import React from "react";
import { Avatar } from "@ui-kitten/components";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { ProfileHeader } from "@/components/ProfileHeader/ProfileHeader";
import { findPressHandlers, findHostByStyleValue } from "@/test/rntl";
import { darkTheme } from "@/config/themes";
import i18n from "@/config/i18n";

const t = (k: string) => i18n.t(k);

const profile = (over: Record<string, unknown> = {}) => ({
  id: "a1",
  name: "Joao Megale",
  username: "joao",
  avatarUrl: "https://cdn/av.png",
  role: "athlete" as const,
  verified: false,
  city: "Santos",
  state: "SP",
  stats: { videoCount: 3, validationCount: 5, contactCount: 2 },
  ...over,
});

beforeEach(() => i18n.changeLanguage("en"));

describe("identidade", () => {
  it("mostra o nome do atleta", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />);
    expect(screen.getByText("Joao Megale")).toBeTruthy();
  });

  it("cai para o @username quando nao ha nome", () => {
    render(<ProfileHeader profile={profile({ name: "  " })} isOwnProfile viewerRole="athlete" />);
    // Aparece duas vezes: como nome principal e como texto secundário.
    expect(screen.getAllByText("@joao")).toHaveLength(2);
  });

  it("cai para o rotulo de perfil sem nome quando nao ha nome nem username", () => {
    render(
      <ProfileHeader
        profile={profile({ name: "", username: null })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getByText(t("search.unnamedProfile"))).toBeTruthy();
  });

  it("mostra o @username como texto secundario", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />);
    expect(screen.getByText("@joao")).toBeTruthy();
  });

  it("mostra o papel como secundario quando nao ha username", () => {
    render(
      <ProfileHeader profile={profile({ username: null })} isOwnProfile viewerRole="athlete" />,
    );
    expect(screen.getByText(t("roles.athlete"))).toBeTruthy();
  });

  it("prefere o subtitulo informado ao username", () => {
    render(
      <ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" subtitle="Atacante" />,
    );
    expect(screen.getByText("Atacante")).toBeTruthy();
  });

  it.each([
    ["vazio", ""],
    ["so espacos", "   "],
    ["null", null],
  ])("ignora subtitulo %s e volta para o username", (_l, subtitle) => {
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile
        viewerRole="athlete"
        subtitle={subtitle}
      />,
    );
    expect(screen.getByText("@joao")).toBeTruthy();
  });
});

describe("avatar", () => {
  it("usa a foto quando ha url", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />);
    expect(screen.UNSAFE_getByType(Avatar).props.source).toEqual({ uri: "https://cdn/av.png" });
  });

  it.each([
    ["Joao Megale", "JM"],
    ["Joao", "J"],
    ["Joao da Silva Megale", "JM"],
    ["  joao  megale  ", "JM"],
  ])("monta as iniciais de %s como %s", (name, initials) => {
    render(
      <ProfileHeader
        profile={profile({ name, avatarUrl: null })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getByText(initials)).toBeTruthy();
  });

  it("usa o username para as iniciais quando nao ha nome", () => {
    render(
      <ProfileHeader
        profile={profile({ name: "", username: "joao", avatarUrl: null })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getByText("J")).toBeTruthy();
  });

  it("mostra ? quando nao ha nome nem username", () => {
    render(
      <ProfileHeader
        profile={profile({ name: "", username: null, avatarUrl: null })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getByText("?")).toBeTruthy();
  });

  it("nao renderiza a foto quando so ha iniciais", () => {
    render(
      <ProfileHeader profile={profile({ avatarUrl: null })} isOwnProfile viewerRole="athlete" />,
    );
    expect(screen.UNSAFE_queryByType(Avatar)).toBeNull();
  });

  it("mostra o selo de verificado quando o perfil e verificado", () => {
    const { UNSAFE_root } = render(
      <ProfileHeader profile={profile({ verified: true })} isOwnProfile viewerRole="athlete" />,
    );
    const selo = findHostByStyleValue(UNSAFE_root, darkTheme["color-primary-500"] as string);
    expect(selo.length).toBeGreaterThan(1); // anel do avatar + selo
  });

  it("nao mostra o selo quando nao verificado", () => {
    render(<ProfileHeader profile={profile({ verified: false })} isOwnProfile viewerRole="athlete" />);
    const icones = screen.UNSAFE_getAllByType(require("@ui-kitten/components").Icon);
    expect(icones.some((i) => i.props.name === "checkmark")).toBe(false);
  });
});

describe("estatisticas", () => {
  it("mostra as tres contagens com seus rotulos", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />);
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText(t("profile.validations"))).toBeTruthy();
    expect(screen.getByText(t("profile.videos"))).toBeTruthy();
    expect(screen.getByText(t("profile.contacts"))).toBeTruthy();
  });

  it("mostra zero em todas as contagens quando o atleta nao tem atividade", () => {
    render(
      <ProfileHeader
        profile={profile({ stats: { videoCount: 0, validationCount: 0, contactCount: 0 } })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it.each([
    [999, "999"],
    [1000, "1k"],
    [1500, "1.5k"],
    [2000, "2k"],
    [12300, "12.3k"],
  ])("abrevia a contagem %i como %s", (value, expected) => {
    render(
      <ProfileHeader
        profile={profile({ stats: { videoCount: value, validationCount: 0, contactCount: 0 } })}
        isOwnProfile
        viewerRole="athlete"
      />,
    );
    expect(screen.getByText(expected)).toBeTruthy();
  });
});

describe("acoes", () => {
  it("no proprio perfil, o botao do topo edita", () => {
    const onEditProfilePress = jest.fn();
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile
        viewerRole="athlete"
        onEditProfilePress={onEditProfilePress}
      />,
    );
    fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    expect(onEditProfilePress).toHaveBeenCalledTimes(1);
  });

  it("no perfil de outro, o botao do topo abre a conversa", () => {
    const onMessagePress = jest.fn();
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile={false}
        viewerRole="athlete"
        onMessagePress={onMessagePress}
      />,
    );
    fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);
    expect(onMessagePress).toHaveBeenCalledTimes(1);
  });

  it("oferece validar o perfil apenas para o profissional visitante", () => {
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile={false}
        viewerRole="pro"
        onValidateProfilePress={jest.fn()}
      />,
    );
    expect(screen.getByText(t("profile.validateProfile"))).toBeTruthy();
  });

  it("dispara a validacao", () => {
    const onValidateProfilePress = jest.fn();
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile={false}
        viewerRole="pro"
        onValidateProfilePress={onValidateProfilePress}
      />,
    );
    fireEvent.press(screen.getByText(t("profile.validateProfile")));
    expect(onValidateProfilePress).toHaveBeenCalledTimes(1);
  });

  it.each(["athlete", "club", "admin"] as const)(
    "nao oferece validar para o papel %s",
    (viewerRole) => {
      render(
        <ProfileHeader
          profile={profile()}
          isOwnProfile={false}
          viewerRole={viewerRole}
          onValidateProfilePress={jest.fn()}
        />,
      );
      expect(screen.queryByText(t("profile.validateProfile"))).toBeNull();
    },
  );

  it("nao oferece validar o proprio perfil, mesmo sendo profissional", () => {
    render(
      <ProfileHeader
        profile={profile()}
        isOwnProfile
        viewerRole="pro"
        onValidateProfilePress={jest.fn()}
      />,
    );
    expect(screen.queryByText(t("profile.validateProfile"))).toBeNull();
  });

  it("omite o botao de validar quando nao ha handler", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile={false} viewerRole="pro" />);
    expect(screen.queryByText(t("profile.validateProfile"))).toBeNull();
  });
});

describe("layout", () => {
  it("aplica o espacamento do topo quando informado", () => {
    const { UNSAFE_root } = render(
      <ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" topSpacing={64} />,
    );
    expect(findHostByStyleValue(UNSAFE_root, "64").length).toBeGreaterThan(0);
  });

  it("renderiza sem espacamento explicito", () => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />);
    expect(screen.getByText("Joao Megale")).toBeTruthy();
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os rotulos das estatisticas em %s", (lang) => {
    render(<ProfileHeader profile={profile()} isOwnProfile viewerRole="athlete" />, {
      language: lang,
    });
    const rotulo = i18n.t("profile.validations", { lng: lang });
    expect(rotulo).not.toBe("profile.validations");
    expect(screen.getByText(rotulo)).toBeTruthy();
  });
});
