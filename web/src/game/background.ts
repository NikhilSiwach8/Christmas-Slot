import { Container, FillGradient, Graphics, Sprite, Ticker } from "pixi.js"
import { flake, softDot } from "./textures"

export type SceneId = "base" | "ante" | "bonus" | "super" | "hidden"

interface Palette {
  skyTop: number
  skyBottom: number
  aurora: number
  far: number
  mid: number
  near: number
  window: number
  snow: number
  snowAmount: number
  wind: number
  dust?: number
}

const PALETTES: Record<SceneId, Palette> = {
  base: { skyTop: 0x141a44, skyBottom: 0xd9785a, aurora: 0x58e0b0, far: 0x3a3366, mid: 0x29234a, near: 0x1b1630, window: 0xffc96b, snow: 0xffffff, snowAmount: 160, wind: 0.25 },
  ante: { skyTop: 0x120c2e, skyBottom: 0x6a3d8c, aurora: 0xb06bff, far: 0x2f2550, mid: 0x221a3d, near: 0x150f26, window: 0xff7a3d, snow: 0xe6dcff, snowAmount: 180, wind: 0.35 },
  bonus: { skyTop: 0x2a120c, skyBottom: 0xc9612c, aurora: 0xffb35c, far: 0x4a2418, mid: 0x351a12, near: 0x22100b, window: 0xffe08a, snow: 0xfff2dc, snowAmount: 120, wind: 0.15, dust: 0xffc070 },
  super: { skyTop: 0x22170a, skyBottom: 0xe2a83c, aurora: 0xfff0a0, far: 0x50391a, mid: 0x3a2812, near: 0x24180a, window: 0xfff4c0, snow: 0xfff6d8, snowAmount: 120, wind: 0.15, dust: 0xffe27a },
  hidden: { skyTop: 0x06070f, skyBottom: 0x2e3a5c, aurora: 0x6f86c9, far: 0x1c2236, mid: 0x141a2b, near: 0x0b0f1c, window: 0x7ab8ff, snow: 0xdfe9ff, snowAmount: 420, wind: 2.2 },
}

interface Flake {
  s: Sprite
  depth: number
  vx: number
  vy: number
  phase: number
}

/** Layered, always-moving winter scene. Purely decorative: never shows game info. */
export class Background extends Container {
  private sky = new Graphics()
  private stars = new Container()
  private aurora = new Graphics()
  private moon = new Graphics()
  private layers: { c: Container; g: Graphics; speed: number; windows: Graphics[] }[] = []
  private smoke = new Container()
  private snow = new Container()
  private dust = new Container()
  private krampus = new Graphics()
  private flash = new Graphics()
  private flakes: Flake[] = []
  private smokePuffs: { s: Sprite; life: number; x: number; y: number }[] = []
  private chimneys: { layer: number; x: number; y: number }[] = []
  private w = 1280
  private h = 720
  private t = 0
  private scene: SceneId = "base"
  private nextKrampus = 12
  private nextLightning = 6

  constructor() {
    super()
    this.addChild(this.sky, this.stars, this.moon, this.aurora)
    for (let i = 0; i < 3; i++) {
      const c = new Container()
      const g = new Graphics()
      c.addChild(g)
      this.layers.push({ c, g, speed: [4, 9, 16][i], windows: [] })
      this.addChild(c)
      if (i === 1) this.addChild(this.krampus)
    }
    this.addChild(this.smoke, this.dust, this.snow, this.flash)
    this.krampus.visible = false
    Ticker.shared.add((t) => this.update(t.deltaMS / 1000))
  }

  setScene(id: SceneId) {
    this.scene = id
    this.draw()
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.draw()
  }

  private get p() {
    return PALETTES[this.scene]
  }

