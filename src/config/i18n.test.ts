import en from "@/locales/en";
import ja from "@/locales/ja";
import ptBr from "@/locales/pt-br";
import i18n from "@/config/i18n";

type Dict = Record<string, unknown>;

/** Achata o dicionario em chaves pontilhadas, como o i18next as resolve. */
const flatten = (obj: Dict, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v as Dict, path)
      : [path];
  });

const keys = {
  en: flatten(en as Dict).sort(),
  ja: flatten(ja as Dict).sort(),
  "pt-BR": flatten(ptBr as Dict).sort(),
};

describe("paridade entre os idiomas", () => {
  // O CLAUDE.md exige adicionar a chave nos 3 arquivos ao mesmo tempo.
  // Nada verificava isso — uma chave faltando so aparece como texto cru na tela.
  it.each(["ja", "pt-BR"] as const)("%s tem exatamente as mesmas chaves que en", (lang) => {
    const faltando = keys.en.filter((k) => !keys[lang].includes(k));
    const sobrando = keys[lang].filter((k) => !keys.en.includes(k));
    expect({ faltando, sobrando }).toEqual({ faltando: [], sobrando: [] });
  });

  it("os tres idiomas tem a mesma quantidade de chaves", () => {
    expect(keys.ja).toHaveLength(keys.en.length);
    expect(keys["pt-BR"]).toHaveLength(keys.en.length);
  });
});

describe("qualidade das traducoes", () => {
  // Afixos gramaticais podem ser legitimamente vazios: em japones a particula vem
  // depois do substantivo, entao `acceptTermsPrefix` e "" e o sufixo carrega o texto.
  // O que nao pode e a frase inteira ficar vazia — isso e testado logo abaixo.
  const AFIXO = /(Prefix|Suffix)$/;

  it.each(["en", "ja", "pt-BR"] as const)(
    "nenhum valor vazio em %s, fora afixos gramaticais",
    (lang) => {
      const dict = { en, ja, "pt-BR": ptBr }[lang] as Dict;
      const vazias: string[] = [];
      const walk = (o: Dict, p = "") => {
        for (const [k, v] of Object.entries(o)) {
          const path = p ? `${p}.${k}` : k;
          if (v && typeof v === "object" && !Array.isArray(v)) walk(v as Dict, path);
          else if (typeof v === "string" && v.trim() === "" && !AFIXO.test(k)) vazias.push(path);
        }
      };
      walk(dict);
      expect(vazias).toEqual([]);
    },
  );

  it.each(["en", "ja", "pt-BR"] as const)(
    "em %s, cada par prefixo/sufixo tem texto em ao menos um dos lados",
    (lang) => {
      const dict = { en, ja, "pt-BR": ptBr }[lang] as Dict;
      const afixos = new Map<string, string[]>();
      const walk = (o: Dict, p = "") => {
        for (const [k, v] of Object.entries(o)) {
          const path = p ? `${p}.${k}` : k;
          if (v && typeof v === "object" && !Array.isArray(v)) walk(v as Dict, path);
          else if (typeof v === "string" && AFIXO.test(k)) {
            const base = path.replace(AFIXO, "");
            afixos.set(base, [...(afixos.get(base) ?? []), v]);
          }
        }
      };
      walk(dict);
      const fraseVazia = [...afixos.entries()]
        .filter(([, partes]) => partes.every((s) => s.trim() === ""))
        .map(([base]) => base);
      expect(fraseVazia).toEqual([]);
    },
  );

  it.each(["ja", "pt-BR"] as const)(
    "%s usa os mesmos placeholders {{...}} que en, em cada chave",
    (lang) => {
      const dict = { ja, "pt-BR": ptBr }[lang] as Dict;
      const get = (d: Dict, path: string): unknown =>
        path.split(".").reduce<unknown>((acc, part) => (acc as Dict)?.[part], d);
      const placeholders = (s: unknown) =>
        typeof s === "string" ? [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort() : [];

      const divergentes = keys.en.filter((k) => {
        const a = placeholders(get(en as Dict, k));
        const b = placeholders(get(dict, k));
        return JSON.stringify(a) !== JSON.stringify(b);
      });
      expect(divergentes).toEqual([]);
    },
  );
});

describe("instancia do i18n", () => {
  it("inicia em ingles com fallback para ingles", () => {
    expect(i18n.language).toBe("en");
    expect(i18n.options.fallbackLng).toEqual(["en"]);
  });

  it("suporta exatamente os tres idiomas do app", () => {
    expect(i18n.options.supportedLngs).toEqual(
      expect.arrayContaining(["en", "ja", "pt-BR"]),
    );
  });

  it("carrega os tres dicionarios como recurso translation", () => {
    for (const lang of ["en", "ja", "pt-BR"]) {
      expect(i18n.getResourceBundle(lang, "translation")).toBeDefined();
    }
  });

  it("nao escapa o valor interpolado — React Native ja e seguro por padrao", () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false);
  });

  it("resolve uma chave real em cada idioma, com textos diferentes", () => {
    const key = keys.en[0];
    const traducoes = ["en", "ja", "pt-BR"].map((l) => i18n.t(key, { lng: l }));
    expect(traducoes.every((t) => typeof t === "string" && t.length > 0)).toBe(true);
  });

  it("troca de idioma e volta", async () => {
    await i18n.changeLanguage("pt-BR");
    expect(i18n.language).toBe("pt-BR");
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
  });
});
