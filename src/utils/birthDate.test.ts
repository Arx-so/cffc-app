import {
  formatBirthDateInput,
  parseDDMMYYYY,
  getAgeInYears,
  toYYYYMMDD,
  isoToDDMMYYYY,
  ddmmyyyyToIso,
} from "@/utils/birthDate";

describe("formatBirthDateInput", () => {
  it("insere as barras conforme o usuario digita", () => {
    expect(formatBirthDateInput("1")).toBe("1");
    expect(formatBirthDateInput("15")).toBe("15");
    expect(formatBirthDateInput("153")).toBe("15/3");
    expect(formatBirthDateInput("1503")).toBe("15/03");
    expect(formatBirthDateInput("150319")).toBe("15/03/19");
    expect(formatBirthDateInput("15031990")).toBe("15/03/1990");
  });

  it("descarta caracteres nao numericos", () => {
    expect(formatBirthDateInput("15a/0-3b1990")).toBe("15/03/1990");
  });

  it("limita a 8 digitos, ignorando o excesso", () => {
    expect(formatBirthDateInput("150319901234")).toBe("15/03/1990");
  });

  it("mantem a formatacao ao reprocessar o proprio resultado (idempotente)", () => {
    expect(formatBirthDateInput("15/03/1990")).toBe("15/03/1990");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(formatBirthDateInput("")).toBe("");
  });
});

describe("parseDDMMYYYY", () => {
  it("converte uma data valida", () => {
    const date = parseDDMMYYYY("15/03/1990");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getDate()).toBe(15);
    expect(date?.getMonth()).toBe(2); // marco = indice 2
    expect(date?.getFullYear()).toBe(1990);
  });

  it("aceita 29/02 em ano bissexto", () => {
    expect(parseDDMMYYYY("29/02/2024")?.getDate()).toBe(29);
  });

  it("rejeita 29/02 em ano nao bissexto", () => {
    expect(parseDDMMYYYY("29/02/2023")).toBeNull();
  });

  it("rejeita datas que estouram o mes, sem rolar para o mes seguinte", () => {
    expect(parseDDMMYYYY("31/02/2000")).toBeNull();
    expect(parseDDMMYYYY("31/04/2000")).toBeNull();
  });

  it("rejeita mes invalido", () => {
    expect(parseDDMMYYYY("15/13/1990")).toBeNull();
  });

  it("rejeita texto incompleto", () => {
    expect(parseDDMMYYYY("15/03/199")).toBeNull();
    expect(parseDDMMYYYY("15/03")).toBeNull();
    expect(parseDDMMYYYY("")).toBeNull();
  });

  it("rejeita dia zero", () => {
    expect(parseDDMMYYYY("00/03/1990")).toBeNull();
  });
});

describe("getAgeInYears", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 31)); // 31/08/2026
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("conta os anos completos quando o aniversario ja passou no ano", () => {
    expect(getAgeInYears(new Date(1990, 2, 15))).toBe(36);
  });

  it("desconta um ano quando o aniversario ainda nao chegou", () => {
    expect(getAgeInYears(new Date(1990, 10, 15))).toBe(35);
  });

  it("conta o ano completo exatamente no dia do aniversario", () => {
    expect(getAgeInYears(new Date(1990, 7, 31))).toBe(36);
  });

  it("desconta um ano no dia anterior ao aniversario", () => {
    expect(getAgeInYears(new Date(1990, 8, 1))).toBe(35);
  });
});

describe("toYYYYMMDD", () => {
  it("formata com zero a esquerda em mes e dia", () => {
    expect(toYYYYMMDD(new Date(1990, 2, 5))).toBe("1990-03-05");
  });

  it("formata datas de dois digitos sem padding extra", () => {
    expect(toYYYYMMDD(new Date(2024, 11, 25))).toBe("2024-12-25");
  });

  it("usa a data local, sem deslocar o dia por UTC", () => {
    // Em America/Sao_Paulo (UTC-3), toISOString() daria 1990-03-06.
    expect(toYYYYMMDD(new Date(1990, 2, 5, 23, 0, 0))).toBe("1990-03-05");
  });
});

describe("isoToDDMMYYYY", () => {
  it("converte a data ISO armazenada para o formato do formulario", () => {
    expect(isoToDDMMYYYY("1990-03-15")).toBe("15/03/1990");
  });

  it("nao desloca o dia mesmo com timestamp completo", () => {
    expect(isoToDDMMYYYY("1990-03-15T00:00:00Z")).toBe("15/03/1990");
  });

  it.each([null, undefined, "", "   "])("retorna vazio para %p", (input) => {
    expect(isoToDDMMYYYY(input)).toBe("");
  });

  it("devolve o valor original quando nao e ISO, para o dado ficar visivel", () => {
    expect(isoToDDMMYYYY("15/03/1990")).toBe("15/03/1990");
    expect(isoToDDMMYYYY("nao-e-data")).toBe("nao-e-data");
  });
});

describe("ddmmyyyyToIso", () => {
  it("converte o formato do formulario para o formato da coluna", () => {
    expect(ddmmyyyyToIso("15/03/1990")).toBe("1990-03-15");
  });

  it("ignora espacos nas bordas", () => {
    expect(ddmmyyyyToIso("  15/03/1990  ")).toBe("1990-03-15");
  });

  it("retorna null quando a data e invalida", () => {
    expect(ddmmyyyyToIso("31/02/2000")).toBeNull();
    expect(ddmmyyyyToIso("15/03/199")).toBeNull();
    expect(ddmmyyyyToIso("")).toBeNull();
  });

  it("faz round-trip com isoToDDMMYYYY", () => {
    expect(ddmmyyyyToIso(isoToDDMMYYYY("2001-12-09"))).toBe("2001-12-09");
  });
});
