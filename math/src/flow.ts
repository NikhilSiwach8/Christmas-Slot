import { GameContext, LinesWinType, Reels, SPIN_TYPE } from "@slot-engine/core"
import type { GameModesType, UserStateType } from "./modes"
import type { SymbolsType } from "./symbols"
import {
  FS_SPINS,
  FsType,
  GIFT_TABLES,
  MAX_WIN_X,
  PAYLINES,
  REELS_AMOUNT,
  RETRIGGER_SPINS,
  ROWS,
  SCATTER_TRIGGER,
  SLEIGH_GIFTS,
  SLEIGH_RUN_CHANCE,
} from "./constants"

export type Ctx = GameContext<GameModesType, SymbolsType, UserStateType>

type Cell = [reel: number, row: number]
type Weights = Record<string | number, number>

/** What a result set asks the flow to produce. */
export interface FlowUserData {
  /** Base-type modes: which feature (if any) the trigger spin must start. */
  trigger?: "none" | FsType
  /** Mystery Present outcome. */
  mystery?: "coal" | "super" | "hidden"
  /** Use the richer max-win tables / strips. */
  boost?: boolean
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function onHandleGameFlow(ctx: Ctx) {
  const mode = ctx.state.currentGameMode as string
  const ud = (ctx.state.currentResultSet.userData ?? {}) as FlowUserData

  switch (mode) {
    case "bonus":
      return startFreeSpins(ctx, "bonus", !!ud.boost)
    case "super":
      return startFreeSpins(ctx, "super", !!ud.boost)
    case "mystery": {
      const outcome = ud.mystery ?? "coal"
      ctx.services.data.addBookEvent({ type: "mysteryReveal", data: { outcome } })
      ctx.state.userData.outcome = outcome
      if (outcome === "coal") return
      return startFreeSpins(ctx, outcome, !!ud.boost)
    }
    default:
      return baseSpin(ctx, mode, ud)
  }
}

// ---------------------------------------------------------------------------
// Base-type spins (base, ante, mini, mega)
// ---------------------------------------------------------------------------

function baseSpin(ctx: Ctx, mode: string, ud: FlowUserData) {
  const isFeatureSpin = mode === "mini" || mode === "mega"
  const trigger = isFeatureSpin ? "none" : (ud.trigger ?? "none")
  const reels = ctx.services.game.getReelsetById(mode, "base")

  drawBaseBoard(ctx, reels, trigger)

  // Naughty List Ante: at least one gift wild every spin.
  if (mode === "ante" && countWilds(ctx) === 0) {
    const cell = ctx.services.rng.randomItem(freeCells(ctx, 1))
    if (cell) placeGift(ctx, cell)
  }

  // Sleigh Run (random in base/ante, guaranteed in feature-spin modes).
  let sleigh: "none" | "standard" | "golden" = "none"
  if (mode === "mini") sleigh = "standard"
  else if (mode === "mega") sleigh = "golden"
  else if (ctx.services.rng.randomFloat(0, 1) < SLEIGH_RUN_CHANCE) sleigh = "standard"

  setAnticipation(ctx)
  addRevealEvent(ctx, "base")

  if (sleigh !== "none") {
    const table = mode === "mega" ? SLEIGH_GIFTS.mega : mode === "mini" ? SLEIGH_GIFTS.mini : SLEIGH_GIFTS.base
    const amount = Number(ctx.services.rng.weightedRandom(table))
    const cells = pickN(ctx, freeCells(ctx, 0), amount)
    for (const c of cells) placeGift(ctx, c)
    ctx.services.data.addBookEvent({
      type: "sleighRun",
      data: { kind: sleigh, gifts: cells.map(([reel, row]) => ({ reel, row })) },
    })
    ctx.services.data.tag({ sleighRun: sleigh })
  }

  // Unwrap every gift on the board.
  const niceTable = ud.boost
    ? GIFT_TABLES.niceBoost
    : mode === "mega"
      ? GIFT_TABLES.niceMega
      : mode === "mini"
        ? GIFT_TABLES.niceMini
        : GIFT_TABLES.niceBase
  const faceTable = ud.boost ? GIFT_TABLES.face.boost : mode === "mega" ? GIFT_TABLES.face.golden : GIFT_TABLES.face.standard
  const reveals = unwrapGifts(ctx, wildCells(ctx), {
    faceTable,
    valueTable: niceTable,
    forceChain: mode === "mega",
  })
  if (reveals.length) ctx.services.data.addBookEvent({ type: "giftReveal", data: { gifts: reveals } })

  // Line wins: multipliers of Nice wilds on the same line multiply.
  evaluateLines(ctx, (combo) => {
    let m = 1
    for (const s of combo.symbols) if (s.isWild) m *= Number(s.symbol.properties.get("mult") ?? 1)
    return m
  })

  // Scatter trigger
  if (trigger === "none") return
  const scatters = countScatters(ctx)
  const type = SCATTER_TRIGGER[Math.min(scatters, 5)]
  if (!type) return
  ctx.services.data.addBookEvent({ type: "scatterTrigger", data: { scatters, positions: scatterCells(ctx).map(([reel, row]) => ({ reel, row })) } })
  startFreeSpins(ctx, type, !!ud.boost)
}

function drawBaseBoard(ctx: Ctx, reels: Reels, trigger: "none" | FsType) {
  const scatter = ctx.config.symbols.get("S")!
  const wanted = trigger === "none" ? -1 : trigger === "bonus" ? 3 : trigger === "super" ? 4 : 5

  for (let guard = 0; guard < 10_000; guard++) {
    ctx.services.board.resetBoard()
    if (wanted > 0) {
      const stops = ctx.services.board.getReelStopsForSymbol(reels, scatter)
      const forced = ctx.services.board.getRandomReelStops(reels, stops, wanted)
      ctx.services.board.drawBoardWithForcedStops({ reels, forcedStops: forced })
    } else {
      ctx.services.board.drawBoardWithRandomStops(reels)
    }
    if (ctx.services.board.isSymbolOnAnyReelMultipleTimes(scatter)) continue
    const n = countScatters(ctx)
    if (wanted > 0 ? n === wanted : n <= 2) return
  }
  throw new Error("drawBaseBoard: could not draw a valid board")
}

// ---------------------------------------------------------------------------
// Free spins: Stocking Spins / Golden Stocking Spins / Krampusnacht
// ---------------------------------------------------------------------------

function startFreeSpins(ctx: Ctx, type: FsType, boost: boolean) {
  const mode = ctx.state.currentGameMode as string
  ctx.state.userData.fsType = type
  ctx.services.data.tag({ fs: type })

  ctx.services.game.awardFreespins(FS_SPINS[type])
  ctx.state.currentSpinType = SPIN_TYPE.FREE_SPINS

  const stockings = Array.from({ length: REELS_AMOUNT }, () => (type === "super" ? 2 : 1))
  const sticky = new Set<string>() // "reel,row"

  ctx.services.data.addBookEvent({
    type: "freeSpinsStart",
    data: { kind: type, spins: FS_SPINS[type], stockings: [...stockings], combine: type === "hidden" ? "product" : "sum" },
  })

  const reels = ctx.services.game.getReelsetById(mode, boost ? "fsBoost" : type === "bonus" ? "fsBonus" : "fs")
  let spinIndex = 0

  while (ctx.state.currentFreespinAmount > 0) {
    ctx.state.currentFreespinAmount--
    spinIndex++
    ctx.services.data.addBookEvent({
      type: "freeSpin",
      data: { index: spinIndex, remaining: ctx.state.currentFreespinAmount },
    })

    drawFsBoard(ctx, reels)

    // Re-apply sticky wilds before the reveal.
    for (const key of sticky) {
      const [r, w] = key.split(",").map(Number) as Cell
      placeGift(ctx, [r, w], { revealed: true, mult: 1 })
    }

    addRevealEvent(ctx, "fs", [...sticky])

    // Krampusnacht: Krampus stuffs a random stocking every spin.
    if (type === "hidden") {
      const reel = Number(ctx.services.rng.randomItem([0, 1, 2, 3, 4]))
      stockings[reel] += 1
      ctx.services.data.addBookEvent({ type: "krampusStuff", data: { reel, amount: 1 } })
    }

    // Unwrap new gifts and feed stockings.
    const newGifts = wildCells(ctx).filter(([r, w]) => !ctx.services.board.getSymbol(r, w)!.properties.get("revealed"))
    const reveals = unwrapGifts(ctx, newGifts, {
      faceTable: boost ? GIFT_TABLES.face.boost : GIFT_TABLES.face.standard,
      valueTable: boost
        ? GIFT_TABLES.stockingNiceBoost
        : type === "hidden"
          ? GIFT_TABLES.stockingNiceHidden
          : type === "bonus"
            ? GIFT_TABLES.stockingNiceBonus
            : GIFT_TABLES.stockingNice,
      forceChain: false,
    })
    for (const g of reveals) {
      if (g.face === "nice") stockings[g.reel] += g.mult
      for (const c of g.chain) stockings[c.reel] += 1
      // Gift wilds inside free spins are plain wilds; their value lives in the stocking.
      ctx.services.board.updateSymbol(g.reel, g.row, { mult: 1 })
      for (const c of g.chain) ctx.services.board.updateSymbol(c.reel, c.row, { mult: 1 })
      if (type === "super" || type === "hidden") for (const c of g.chain) sticky.add(`${c.reel},${c.row}`)
    }
    if (reveals.length) ctx.services.data.addBookEvent({ type: "giftReveal", data: { gifts: reveals } })
    ctx.services.data.addBookEvent({ type: "stockings", data: { values: [...stockings] } })

    evaluateLines(ctx, (combo) => stockingFactor(stockings, combo.kind, type))

    if (ctx.services.wallet.getCurrentWin() >= MAX_WIN_X) {
      ctx.services.data.addBookEvent({ type: "maxWin", data: { amount: MAX_WIN_X } })
      ctx.state.currentFreespinAmount = 0
      break
    }

    const scat = countScatters(ctx)
    const extra = RETRIGGER_SPINS[Math.min(scat, 5)] ?? 0
    if (extra > 0) {
      ctx.services.game.awardFreespins(extra)
      ctx.services.data.addBookEvent({ type: "retrigger", data: { spins: extra, total: ctx.state.currentFreespinAmount } })
    }
  }

  ctx.services.data.addBookEvent({
    type: "freeSpinsEnd",
    data: { kind: type, totalWin: Math.min(ctx.services.wallet.getCurrentWin(), MAX_WIN_X) },
  })
}

function drawFsBoard(ctx: Ctx, reels: Reels) {
  const scatter = ctx.config.symbols.get("S")!
  for (let guard = 0; guard < 10_000; guard++) {
    ctx.services.board.resetBoard()
    ctx.services.board.drawBoardWithRandomStops(reels)
    if (!ctx.services.board.isSymbolOnAnyReelMultipleTimes(scatter)) return
  }
  throw new Error("drawFsBoard: could not draw a valid board")
}

/** Stocking multiplier for a line covering reels [0, kind). */
export function stockingFactor(stockings: number[], kind: number, type: FsType) {
  const covered = stockings.slice(0, kind)
  if (type === "hidden") return covered.reduce((p, s) => p * Math.max(1, s), 1)
  return Math.max(1, covered.reduce((a, s) => a + s, 0))
}

// ---------------------------------------------------------------------------
// Gift wilds
// ---------------------------------------------------------------------------

interface GiftReveal {
  reel: number
  row: number
  face: "nice" | "naughty"
  mult: number
  chain: { reel: number; row: number }[]
}

function unwrapGifts(
  ctx: Ctx,
  cells: Cell[],
  opts: { faceTable: Weights; valueTable: Weights; forceChain: boolean },
): GiftReveal[] {
  const out: GiftReveal[] = []
  let chainDone = false
  // Snapshot first: chains create new wilds that must not be unwrapped again.
  const original = cells.filter(([r, w]) => !ctx.services.board.getSymbol(r, w)!.properties.get("revealed"))

  original.forEach(([reel, row], i) => {
    let face = ctx.services.rng.weightedRandom(opts.faceTable) as "nice" | "naughty"
    if (opts.forceChain && !chainDone && i === original.length - 1) face = "naughty"
    const reveal: GiftReveal = { reel, row, face, mult: 1, chain: [] }

    if (face === "nice") {
      reveal.mult = Number(ctx.services.rng.weightedRandom(opts.valueTable))
    } else {
      chainDone = true
      const len = Number(ctx.services.rng.weightedRandom(GIFT_TABLES.chainLen))
      const targets = pickN(ctx, neighbours(ctx, [reel, row]), len)
      for (const t of targets) {
        placeGift(ctx, t, { revealed: true, mult: 1, chained: true })
        reveal.chain.push({ reel: t[0], row: t[1] })
      }
    }
    ctx.services.board.updateSymbol(reel, row, { revealed: true, mult: reveal.mult, face })
    out.push(reveal)
  })
  return out
}

function placeGift(ctx: Ctx, [reel, row]: Cell, props: Record<string, any> = {}) {
  const w = ctx.config.symbols.get("W")!.clone()
  ctx.services.board.setSymbol(reel, row, w)
  ctx.services.board.updateSymbol(reel, row, { revealed: false, mult: 1, ...props })
}

/** Orthogonal neighbours that can be converted by a Krampus chain. */
function neighbours(ctx: Ctx, [r, w]: Cell): Cell[] {
  const cand: Cell[] = [
    [r - 1, w],
    [r + 1, w],
    [r, w - 1],
    [r, w + 1],
  ]
  return cand.filter(([cr, cw]) => {
    if (cr < 0 || cr >= REELS_AMOUNT || cw < 0 || cw >= ROWS) return false
    const s = ctx.services.board.getSymbol(cr, cw)!
    return !s.properties.get("isScatter") && !s.properties.get("isWild")
  })
}

// ---------------------------------------------------------------------------
// Board helpers
// ---------------------------------------------------------------------------

function forEachCell(fn: (c: Cell) => void) {
  for (let r = 0; r < REELS_AMOUNT; r++) for (let w = 0; w < ROWS; w++) fn([r, w])
}

function cellsWhere(ctx: Ctx, pred: (props: Map<string, any>) => boolean): Cell[] {
  const out: Cell[] = []
  forEachCell(([r, w]) => {
    if (pred(ctx.services.board.getSymbol(r, w)!.properties)) out.push([r, w])
  })
  return out
}

const wildCells = (ctx: Ctx) => cellsWhere(ctx, (p) => !!p.get("isWild"))
const scatterCells = (ctx: Ctx) => cellsWhere(ctx, (p) => !!p.get("isScatter"))
const countWilds = (ctx: Ctx) => wildCells(ctx).length
const countScatters = (ctx: Ctx) => scatterCells(ctx).length

/** Cells that may receive a new gift: not a scatter, not already a wild, reel >= minReel. */
function freeCells(ctx: Ctx, minReel: number): Cell[] {
  return cellsWhere(ctx, (p) => !p.get("isScatter") && !p.get("isWild")).filter(([r]) => r >= minReel)
}

function pickN<T>(ctx: Ctx, items: T[], n: number): T[] {
  return ctx.services.rng.shuffle([...items]).slice(0, Math.min(n, items.length))
}

function setAnticipation(ctx: Ctx) {
  let seen = 0
  for (let r = 0; r < REELS_AMOUNT; r++) {
    if (seen >= 2) ctx.services.board.setAnticipationForReel(r, true)
    if (ctx.services.board.countSymbolsOnReel({ isScatter: true }, r) > 0) seen++
  }
}

function addRevealEvent(ctx: Ctx, board: "base" | "fs", sticky: string[] = []) {
  const ids = (reels: Reels) => reels.map((reel) => reel.map((s) => s.id))
  ctx.services.data.addBookEvent({
    type: "reveal",
    data: {
      board,
      reels: ids(ctx.services.board.getBoardReels()),
      paddingTop: ids(ctx.services.board.getPaddingTop()),
      paddingBottom: ids(ctx.services.board.getPaddingBottom()),
      anticipation: ctx.services.board.getAnticipation(),
      sticky: sticky.map((k) => k.split(",").map(Number)),
    },
  })
}

function evaluateLines(ctx: Ctx, multiplierFor: (combo: any) => number) {
  const lines = new LinesWinType({ ctx, lines: PAYLINES, wildSymbol: { isWild: true } })
  const { payout, winCombinations } = lines
    .evaluateWins(ctx.services.board.getBoardReels())
    .postProcess((wins) => ({
      winCombinations: wins.map((w) => {
        const multiplier = multiplierFor(w)
        return { ...w, payout: Math.round(w.payout * multiplier * 100) / 100, multiplier } as any
      }),
    }))
    .getWins()

  ctx.services.wallet.addSpinWin(payout)
  if (payout > 0) {
    ctx.services.data.addBookEvent({
      type: "lineWins",
      data: {
        payout,
        wins: winCombinations.map((w: any) => ({
          line: w.lineNumber,
          symbol: w.baseSymbol.id,
          kind: w.kind,
          base: Math.round((w.payout / w.multiplier) * 100) / 100,
          multiplier: w.multiplier,
          payout: w.payout,
          positions: w.symbols.map((s: any) => [s.reelIndex, s.posIndex]),
        })),
      },
    })
  }
  ctx.services.wallet.confirmSpinWin()
}
