/** Acesso tipado ao router mockado em `jest.setup.ts` (mesma instância que `useRouter()` devolve). */
import { router } from "expo-router";

export const mockRouter = router as unknown as {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  navigate: jest.Mock;
  dismissAll: jest.Mock;
  canGoBack: jest.Mock;
  setParams: jest.Mock;
};

export const resetMockRouter = () => {
  Object.values(mockRouter).forEach((fn) => fn.mockClear());
  mockRouter.canGoBack.mockReturnValue(true);
};
