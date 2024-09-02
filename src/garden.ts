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
