import React from "react";
import { renderHook } from "@testing-library/react-native";
import { render, screen } from "@/test/renderWithProviders";
import { RoleTabPlaceholder } from "@/Views/RoleTabPlaceholder/RoleTabPlaceholder";
import { useRoleTabPlaceholder } from "@/Views/RoleTabPlaceholder/useRoleTabPlaceholder";
import { Brand } from "@/constants/theme";
import { findHostByStyleValue } from "@/test/rntl";
import i18n from "@/config/i18n";

const keys = { titleKey: "tabs.favorites", bodyKey: "profile.noVideosHint" };

beforeEach(() => i18n.changeLanguage("en"));

describe("useRoleTabPlaceholder", () => {
  it("traduz as duas chaves recebidas", () => {
    const { result } = renderHook(() => useRoleTabPlaceholder(keys));
    expect(result.current).toEqual({
      title: i18n.t(keys.titleKey),
      body: i18n.t(keys.bodyKey),
    });
  });

  it("devolve a propria chave quando ela nao existe, em vez de vazio", () => {
    const { result } = renderHook(() =>
      useRoleTabPlaceholder({ titleKey: "nao.existe", bodyKey: "tambem.nao" }),
    );
    expect(result.current).toEqual({ title: "nao.existe", body: "tambem.nao" });
  });
});

describe("RoleTabPlaceholder", () => {
  it("mostra titulo e corpo traduzidos", () => {
    render(<RoleTabPlaceholder {...keys} />);
    expect(screen.getByText(i18n.t(keys.titleKey))).toBeTruthy();
    expect(screen.getByText(i18n.t(keys.bodyKey))).toBeTruthy();
  });

  it("usa o fundo escuro da marca, ocupando a tela toda", () => {
    const { UNSAFE_root } = render(<RoleTabPlaceholder {...keys} />);
    expect(findHostByStyleValue(UNSAFE_root, Brand.bg).length).toBeGreaterThan(0);
  });

  it.each(["en", "pt-BR", "ja"])("traduz conforme o idioma ativo (%s)", (lang) => {
    render(<RoleTabPlaceholder {...keys} />, { language: lang });
    const titulo = i18n.t(keys.titleKey, { lng: lang });
    expect(titulo).not.toBe(keys.titleKey);
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
