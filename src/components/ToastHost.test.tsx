import React from "react";
import { render, screen } from "@/test/renderWithProviders";
import ToastContainer from "react-native-toast-message";
import { ToastHost } from "@/components/ToastHost";
import ToastHostDefault from "@/components/ToastHost";

const container = () => screen.UNSAFE_getByType(ToastContainer as never);

describe("ToastHost", () => {
  it("ancora os toasts na base da tela", () => {
    render(<ToastHost />);
    expect(container().props.position).toBe("bottom");
  });

  it("usa 130px de folga por padrao, acima da tab bar", () => {
    render(<ToastHost />);
    expect(container().props.bottomOffset).toBe(130);
  });

  it("aceita uma folga customizada", () => {
    render(<ToastHost bottomOffset={40} />);
    expect(container().props.bottomOffset).toBe(40);
  });

  it("nao intercepta toques fora do toast", () => {
    const { UNSAFE_root } = render(<ToastHost />);
    const animated = UNSAFE_root.findAll(
      (n) => n.props?.pointerEvents === "box-none",
    );
    expect(animated.length).toBeGreaterThan(0);
  });

  it("exporta o mesmo componente como default", () => {
    expect(ToastHostDefault).toBe(ToastHost);
  });
});
