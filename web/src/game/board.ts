import { BlurFilter, Container, Graphics, Sprite, Text, TextStyle } from "pixi.js"
import { SymbolId, SYMBOL_IDS } from "../art/symbols"
import { CELL, frameTex, softDot, symbolTex } from "./textures"
import { ease, lerp, tween, wait } from "../util/tween"
import { PAYLINES } from "../rules"
import { sfx } from "../audio"

export const REELS = 5
export const ROWS = 4
const GAP = 8
const STEP = CELL + GAP
export const BOARD_W = REELS * STEP - GAP
export const BOARD_H = ROWS * STEP - GAP

const FONT = "Lilita One, Rubik, sans-serif"

export const badgeStyle = (fill: string, size = 34) =>
  new TextStyle({
    fontFamily: FONT,
    fontSize: size,
    fill,
    stroke: { color: "#1d1424", width: 7, join: "round" },
    dropShadow: { color: "#000000", alpha: 0.5, blur: 0, distance: 3, angle: Math.PI / 2 },
  })

/** One symbol on the board. */
export class SymbolView extends Container {
  id: SymbolId
  frame = new Sprite()
  icon = new Sprite()
  glow = new Sprite(softDot)
  badge: Text
  lid?: Graphics

  constructor(id: SymbolId) {
    super()
    this.id = id
    this.glow.anchor.set(0.5)
    this.glow.scale.set(3.4)
    this.glow.alpha = 0
    this.glow.blendMode = "add"
    for (const s of [this.frame, this.icon]) s.anchor.set(0.5)
    this.badge = new Text({ text: "", style: badgeStyle("#ffe27a") })
    this.badge.anchor.set(0.5)
    this.badge.position.set(36, -38)
    this.badge.visible = false
    this.addChild(this.glow, this.frame, this.icon, this.badge)
    this.set(id)
  }

  set(id: SymbolId) {
    this.id = id
    this.frame.texture = frameTex[id]
    this.frame.scale.set(CELL / this.frame.texture.width)
    this.icon.texture = symbolTex[id]
    this.icon.scale.set((CELL * 0.74) / this.icon.texture.width)
    this.badge.visible = false
    this.glow.alpha = 0
    this.glow.tint = 0xffffff
  }

  setBadge(text: string, color = "#ffe27a") {
    this.badge.text = text
    this.badge.style = badgeStyle(color)
    this.badge.position.set(36, -38)
    this.badge.visible = true
  }
}

class Stocking extends Container {
  value = 0
  body = new Graphics()
  valueText: Text
  combine: "sum" | "product" = "sum"

  constructor() {
    super()
    this.valueText = new Text({ text: "×0", style: badgeStyle("#ffffff", 30) })
    this.valueText.anchor.set(0.5)
    this.valueText.position.set(0, 10)
    this.addChild(this.body, this.valueText)
    this.draw(0)
  }

  draw(fill: number) {
    const g = this.body.clear()
    const bulge = Math.min(1, fill / 25)
    const w = 64 + bulge * 18
    // cuff
    g.roundRect(-38, -46, 76, 22, 8).fill(0xf4f8ff).stroke({ color: 0x1d1424, width: 4 })
    // leg + foot
    g.moveTo(-w / 2 + 6, -26)
      .lineTo(w / 2 - 6, -26)
      .lineTo(w / 2 - 2, 26)
      .quadraticCurveTo(w / 2 + 22, 30, w / 2 + 18, 46)
      .quadraticCurveTo(0, 58, -w / 2, 40)
      .closePath()
      .fill(this.combine === "product" ? 0x3b2a6b : fill > 0 ? 0xc2283a : 0x7a1d29)
      .stroke({ color: 0x1d1424, width: 4 })
    // stripe
    g.rect(-w / 2 + 6, -6, w - 10, 8).fill({ color: 0xffffff, alpha: 0.85 })
  }

  async set(v: number, animate: boolean) {
    const from = this.value
    this.value = v
    this.valueText.text = `×${v}`
    this.draw(v)
    if (!animate || v === from) return
    sfx.stock()
    await tween(320, (t) => this.scale.set(1 + Math.sin(t * Math.PI) * 0.25), ease.linear)
  }
}

