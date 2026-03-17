export interface Plant {
  type: string;
  stage: number;
}

export interface GardenCell {
  plant: Plant | null;
}

export interface PlantInventory {
  [plantType: string]: number;
}

export interface InventoryItem {
  type: string;
  count: number;
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

// Garden sizes
export const GARDEN_SIZES = [
  { name: 'Small', size: 5, cellSize: 'large', cost: 0 },
  { name: 'Medium', size: 7, cellSize: 'medium', cost: 50 },
  { name: 'Large', size: 9, cellSize: 'small', cost: 150 },
  { name: 'Extra Large', size: 12, cellSize: 'xsmall', cost: 300 },
];

export function getMaxGardenSize(): number {
  if (typeof window === 'undefined') return 5;
  const saved = localStorage.getItem('calm-garden-max-size');
  return saved ? parseInt(saved, 10) : 5;
}

export function setMaxGardenSize(size: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('calm-garden-max-size', size.toString());
}

export function canExpandGarden(currentSize: number): { canExpand: boolean; nextSize: number; cost: number } {
  const currentSizeConfig = GARDEN_SIZES.find(s => s.size === currentSize);
  if (!currentSizeConfig) return { canExpand: false, nextSize: currentSize, cost: 0 };
  
  const currentIndex = GARDEN_SIZES.indexOf(currentSizeConfig);
  const nextSizeConfig = GARDEN_SIZES[currentIndex + 1];
  
  if (!nextSizeConfig) {
    return { canExpand: false, nextSize: currentSize, cost: 0 };
  }
  
  return { canExpand: true, nextSize: nextSizeConfig.size, cost: nextSizeConfig.cost };
}

export function loadInventory(): PlantInventory {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('calm-garden-inventory');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse inventory:', e);
    }
  }
  return {};
}

export function saveInventory(inventory: PlantInventory): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('calm-garden-inventory', JSON.stringify(inventory));
}

export function addToInventory(inventory: PlantInventory, plantType: string, count: number = 1): PlantInventory {
  const newInventory = { ...inventory };
  newInventory[plantType] = (newInventory[plantType] || 0) + count;
  return newInventory;
}

export function removeFromInventory(inventory: PlantInventory, plantType: string, count: number = 1): PlantInventory {
  const newInventory = { ...inventory };
  if (newInventory[plantType]) {
    newInventory[plantType] = Math.max(0, newInventory[plantType] - count);
    if (newInventory[plantType] === 0) {
      delete newInventory[plantType];
    }
  }
  return newInventory;
}

export function getInventoryCount(inventory: PlantInventory, plantType: string): number {
  return inventory[plantType] || 0;
}
