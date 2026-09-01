import { LegalUrls } from "@/constants/legal";

describe("LegalUrls", () => {
  it("expoe as quatro paginas exigidas pelas lojas", () => {
    expect(Object.keys(LegalUrls).sort()).toEqual([
      "deleteAccount",
      "privacyPolicy",
      "support",
      "termsOfUse",
    ]);
  });

  it.each(Object.entries(LegalUrls))("%s e uma url https absoluta", (_name, url) => {
    expect(url).toMatch(/^https:\/\/[^\s]+$/);
    expect(() => new URL(url)).not.toThrow();
  });

  it("todas apontam para o mesmo dominio legal", () => {
    const hosts = new Set(Object.values(LegalUrls).map((u) => new URL(u).host));
    expect(hosts.size).toBe(1);
  });

  it("cada pagina tem um caminho proprio, sem colisao", () => {
    const paths = Object.values(LegalUrls).map((u) => new URL(u).pathname);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("nenhuma url termina em barra, que quebraria concatenacao", () => {
    for (const url of Object.values(LegalUrls)) expect(url).not.toMatch(/\/$/);
  });
});
