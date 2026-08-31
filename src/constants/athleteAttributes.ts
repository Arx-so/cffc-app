export const POSITION_SECTORS = [
  "goalkeeper",
  "defense",
  "midfield",
  "attack",
] as const;

export type PositionSector = (typeof POSITION_SECTORS)[number];

export const POSITIONS_BY_SECTOR: Record<PositionSector, readonly string[]> = {
  goalkeeper: ["gk"],
  defense: ["cb", "rb", "lb"],
  midfield: ["dm", "cm", "am"],
  attack: ["rw", "lw", "st", "cf"],
};

export const ATHLETE_POSITIONS = POSITION_SECTORS.flatMap(
  (sector) => POSITIONS_BY_SECTOR[sector],
);

export const SECTOR_BY_POSITION = Object.fromEntries(
  POSITION_SECTORS.flatMap((sector) =>
    POSITIONS_BY_SECTOR[sector].map((position) => [position, sector]),
  ),
) as Record<string, PositionSector>;

export const isPositionSector = (value: string): value is PositionSector =>
  (POSITION_SECTORS as readonly string[]).includes(value);

export const expandPositionFilter = (values: string[]): string[] => {
  const expanded = new Set<string>();
  values.forEach((value) => {
    if (isPositionSector(value)) {
      POSITIONS_BY_SECTOR[value].forEach((position) => expanded.add(position));
    } else {
      expanded.add(value);
    }
  });
  return [...expanded];
};

export const ATHLETE_STRENGTHS = [
  "speed",
  "dribbling",
  "finishing",
  "passing",
  "defending",
  "heading",
  "vision",
  "stamina",
  "strength",
  "positioning",
] as const;