export class Board extends Container {
  private frameBg = new Graphics()
  private reelsLayer = new Container()
  private reelMask = new Graphics()
  private fx = new Container()
  private lines = new Graphics()
  private stockingRow = new Container()
  readonly stockings: Stocking[] = []
  private cells: SymbolView[][] = []
  private totalText: Text

  constructor() {
    super()
    // board frame: carved wood + gold trim
    const f = this.frameBg
    f.roundRect(-26, -26, BOARD_W + 52, BOARD_H + 52, 30).fill(0x1d1424)
    f.roundRect(-20, -20, BOARD_W + 40, BOARD_H + 40, 26).fill(0xb8862f)
    f.roundRect(-14, -14, BOARD_W + 28, BOARD_H + 28, 22).fill(0x5a2e1a)
    f.roundRect(-8, -8, BOARD_W + 16, BOARD_H + 16, 18).fill({ color: 0x0f0b18, alpha: 0.88 })
    for (let r = 1; r < REELS; r++) f.rect(r * STEP - GAP / 2 - 1, 0, 2, BOARD_H).fill({ color: 0xffffff, alpha: 0.06 })

    this.reelMask.rect(-8, -8, BOARD_W + 16, BOARD_H + 16).fill(0xffffff)
    this.reelsLayer.mask = this.reelMask

    for (let r = 0; r < REELS; r++) {
      const s = new Stocking()
      s.position.set(r * STEP + CELL / 2, -96)
      this.stockings.push(s)
      this.stockingRow.addChild(s)
    }
    this.stockingRow.visible = false

    this.totalText = new Text({ text: "", style: badgeStyle("#ffffff", 44) })
    this.totalText.anchor.set(0.5)
    this.totalText.position.set(BOARD_W / 2, BOARD_H + 52)

    this.addChild(this.frameBg, this.reelsLayer, this.reelMask, this.lines, this.fx, this.stockingRow, this.totalText)

    const rand = () => SYMBOL_IDS[2 + Math.floor(Math.random() * 9)]
    this.setBoard(Array.from({ length: REELS }, () => Array.from({ length: ROWS }, rand)))
  }

  cell(r: number, row: number) {
    return this.cells[r][row]
  }

  cellPos(r: number, row: number) {
    return { x: r * STEP + CELL / 2, y: row * STEP + CELL / 2 }
  }

  setBoard(reels: string[][]) {
    this.reelsLayer.removeChildren().forEach((c) => c.destroy({ children: true }))
    this.cells = reels.map((reel, r) =>
      reel.map((id, row) => {
        const v = new SymbolView(id as SymbolId)
        const p = this.cellPos(r, row)
        v.position.set(p.x, p.y)
        this.reelsLayer.addChild(v)
        return v
      }),
    )
  }

