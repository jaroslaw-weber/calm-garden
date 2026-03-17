import React, { useState, useEffect } from 'react';
import { 
  type GardenCell, 
  AVAILABLE_PLANTS, 
  GROWTH_COST, 
  MAX_STAGE, 
  GARDEN_SIZES,
  encodeGardenSetup, 
  decodeGardenSetup,
  type PlantInventory,
  loadInventory,
  saveInventory,
  addToInventory,
  removeFromInventory,
  getInventoryCount,
  canExpandGarden,
  setMaxGardenSize,
  getMaxGardenSize,
} from '../garden';

interface GardenEditorProps {
  points: number;
  onSpendPoints: (amount: number) => boolean;
  onEarnPoints?: (amount: number) => void;
}

type TabMode = 'garden' | 'shop' | 'inventory';

const DEFAULT_SIZE = 5;

export function GardenEditor({ points, onSpendPoints, onEarnPoints }: GardenEditorProps) {
  const [gridSize, setGridSize] = useState(DEFAULT_SIZE);
  const [garden, setGarden] = useState<GardenCell[][]>(() => {
    return Array(DEFAULT_SIZE).fill(null).map(() =>
      Array(DEFAULT_SIZE).fill(null).map(() => ({ plant: null }))
    );
  });
  const [inventory, setInventory] = useState<PlantInventory>({});
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabMode>('garden');
  const [showExport, setShowExport] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
  const [isSharedView, setIsSharedView] = useState(false);
  const [shopNotification, setShopNotification] = useState<string | null>(null);
  const [shovelMode, setShovelMode] = useState(false);

  // Load garden and inventory from localStorage or URL on mount
  useEffect(() => {
    // Load inventory
    setInventory(loadInventory());
    
    // Load max garden size
    const maxSize = getMaxGardenSize();
    setGridSize(maxSize);
    
    // First check URL for shared garden
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
      try {
        const decodedGarden = decodeGardenSetup(sharedData);
        if (decodedGarden.length > 0 && decodedGarden[0].length > 0) {
          setGarden(decodedGarden);
          setGridSize(decodedGarden.length);
          setIsSharedView(true);
          return;
        }
      } catch (e) {
        console.error('Failed to decode shared garden:', e);
      }
    }
    
    // Otherwise load from localStorage
    const saved = localStorage.getItem('calm-garden-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.garden) {
          setGarden(parsed.garden);
          if (parsed.gridSize) {
            setGridSize(parsed.gridSize);
          }
        }
      } catch (e) {
        console.error('Failed to load garden:', e);
      }
    }
  }, []);

  // Save garden to localStorage whenever it changes (only if not shared view)
  useEffect(() => {
    if (!isSharedView) {
      localStorage.setItem('calm-garden-data', JSON.stringify({ garden, gridSize }));
    }
  }, [garden, gridSize, isSharedView]);

  // Save inventory whenever it changes
  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  const handleBuyPlant = (plantType: string, cost: number) => {
    if (onSpendPoints(cost)) {
      setInventory(prev => addToInventory(prev, plantType, 1));
      setShopNotification(`Bought 1 ${plantType}! 🎉`);
      setTimeout(() => setShopNotification(null), 2000);
    }
  };

  const handleExpandGarden = () => {
    const expansion = canExpandGarden(gridSize);
    if (expansion.canExpand && onSpendPoints(expansion.cost)) {
      const newSize = expansion.nextSize;
      
      // Expand garden grid
      const newGarden = Array(newSize).fill(null).map((_, rowIndex) =>
        Array(newSize).fill(null).map((_, colIndex) => {
          // Copy existing plants if within old grid
          if (rowIndex < garden.length && colIndex < garden[0].length) {
            return garden[rowIndex][colIndex];
          }
          return { plant: null };
        })
      );
      
      setGarden(newGarden);
      setGridSize(newSize);
      setMaxGardenSize(newSize);
      setShopNotification(`Garden expanded to ${newSize}x${newSize}! 🌱`);
      setTimeout(() => setShopNotification(null), 2000);
    }
  };

  const handleSellPlant = (plantType: string) => {
    const plant = AVAILABLE_PLANTS.find(p => p.type === plantType);
    if (plant && getInventoryCount(inventory, plantType) > 0) {
      const sellPrice = Math.floor(plant.cost * 0.5); // Sell for 50% of cost
      setInventory(prev => removeFromInventory(prev, plantType, 1));
      if (onEarnPoints) {
        onEarnPoints(sellPrice);
      }
      setShopNotification(`Sold 1 ${plant.name} for ${sellPrice} coins! 💰`);
      setTimeout(() => setShopNotification(null), 2000);
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (isSharedView) return;

    const cell = garden[rowIndex][colIndex];

    // Shovel mode - dig up plant
    if (shovelMode) {
      if (cell.plant) {
        const newGarden = [...garden];
        newGarden[rowIndex] = [...newGarden[rowIndex]];
        newGarden[rowIndex][colIndex] = { plant: null };
        setGarden(newGarden);
        
        // Return plant to inventory
        setInventory(prev => addToInventory(prev, cell.plant!.type, 1));
      }
      return;
    }

    // Planting mode
    if (!selectedTool) return;

    const ownedCount = getInventoryCount(inventory, selectedTool);
    
    // If cell is empty, plant from inventory
    if (!cell.plant) {
      if (ownedCount > 0) {
        setInventory(prev => removeFromInventory(prev, selectedTool, 1));
        const newGarden = [...garden];
        newGarden[rowIndex] = [...newGarden[rowIndex]];
        newGarden[rowIndex][colIndex] = {
          plant: { type: selectedTool, stage: 1 }
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

  const handleRemovePlant = (rowIndex: number, colIndex: number) => {
    if (isSharedView) return;
    
    const cell = garden[rowIndex][colIndex];
    if (cell.plant) {
      const newGarden = [...garden];
      newGarden[rowIndex] = [...newGarden[rowIndex]];
      newGarden[rowIndex][colIndex] = { plant: null };
      setGarden(newGarden);
      
      // Return plant to inventory
      setInventory(prev => addToInventory(prev, cell.plant!.type, 1));
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

  const handleClaimGarden = () => {
    setIsSharedView(false);
    localStorage.setItem('calm-garden-data', JSON.stringify({ garden, gridSize }));
    alert('Garden saved to your collection! 🌱');
  };

  const getCellSizeClass = () => {
    const sizeConfig = GARDEN_SIZES.find(s => s.size === gridSize);
    switch (sizeConfig?.cellSize) {
      case 'large': return 'text-3xl';
      case 'medium': return 'text-2xl';
      case 'small': return 'text-xl';
      case 'xsmall': return 'text-lg';
      default: return 'text-3xl';
    }
  };

  const expansion = canExpandGarden(gridSize);

  return (
    <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Your Garden ({gridSize}x{gridSize})</h2>
      
      {/* Shared garden banner */}
      {isSharedView && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-center">
          <p className="text-blue-800 font-semibold mb-2">🎁 You're viewing a shared garden!</p>
          <button
            onClick={handleClaimGarden}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Claim This Garden
          </button>
        </div>
      )}
      
      {/* Points display */}
      {!isSharedView && (
        <div className="mb-4 px-6 py-2 bg-yellow-100 rounded-full">
          <span className="text-xl font-bold text-yellow-800">
            ⭐ Points: {points}
          </span>
        </div>
      )}

      {/* Tab navigation */}
      {!isSharedView && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('garden')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'garden'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌱 Garden
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'shop'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🛒 Shop
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎒 Inventory
          </button>
        </div>
      )}

      {/* Toast notification */}
      {shopNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg font-medium animate-pulse">
            {shopNotification}
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && !isSharedView && (
        <div className="w-full max-w-2xl mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🌿 Buy Plants</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_PLANTS.map((plant) => (
                <div
                  key={plant.type}
                  className="p-3 bg-white rounded-lg border-2 border-green-200 flex flex-col items-center"
                >
                  <span className="text-3xl mb-2">{plant.emoji}</span>
                  <span className="font-medium text-green-800">{plant.name}</span>
                  <span className="text-sm text-green-600 mb-2">Cost: {plant.cost} pts</span>
                  <button
                    onClick={() => handleBuyPlant(plant.type, plant.cost)}
                    disabled={points < plant.cost}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      points >= plant.cost
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🏡 Expand Garden</h3>
            {expansion.canExpand ? (
              <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-green-800">
                      Expand to {expansion.nextSize}x{expansion.nextSize}
                    </span>
                    <p className="text-sm text-green-600">
                      Cells will be smaller to see more of your garden
                    </p>
                  </div>
                  <button
                    onClick={handleExpandGarden}
                    disabled={points < expansion.cost}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      points >= expansion.cost
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Expand ({expansion.cost} pts)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-200 text-gray-500 text-center">
                🏆 Garden is at maximum size!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && !isSharedView && (
        <div className="w-full max-w-2xl mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">🎒 Your Inventory</h3>
          
          {Object.keys(inventory).length === 0 ? (
            <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-center">
              Your inventory is empty. Visit the shop to buy plants!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_PLANTS.map((plant) => {
                const count = getInventoryCount(inventory, plant.type);
                if (count === 0) return null;
                
                return (
                  <div
                    key={plant.type}
                    className="p-3 bg-white rounded-lg border-2 border-purple-200 flex flex-col items-center"
                  >
                    <span className="text-3xl mb-2">{plant.emoji}</span>
                    <span className="font-medium text-purple-800">{plant.name}</span>
                    <span className="text-sm text-purple-600 mb-2">Owned: {count}</span>
                    <button
                      onClick={() => handleSellPlant(plant.type)}
                      className="px-3 py-1 bg-red-400 hover:bg-red-500 text-white rounded text-sm font-medium transition-colors"
                    >
                      Sell ({Math.floor(plant.cost * 0.5)} pts)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Garden Tab - Planting mode */}
      {activeTab === 'garden' && !isSharedView && (
        <div className="mb-6">
          {/* Plant selection */}
          <p className="text-green-700 mb-2 font-semibold text-center">Select a plant to place:</p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {AVAILABLE_PLANTS.filter((plant) => getInventoryCount(inventory, plant.type) > 0).map((plant) => {
              const ownedCount = getInventoryCount(inventory, plant.type);
              return (
                <button
                  key={plant.type}
                  onClick={() => {
                    setSelectedTool(selectedTool === plant.type ? null : plant.type);
                    setShovelMode(false);
                  }}
                  className={`
                    px-4 py-2 rounded-lg border-2 font-medium transition-all relative
                    ${selectedTool === plant.type && !shovelMode
                      ? 'border-green-600 bg-green-200 text-green-900'
                      : 'border-green-400 bg-white text-green-700 hover:bg-green-50'
                    }
                  `}
                >
                  <span className="mr-2">{plant.emoji}</span>
                  {plant.name}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    {ownedCount}
                  </span>
                </button>
              );
            })}
          </div>
          
          {Object.keys(inventory).length === 0 && (
            <p className="text-sm text-gray-500 text-center mb-4">
              No plants in inventory. Visit the shop to buy some!
            </p>
          )}
          
          {/* Shovel toggle - separate section */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                setShovelMode(!shovelMode);
                setSelectedTool(null);
              }}
              className={`
                px-6 py-3 rounded-lg border-2 font-medium transition-all flex items-center gap-2
                ${shovelMode
                  ? 'border-amber-600 bg-amber-200 text-amber-900'
                  : 'border-amber-400 bg-white text-amber-700 hover:bg-amber-50'
                }
              `}
            >
              <span className="text-xl">🥄</span>
              <span>Shovel</span>
              {shovelMode && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">ON</span>}
            </button>
          </div>
          
          {/* Instructions */}
          <p className="text-sm text-green-600 mt-2 text-center">
            {shovelMode ? (
              <span className="text-amber-700 font-semibold">🥄 Shovel mode: Click a cell to dig up the plant</span>
            ) : (
              <>
                Click a cell to plant. Click same plant again to upgrade (+{GROWTH_COST} pts).
                <br />
                Use the shovel to dig up plants and return them to inventory.
              </>
            )}
          </p>
        </div>
      )}

      {/* Garden Grid - only show in garden tab */}
      {(activeTab === 'garden' || isSharedView) && (
        <div className="w-full max-w-lg aspect-square mb-6">
          <div
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {garden.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleRemovePlant(rowIndex, colIndex);
                  }}
                  className={`
                    relative rounded-lg border-2 transition-all
                    ${(selectedTool || shovelMode) && !isSharedView && activeTab === 'garden'
                      ? shovelMode 
                        ? 'cursor-pointer hover:border-amber-500 hover:bg-amber-50' 
                        : 'cursor-pointer hover:border-green-500'
                      : 'cursor-default'
                    }
                    ${cell.plant 
                      ? 'bg-green-100 border-green-400' 
                      : 'bg-amber-100 border-amber-300'
                    }
                    ${shovelMode && cell.plant ? 'ring-2 ring-amber-400' : ''}
                  `}
                  disabled={(!selectedTool && !shovelMode) || isSharedView || activeTab !== 'garden'}
                >
                  {cell.plant ? (
                    <div className={`absolute inset-0 flex items-center justify-center ${getCellSizeClass()}`}>
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
      )}

      {/* Export button */}
      {!isSharedView && (
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          🔗 Share Garden
        </button>
      )}

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
