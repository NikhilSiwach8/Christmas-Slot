import { Container, Graphics, Sprite, Text } from "pixi.js"
import { badgeStyle } from "./board"
import { softDot, symbolTex } from "./textures"
import { ease, lerp, tween, wait } from "../util/tween"
import { sfx } from "../audio"

export type IntroKind = "bonus" | "super" | "hidden" | "sleigh" | "midnight"
export type MysteryOutcome = "coal" | "super" | "hidden"

const TITLES: Record<IntroKind, { title: string; sub: string; color: string }> = {
  bonus: { title: "STOCKING SPINS", sub: "Fill the stockings!", color: "#ffffff" },
  super: { title: "GOLDEN STOCKING SPINS", sub: "Every stocking starts at ×2", color: "#ffe27a" },
  hidden: { title: "KRAMPUSNACHT", sub: "Stockings MULTIPLY together", color: "#c9a8ff" },
  sleigh: { title: "SLEIGH RUN!", sub: "", color: "#ffffff" },
  midnight: { title: "MIDNIGHT RUN!", sub: "", color: "#ffe27a" },
}

/**
 * Code-driven intro "clips" (storyboards from docs/GDD.md §7.5).
 * These are animatics: final versions can be swapped for Spine/video with the same API.
 * Skippable after 1 s by clicking or pressing space.
 */
export class Intro extends Container {
  private w = 1280
  private h = 720
  private skipReady = false
  private skipped = false

  constructor() {
    super()
    this.visible = false
    this.eventMode = "static"
    this.on("pointertap", () => this.trySkip())
    window.addEventListener("keydown", (e) => {
      if (this.visible && e.code === "Space") this.trySkip()
    })
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
  }

  private trySkip() {
    if (!this.skipReady) return
    this.skipped = true
    this.skipResolve?.()
  }

  private skipResolve?: () => void

