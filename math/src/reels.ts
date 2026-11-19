import { GeneratedReelSet } from "@slot-engine/core"

const common = {
  overrideExisting: false,
  // Gift wilds never land on reel 1 naturally (reel indices are 0-based).
  limitSymbolsToReels: { W: [1, 2, 3, 4] },
  spaceBetweenSameSymbols: 3,
  spaceBetweenSymbols: { S: { W: 2 } },
}

export const REELS = {
  base: new GeneratedReelSet({
    id: "base",
    ...common,
    symbolWeights: { S: 4, W: 6, H1: 9, H2: 11, H3: 14, H4: 17, L1: 34, L2: 38, L3: 42, L4: 46, L5: 50 },
  }),
  /** Stocking Spins strips (gift-heavy). */
  fsBonus: new GeneratedReelSet({
    id: "fsBonus",
    ...common,
    symbolWeights: { S: 3, W: 24, H1: 12, H2: 14, H3: 17, H4: 20, L1: 32, L2: 35, L3: 38, L4: 40, L5: 42 },
  }),
  /** Golden Stocking Spins / Krampusnacht strips. */
  fs: new GeneratedReelSet({
    id: "fs",
    ...common,
    symbolWeights: { S: 3, W: 10, H1: 12, H2: 14, H3: 17, H4: 20, L1: 32, L2: 35, L3: 38, L4: 40, L5: 42 },
  }),
  /** Richer strips, only used by forced max-win result sets. */
  fsBoost: new GeneratedReelSet({
    id: "fsBoost",
    ...common,
    symbolWeights: { S: 2, W: 30, H1: 22, H2: 20, H3: 18, H4: 18, L1: 22, L2: 22, L3: 22, L4: 20, L5: 20 },
  }),
} as const
