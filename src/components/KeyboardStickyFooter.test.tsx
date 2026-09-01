import React from "react";
import { Text } from "react-native";
import { render, screen } from "@/test/renderWithProviders";
import { KeyboardStickyFooter } from "@/components/KeyboardStickyFooter";
import KeyboardStickyFooterDefault from "@/components/KeyboardStickyFooter";

const sticky = () => screen.getByTestId("KeyboardStickyView");

describe("KeyboardStickyFooter", () => {
  it("renderiza os filhos", () => {
    render(<KeyboardStickyFooter><Text>Salvar</Text></KeyboardStickyFooter>);
    expect(screen.getByText("Salvar")).toBeTruthy();
  });

  it("nao desloca o rodape por padrao, em nenhum dos dois estados", () => {
    render(<KeyboardStickyFooter><Text>x</Text></KeyboardStickyFooter>);
    expect(sticky().props.offset).toEqual({ closed: 0, opened: 0 });
  });

  it("aceita deslocamento diferente para teclado fechado e aberto", () => {
    render(
      <KeyboardStickyFooter closedOffset={84} openedOffset={-16}>
        <Text>x</Text>
      </KeyboardStickyFooter>,
    );
    expect(sticky().props.offset).toEqual({ closed: 84, opened: -16 });
  });

  it("vem habilitado por padrao", () => {
    render(<KeyboardStickyFooter><Text>x</Text></KeyboardStickyFooter>);
    expect(sticky().props.enabled).toBe(true);
  });

  it("pode ser desabilitado", () => {
    render(<KeyboardStickyFooter enabled={false}><Text>x</Text></KeyboardStickyFooter>);
    expect(sticky().props.enabled).toBe(false);
  });

  it("repassa o estilo", () => {
    render(<KeyboardStickyFooter style={{ padding: 12 }}><Text>x</Text></KeyboardStickyFooter>);
    expect(sticky().props.style).toEqual({ padding: 12 });
  });

  it("exporta o mesmo componente como default", () => {
    expect(KeyboardStickyFooterDefault).toBe(KeyboardStickyFooter);
  });
});
