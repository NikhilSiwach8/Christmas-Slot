// Shared constants for Claus & Krampus. Keep in sync with docs/GDD.md.

export const REELS_AMOUNT = 5
export const ROWS = 4
export const MAX_WIN_X = 10_000

/** 20 fixed paylines. Row 0 = top. */
export const PAYLINES: Record<number, number[]> = {
  1: [1, 1, 1, 1, 1],
  2: [2, 2, 2, 2, 2],
  3: [0, 0, 0, 0, 0],
  4: [3, 3, 3, 3, 3],
  5: [0, 1, 2, 3, 3],
  6: [1, 0, 0, 0, 1],
  7: [2, 3, 3, 3, 2],
  8: [0, 1, 2, 1, 0],
  9: [3, 2, 1, 2, 3],
  10: [3, 2, 1, 0, 0],
  11: [0, 1, 0, 1, 0],
  12: [3, 2, 3, 2, 3],
  13: [1, 2, 1, 2, 1],
  14: [2, 1, 2, 1, 2],
  15: [1, 0, 1, 0, 1],
  16: [1, 1, 0, 1, 1],
  17: [2, 2, 3, 2, 2],
  18: [0, 0, 1, 0, 0],
  19: [3, 3, 2, 3, 3],
  20: [2, 3, 2, 3, 2],
}

export type FsType = "bonus" | "super" | "hidden"

/** Free spins awarded per feature. */
export const FS_SPINS: Record<FsType, number> = { bonus: 10, super: 12, hidden: 10 }

/** Scatter count in base game -> feature. */
export const SCATTER_TRIGGER: Record<number, FsType> = { 3: "bonus", 4: "super", 5: "hidden" }

/** Retrigger: scatters landed during free spins -> extra spins. */
export const RETRIGGER_SPINS: Record<number, number> = { 2: 2, 3: 4, 4: 4, 5: 4 }

/** Weighted tables used by the gift-wild reveal. Keys are values, numbers are weights. */
export const GIFT_TABLES = {
  /** Nice vs Naughty face. */
  face: {
    standard: { nice: 65, naughty: 35 },
    golden: { nice: 70, naughty: 30 },
    boost: { nice: 80, naughty: 20 },
  },
  /** Multiplier of a Nice gift in base / ante. */
  niceBase: { 2: 60, 3: 30, 5: 10 },
  /** Sleigh Run Spins (mini feature mode). */
  niceMini: { 2: 55, 3: 30, 5: 12, 10: 3 },
  /** Midnight Run Spins (mega feature mode). */
  niceMega: { 2: 30, 3: 35, 5: 25, 10: 8, 25: 2 },
  /** Max-win hunting variants (only used by forced max-win result sets). */
  niceBoost: { 5: 30, 10: 40, 25: 30 },
  /** Stocking value added by a Nice gift during free spins. */
  stockingNiceBonus: { 2: 25, 3: 35, 5: 28, 10: 12 },
  stockingNice: { 2: 40, 3: 35, 5: 20, 10: 5 },
  /** Krampusnacht stockings multiply, so its values are smaller. */
  stockingNiceHidden: { 1: 65, 2: 30, 3: 5 },
  stockingNiceBoost: { 5: 30, 10: 70 },
  /** Krampus chain length (cells converted). */
  chainLen: { 1: 50, 2: 35, 3: 15 },
}

/** Sleigh Run gift count tables. */
export const SLEIGH_GIFTS = {
  base: { 3: 40, 4: 35, 5: 18, 6: 7 },
  mini: { 4: 30, 5: 30, 6: 22, 7: 12, 8: 6 },
  mega: { 6: 25, 7: 25, 8: 20, 9: 15, 10: 15 },
}

/** Chance per base / ante spin that a Sleigh Run happens (≈ 1 in 45). */
export const SLEIGH_RUN_CHANCE = 1 / 45
