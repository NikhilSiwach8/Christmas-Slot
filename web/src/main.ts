import "@fontsource/lilita-one/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/700.css"
import "@fontsource/rubik/800.css"
import { Application, Container } from "pixi.js"
import { DisplayAmount } from "stake-engine"
import { Background } from "./game/background"
import { Board, BOARD_H, BOARD_W } from "./game/board"
import { Intro } from "./game/intro"
import { BookEvent, BookPlayer } from "./game/player"
import { loadTextures } from "./game/textures"
import { Hud } from "./ui/hud"
import { createClient, ensureSession } from "./rgs"
import { MODES, ModeId, WIN_TIERS } from "./rules"
import { clock } from "./util/tween"
import { sfx } from "./audio"

const API = 1_000_000

async function boot() {
  if (!(await ensureSession())) {
    if (!import.meta.env.DEV) document.body.innerHTML = `<p style="color:#fff;font:16px Rubik;padding:24px">Missing launch parameters.</p>`
    return
  }
  await document.fonts.load("40px 'Lilita One'")

  const client = createClient()
  const auth = await client.Authenticate()
  const cfg = auth.config
  const flags = auth.jurisdictionFlags
  const currency = auth.balance.currency

  // ---------- state ----------
  const levels = cfg.betLevels.length ? cfg.betLevels : [cfg.minBet]
  let betIndex = Math.max(0, levels.indexOf(cfg.defaultBetLevel))
  let balance = auth.balance.amount
  let active: ModeId = "base"
  let busy = false
  let auto = 0
  let turbo = false

  const money = (major: number) => DisplayAmount({ amount: Math.round(major * API), currency })
  const bet = () => levels[betIndex] / API

  // ---------- scene ----------
  const app = new Application()
  const stage = document.getElementById("stage")!
  await app.init({ resizeTo: stage, antialias: true, background: 0x0b0912, resolution: Math.min(2, devicePixelRatio), autoDensity: true })
  stage.appendChild(app.canvas)
  await loadTextures(app.renderer)

  const bg = new Background()
  const board = new Board()
  const intro = new Intro()
  const world = new Container()
  world.addChild(board)
  app.stage.addChild(bg, world, intro)

  const layout = () => {
    const w = app.screen.width
    const h = app.screen.height
    bg.resize(w, h)
    intro.resize(w, h)
    const mobile = w < 760
    const hudH = mobile ? 150 : 120
    const availH = h - hudH - 30
    const needH = BOARD_H + 240 // stockings above + total text below
    const s = Math.min((w - 24) / (BOARD_W + 60), availH / needH, 1.25)
    board.scale.set(s)
    board.position.set((w - BOARD_W * s) / 2, 16 + 160 * s + Math.max(0, (availH - needH * s) / 2))
  }
  app.renderer.on("resize", layout)
  layout()

  // ---------- HUD ----------
  const hud = new Hud({
    spin: () => onSpin(),
    stopAuto: () => (auto = 0),
    startAuto: (n) => {
      auto = n
      void loop()
    },
    toggleTurbo: () => {
      turbo = !turbo
      clock.speed = turbo ? 2.2 : 1
      return turbo
    },
    setBetIndex: (i) => {
      betIndex = Math.max(0, Math.min(levels.length - 1, i))
      refresh()
    },
    activate: (m) => {
      active = m ?? "base"
      bg.setScene(active === "ante" ? "ante" : "base")
      refresh()
    },
    buy: (m) => void play(m),
    money,
    betAmount: bet,
    balanceAmount: () => balance / API,
    activeMode: () => active,
    levels: () => levels,
    betIndex: () => betIndex,
    disabled: () => ({
      autoplay: !!flags?.disabledAutoplay,
      turbo: !!flags?.disabledTurbo,
      buy: !!flags?.disabledBuyFeature,
      rtp: !flags?.displayRTP,
    }),
  })
  hud.initBets()

  const refresh = () => {
    const m = MODES[active]
    hud.setBalance(money(balance / API))
    hud.setBet(m.cost > 1 ? `${money(bet() * m.cost)}` : money(bet()), betIndex, levels.length)
    hud.setMode(active === "base" ? "" : `${m.name.toUpperCase()} ACTIVE`)
    hud.setBusy(busy, auto)
  }
  refresh()

  const player = new BookPlayer(
    board,
    bg,
    intro,
    {
      onWin: (x) => hud.setWin(x > 0 ? money(x * bet()) : ""),
      onFreeSpins: (info) => hud.setFs(info ? `FREE SPINS LEFT: ${info.remaining}` : ""),
      formatX: (x) => money(x * bet()),
    },
    () => (active === "ante" ? "ante" : "base"),
  )

  // ---------- round ----------
  async function play(mode: ModeId): Promise<boolean> {
    if (busy) return false
    const cost = MODES[mode].cost
    if (balance < levels[betIndex] * cost) {
      hud.toast("Insufficient balance")
      auto = 0
      refresh()
      return false
    }
    busy = true
    hud.setWin("")
    refresh()
    let triggeredFeature = false
    try {
      const res = await client.Play({ amount: levels[betIndex], mode })
      balance = res.balance.amount
      hud.setBalance(money(balance / API))
      const events = (res.round.state ?? []) as BookEvent[]
      triggeredFeature = events.some((e) => e.type === "freeSpinsStart" || e.type === "mysteryReveal")
      const payoutX = res.round.payoutMultiplier ?? 0
      await player.play(events, 1)
      // Celebrate relative to what the player paid, so a win below the mode cost is never dressed up as a big win.
      const tier = WIN_TIERS.find((t) => payoutX / cost >= t.min)
      if (tier) await intro.bigWin(tier.name, payoutX * bet(), money)
      hud.setWin(payoutX > 0 ? money(payoutX * bet()) : "")
      if (res.round.active) {
        const end = await client.EndRound()
        balance = end.balance.amount
      }
    } catch (err) {
      console.warn(err)
      hud.toast("Connection problem, please try again")
      auto = 0
    } finally {
      busy = false
      refresh()
    }
    return triggeredFeature
  }

  async function loop() {
    refresh()
    while (auto > 0) {
      auto--
      const feature = await play(active)
      if (feature) auto = 0
      if (auto > 0) await new Promise((r) => setTimeout(r, 250))
    }
    refresh()
  }

  function onSpin() {
    if (auto > 0) {
      auto = 0
      refresh()
      return
    }
    void play(active)
  }

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || flags?.disabledSpacebar || hud.anyModalOpen || intro.visible) return
    e.preventDefault()
    sfx.unlock()
    onSpin()
  })
}

boot().catch((e) => {
  console.error(e)
  document.body.insertAdjacentHTML("beforeend", `<p style="position:fixed;top:8px;left:8px;color:#fff;font:14px sans-serif">Could not start the game.</p>`)
})
