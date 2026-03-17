export interface Plant {
  type: string;
  stage: number;
}

export interface GardenCell {
  plant: Plant | null;
}

export function decodeGardenSetup(encodedData: string): GardenCell[][] {
  const rows = encodedData.split(";");

  return rows.map((row) => {
    const cells = row.split(".");
    return cells.map((cell) => {
      if (cell === "_") {
        return { plant: null };
      } else {
        const [plantType, stage] = cell.split(",");
        return {
          plant: {
            type: plantType,
            stage: parseInt(stage, 10),
          },
        };
      }
    });
  });
}

export function encodeGardenSetup(garden: GardenCell[][]): string {
  return garden
    .map((row) =>
      row
        .map((cell) => {
          if (cell.plant) {
            return `${cell.plant.type},${cell.plant.stage}`;
          }
          return "_";
        })
        .join(".")
    )
    .join(";");
}

// Available plants and their costs
export const AVAILABLE_PLANTS = [
  { type: 'grass', name: 'Grass', cost: 1, emoji: '🌱' },
  { type: 'flower', name: 'Flower', cost: 3, emoji: '🌸' },
  { type: 'tree', name: 'Tree', cost: 5, emoji: '🌳' },
  { type: 'bush', name: 'Bush', cost: 2, emoji: '🌿' },
  { type: 'cactus', name: 'Cactus', cost: 4, emoji: '🌵' },
];

// Growth stages and their costs
export const GROWTH_COST = 2;
export const MAX_STAGE = 3;
