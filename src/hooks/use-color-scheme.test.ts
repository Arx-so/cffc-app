import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColorScheme as useRNColorScheme } from "react-native";

describe("useColorScheme (nativo)", () => {
  it("reexporta o hook do react-native sem envolver em nada", () => {
    expect(useColorScheme).toBe(useRNColorScheme);
  });
});
