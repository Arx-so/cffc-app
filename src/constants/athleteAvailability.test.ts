import {
  ATHLETE_AVAILABILITY_KEYS,
  AVAILABILITY_VALUE_BY_TRANSLATION_KEY,
} from "@/constants/athleteAvailability";

describe("disponibilidade do atleta", () => {
  it("tem um valor de banco para cada chave de traducao", () => {
    expect(Object.keys(AVAILABILITY_VALUE_BY_TRANSLATION_KEY).sort()).toEqual(
      [...ATHLETE_AVAILABILITY_KEYS].sort(),
    );
  });

  it("nao repete chave", () => {
    expect(new Set(ATHLETE_AVAILABILITY_KEYS).size).toBe(ATHLETE_AVAILABILITY_KEYS.length);
  });

  it("nao repete valor gravado, para o mapa reverso ser inequivoco", () => {
    const values = Object.values(AVAILABILITY_VALUE_BY_TRANSLATION_KEY);
    expect(new Set(values).size).toBe(values.length);
  });

  it("mantem os literais gravados no banco — mudar aqui quebra dados existentes", () => {
    expect(AVAILABILITY_VALUE_BY_TRANSLATION_KEY).toEqual({
      availabilityLookingForClub: "Em busca de clube",
      availabilityNegotiating: "Em negociação",
      availabilityContracted: "Contratado",
      availabilityFreeAgent: "Livre no mercado",
    });
  });

  it("usa chaves no namespace de traducao esperado", () => {
    for (const key of ATHLETE_AVAILABILITY_KEYS) {
      expect(key).toMatch(/^availability[A-Z]/);
    }
  });
});
