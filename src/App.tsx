// src/App.tsx
import React, { useState, useEffect } from "react";
import ImageGrid from "./components/ImageGrid";
import { decodeGardenSetup, GardenCell } from "./garden";
import { Attributions } from "./components/Attributions";

function App() {
  const [garden, setGarden] = useState<GardenCell[][]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedGarden = urlParams.get("data");

    if (encodedGarden) {
      const decodedGarden = decodeGardenSetup(encodedGarden);
      setGarden(decodedGarden);
    }
  }, []);

  console.log("garden", garden);

  // Convert garden data to image URLs (you'll need to implement this based on your image assets)
  const gardenImages = garden.map((row) =>
    row.map((cell) =>
      cell.plant ? `/img/${cell.plant.type}.png` : "/img/grass.png"
    )
  );
  return (
    <div>
      <div className="w-screen h-screen flex items-center justify-center p-4">
        <div className="w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
          <ImageGrid garden={gardenImages} />
        </div>
      </div>
      <Attributions />
    </div>
  );
}
export default App;
