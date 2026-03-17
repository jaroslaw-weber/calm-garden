import React, { useState, useEffect } from 'react';
import ImageGrid from './ImageGrid';
import { type GardenCell, AVAILABLE_PLANTS, GROWTH_COST, MAX_STAGE, encodeGardenSetup } from '../garden';

interface GardenEditorProps {
  points: number;
  onSpendPoints: (amount: number) => boolean;
}

const GRID_SIZE = 5;

export function GardenEditor({ points, onSpendPoints }: GardenEditorProps) {
  const [garden, setGarden] = useState<GardenCell[][]>(() => {
    // Initialize empty grid
    return Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({ plant: null }))
    );
  });
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportUrl, setExportUrl] = useState('');

  // Load garden from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('calm-garden-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.garden) {
          setGarden(parsed.garden);
        }
      } catch (e) {
        console.error('Failed to load garden:', e);
      }
    }
  }, []);

  // Save garden to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calm-garden-data', JSON.stringify({ garden }));
  }, [garden]);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!selectedTool) return;

    const cell = garden[rowIndex][colIndex];
    const plant = AVAILABLE_PLANTS.find(p => p.type === selectedTool);
    
    if (!plant) return;

    // If cell is empty, plant new item
    if (!cell.plant) {
      if (onSpendPoints(plant.cost)) {
        const newGarden = [...garden];
        newGarden[rowIndex] = [...newGarden[rowIndex]];
        newGarden[rowIndex][colIndex] = {
          plant: { type: plant.type, stage: 1 }
        };
        setGarden(newGarden);
      }
    }
    // If cell has same type plant, upgrade it
    else if (cell.plant.type === selectedTool && cell.plant.stage < MAX_STAGE) {
      if (onSpendPoints(GROWTH_COST)) {
        const newGarden = [...garden];
        newGarden[rowIndex] = [...newGarden[rowIndex]];
        newGarden[rowIndex][colIndex] = {
          plant: { ...cell.plant, stage: cell.plant.stage + 1 }
        };
        setGarden(newGarden);
      }
    }
  };

  const handleExport = () => {
    const encoded = encodeGardenSetup(garden);
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?data=${encoded}`;
    setExportUrl(url);
    setShowExport(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportUrl);
    alert('URL copied to clipboard!');
  };

  // Convert garden data to image URLs
  const gardenImages = garden.map((row) =>
    row.map((cell) => {
      if (cell.plant) {
        return `/calm-garden/img/${cell.plant.type}-${cell.plant.stage}.png`;
      }
      return '/calm-garden/img/dirt.png';
    })
  );

  return (
    <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Your Garden</h2>
      
      {/* Points display */}
      <div className="mb-4 px-6 py-2 bg-yellow-100 rounded-full">
        <span className="text-xl font-bold text-yellow-800">
          ⭐ Points: {points}
        </span>
      </div>

      {/* Tool selection */}
      <div className="mb-6">
        <p className="text-green-700 mb-2 font-semibold">Select a plant to place:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {AVAILABLE_PLANTS.map((plant) => (
            <button
              key={plant.type}
              onClick={() => setSelectedTool(selectedTool === plant.type ? null : plant.type)}
              disabled={points < plant.cost}
              className={`
                px-4 py-2 rounded-lg border-2 font-medium transition-all
                ${selectedTool === plant.type
                  ? 'border-green-600 bg-green-200 text-green-900'
                  : points >= plant.cost
                    ? 'border-green-400 bg-white text-green-700 hover:bg-green-50'
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <span className="mr-2">{plant.emoji}</span>
              {plant.name} ({plant.cost} pts)
            </button>
          ))}
        </div>
        <p className="text-sm text-green-600 mt-2 text-center">
          Click a cell to plant. Click same plant again to upgrade (+{GROWTH_COST} pts).
        </p>
      </div>

      {/* Garden Grid */}
      <div className="w-full max-w-lg aspect-square mb-6">
        <div
          className="grid gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {garden.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  relative rounded-lg border-2 transition-all
                  ${selectedTool 
                    ? 'cursor-pointer hover:border-green-500' 
                    : 'cursor-default'
                  }
                  ${cell.plant 
                    ? 'bg-green-100 border-green-400' 
                    : 'bg-amber-100 border-amber-300'
                  }
                `}
                disabled={!selectedTool}
              >
                {cell.plant ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    {AVAILABLE_PLANTS.find(p => p.type === cell.plant!.type)?.emoji}
                    <span className="absolute top-0 right-1 text-xs font-bold text-green-700">
                      L{cell.plant.stage}
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-400 text-2xl">◻</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      >
        🔗 Share Garden
      </button>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Share Your Garden</h3>
            <div className="bg-gray-100 p-3 rounded mb-4 break-all text-sm">
              {exportUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Copy URL
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