  private draw() {
    const { w, h, p } = this
    // sky
    const grad = new FillGradient(0, 0, 0, h)
    grad.addColorStop(0, p.skyTop)
    grad.addColorStop(1, p.skyBottom)
    this.sky.clear().rect(0, 0, w, h).fill(grad)

    // stars
    this.stars.removeChildren()
    const rnd = mulberry(7)
    for (let i = 0; i < 90; i++) {
      const s = new Sprite(flake)
      s.anchor.set(0.5)
      s.position.set(rnd() * w, rnd() * h * 0.5)
      s.scale.set(0.15 + rnd() * 0.3)
      s.alpha = 0.3 + rnd() * 0.6
      ;(s as any).tw = rnd() * 6
      this.stars.addChild(s)
    }

    // moon
    this.moon.clear()
    const mx = w * 0.78
    const my = h * 0.17
    const mr = Math.min(w, h) * 0.07
    for (let i = 5; i >= 1; i--) this.moon.circle(mx, my, mr * (1 + i * 0.35)).fill({ color: 0xfff6d8, alpha: 0.04 })
    this.moon.circle(mx, my, mr).fill(this.scene === "hidden" ? 0xbfd0ff : 0xfff3d0)
    this.moon.circle(mx + mr * 0.3, my - mr * 0.2, mr * 0.18).fill({ color: 0x000000, alpha: 0.07 })

    // rooftop layers (drawn twice as wide so they can scroll seamlessly)
    this.chimneys = []
    this.layers.forEach((layer, li) => {
      const g = layer.g.clear()
      layer.windows.forEach((wg) => wg.destroy())
      layer.windows = []
      const color = [p.far, p.mid, p.near][li]
      const base = h * [0.62, 0.72, 0.84][li]
      const scale = [0.6, 0.85, 1.2][li]
      const r = mulberry(31 + li * 17)
      const span = w * 2
      g.rect(0, base, span, h - base).fill(color)
      let x = -40
      while (x < span) {
        const bw = (60 + r() * 90) * scale
        const bh = (50 + r() * 80) * scale
        const roof = bh * (0.35 + r() * 0.25)
        const top = base - bh
        g.moveTo(x, base).lineTo(x, top).lineTo(x + bw / 2, top - roof).lineTo(x + bw, top).lineTo(x + bw, base).closePath().fill(color)
        // snow cap
        g.moveTo(x - 4, top + 2).lineTo(x + bw / 2, top - roof - 3).lineTo(x + bw + 4, top + 2).lineTo(x + bw / 2, top - roof + 8).closePath().fill({ color: 0xeaf2ff, alpha: li === 0 ? 0.35 : 0.8 })
        // chimney
        if (r() > 0.4) {
          const cx = x + bw * (0.65 + r() * 0.15)
          const cy = top - roof * 0.45
          g.rect(cx, cy - 18 * scale, 12 * scale, 26 * scale).fill(color)
          this.chimneys.push({ layer: li, x: cx + 6 * scale, y: cy - 18 * scale })
        }
        // windows
        if (li > 0) {
          const rows = Math.max(1, Math.floor(bh / (30 * scale)))
          for (let ry = 0; ry < rows; ry++) {
            for (let cx = 0; cx < 2; cx++) {
              if (r() < 0.35) continue
              const wg = new Graphics()
              const ww = 12 * scale
              const wh = 16 * scale
              const wx = x + bw * (0.25 + cx * 0.4)
              const wy = top + 10 * scale + ry * 28 * scale
              wg.roundRect(wx - 3, wy - 3, ww + 6, wh + 6, 3).fill({ color: p.window, alpha: 0.18 })
              wg.rect(wx, wy, ww, wh).fill(p.window)
              wg.rect(wx + ww / 2 - 1, wy, 2, wh).fill(color)
              ;(wg as any).flick = r() * 10
              layer.c.addChild(wg)
              layer.windows.push(wg)
            }
          }
        }
        x += bw + (10 + r() * 40) * scale
      }
    })

    // Krampus silhouette (base/ante leap across rooftops, giant in hidden)
    this.krampus.clear()
    drawKrampus(this.krampus, this.scene === "hidden" ? 0x020308 : p.near)

    this.flash.clear().rect(0, 0, w, h).fill(0xdfe9ff)
    this.flash.alpha = 0

    this.resetSnow()
    this.resetDust()
  }

  private resetSnow() {
    const { p } = this
    this.snow.removeChildren()
    this.flakes = []
    for (let i = 0; i < p.snowAmount; i++) {
      const depth = Math.random()
      const s = new Sprite(flake)
      s.anchor.set(0.5)
      s.tint = p.snow
      s.scale.set(0.25 + depth * 0.9)
      s.alpha = 0.35 + depth * 0.6
      s.position.set(Math.random() * this.w, Math.random() * this.h)
      this.snow.addChild(s)
      this.flakes.push({ s, depth, vx: 0, vy: 30 + depth * 70, phase: Math.random() * 6 })
    }
  }

  private resetDust() {
    this.dust.removeChildren()
    const c = this.p.dust
    if (!c) return
    for (let i = 0; i < 40; i++) {
      const s = new Sprite(softDot)
      s.anchor.set(0.5)
      s.tint = c
      s.blendMode = "add"
      s.scale.set(0.15 + Math.random() * 0.35)
      s.position.set(Math.random() * this.w, Math.random() * this.h)
      ;(s as any).ph = Math.random() * 6
      this.dust.addChild(s)
    }
  }

