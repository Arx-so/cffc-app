import React from "react";
import { Image } from "react-native";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { VideosSection } from "@/components/VideosSection/VideosSection";
import i18n from "@/config/i18n";
import { Brand } from "@/constants/theme";
import { darkTheme } from "@/config/themes";
import { findPressables, findHostByStyleValue } from "@/test/rntl";

const t = (k: string) => i18n.t(k);

const video = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "m1",
  url: "https://cdn/v.mp4",
  thumbUrl: "https://cdn/t.jpg",
  status: "approved" as const,
  ...over,
});

beforeEach(() => i18n.changeLanguage("en"));

describe("VideosSection — cabecalho", () => {
  it("sempre mostra o titulo da secao", () => {
    render(<VideosSection videos={[]} isOwnProfile />);
    expect(screen.getByText(t("profile.videosTitle"))).toBeTruthy();
  });
});

describe("VideosSection — vazio no proprio perfil", () => {
  it("convida o dono a enviar o primeiro video", () => {
    render(<VideosSection videos={[]} isOwnProfile />);
    expect(screen.getByText(t("profile.noVideosTitle"))).toBeTruthy();
    expect(screen.getByText(t("profile.noVideosHint"))).toBeTruthy();
    expect(screen.getByText(t("profile.addFirstVideo"))).toBeTruthy();
  });

  it("dispara onAddPress pelo botao do estado vazio", () => {
    const onAddPress = jest.fn();
    render(<VideosSection videos={[]} isOwnProfile onAddPress={onAddPress} />);
    fireEvent.press(screen.getByText(t("profile.addFirstVideo")));
    expect(onAddPress).toHaveBeenCalledTimes(1);
  });

  it("nao quebra quando onAddPress nao e informado", () => {
    render(<VideosSection videos={[]} isOwnProfile />);
    expect(() => fireEvent.press(screen.getByText(t("profile.addFirstVideo")))).not.toThrow();
  });
});

describe("VideosSection — vazio no perfil de outro", () => {
  it("mostra a mensagem de visitante, sem convite para enviar", () => {
    render(<VideosSection videos={[]} isOwnProfile={false} />);
    expect(screen.getByText(t("profile.noVideosVisitor"))).toBeTruthy();
    expect(screen.queryByText(t("profile.addFirstVideo"))).toBeNull();
  });

  it("usa cor apagada no icone, nao a cor primaria", () => {
    render(<VideosSection videos={[]} isOwnProfile={false} />);
    const icon = screen.UNSAFE_getAllByType(require("@ui-kitten/components").Icon)[0];
    expect(icon.props.fill).toBe(darkTheme["color-basic-600"]);
  });
});

describe("VideosSection — grade", () => {
  const pressables = () => findPressables(screen.UNSAFE_root);

  it("renderiza uma miniatura por video", () => {
    render(
      <VideosSection videos={[video(), video({ id: "m2" })]} isOwnProfile={false} />,
    );
    expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(2);
  });

  it("prefere a miniatura e cai para a url do video quando nao ha thumb", () => {
    render(<VideosSection videos={[video({ thumbUrl: null })]} isOwnProfile={false} />);
    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: "https://cdn/v.mp4" });
  });

  it("usa a miniatura quando disponivel", () => {
    render(<VideosSection videos={[video()]} isOwnProfile={false} />);
    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: "https://cdn/t.jpg" });
  });

  it("devolve o video tocado, nao apenas o indice", () => {
    const onVideoPress = jest.fn();
    const v = video();
    render(<VideosSection videos={[v]} isOwnProfile={false} onVideoPress={onVideoPress} />);
    fireEvent.press(pressables()[0]);
    expect(onVideoPress).toHaveBeenCalledWith(v);
  });

  it("nao quebra quando onVideoPress nao e informado", () => {
    render(<VideosSection videos={[video()]} isOwnProfile={false} />);
    expect(() => fireEvent.press(pressables()[0])).not.toThrow();
  });

  it("marca com ponto apenas os videos aprovados", () => {
    const { UNSAFE_root } = render(
      <VideosSection
        videos={[video(), video({ id: "m2", status: "pending" }), video({ id: "m3", status: "rejected" })]}
        isOwnProfile={false}
      />,
    );
    const dots = findHostByStyleValue(UNSAFE_root, darkTheme["color-primary-500"] as string);
    expect(dots).toHaveLength(1);
  });

  it("mostra o atalho de adicionar no fim da grade do proprio perfil", () => {
    render(<VideosSection videos={[video()]} isOwnProfile />);
    expect(pressables()).toHaveLength(2);
  });

  it("nao mostra o atalho de adicionar no perfil de outro", () => {
    render(<VideosSection videos={[video()]} isOwnProfile={false} />);
    expect(pressables()).toHaveLength(1);
  });

  it("dispara onAddPress pelo atalho da grade", () => {
    const onAddPress = jest.fn();
    render(<VideosSection videos={[video()]} isOwnProfile onAddPress={onAddPress} />);
    fireEvent.press(pressables()[1]);
    expect(onAddPress).toHaveBeenCalledTimes(1);
  });

  it("usa o fundo de card da marca no atalho de adicionar", () => {
    render(<VideosSection videos={[video()]} isOwnProfile />);
    const add = pressables()[1];
    expect(JSON.stringify(add.props.style)).toContain(Brand.card);
  });
});

describe("VideosSection — i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos em %s", (lang) => {
    render(<VideosSection videos={[]} isOwnProfile />, { language: lang });
    const titulo = i18n.t("profile.videosTitle", { lng: lang });
    expect(screen.getByText(titulo)).toBeTruthy();
    expect(titulo).not.toBe("profile.videosTitle");
  });
});