  /** Wait `ms` of real time, or until the player skips. */
  private hold(ms: number) {
    if (this.skipped) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer)
        this.skipResolve = undefined
        resolve()
      }
      const timer = setTimeout(done, ms)
      this.skipResolve = done
    })
  }

  private begin(dim = 0.75) {
    this.removeChildren().forEach((c) => c.destroy({ children: true }))
    this.visible = true
    this.skipped = false
    this.skipReady = false
    setTimeout(() => (this.skipReady = true), 1000)
    const bg = new Graphics().rect(0, 0, this.w, this.h).fill({ color: 0x07050d, alpha: dim })
    this.addChild(bg)
    return bg
  }

  private end() {
    this.visible = false
    this.removeChildren().forEach((c) => c.destroy({ children: true }))
  }

  private title(kind: IntroKind, y = 0.45) {
    const t = TITLES[kind]
    const title = new Text({ text: t.title, style: badgeStyle(t.color, Math.min(96, this.w / 11)) })
    title.anchor.set(0.5)
    title.position.set(this.w / 2, this.h * y)
    const sub = new Text({ text: t.sub, style: badgeStyle("#ffffff", Math.min(40, this.w / 26)) })
    sub.anchor.set(0.5)
    sub.position.set(this.w / 2, this.h * y + Math.min(80, this.w / 14))
    this.addChild(title, sub)
    return { title, sub }
  }

  /** Short fly-by used before Sleigh Run / Midnight Run. */
  async sleighRun(golden: boolean) {
    this.begin(0.25)
    sfx.sleigh()
    const sleigh = drawSleigh(golden)
    sleigh.position.set(-200, this.h * 0.25)
    this.addChild(sleigh)
    const { title, sub } = this.title(golden ? "midnight" : "sleigh", 0.5)
    sub.visible = false
    title.scale.set(0)
    await Promise.all([
      tween(1300, (t) => {
        sleigh.x = lerp(-200, this.w + 200, t)
        sleigh.y = this.h * 0.25 + Math.sin(t * Math.PI * 2) * 30
      }, ease.linear),
      tween(500, (t) => title.scale.set(t), ease.outBack),
    ])
    this.end()
  }

  /** Free-spins intro. */
  async freeSpins(kind: "bonus" | "super" | "hidden", spins: number) {
    const bg = this.begin(kind === "hidden" ? 0.92 : 0.7)
    if (kind === "hidden") {
      // the lights go out, eyes open in the dark, frost cracks
      sfx.naughty()
      const eyes = new Graphics()
      eyes.circle(-40, 0, 14).fill(0xffd34d).circle(40, 0, 14).fill(0xffd34d)
      eyes.position.set(this.w / 2, this.h * 0.3)
      eyes.scale.set(1, 0)
      this.addChild(eyes)
      await tween(700, (t) => eyes.scale.set(1, t), ease.outCubic)
      const frost = new Graphics()
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2
        frost.moveTo(this.w / 2, this.h / 2)
        let x = this.w / 2
        let y = this.h / 2
        for (let j = 0; j < 6; j++) {
          x += Math.cos(a + (Math.random() - 0.5)) * this.w * 0.08
          y += Math.sin(a + (Math.random() - 0.5)) * this.h * 0.08
          frost.lineTo(x, y)
        }
      }
      frost.stroke({ color: 0xbfe0ff, width: 3, alpha: 0.8 })
      frost.alpha = 0
      this.addChild(frost)
      tween(600, (t) => (frost.alpha = t))
    } else {
      // stockings drop onto their hooks; golden version adds rays
      if (kind === "super") {
        const rays = new Graphics()
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2
          rays.moveTo(0, 0).lineTo(Math.cos(a) * 2000, Math.sin(a) * 2000).lineTo(Math.cos(a + 0.1) * 2000, Math.sin(a + 0.1) * 2000).closePath()
        }
        rays.fill({ color: 0xffe27a, alpha: 0.12 })
        rays.position.set(this.w / 2, this.h * 0.45)
        this.addChildAt(rays, 1)
        tween(4000, (t) => (rays.rotation = t), ease.linear)
      }
      for (let i = 0; i < 5; i++) {
        const s = new Sprite(softDot)
        s.anchor.set(0.5)
        s.tint = kind === "super" ? 0xffe27a : 0xff5a5a
        s.scale.set(1.4)
        s.position.set(this.w * (0.2 + i * 0.15), -60)
        this.addChild(s)
        tween(500 + i * 90, (t) => (s.y = lerp(-60, this.h * 0.2, t)), ease.outBack)
      }
      sfx.win(true)
    }
    const { title, sub } = this.title(kind)
    sub.text = `${spins} FREE SPINS · ${TITLES[kind].sub}`
    title.scale.set(0)
    await tween(550, (t) => title.scale.set(t), ease.outBack)
    await this.hold(2200)
    await tween(250, (t) => (this.alpha = 1 - t))
    this.alpha = 1
    void bg
    this.end()
  }

  /** Giant present shakes, ribbon snaps, outcome revealed. */
  async mystery(outcome: MysteryOutcome) {
    this.begin(0.85)
    const gift = new Sprite(symbolTex.W)
    gift.anchor.set(0.5)
    gift.position.set(this.w / 2, this.h * 0.5)
    gift.scale.set(Math.min(this.w, this.h) / 380)
    this.addChild(gift)
    for (let i = 0; i < 3; i++) {
      sfx.thud()
      await tween(300, (t) => (gift.rotation = Math.sin(t * Math.PI * 4) * 0.08 * (i + 1)), ease.linear)
      await wait(180)
    }
    gift.rotation = 0
    const burst = new Sprite(softDot)
    burst.anchor.set(0.5)
    burst.position.copyFrom(gift.position)
    burst.blendMode = "add"
    burst.tint = outcome === "coal" ? 0x555555 : outcome === "super" ? 0xffe27a : 0x9b5cff
    this.addChild(burst)
    outcome === "coal" ? sfx.naughty() : sfx.win(true)
    await tween(500, (t) => {
      burst.scale.set(1 + t * 14)
      burst.alpha = 1 - t * 0.6
      gift.alpha = 1 - t
    })
    const label =
      outcome === "coal"
        ? { text: "COAL!", sub: "Krampus laughs… no feature this time.", color: "#b8b0c0" }
        : outcome === "super"
          ? { text: "GOLDEN STOCKING SPINS!", sub: "", color: "#ffe27a" }
          : { text: "KRAMPUSNACHT!", sub: "The hidden bonus", color: "#c9a8ff" }
    const t1 = new Text({ text: label.text, style: badgeStyle(label.color, Math.min(90, this.w / 12)) })
    t1.anchor.set(0.5)
    t1.position.set(this.w / 2, this.h * 0.45)
    const t2 = new Text({ text: label.sub, style: badgeStyle("#ffffff", Math.min(36, this.w / 28)) })
    t2.anchor.set(0.5)
    t2.position.set(this.w / 2, this.h * 0.45 + 80)
    this.addChild(t1, t2)
    t1.scale.set(0)
    await tween(450, (t) => t1.scale.set(t), ease.outBack)
    await this.hold(outcome === "coal" ? 1400 : 1000)
    this.end()
  }

  /** Big-win banner with count-up. Resolves when finished or skipped. */
  async bigWin(name: string, amount: number, format: (n: number) => string) {
    this.begin(0.6)
    sfx.win(true)
    const t1 = new Text({ text: name, style: badgeStyle("#ffe27a", Math.min(100, this.w / 10)) })
    t1.anchor.set(0.5)
    t1.position.set(this.w / 2, this.h * 0.38)
    const t2 = new Text({ text: format(0), style: badgeStyle("#ffffff", Math.min(80, this.w / 13)) })
    t2.anchor.set(0.5)
    t2.position.set(this.w / 2, this.h * 0.54)
    this.addChild(t1, t2)
    t1.scale.set(0)
    tween(500, (t) => t1.scale.set(t), ease.outBack)
    const dur = 2600
    const t0 = performance.now()
    const tick = setInterval(() => {
      t2.text = format(amount * ease.outCubic(Math.min(1, (performance.now() - t0) / dur)))
    }, 40)
    await this.hold(dur)
    clearInterval(tick)
    t2.text = format(amount)
    await this.hold(900)
    this.end()
  }
}

