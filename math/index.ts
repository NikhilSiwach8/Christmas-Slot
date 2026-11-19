import { InferGameType, createSlotGame } from "@slot-engine/core"
import { symbols, SymbolsType } from "./src/symbols"
import { gameModes, GameModesType, userState, UserStateType } from "./src/modes"
import { onHandleGameFlow } from "./src/flow"
import { MAX_WIN_X } from "./src/constants"

export type GameType = InferGameType<GameModesType, SymbolsType, UserStateType>

export const game = createSlotGame<GameType>({
  rootDir: __dirname,
  id: "claus-and-krampus",
  name: "Claus & Krampus",
  maxWinX: MAX_WIN_X,
  gameModes,
  symbols,
  padSymbols: 1,
  userState,
  hooks: { onHandleGameFlow },
})

// SIMS=200000 npm run sim   -> publication run (Stake needs 100k–1M per mode)
const SIMS = Number(process.env.SIMS ?? 20_000)
const MODES = (process.env.MODES ?? "base,ante,mini,mega,bonus,super,mystery").split(",") as any[]

game.configureSimulation({
  simRunsAmount: Object.fromEntries(MODES.map((m) => [m, SIMS])),
  concurrency: Number(process.env.CONCURRENCY ?? 4),
})

// Targets mirror docs/GDD.md §5. hitRate = "1 in N", rtp = share of the mode cost.
game.configureOptimization({
  base: {
    targets: {
      "0": {},
      basegame: { hitRate: 3.6 },
      bonus: { hitRate: 860, rtp: 0.28 },
      super: { hitRate: 6_900, rtp: 0.07 },
      hidden: { hitRate: 120_000, rtp: 0.01 },
      maxwin: { hitRate: 5_000_000 },
    },
  },
  ante: {
    targets: {
      "0": {},
      basegame: { hitRate: 3 },
      bonus: { hitRate: 150, rtp: 0.533 },
      super: { hitRate: 1_370, rtp: 0.117 },
      hidden: { hitRate: 25_800, rtp: 0.0187 },
      maxwin: { hitRate: 1_500_000 },
    },
  },
  mini: {
    targets: { "0": {}, feature: { hitRate: 1.15 }, maxwin: { hitRate: 200_000 } },
  },
  mega: {
    targets: { "0": {}, feature: { hitRate: 1.02 }, maxwin: { hitRate: 3_000 } },
  },
  bonus: {
    targets: { bonus: {}, maxwin: { hitRate: 60_000 } },
  },
  super: {
    targets: { super: {}, maxwin: { hitRate: 10_000 } },
  },
  mystery: {
    targets: {
      coal: { hitRate: 2.5 },
      super: { hitRate: 2.5, avgWin: 481 },
      maxwin: { hitRate: 1_000 },
      hidden: {},
    },
  },
})

game.runTasks({
  doSimulation: process.env.NO_SIM !== "1",
  doOptimization: process.env.OPTIMIZE === "1",
  optimizationOpts: { gameModes: MODES },
  doAnalysis: process.env.OPTIMIZE === "1",
  analysisOpts: { gameModes: MODES },
})
