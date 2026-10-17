/* 料金設定はこのファイルに集約。すべて税抜の仮価格（円）です。
   壁＋天井は walls + ceilingAddition、床料金は部屋別です。
   家具・オプションは1部屋あたりの一式料金です。 */
window.ESTIMATE_PRICING = {
  taxRate: 0.10,
  rooms: {
    6:  { walls: 36000, ceilingAddition: 12000, floor: 42000 },
    8:  { walls: 44000, ceilingAddition: 16000, floor: 56000 },
    10: { walls: 52000, ceilingAddition: 20000, floor: 70000 },
    12: { walls: 60000, ceilingAddition: 24000, floor: 84000 }
  },
  wallpaperMultipliers: { standard: 1, select: 1.35 },
  furniture: { none: 0, small: 3000, large1: 6000, large2: 12000 },
  options: { baseboard: 8000, plates: 3000, lighting: 8000, rail: 6000 }
};
