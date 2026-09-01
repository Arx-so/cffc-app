import React from "react";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { SettingsAction } from "@/components/SettingsAction/SettingsAction";
import { darkTheme } from "@/config/themes";
import { mockRouter, resetMockRouter } from "@/test/router";

beforeEach(resetMockRouter);

describe("SettingsAction", () => {
  it("navega para as configuracoes ao ser tocado", () => {
    render(<SettingsAction />);
    fireEvent.press(screen.UNSAFE_getByType(
      require("@ui-kitten/components").TopNavigationAction,
    ));
    expect(mockRouter.push).toHaveBeenCalledWith("/settings");
  });

  it("usa o icone de menu preenchido com a cor primaria do tema", () => {
    render(<SettingsAction />);
    const icon = screen.UNSAFE_getByType(require("@ui-kitten/components").Icon);
    expect(icon.props.name).toBe("menu-2-outline");
    expect(icon.props.fill).toBe(darkTheme["color-primary-500"]);
  });

  it("nao navega sozinho ao montar", () => {
    render(<SettingsAction />);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