  /** Spin to the given board. Reels stop left to right; anticipation reels spin longer. */
  async spin(reels: string[][], anticipation: boolean[], sticky: number[][] = []) {
    this.clearWins()
    const stickySet = new Set(sticky.map(([r, w]) => `${r},${w}`))
    const old = this.cells
    const jobs: Promise<void>[] = []
    let extra = 0
    for (let r = 0; r < REELS; r++) {
      if (anticipation[r]) extra += 650
      const strip = new Container()
      const len = 10 + r * 3
      const fillers: SymbolView[] = []
      for (let i = 0; i < len; i++) {
        const v = new SymbolView(SYMBOL_IDS[2 + Math.floor(Math.random() * 9)])
        v.position.set(this.cellPos(r, 0).x, (-i - 1) * STEP + CELL / 2)
        fillers.push(v)
        strip.addChild(v)
      }
      const finals = reels[r].map((id, row) => {
        const v = new SymbolView(id as SymbolId)
        v.position.set(this.cellPos(r, row).x, -(len + ROWS) * STEP + this.cellPos(r, row).y)
        // sticky cells keep their current view in place; the strip just slides behind them
        if (stickySet.has(`${r},${row}`)) v.visible = false
        strip.addChild(v)
        return v
      })
      // old symbols scroll down out of view with the strip
      for (let row = 0; row < ROWS; row++) {
        const o = old[r]?.[row]
        if (!o || stickySet.has(`${r},${row}`)) continue
        o.removeFromParent()
        strip.addChild(o)
      }
      this.reelsLayer.addChildAt(strip, 0)
      const blur = new BlurFilter({ strengthX: 0, strengthY: 10 })
      strip.filters = [blur]
      const dist = (len + ROWS) * STEP
      const dur = 520 + r * 140 + extra
      const anticipating = anticipation[r]
      const next: SymbolView[] = finals.map((v, row) => (stickySet.has(`${r},${row}`) ? old[r][row] : v))
      this.cells[r] = next
      const job = (async () => {
        if (anticipating) this.anticipationGlow(r, dur)
        await tween(dur, (t) => (strip.y = dist * t), ease.inOutCubic)
        strip.filters = []
        sfx.reelStop()
        await tween(140, (t) => (strip.y = dist + Math.sin(t * Math.PI) * 14), ease.linear)
        for (const v of fillers) v.destroy()
        finals.forEach((v, row) => {
          if (next[row] !== v) {
            v.destroy()
            return
          }
          v.removeFromParent()
          const pos = this.cellPos(r, row)
          v.position.set(pos.x, pos.y)
          this.reelsLayer.addChild(v)
        })
        strip.destroy({ children: true })
        if (finals.some((v) => v.id === "S")) sfx.bell()
      })()
      jobs.push(job)
    }
    await Promise.all(jobs)
    for (let r = 0; r < REELS; r++) for (let w = 0; w < ROWS; w++) {
      const p = this.cellPos(r, w)
      this.cells[r][w].position.set(p.x, p.y)
    }
  }

