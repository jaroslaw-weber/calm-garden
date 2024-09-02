// src/components/ImageGrid.tsx
import React from "react";
const ImageGrid = ({ garden }: { garden: string[][] }) => {
  const columnCount = garden[0]?.length || 0;
  const rowCount = garden.length;

  return (
    <div
      className="grid gap-1 w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gridTemplateRows: `repeat(${rowCount}, 1fr)`,
      }}
    >
      {garden.flat().map((url, index) => (
        <div key={index} className="relative">
          <img
            src={url}
            alt={`img-${index}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
