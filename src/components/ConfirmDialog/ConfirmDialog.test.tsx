import React from "react";
import { render, screen, fireEvent } from "@/test/renderWithProviders";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";

const base = {
  visible: true,
  title: "Excluir conta",
  cancelLabel: "Cancelar",
  confirmLabel: "Excluir",
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("ConfirmDialog", () => {
  it("mostra titulo e os dois botoes", () => {
    render(<ConfirmDialog {...base} />);
    expect(screen.getByText("Excluir conta")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
    expect(screen.getByText("Excluir")).toBeTruthy();
  });

  it("mostra a mensagem quando informada", () => {
    render(<ConfirmDialog {...base} message="Esta acao e irreversivel." />);
    expect(screen.getByText("Esta acao e irreversivel.")).toBeTruthy();
  });

  it("omite a mensagem quando nao informada", () => {
    render(<ConfirmDialog {...base} />);
    expect(screen.queryByText("Esta acao e irreversivel.")).toBeNull();
  });

  it.each([
    ["string vazia", ""],
    ["undefined", undefined],
  ])("nao renderiza bloco de mensagem para %s", (_l, message) => {
    render(<ConfirmDialog {...base} message={message} />);
    expect(screen.getAllByText(/./).length).toBe(3); // titulo + 2 botoes
  });

  it("nao renderiza nada quando invisivel", () => {
    render(<ConfirmDialog {...base} visible={false} />);
    expect(screen.queryByText("Excluir conta")).toBeNull();
  });

  it("chama onConfirm ao tocar em confirmar", () => {
    render(<ConfirmDialog {...base} />);
    fireEvent.press(screen.getByText("Excluir"));
    expect(base.onConfirm).toHaveBeenCalledTimes(1);
    expect(base.onCancel).not.toHaveBeenCalled();
  });

  it("chama onCancel ao tocar em cancelar", () => {
    render(<ConfirmDialog {...base} />);
    fireEvent.press(screen.getByText("Cancelar"));
    expect(base.onCancel).toHaveBeenCalledTimes(1);
    expect(base.onConfirm).not.toHaveBeenCalled();
  });

  it("troca o rotulo de confirmar por um indicador durante o carregamento", () => {
    render(<ConfirmDialog {...base} isLoading />);
    expect(screen.queryByText("Excluir")).toBeNull();
    expect(screen.UNSAFE_getByType(
      require("react-native").ActivityIndicator,
    )).toBeTruthy();
  });

  it("bloqueia os dois botoes durante o carregamento, evitando dupla submissao", () => {
    render(<ConfirmDialog {...base} isLoading />);
    fireEvent.press(screen.getByText("Cancelar"));
    const indicator = screen.UNSAFE_getByType(require("react-native").ActivityIndicator);
    fireEvent.press(indicator);
    expect(base.onCancel).not.toHaveBeenCalled();
    expect(base.onConfirm).not.toHaveBeenCalled();
  });

  it("mantem o rotulo de cancelar visivel durante o carregamento", () => {
    render(<ConfirmDialog {...base} isLoading />);
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("aceita o modo destrutivo sem alterar os rotulos", () => {
    render(<ConfirmDialog {...base} destructive />);
    expect(screen.getByText("Excluir")).toBeTruthy();
  });

  it("usa a cor de perigo no indicador quando destrutivo", () => {
    const { Brand } = require("@/constants/theme");
    render(<ConfirmDialog {...base} destructive isLoading />);
    const indicator = screen.UNSAFE_getByType(require("react-native").ActivityIndicator);
    expect(indicator.props.color).toBe(Brand.danger);
  });

  it("usa a cor do botao primario no indicador quando nao destrutivo", () => {
    const { Brand } = require("@/constants/theme");
    render(<ConfirmDialog {...base} isLoading />);
    const indicator = screen.UNSAFE_getByType(require("react-native").ActivityIndicator);
    expect(indicator.props.color).toBe(Brand.buttonPrimaryText);
  });

  it("fecha ao tocar no fundo (onRequestClose do modal)", () => {
    render(<ConfirmDialog {...base} />);
    const modal = screen.UNSAFE_getByType(require("react-native").Modal);
    modal.props.onRequestClose();
    expect(base.onCancel).toHaveBeenCalledTimes(1);
  });

  it("nao fecha ao tocar no conteudo do dialogo", () => {
    render(<ConfirmDialog {...base} />);
    fireEvent.press(screen.getByText("Excluir conta"));
    expect(base.onCancel).not.toHaveBeenCalled();
  });
});
