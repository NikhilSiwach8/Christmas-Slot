import { Assets, Graphics, Renderer, Texture } from "pixi.js"
import { FRAME, SYMBOL_IDS, SYMBOL_SVG, SymbolId, TIER } from "../art/symbols"

export const CELL = 128

export const symbolTex = {} as Record<SymbolId, Texture>
export const frameTex = {} as Record<SymbolId, Texture>
export let softDot: Texture
export let flake: Texture

function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Bevelled tile frame, coloured per tier. */
function drawFrame(id: SymbolId) {
  const c = FRAME[id]
  const tier = TIER[id]
  const g = new Graphics()
  const s = CELL
  const r = 18
  // outer dark rim
  g.roundRect(2, 2, s - 4, s - 4, r).fill(0x1d1424)
  // metal bevel
  const bevel = tier === "low" ? 0x4a3f55 : tier === "wild" ? 0xf2c14e : tier === "scatter" ? 0xe7e2d6 : 0xc9a24a
  g.roundRect(6, 6, s - 12, s - 12, r - 4).fill(bevel)
  g.roundRect(6, 6, s - 12, (s - 12) / 2, r - 4).fill({ color: 0xffffff, alpha: tier === "low" ? 0.06 : 0.22 })
  // inner face
  g.roundRect(12, 12, s - 24, s - 24, r - 8).fill(c.dark)
  g.roundRect(12, 12, s - 24, (s - 24) * 0.55, r - 8).fill({ color: c.base, alpha: 0.75 })
  // gem studs for premiums
  if (tier === "high" || tier === "wild") {
    for (const [x, y] of [
      [s / 2, 7],
      [s / 2, s - 7],
    ] as const) {
      g.circle(x, y, 6).fill(0x1d1424)
      g.circle(x, y, 4).fill(c.light)
    }
  }
  return g
}

function makeDot(renderer: Renderer, radius: number, soft: boolean) {
  const g = new Graphics()
  if (soft) {
    for (let i = 6; i >= 1; i--) g.circle(radius, radius, (radius * i) / 6).fill({ color: 0xffffff, alpha: 0.12 })
  } else {
    g.circle(radius, radius, radius).fill(0xffffff)
  }
  return renderer.generateTexture({ target: g, resolution: 2 })
}

export async function loadTextures(renderer: Renderer) {
  await Promise.all(
    SYMBOL_IDS.map(async (id) => {
      symbolTex[id] = await Assets.load<Texture>({
        src: svgUrl(SYMBOL_SVG[id]),
        loadParser: "loadSVG",
        data: { resolution: 2 },
      })
      frameTex[id] = renderer.generateTexture({ target: drawFrame(id), resolution: 2 })
    }),
  )
  softDot = makeDot(renderer, 24, true)
  flake = makeDot(renderer, 4, false)
}
