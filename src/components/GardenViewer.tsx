// src/components/GardenViewer.tsx
import React, { useState, useEffect } from "react";
import ImageGrid from "./ImageGrid";
import { decodeGardenSetup, type GardenCell } from "../garden";

const GardenViewer: React.FC = () => {
  const [garden, setGarden] = useState<GardenCell[][]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedGarden = urlParams.get("data");

    if (encodedGarden) {
      const decodedGarden = decodeGardenSetup(encodedGarden);
      setGarden(decodedGarden);
    }
  }, []);

  // Convert garden data to image URLs
  const gardenImages = garden.map((row) =>
    row.map((cell) =>
      cell.plant ? `/calm-garden/img/${cell.plant.type}.png` : "/calm-garden/img/grass.png"
    )
  );

  // Show fallback message if no garden data
  if (garden.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-green-50 rounded-lg border-2 border-dashed border-green-200">
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-green-800 mb-2">No Garden Data</h3>
          <p className="text-green-600 mb-4">
            To view your garden, you need to provide garden data via URL parameter.
          </p>
          <p className="text-sm text-green-500">
            Example: ?data=grass,1.grass,1;grass,1.grass,1
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ImageGrid garden={gardenImages} />
    </div>
  );
};

export default GardenViewer;
