import {
  formatPhonePtBrInput,
  formatPhoneDigitsForDisplay,
} from "@/utils/brazilianPhone";

describe("formatPhonePtBrInput", () => {
  it("formata um celular completo de 11 digitos", () => {
    expect(formatPhonePtBrInput("11987654321")).toBe("(11) 98765-4321");
  });

  it("abre o parenteses assim que o DDD comeca a ser digitado", () => {
    expect(formatPhonePtBrInput("1")).toBe("(1");
    expect(formatPhonePtBrInput("11")).toBe("(11");
  });

  it("fecha o parenteses e separa o DDD do numero", () => {
    expect(formatPhonePtBrInput("119")).toBe("(11) 9");
    expect(formatPhonePtBrInput("1198765")).toBe("(11) 98765");
  });

  it("insere o hifen a partir do oitavo digito", () => {
    expect(formatPhonePtBrInput("11987654")).toBe("(11) 98765-4");
  });

  it("descarta caracteres nao numericos", () => {
    expect(formatPhonePtBrInput("(11) 98765-4321")).toBe("(11) 98765-4321");
    expect(formatPhonePtBrInput("11a98b765c4321")).toBe("(11) 98765-4321");
  });

  it("limita a 11 digitos, ignorando o excesso", () => {
    expect(formatPhonePtBrInput("119876543219999")).toBe("(11) 98765-4321");
  });

  it("retorna string vazia quando nao ha digito algum", () => {
    expect(formatPhonePtBrInput("")).toBe("");
    expect(formatPhonePtBrInput("abc")).toBe("");
    expect(formatPhonePtBrInput("()- ")).toBe("");
  });

  // BUG conhecido: o JSDoc promete "celular/fixo", mas a funcao aplica o padrao de
  // celular (5+4) a qualquer numero com mais de 7 digitos. Um fixo de 10 digitos
  // deveria virar (11) 3265-4321 e vira (11) 32654-321.
  // `it.failing` passa enquanto o bug existe e QUEBRA quando ele for corrigido,
  // avisando para converter este teste em `it` normal.
  it.failing("formata um telefone fixo de 10 digitos com hifen 4+4", () => {
    expect(formatPhonePtBrInput("1132654321")).toBe("(11) 3265-4321");
  });

  it("comportamento atual para 10 digitos (documenta o bug acima)", () => {
    expect(formatPhonePtBrInput("1132654321")).toBe("(11) 32654-321");
  });
});

describe("formatPhoneDigitsForDisplay", () => {
  it("formata os digitos crus vindos de profile.phone", () => {
    expect(formatPhoneDigitsForDisplay("11987654321")).toBe("(11) 98765-4321");
  });

  it("tolera um valor ja formatado no banco", () => {
    expect(formatPhoneDigitsForDisplay("(11) 98765-4321")).toBe("(11) 98765-4321");
  });

  it("tolera prefixo internacional descartando os nao-digitos e cortando em 11", () => {
    // +55 11 98765-4321 -> digitos "5511987654321" -> corta nos 11 primeiros
    expect(formatPhoneDigitsForDisplay("+55 11 98765-4321")).toBe("(55) 11987-6543");
  });

  it.each([null, undefined, "", "   "])("retorna vazio para %p", (input) => {
    expect(formatPhoneDigitsForDisplay(input)).toBe("");
  });
});
