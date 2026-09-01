import React from "react";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { OptionsSheet } from "@/components/OptionsSheet/OptionsSheet";

const options = [
  { key: "report", label: "Denunciar" },
  { key: "block", label: "Bloquear", destructive: true },
  { key: "pt", label: "Português", selected: true },
];

const base = {
  visible: true,
  options,
  cancelLabel: "Cancelar",
  onSelect: jest.fn(),
  onClose: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("OptionsSheet", () => {
  it("lista todas as opcoes mais o cancelar", () => {
    render(<OptionsSheet {...base} />);
    for (const o of options) expect(screen.getByText(o.label)).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("mostra o titulo quando informado", () => {
    render(<OptionsSheet {...base} title="Idioma" />);
    expect(screen.getByText("Idioma")).toBeTruthy();
  });

  it.each([
    ["sem titulo", undefined],
    ["titulo vazio", ""],
  ])("omite o cabecalho %s", (_l, title) => {
    render(<OptionsSheet {...base} title={title} />);
    expect(screen.getAllByText(/./).length).toBe(options.length + 1);
  });

  it("nao renderiza nada quando invisivel", () => {
    render(<OptionsSheet {...base} visible={false} />);
    expect(screen.queryByText("Denunciar")).toBeNull();
  });

  it("devolve a chave da opcao tocada, nao o rotulo", () => {
    render(<OptionsSheet {...base} />);
    fireEvent.press(screen.getByText("Bloquear"));
    expect(base.onSelect).toHaveBeenCalledWith("block");
  });

  it.each(options)("seleciona a opcao $key", (option) => {
    render(<OptionsSheet {...base} />);
    fireEvent.press(screen.getByText(option.label));
    expect(base.onSelect).toHaveBeenCalledWith(option.key);
  });

  it("fecha ao tocar em cancelar, sem selecionar nada", () => {
    render(<OptionsSheet {...base} />);
    fireEvent.press(screen.getByText("Cancelar"));
    expect(base.onClose).toHaveBeenCalledTimes(1);
    expect(base.onSelect).not.toHaveBeenCalled();
  });

  it("fecha pelo botao voltar do sistema", () => {
    render(<OptionsSheet {...base} />);
    screen.UNSAFE_getByType(require("react-native").Modal).props.onRequestClose();
    expect(base.onClose).toHaveBeenCalledTimes(1);
  });

  it("nao fecha ao tocar no conteudo da folha", () => {
    render(<OptionsSheet {...base} title="Idioma" />);
    fireEvent.press(screen.getByText("Idioma"));
    expect(base.onClose).not.toHaveBeenCalled();
  });

  it("da estilo distinto para a opcao selecionada", () => {
    render(<OptionsSheet {...base} />);
    const selecionada = JSON.stringify(screen.getByText("Português").props.style);
    const normal = JSON.stringify(screen.getByText("Denunciar").props.style);
    expect(selecionada).not.toBe(normal);
  });

  it("da estilo distinto para a opcao destrutiva", () => {
    render(<OptionsSheet {...base} />);
    const destrutiva = JSON.stringify(screen.getByText("Bloquear").props.style);
    const normal = JSON.stringify(screen.getByText("Denunciar").props.style);
    expect(destrutiva).not.toBe(normal);
  });

  it("renderiza sem opcao alguma", () => {
    render(<OptionsSheet {...base} options={[]} />);
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });
});
