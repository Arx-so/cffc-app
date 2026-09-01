import React from "react";
import { Text } from "react-native";
import { render, screen } from "@/test/renderWithProviders";
import {
  KeyboardAwareScreen,
  TAB_BAR_BOTTOM_INSET,
} from "@/components/KeyboardAwareScreen";
import KeyboardAwareScreenDefault from "@/components/KeyboardAwareScreen";

const scroll = () => screen.getByTestId("KeyboardAwareScrollView");

describe("KeyboardAwareScreen", () => {
  it("renderiza os filhos", () => {
    render(<KeyboardAwareScreen><Text>Conteudo</Text></KeyboardAwareScreen>);
    expect(screen.getByText("Conteudo")).toBeTruthy();
  });

  it("deixa ~16px de folga acima do teclado por padrao", () => {
    render(<KeyboardAwareScreen><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.bottomOffset).toBe(16);
  });

  it("soma o inset da tab bar quando a tela vive dentro do grupo de papeis", () => {
    render(<KeyboardAwareScreen withTabBarInset><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.bottomOffset).toBe(16 + TAB_BAR_BOTTOM_INSET);
  });

  it("soma o inset sobre um bottomOffset customizado, sem substituir", () => {
    render(<KeyboardAwareScreen bottomOffset={40} withTabBarInset><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.bottomOffset).toBe(40 + TAB_BAR_BOTTOM_INSET);
  });

  it("nao soma o inset quando a tela nao esta sob a tab bar", () => {
    render(<KeyboardAwareScreen bottomOffset={40}><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.bottomOffset).toBe(40);
  });

  it("mantem o toque funcionando com o teclado aberto", () => {
    render(<KeyboardAwareScreen><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.keyboardShouldPersistTaps).toBe("handled");
  });

  it("esconde a barra de rolagem por padrao", () => {
    render(<KeyboardAwareScreen><Text>x</Text></KeyboardAwareScreen>);
    expect(scroll().props.showsVerticalScrollIndicator).toBe(false);
  });

  it("permite sobrescrever os dois padroes de scroll", () => {
    render(
      <KeyboardAwareScreen keyboardShouldPersistTaps="always" showsVerticalScrollIndicator>
        <Text>x</Text>
      </KeyboardAwareScreen>,
    );
    expect(scroll().props.keyboardShouldPersistTaps).toBe("always");
    expect(scroll().props.showsVerticalScrollIndicator).toBe(true);
  });

  it("repassa extraKeyboardSpace e props arbitrarias de ScrollView", () => {
    render(
      <KeyboardAwareScreen extraKeyboardSpace={32} contentContainerStyle={{ padding: 8 }}>
        <Text>x</Text>
      </KeyboardAwareScreen>,
    );
    expect(scroll().props.extraKeyboardSpace).toBe(32);
    expect(scroll().props.contentContainerStyle).toEqual({ padding: 8 });
  });

  it("o inset da tab bar cobre a barra absoluta (64) mais a margem (20)", () => {
    expect(TAB_BAR_BOTTOM_INSET).toBe(84);
  });

  it("exporta o mesmo componente como default", () => {
    expect(KeyboardAwareScreenDefault).toBe(KeyboardAwareScreen);
  });
});
