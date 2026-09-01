/** Leitura das `options` declaradas em `<Tabs.Screen>` / `<Stack.Screen>`. */
import type { ReactTestInstance } from "react-test-renderer";

export interface ScreenDeclaration {
  name: string;
  options: Record<string, any>;
}

/** Todas as telas declaradas por um navegador, na ordem em que aparecem. */
export const findScreens = (root: ReactTestInstance, navigator: "Tabs" | "Stack") =>
  root
    .findAll(() => true, { deep: true })
    .filter(
      (n) =>
        typeof n.type !== "string" &&
        (n.type as { displayName?: string })?.displayName === `${navigator}.Screen`,
    )
    .map((n) => ({ name: n.props.name as string, options: (n.props.options ?? {}) as Record<string, any> }));

export const findScreen = (
  root: ReactTestInstance,
  navigator: "Tabs" | "Stack",
  name: string,
): ScreenDeclaration | undefined => findScreens(root, navigator).find((s) => s.name === name);

/** Opções globais aplicadas pelo navegador a todas as telas. */
export const navigatorOptions = (root: ReactTestInstance, navigator: "Tabs" | "Stack") =>
  root
    .findAll(() => true, { deep: true })
    .find(
      (n) =>
        typeof n.type !== "string" &&
        (n.type as { displayName?: string })?.displayName === navigator,
    )?.props?.screenOptions ?? {};
