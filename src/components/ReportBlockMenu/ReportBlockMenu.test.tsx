jest.mock("@/processes/moderation", () => ({
  reportContent: jest.fn(async () => {}),
  blockUser: jest.fn(async () => {}),
}));

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@/test/renderWithProviders";
import Toast from "react-native-toast-message";
import { reportContent, blockUser } from "@/processes/moderation";
import { REPORT_REASONS } from "@/processes/types/moderationTypes";
import { ReportBlockMenu } from "@/components/ReportBlockMenu/ReportBlockMenu";
import { findPressHandlers } from "@/test/rntl";
import i18n from "@/config/i18n";

const report = reportContent as jest.Mock;
const block = blockUser as jest.Mock;
const toast = Toast.show as jest.Mock;
const t = (k: string) => i18n.t(k);

const openMenu = () => fireEvent.press(findPressHandlers(screen.UNSAFE_root)[0]);

beforeEach(() => {
  jest.clearAllMocks();
  i18n.changeLanguage("en");
  report.mockResolvedValue(undefined);
  block.mockResolvedValue(undefined);
});

describe("gatilho", () => {
  it("comeca com todos os modais fechados", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    expect(screen.queryByText(t("moderation.menuTitle"))).toBeNull();
    expect(screen.queryByText(t("moderation.blockConfirmTitle"))).toBeNull();
  });

  it("abre o menu ao tocar nos tres pontos", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    openMenu();
    expect(screen.getByText(t("moderation.menuTitle"))).toBeTruthy();
    expect(screen.getByText(t("moderation.reportAction"))).toBeTruthy();
    expect(screen.getByText(t("moderation.blockAction"))).toBeTruthy();
  });

  it("usa cor e tamanho de icone padrao", () => {
    const { Ionicons } = require("@expo/vector-icons");
    render(<ReportBlockMenu reportedUserId="u5" />);
    const icon = screen.UNSAFE_getByType(Ionicons);
    expect(icon.props).toMatchObject({ name: "ellipsis-vertical", size: 20, color: "#FFFFFF" });
  });

  it("aceita cor e tamanho customizados", () => {
    const { Ionicons } = require("@expo/vector-icons");
    render(<ReportBlockMenu reportedUserId="u5" iconColor="#000" iconSize={32} />);
    expect(screen.UNSAFE_getByType(Ionicons).props).toMatchObject({ size: 32, color: "#000" });
  });
});

describe("denuncia", () => {
  const abrirMotivos = () => {
    openMenu();
    fireEvent.press(screen.getByText(t("moderation.reportAction")));
  };

  it("lista todos os motivos de denuncia", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    for (const reason of REPORT_REASONS) {
      expect(screen.getByText(t(`moderation.reasons.${reason}`))).toBeTruthy();
    }
  });

  it("fecha o menu ao abrir a lista de motivos", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    expect(screen.queryByText(t("moderation.menuTitle"))).toBeNull();
  });

  it("envia a denuncia com o motivo escolhido e o video em contexto", async () => {
    render(<ReportBlockMenu reportedUserId="u5" mediaId="m1" />);
    abrirMotivos();
    fireEvent.press(screen.getByText(t(`moderation.reasons.${REPORT_REASONS[0]}`)));

    await waitFor(() =>
      expect(report).toHaveBeenCalledWith({
        reportedUserId: "u5",
        mediaId: "m1",
        reason: REPORT_REASONS[0],
      }),
    );
  });

  it("envia denuncia de perfil sem mediaId", async () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    fireEvent.press(screen.getByText(t(`moderation.reasons.${REPORT_REASONS[0]}`)));
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ mediaId: undefined })),
    );
  });

  it("confirma o envio com um toast de sucesso", async () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    fireEvent.press(screen.getByText(t(`moderation.reasons.${REPORT_REASONS[0]}`)));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "success",
        text1: t("moderation.reportSubmitted"),
      }),
    );
  });

  it("avisa com toast de erro quando a denuncia falha", async () => {
    report.mockRejectedValue(new Error("rls"));
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    fireEvent.press(screen.getByText(t(`moderation.reasons.${REPORT_REASONS[0]}`)));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ type: "error", text1: t("moderation.reportError") }),
    );
  });

  it("fecha a lista de motivos ao cancelar, sem denunciar", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirMotivos();
    fireEvent.press(screen.getByText(t("common.cancel")));
    expect(screen.queryByText(t("moderation.reportReasonTitle"))).toBeNull();
    expect(report).not.toHaveBeenCalled();
  });
});

describe("bloqueio", () => {
  const abrirConfirmacao = () => {
    openMenu();
    fireEvent.press(screen.getByText(t("moderation.blockAction")));
  };

  it("pede confirmacao antes de bloquear", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirConfirmacao();
    expect(screen.getByText(t("moderation.blockConfirmTitle"))).toBeTruthy();
    expect(screen.getByText(t("moderation.blockConfirmMessage"))).toBeTruthy();
    expect(block).not.toHaveBeenCalled();
  });

  it("bloqueia ao confirmar", async () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    await waitFor(() => expect(block).toHaveBeenCalledWith("u5"));
  });

  it("nao bloqueia ao cancelar", () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("common.cancel")));
    expect(block).not.toHaveBeenCalled();
    expect(screen.queryByText(t("moderation.blockConfirmTitle"))).toBeNull();
  });

  it("invalida o feed para o usuario bloqueado sumir da lista", async () => {
    const { queryClient } = render(<ReportBlockMenu reportedUserId="u5" />);
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["home-feed-videos"] }),
    );
  });

  it("avisa o chamador para navegar ou atualizar a lista", async () => {
    const onBlocked = jest.fn();
    render(<ReportBlockMenu reportedUserId="u5" onBlocked={onBlocked} />);
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    await waitFor(() => expect(onBlocked).toHaveBeenCalledTimes(1));
  });

  it("confirma com toast de sucesso", async () => {
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        type: "success",
        text1: t("moderation.blockSuccess"),
      }),
    );
  });

  it("avisa com toast de erro e nao chama onBlocked quando falha", async () => {
    block.mockRejectedValue(new Error("rls"));
    const onBlocked = jest.fn();
    render(<ReportBlockMenu reportedUserId="u5" onBlocked={onBlocked} />);
    abrirConfirmacao();
    fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ type: "error", text1: t("moderation.blockError") }),
    );
    expect(onBlocked).not.toHaveBeenCalled();
  });

  it("fecha o dialogo mesmo quando o bloqueio falha", async () => {
    block.mockRejectedValue(new Error("rls"));
    render(<ReportBlockMenu reportedUserId="u5" />);
    abrirConfirmacao();

    // `act` assíncrono drena a cadeia de promessas do handler antes de afirmar.
    // Depender de `waitFor` aqui deixava o teste refém do timeout de 1s, que
    // estoura quando as suítes rodam em paralelo.
    await act(async () => {
      fireEvent.press(screen.getByText(t("moderation.blockConfirmButton")));
    });

    expect(screen.queryByText(t("moderation.blockConfirmTitle"))).toBeNull();
  });
});

describe("i18n", () => {
  it.each(["en", "pt-BR", "ja"])("resolve os textos do menu em %s", (lang) => {
    render(<ReportBlockMenu reportedUserId="u5" />, { language: lang });
    openMenu();
    const titulo = i18n.t("moderation.menuTitle", { lng: lang });
    expect(titulo).not.toBe("moderation.menuTitle");
    expect(screen.getByText(titulo)).toBeTruthy();
  });
});
