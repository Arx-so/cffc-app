import React from "react";
import { Text as RNText } from "react-native";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { HeaderBar } from "@/components/HeaderBar/HeaderBar";
import { Brand } from "@/constants/theme";

/** O TouchableOpacity que envolve o título — onde `disabled` é decidido. */
const touchableDoTitulo = (root: any) =>
  root
    .findAll(() => true, { deep: true })
    .find(
      (n: any) =>
        typeof n.type !== "string" &&
        (n.type?.displayName ?? n.type?.name) === "TouchableOpacity",
    );

describe("HeaderBar", () => {
  it("mostra o titulo recebido", () => {
    render(<HeaderBar title="Meu Perfil" />);
    expect(screen.getByText("Meu Perfil")).toBeTruthy();
  });

  it("nao renderiza texto quando nao ha titulo", () => {
    render(<HeaderBar />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it("dispara onLeftPress ao tocar no titulo", () => {
    const onLeftPress = jest.fn();
    render(<HeaderBar title="Voltar" onLeftPress={onLeftPress} />);
    fireEvent.press(screen.getByText("Voltar"));
    expect(onLeftPress).toHaveBeenCalledTimes(1);
  });

  it("desabilita o toque quando nao ha handler, evitando area clicavel morta", () => {
    const { UNSAFE_root } = render(<HeaderBar title="Estatico" />);
    expect(touchableDoTitulo(UNSAFE_root).props.disabled).toBe(true);
  });

  it("habilita o toque quando ha handler", () => {
    const { UNSAFE_root } = render(<HeaderBar title="Ativo" onLeftPress={jest.fn()} />);
    expect(touchableDoTitulo(UNSAFE_root).props.disabled).toBe(false);
  });

  it("renderiza o acessorio da direita", () => {
    render(<HeaderBar title="Perfil" rightIcon={<RNText>Ação</RNText>} />);
    expect(screen.getByText("Ação")).toBeTruthy();
  });

  it("usa o fundo padrao da marca quando nenhum e informado", () => {
    const { UNSAFE_root } = render(<HeaderBar title="X" />);
    const container = UNSAFE_root.findAllByType("View" as never)[0];
    expect(JSON.stringify(container.props.style)).toContain(Brand.bg);
  });

  it("aceita um fundo customizado", () => {
    const { UNSAFE_root } = render(<HeaderBar title="X" backgroundColor="#123456" />);
    const container = UNSAFE_root.findAllByType("View" as never)[0];
    expect(JSON.stringify(container.props.style)).toContain("#123456");
  });

  it("renderiza no modo compacto sem quebrar", () => {
    render(<HeaderBar title="Compacto" compact />);
    expect(screen.getByText("Compacto")).toBeTruthy();
  });

  it("renderiza com icone a esquerda", () => {
    render(<HeaderBar title="Com icone" leftIcon="arrow-back" />);
    expect(screen.getByText("Com icone")).toBeTruthy();
  });
});
