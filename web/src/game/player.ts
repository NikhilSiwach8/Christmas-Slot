import type { Board } from "./board"
import type { Background } from "./background"
import type { Intro } from "./intro"
import { clock, wait } from "../util/tween"
import { sfx } from "../audio"

/** Book event types written by math/src/flow.ts. */
export type BookEvent =
  | { type: "reveal"; data: { board: "base" | "fs"; reels: string[][]; anticipation: boolean[]; sticky: number[][] } }
  | { type: "sleighRun"; data: { kind: "standard" | "golden"; gifts: { reel: number; row: number }[] } }
  | { type: "giftReveal"; data: { gifts: { reel: number; row: number; face: "nice" | "naughty"; mult: number; chain: { reel: number; row: number }[] }[] } }
  | { type: "lineWins"; data: { payout: number; wins: { line: number; symbol: string; kind: number; base: number; multiplier: number; payout: number; positions: number[][] }[] } }
  | { type: "scatterTrigger"; data: { scatters: number } }
  | { type: "freeSpinsStart"; data: { kind: "bonus" | "super" | "hidden"; spins: number; stockings: number[]; combine: "sum" | "product" } }
  | { type: "freeSpin"; data: { index: number; remaining: number } }
  | { type: "krampusStuff"; data: { reel: number; amount: number } }
  | { type: "stockings"; data: { values: number[] } }
  | { type: "retrigger"; data: { spins: number; total: number } }
  | { type: "maxWin"; data: { amount: number } }
  | { type: "freeSpinsEnd"; data: { kind: string; totalWin: number } }
  | { type: "mysteryReveal"; data: { outcome: "coal" | "super" | "hidden" } }

export interface PlayerHooks {
  /** Running win (in bet multiples) for the HUD win meter. */
  onWin: (multiplier: number) => void
  onFreeSpins: (info: { remaining: number; kind: string } | null) => void
  formatX: (multiplier: number) => string
}

/** Plays one book: turns events into animations. Never recomputes payouts. */
export class BookPlayer {
  private total = 0
  private inFs = false

  constructor(
    private board: Board,
    private bg: Background,
    private intro: Intro,
    private hooks: PlayerHooks,
    private baseScene: () => "base" | "ante",
  ) {}

  async play(events: BookEvent[], costMultiplier: number) {
    this.total = 0
    this.inFs = false
    this.hooks.onWin(0)
    let stockings = [0, 0, 0, 0, 0]
    for (const ev of events) {
      switch (ev.type) {
        case "mysteryReveal":
          await this.intro.mystery(ev.data.outcome)
          break

        case "reveal":
          await this.board.spin(ev.data.reels, ev.data.anticipation, ev.data.sticky)
          if (ev.data.sticky.length) this.board.markSticky(ev.data.sticky)
          break

        case "sleighRun":
          await this.intro.sleighRun(ev.data.kind === "golden")
          for (const g of ev.data.gifts) void this.board.dropGift(g.reel, g.row)
          await wait(450)
          break

        case "giftReveal":
          for (const g of ev.data.gifts) {
            await this.board.revealGift(g.reel, g.row, g.face, g.mult, !this.inFs)
            if (g.chain.length) await this.board.chain(g, g.chain)
            if (this.inFs) {
              const feeds: Promise<void>[] = []
              if (g.face === "nice") feeds.push(this.board.feedStocking(g.reel, g.row, g.mult))
              for (const c of g.chain) feeds.push(this.board.feedStocking(c.reel, c.row, 1))
              await Promise.all(feeds)
            }
          }
          break

        case "krampusStuff":
          stockings[ev.data.reel] += ev.data.amount
          await this.board.feedStocking(ev.data.reel, 0, ev.data.amount)
          await this.board.setStockings(stockings, true)
          break

        case "stockings":
          stockings = [...ev.data.values]
          await this.board.setStockings(stockings, true)
          break

        case "lineWins": {
          sfx.win(false)
          await this.board.showWins(ev.data.wins, clock.speed > 1)
          this.total += ev.data.payout
          this.hooks.onWin(this.total)
          const best = ev.data.wins.reduce((a, b) => (b.payout > a.payout ? b : a))
          this.board.setTotal(
            ev.data.wins.length === 1 && best.multiplier > 1
              ? `${this.hooks.formatX(best.base)} × ${best.multiplier} = ${this.hooks.formatX(best.payout)}`
              : this.hooks.formatX(ev.data.payout),
          )
          await wait(clock.speed > 1 ? 250 : 600)
          this.board.setTotal("")
          break
        }

        case "scatterTrigger":
          sfx.bell()
          await wait(600)
          break

        case "freeSpinsStart":
          this.inFs = true
          stockings = [...ev.data.stockings]
          await this.intro.freeSpins(ev.data.kind, ev.data.spins)
          this.bg.setScene(ev.data.kind)
          this.board.showStockings(true, ev.data.combine)
          await this.board.setStockings(stockings, false)
          this.hooks.onFreeSpins({ remaining: ev.data.spins, kind: ev.data.kind })
          break

        case "freeSpin":
          this.hooks.onFreeSpins({ remaining: ev.data.remaining, kind: "" })
          break

        case "retrigger":
          sfx.win(true)
          this.hooks.onFreeSpins({ remaining: ev.data.total, kind: "" })
          this.board.setTotal(`+${ev.data.spins} SPINS`)
          await wait(900)
          this.board.setTotal("")
          break

        case "maxWin":
          this.board.setTotal("MAX WIN 10,000×")
          await wait(1200)
          break

        case "freeSpinsEnd":
          this.board.setTotal(`TOTAL ${this.hooks.formatX(ev.data.totalWin)}`)
          await wait(1400)
          this.board.setTotal("")
          this.board.showStockings(false)
          this.bg.setScene(this.baseScene())
          this.hooks.onFreeSpins(null)
          this.inFs = false
          break
      }
    }
    this.board.clearWins()
    return this.total / costMultiplier
  }
}
