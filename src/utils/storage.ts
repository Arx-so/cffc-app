import { secureStorage } from "@/utils/secureStorage";

const TOKEN_KEY = "auth_token";

export const saveToken = async (token: string): Promise<void> => {
  await secureStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await secureStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await secureStorage.removeItem(TOKEN_KEY);
};