  private anticipationGlow(r: number, dur: number) {
    const g = new Graphics()
    g.roundRect(r * STEP - 6, -6, CELL + 12, BOARD_H + 12, 14).stroke({ color: 0xffd34d, width: 6 })
    this.fx.addChild(g)
    sfx.anticipate()
    tween(dur, (t) => (g.alpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 12))), ease.linear).then(() => g.destroy())
  }

  /** A gift drops onto a cell (Sleigh Run / Ante). */
  async dropGift(r: number, row: number) {
    const v = this.cells[r][row]
    v.set("W")
    const p = this.cellPos(r, row)
    v.y = p.y - 400
    v.alpha = 0
    await tween(380, (t) => {
      v.y = lerp(p.y - 400, p.y, t)
      v.alpha = Math.min(1, t * 2)
    }, ease.outBack)
    sfx.thud()
  }

  /** Unwrap animation: shake, lid pops, face revealed. */
  async revealGift(r: number, row: number, face: "nice" | "naughty", mult: number, showMult: boolean) {
    const v = this.cells[r][row]
    if (v.id !== "W") v.set("W")
    await tween(260, (t) => (v.rotation = Math.sin(t * Math.PI * 6) * 0.12 * (1 - t)), ease.linear)
    v.rotation = 0
    // lid burst
    const burst = new Sprite(softDot)
    burst.anchor.set(0.5)
    burst.position.copyFrom(v.position)
    burst.tint = face === "nice" ? 0xffd34d : 0x9b5cff
    burst.blendMode = "add"
    this.fx.addChild(burst)
    face === "nice" ? sfx.nice() : sfx.naughty()
    tween(420, (t) => {
      burst.scale.set(1 + t * 5)
      burst.alpha = 1 - t
    }).then(() => burst.destroy())
    v.glow.tint = face === "nice" ? 0xffc93d : 0x9b5cff
    await tween(180, (t) => {
      v.scale.set(1 + Math.sin(t * Math.PI) * 0.18)
      v.glow.alpha = t * 0.7
    }, ease.linear)
    if (face === "nice" && showMult) v.setBadge(`×${mult}`)
    if (face === "naughty") {
      v.setBadge("CHAIN", "#c9a8ff")
      v.badge.style.fontSize = 22
      v.badge.position.set(24, -40)
    }
  }

  /** Krampus chain lashes from a gift to neighbour cells, turning them into wilds. */
  async chain(from: { reel: number; row: number }, to: { reel: number; row: number }[]) {
    const a = this.cellPos(from.reel, from.row)
    for (const t of to) {
      const b = this.cellPos(t.reel, t.row)
      const g = new Graphics()
      this.fx.addChild(g)
      await tween(200, (k) => {
        g.clear()
        const x = lerp(a.x, b.x, k)
        const y = lerp(a.y, b.y, k)
        g.moveTo(a.x, a.y).lineTo(x, y).stroke({ color: 0x1d1424, width: 12, cap: "round" })
        g.moveTo(a.x, a.y).lineTo(x, y).stroke({ color: 0xb9b2c9, width: 6, cap: "round" })
        for (let i = 0; i <= 6; i++) {
          if (i / 6 > k) break
          g.circle(lerp(a.x, b.x, i / 6), lerp(a.y, b.y, i / 6), 5).fill(0x6e6a7a)
        }
      }, ease.outCubic)
      sfx.chain()
      const v = this.cells[t.reel][t.row]
      v.set("W")
      v.glow.tint = 0x9b5cff
      v.glow.alpha = 0.6

      tween(500, (k) => (g.alpha = 1 - k)).then(() => g.destroy())
    }
  }

  markSticky(cells: number[][]) {
    for (const [r, w] of cells) {
      const v = this.cells[r]?.[w]
      if (!v) continue
      v.glow.tint = 0x9b5cff
      v.glow.alpha = 0.45
    }
  }

  /** Highlight winning lines one by one, then all together. */
  async showWins(wins: { line: number; positions: number[][]; payout: number; multiplier: number }[], fast: boolean) {
    const winning = new Set<string>()
    for (const w of wins) for (const [r, row] of w.positions) winning.add(`${r},${row}`)
    for (let r = 0; r < REELS; r++) for (let w = 0; w < ROWS; w++) {
      this.cells[r][w].alpha = winning.has(`${r},${w}`) ? 1 : 0.45
    }
    const g = this.lines.clear()
    for (const w of wins) {
      const path = PAYLINES[w.line - 1]
      const pts = path.map((row, r) => this.cellPos(r, row))
      g.moveTo(pts[0].x, pts[0].y)
      for (const p of pts.slice(1)) g.lineTo(p.x, p.y)
      g.stroke({ color: 0x1d1424, width: 10, cap: "round", join: "round", alpha: 0.7 })
      g.moveTo(pts[0].x, pts[0].y)
      for (const p of pts.slice(1)) g.lineTo(p.x, p.y)
      g.stroke({ color: 0xffd34d, width: 5, cap: "round", join: "round" })
    }
    const pulse = [...winning].map((k) => {
      const [r, w] = k.split(",").map(Number)
      return this.cells[r][w]
    })
    await tween(fast ? 300 : 650, (t) => {
      const s = 1 + Math.sin(t * Math.PI * 2) * 0.08
      for (const v of pulse) v.scale.set(s)
    }, ease.linear)
  }

  clearWins() {
    this.lines.clear()
    for (const reel of this.cells) for (const v of reel) {
      v.alpha = 1
      v.scale.set(1)
    }
  }

  showStockings(on: boolean, combine: "sum" | "product" = "sum") {
    this.stockingRow.visible = on
    for (const s of this.stockings) {
      s.combine = combine
      s.draw(s.value)
    }
  }

  async setStockings(values: number[], animate: boolean) {
    await Promise.all(values.map((v, i) => this.stockings[i].set(v, animate)))
  }

  /** Flying "+N" from a cell into its stocking. */
  async feedStocking(r: number, row: number, amount: number) {
    const p = this.cellPos(r, row)
    const t = new Text({ text: `+${amount}`, style: badgeStyle("#ffe27a", 30) })
    t.anchor.set(0.5)
    t.position.set(p.x, p.y)
    this.fx.addChild(t)
    const target = this.stockings[r].position
    await tween(420, (k) => {
      t.x = lerp(p.x, target.x, k)
      t.y = lerp(p.y, target.y, k) - Math.sin(k * Math.PI) * 50
    }, ease.inOutCubic)
    t.destroy()
  }

  setTotal(text: string) {
    this.totalText.text = text
  }

  async wait(ms: number) {
    await wait(ms)
  }
}
