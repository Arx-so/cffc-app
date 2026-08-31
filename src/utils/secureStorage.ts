import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const memoryStore = new Map<string, string>();

const hasLocalStorage = () =>
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { localStorage?: Storage }).localStorage !== "undefined";

const webStorage = {
  getItem: async (key: string) =>
    hasLocalStorage() ? globalThis.localStorage.getItem(key) : (memoryStore.get(key) ?? null),
  setItem: async (key: string, value: string) => {
    if (hasLocalStorage()) globalThis.localStorage.setItem(key, value);
    else memoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    if (hasLocalStorage()) globalThis.localStorage.removeItem(key);
    else memoryStore.delete(key);
  },
};

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const secureStorage = Platform.OS === "web" ? webStorage : nativeStorage;
