/* 税抜原価。廃材処分費は含まない。 */
window.ESTIMATE_PRICING = {
  taxRate: 0.10,
  rooms: {
    6: { walls: 29.9, wallsAndCeiling: 39.6, floor: 42000 },
    8: { walls: 34.6, wallsAndCeiling: 47.6, floor: 56000 },
    10: { walls: 38.6, wallsAndCeiling: 54.8, floor: 70000 },
    12: { walls: 42.3, wallsAndCeiling: 61.7, floor: 84000 }
  },
  material: { standard: 380, select: 670 },
  laborRate: 800,
  dailyCapacity: 60,
  travelPerDay: 5000,
  managementRate: 0.10,
  grossMargin: 0.30,
  roundTo: 1000,
  furniture: { none: 0, small: 2000, large1: 2000, large2: 4000 },
  options: { baseboard: 8000, plates: 3000, lighting: 8000, rail: 6000 }
};