function drawSleigh(golden: boolean) {
  const c = new Container()
  const g = new Graphics()
  const body = golden ? 0xe2a83c : 0xc2283a
  // reindeer team (simple silhouettes)
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 70
    g.ellipse(x, 0, 26, 12).fill(0x6b4325).stroke({ color: 0x1d1424, width: 3 })
    g.circle(x + 26, -14, 9).fill(0x6b4325).stroke({ color: 0x1d1424, width: 3 })
    g.moveTo(x + 24, -22).lineTo(x + 18, -38).moveTo(x + 30, -22).lineTo(x + 36, -38).stroke({ color: 0xa5713f, width: 4 })
    if (i === 2) g.circle(x + 35, -12, 4).fill(0xe02f3d)
  }
  g.moveTo(0, 0).lineTo(100, 0).stroke({ color: 0xd9c7a3, width: 2 })
  // sleigh
  g.moveTo(-90, -30).lineTo(10, -30).quadraticCurveTo(30, -30, 30, -10).lineTo(30, 10).lineTo(-80, 10).quadraticCurveTo(-100, 0, -90, -30).fill(body).stroke({ color: 0x1d1424, width: 4 })
  g.moveTo(-95, 24).lineTo(30, 24).quadraticCurveTo(48, 24, 46, 10).stroke({ color: 0xf2c14e, width: 5 })
  // sack of gifts
  g.circle(-50, -44, 24).fill(0x8a5a2b).stroke({ color: 0x1d1424, width: 4 })
  g.rect(-30, -60, 22, 22).fill(0x2f8f57).stroke({ color: 0x1d1424, width: 3 })
  c.addChild(g)
  return c
}
