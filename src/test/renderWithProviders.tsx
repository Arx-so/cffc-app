/**
 * Render helper para componentes e telas.
 *
 * Monta os providers que o app monta em `_layout.tsx` — UI Kitten + Eva, o
 * QueryClient e o i18n real. Usar o i18n real (em vez de um `t` que ecoa a
 * chave) faz os testes falharem quando uma chave de tradução não existe, que é
 * exatamente a classe de bug que o CLAUDE.md pede para evitar.
 */
import React from "react";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { render, RenderOptions } from "@testing-library/react-native";

import i18n from "@/config/i18n";
import { darkTheme } from "@/config/themes";

/** Métricas fixas: sem elas o SafeAreaProvider mede assincronamente e o layout varia entre execuções. */
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export const makeTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
    // Silencia o log de erro esperado nos testes de caminho de falha.
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  } as never);

export const SAFE_AREA_TOP = SAFE_AREA_METRICS.insets.top;
export const SAFE_AREA_BOTTOM = SAFE_AREA_METRICS.insets.bottom;

export interface ProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  language?: string;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  { queryClient = makeTestQueryClient(), language, ...options }: ProvidersOptions = {},
) => {
  if (language) i18n.changeLanguage(language);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <IconRegistry icons={EvaIconsPack} />
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ApplicationProvider {...eva} theme={{ ...eva.dark, ...darkTheme }}>
            {children}
          </ApplicationProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
};

export * from "@testing-library/react-native";
export { renderWithProviders as render };
