import {
  POSITION_SECTORS,
  POSITIONS_BY_SECTOR,
  ATHLETE_POSITIONS,
  SECTOR_BY_POSITION,
  isPositionSector,
  expandPositionFilter,
  ATHLETE_STRENGTHS,
} from "@/constants/athleteAttributes";

describe("estrutura de posicoes", () => {
  it("achata todos os setores em ATHLETE_POSITIONS sem perder nenhuma", () => {
    const fromSectors = POSITION_SECTORS.flatMap((s) => POSITIONS_BY_SECTOR[s]);
    expect(ATHLETE_POSITIONS).toEqual(fromSectors);
  });

  it("nao repete posicao entre setores", () => {
    expect(new Set(ATHLETE_POSITIONS).size).toBe(ATHLETE_POSITIONS.length);
  });

  it("mapeia cada posicao de volta ao seu setor", () => {
    for (const sector of POSITION_SECTORS) {
      for (const position of POSITIONS_BY_SECTOR[sector]) {
        expect(SECTOR_BY_POSITION[position]).toBe(sector);
      }
    }
  });

  it("cobre todas as posicoes no mapa reverso", () => {
    expect(Object.keys(SECTOR_BY_POSITION).sort()).toEqual([...ATHLETE_POSITIONS].sort());
  });
});

describe("isPositionSector", () => {
  it.each([...POSITION_SECTORS])("reconhece o setor %s", (sector) => {
    expect(isPositionSector(sector)).toBe(true);
  });

  it.each(["st", "gk", "libero", ""])("nao trata %p como setor", (value) => {
    expect(isPositionSector(value)).toBe(false);
  });
});

describe("expandPositionFilter", () => {
  it("expande um setor para todas as posicoes que ele cobre", () => {
    expect(expandPositionFilter(["attack"]).sort()).toEqual(
      [...POSITIONS_BY_SECTOR.attack].sort(),
    );
  });

  it("mantem uma posicao especifica intacta", () => {
    expect(expandPositionFilter(["st"])).toEqual(["st"]);
  });

  it("mistura setor e posicao sem duplicar a interseccao", () => {
    const result = expandPositionFilter(["attack", "st"]);
    expect(new Set(result).size).toBe(result.length);
    expect(result).toContain("st");
  });

  it("deduplica setores repetidos", () => {
    expect(expandPositionFilter(["attack", "attack"])).toEqual(
      expandPositionFilter(["attack"]),
    );
  });

  it("preserva um valor desconhecido em vez de descartar o filtro", () => {
    expect(expandPositionFilter(["libero"])).toEqual(["libero"]);
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(expandPositionFilter([])).toEqual([]);
  });

  it("expande todos os setores para o conjunto completo de posicoes", () => {
    expect(expandPositionFilter([...POSITION_SECTORS]).sort()).toEqual(
      [...ATHLETE_POSITIONS].sort(),
    );
  });
});

describe("ATHLETE_STRENGTHS", () => {
  it("nao tem caracteristica repetida", () => {
    expect(new Set(ATHLETE_STRENGTHS).size).toBe(ATHLETE_STRENGTHS.length);
  });

  it("nao colide com nomes de posicao, evitando chave de traducao ambigua", () => {
    const overlap = ATHLETE_STRENGTHS.filter((s) =>
      (ATHLETE_POSITIONS as readonly string[]).includes(s),
    );
    expect(overlap).toEqual([]);
  });
});
