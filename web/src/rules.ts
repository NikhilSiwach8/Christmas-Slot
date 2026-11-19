// Single source of truth for everything the UI shows about modes and rules.
// Must match math/src (costs, RTP, paytable, feature values).

export const MAX_WIN_X = 10_000
export const RTP = 96.2

export type ModeId = "base" | "ante" | "mini" | "mega" | "bonus" | "super" | "mystery"

export interface ModeInfo {
  id: ModeId
  name: string
  cost: number
  kind: "base" | "activate" | "buy"
  stars: number
  blurb: string
  icon: "stocking" | "sleigh" | "moon" | "gift" | "goldStocking" | "mystery" | "coal"
}

export const MODES: Record<ModeId, ModeInfo> = {
  base: { id: "base", name: "Base Game", cost: 1, kind: "base", stars: 3, blurb: "Standard play.", icon: "gift" },
  ante: {
    id: "ante",
    name: "Naughty List Ante",
    cost: 3,
    kind: "activate",
    stars: 3,
    blurb: "Free spins about 5.6× more often, and at least one Gift Wild every spin.",
    icon: "coal",
  },
  mini: {
    id: "mini",
    name: "Sleigh Run Spins",
    cost: 100,
    kind: "activate",
    stars: 4,
    blurb: "Every spin is a Sleigh Run: 4–8 Gift Wilds with Nice multipliers up to ×10.",
    icon: "sleigh",
  },
  mega: {
    id: "mega",
    name: "Midnight Run Spins",
    cost: 1000,
    kind: "activate",
    stars: 5,
    blurb: "Every spin is a Golden Sleigh Run: 6–10 Gift Wilds, multipliers up to ×25 and a guaranteed Krampus chain.",
    icon: "moon",
  },
  bonus: {
    id: "bonus",
    name: "Stocking Spins",
    cost: 250,
    kind: "buy",
    stars: 3,
    blurb: "10 free spins. Gift Wilds fill the stocking above their reel, and stockings never reset.",
    icon: "stocking",
  },
  super: {
    id: "super",
    name: "Golden Stocking Spins",
    cost: 500,
    kind: "buy",
    stars: 4,
    blurb: "12 free spins. Every stocking starts at ×2, and Krampus chain wilds stay in place.",
    icon: "goldStocking",
  },
  mystery: {
    id: "mystery",
    name: "Mystery Present",
    cost: 500,
    kind: "buy",
    stars: 5,
    blurb: "Unwrap a giant present: 40% Coal (no feature), 40% Golden Stocking Spins, 20% KRAMPUSNACHT.",
    icon: "mystery",
  },
}

export const MENU_ORDER: ModeId[] = ["ante", "mini", "mega", "bonus", "super", "mystery"]

export const PAYTABLE: { id: string; pays: [number, number, number] }[] = [
  { id: "H1", pays: [1, 3, 10] },
  { id: "H2", pays: [0.75, 2.5, 7.5] },
  { id: "H3", pays: [0.5, 1.5, 5] },
  { id: "H4", pays: [0.4, 1, 3] },
  { id: "L1", pays: [0.15, 0.3, 1] },
  { id: "L2", pays: [0.1, 0.25, 0.8] },
  { id: "L3", pays: [0.1, 0.2, 0.6] },
  { id: "L4", pays: [0.05, 0.2, 0.5] },
  { id: "L5", pays: [0.05, 0.15, 0.4] },
  { id: "W", pays: [1, 3, 10] },
]

export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [0, 0, 0, 0, 0], [3, 3, 3, 3, 3], [0, 1, 2, 3, 3],
  [1, 0, 0, 0, 1], [2, 3, 3, 3, 2], [0, 1, 2, 1, 0], [3, 2, 1, 2, 3], [3, 2, 1, 0, 0],
  [0, 1, 0, 1, 0], [3, 2, 3, 2, 3], [1, 2, 1, 2, 1], [2, 1, 2, 1, 2], [1, 0, 1, 0, 1],
  [1, 1, 0, 1, 1], [2, 2, 3, 2, 2], [0, 0, 1, 0, 0], [3, 3, 2, 3, 3], [2, 3, 2, 3, 2],
]

export const WIN_TIERS = [
  { min: 1000, name: "KRAMPUS WIN" },
  { min: 100, name: "LEGENDARY WIN" },
  { min: 50, name: "FESTIVE WIN" },
  { min: 25, name: "MERRY WIN" },
  { min: 10, name: "JOLLY WIN" },
]
