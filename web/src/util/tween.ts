import { Ticker } from "pixi.js"

export type Ease = (t: number) => number

export const ease = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inCubic: (t: number) => t * t * t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  outElastic: (t: number) =>
    t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
}

/** Global time scale. Turbo sets this > 1. */
export const clock = { speed: 1 }

/** Animate `fn(progress)` over `ms` (scaled by clock.speed). Resolves when done. */
export function tween(ms: number, fn: (t: number) => void, e: Ease = ease.outCubic): Promise<void> {
  return new Promise((resolve) => {
    const dur = Math.max(1, ms / clock.speed)
    let elapsed = 0
    const tick = (t: Ticker) => {
      elapsed += t.deltaMS
      const p = Math.min(1, elapsed / dur)
      fn(e(p))
      if (p >= 1) {
        Ticker.shared.remove(tick)
        resolve()
      }
    }
    Ticker.shared.add(tick)
  })
}

export const wait = (ms: number) => tween(ms, () => {})

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Cancellable skip signal for long sequences (intros, count-ups). */
export class SkipSignal {
  skipped = false
  skip() {
    this.skipped = true
  }
}
