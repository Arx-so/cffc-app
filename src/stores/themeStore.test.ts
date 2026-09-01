import { useEffectiveTheme } from "@/stores/themeStore";

describe("useEffectiveTheme", () => {
  it("resolve sempre para dark — o app hoje so tem tema escuro", () => {
    expect(useEffectiveTheme()).toBe("dark");
  });

  it("e estavel entre chamadas", () => {
    expect(useEffectiveTheme()).toBe(useEffectiveTheme());
  });
});