  private update(dt: number) {
    this.t += dt
    const { w, h, p, t } = this

    for (const s of this.stars.children as any[]) s.alpha = 0.35 + 0.35 * Math.sin(t * 1.5 + s.tw)

    // aurora ribbons
    const a = this.aurora.clear()
    for (let band = 0; band < 3; band++) {
      const y0 = h * (0.12 + band * 0.07)
      a.moveTo(0, y0)
      for (let x = 0; x <= w; x += 24) {
        a.lineTo(x, y0 + Math.sin(x * 0.004 + t * 0.35 + band) * 26 + Math.sin(x * 0.011 - t * 0.6) * 9)
      }
      a.lineTo(w, y0 + 70).lineTo(0, y0 + 70).closePath()
      a.fill({ color: p.aurora, alpha: 0.05 + 0.03 * Math.sin(t * 0.5 + band * 2) })
    }

    // parallax drift
    for (const layer of this.layers) {
      layer.c.x = -((t * layer.speed) % w)
      for (const wg of layer.windows as any[]) {
        wg.alpha = 0.75 + 0.25 * Math.sin(t * 3 + wg.flick) * Math.sin(t * 1.3 + wg.flick * 2)
      }
    }

    // chimney smoke
    if (Math.random() < dt * 6 && this.chimneys.length) {
      const c = this.chimneys[Math.floor(Math.random() * this.chimneys.length)]
      const layer = this.layers[c.layer]
      const s = new Sprite(softDot)
      s.anchor.set(0.5)
      s.alpha = 0
      s.tint = 0xc9cfe0
      this.smoke.addChild(s)
      this.smokePuffs.push({ s, life: 0, x: c.x + layer.c.x, y: c.y })
    }
    for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
      const pf = this.smokePuffs[i]
      pf.life += dt
      const k = pf.life / 5
      pf.s.position.set(pf.x + k * 60 * (1 + p.wind), pf.y - k * 90)
      pf.s.scale.set(0.3 + k * 1.4)
      pf.s.alpha = Math.sin(Math.PI * Math.min(1, k)) * 0.25
      if (k >= 1) {
        pf.s.destroy()
        this.smokePuffs.splice(i, 1)
      }
    }

    // snowfall
    for (const f of this.flakes) {
      f.phase += dt
      f.s.x += (Math.sin(f.phase * 1.2) * 12 + p.wind * 60 * (0.5 + f.depth)) * dt
      f.s.y += f.vy * dt * (this.scene === "hidden" ? 1.8 : 1)
      if (f.s.y > h + 10) {
        f.s.y = -10
        f.s.x = Math.random() * w
      }
      if (f.s.x > w + 10) f.s.x = -10
      if (f.s.x < -10) f.s.x = w + 10
    }

    for (const s of this.dust.children as any[]) {
      s.ph += dt
      s.y -= dt * 12
      s.x += Math.sin(s.ph) * 0.3
      s.alpha = 0.4 + 0.4 * Math.sin(s.ph * 2)
      if (s.y < -10) s.y = h + 10
    }

    this.updateKrampus(dt)
    this.updateLightning(dt)
  }

  private updateKrampus(dt: number) {
    const k = this.krampus
    if (this.scene === "hidden") {
      // A huge, slowly breathing silhouette behind the town.
      k.visible = true
      k.scale.set((this.h / 260) * (1 + 0.01 * Math.sin(this.t)))
      k.position.set(this.w * 0.22, this.h * 0.72)
      k.alpha = 0.85
      return
    }
    if (this.scene !== "base" && this.scene !== "ante") {
      k.visible = false
      return
    }
    this.nextKrampus -= dt
    if (this.nextKrampus > 0 && !k.visible) return
    if (!k.visible) {
      k.visible = true
      ;(k as any).p = 0
      k.scale.set(this.h / 2200)
      k.alpha = 1
    }
    const kk = k as any
    kk.p += dt / 3.2
    const x = -60 + kk.p * (this.w + 120)
    const hop = Math.abs(Math.sin(kk.p * Math.PI * 4)) * this.h * 0.06
    k.position.set(x, this.h * 0.64 - hop)
    if (kk.p >= 1) {
      k.visible = false
      this.nextKrampus = 18 + Math.random() * 20
    }
  }

  private updateLightning(dt: number) {
    if (this.scene !== "hidden") {
      this.flash.alpha = 0
      return
    }
    this.nextLightning -= dt
    if (this.nextLightning <= 0) {
      this.flash.alpha = 0.55
      this.nextLightning = 5 + Math.random() * 7
    }
    this.flash.alpha = Math.max(0, this.flash.alpha - dt * 2.5)
  }
}

function drawKrampus(g: Graphics, color: number) {
  // Simple hunched silhouette with curled horns, chain and switch; origin at feet.
  g.moveTo(-40, 0)
    .lineTo(-30, -60)
    .lineTo(-55, -110)
    .lineTo(-35, -170)
    .lineTo(-10, -190)
    .lineTo(-30, -230)
    .lineTo(-60, -235)
    .lineTo(-35, -255)
    .lineTo(-5, -240)
    .lineTo(10, -215)
    .lineTo(25, -240)
    .lineTo(55, -255)
    .lineTo(80, -235)
    .lineTo(50, -230)
    .lineTo(35, -195)
    .lineTo(55, -170)
    .lineTo(80, -120)
    .lineTo(110, -140)
    .lineTo(118, -130)
    .lineTo(85, -100)
    .lineTo(60, -60)
    .lineTo(45, 0)
    .closePath()
    .fill(color)
  g.circle(0, -205, 3).fill(0xffd34d)
  g.circle(22, -205, 3).fill(0xffd34d)
}

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
