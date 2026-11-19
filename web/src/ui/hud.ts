import "./hud.css"
import { cardArt, icon } from "./icons"
import { MAX_WIN_X, MENU_ORDER, MODES, ModeId, PAYLINES, PAYTABLE, RTP } from "../rules"
import { NAMES, SYMBOL_SVG, SymbolId } from "../art/symbols"
import { sfx } from "../audio"

export interface HudController {
  spin(): void
  stopAuto(): void
  startAuto(count: number): void
  toggleTurbo(): boolean
  setBetIndex(i: number): void
  activate(mode: ModeId | null): void
  buy(mode: ModeId): void
  money(amount: number): string
  betAmount(): number
  balanceAmount(): number
  activeMode(): ModeId
  levels(): number[]
  betIndex(): number
  disabled(): { autoplay: boolean; turbo: boolean; buy: boolean; rtp: boolean }
}

const $ = <T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T
const hex = (cls: string, svg: string, label: string, id = "") =>
  `<button class="hex ${cls}" ${id ? `id="${id}"` : ""} aria-label="${label}"><span class="in"></span>${svg}</button>`
const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

export class Hud {
  private root: HTMLElement
  private betSlider!: Slider
  private menuOpen = false

  constructor(private c: HudController) {
    this.root = document.createElement("div")
    this.root.id = "hud"
    this.root.innerHTML = `
      <div class="bar">
        <div class="left">
          ${hex("light menu-btn", icon.menu, "Menu", "menuBtn")}
          <div class="hex amber logo" aria-hidden="true"><span class="in"></span>${icon.emblem}</div>
          <div class="field"><span class="tab">BALANCE</span><span class="val" id="balance">—</span></div>
        </div>
        <div class="center">
          <div class="mode-chip" id="modeChip"></div>
          <div class="win" id="win"></div>
          <div class="fsinfo" id="fsinfo"></div>
          <div class="slider" id="betSlider"><div class="track"></div><div class="fill"></div><div class="thumb"></div></div>
        </div>
        <div class="right">
          <div class="field r"><span class="tab">BET</span><span class="val" id="bet">—</span>
            <div class="pm"><button id="minus" aria-label="Decrease bet">−</button><button id="plus" aria-label="Increase bet">+</button></div>
          </div>
          ${hex("light spin", icon.spin, "Spin (Space)", "spinBtn")}
          <div class="stack">
            ${hex("light", icon.gift, "Feature menu", "featBtn")}
            ${hex("light", icon.auto, "Autoplay", "autoBtn")}
            ${hex("light", icon.turbo, "Turbo", "turboBtn")}
          </div>
        </div>
      </div>

      <div class="pop" id="pop">
        <button class="row" id="infoBtn">${icon.info}<span>INFO</span></button>
        <button class="row" id="shareBtn">${icon.share}<span>SHARE</span></button>
        <button class="row" id="muteBtn">${icon.sound}<span>SOUND ON</span></button>
        <div class="vol">${icon.music}<div class="slider" id="musicVol"><div class="track"></div><div class="fill"></div><div class="thumb"></div></div></div>
        <div class="vol">${icon.sound}<div class="slider" id="sfxVol"><div class="track"></div><div class="fill"></div><div class="thumb"></div></div></div>
      </div>

      <div class="modal" id="featModal"><button class="x" data-close>${icon.close}</button>
        <div class="features"><div class="cards" id="cards"></div>
          <div class="feat-foot">
            <div class="field"><span class="tab">BALANCE</span><span class="val" id="fBalance"></span></div>
            <div class="betbox"><div><b>BET</b><span id="fBet"></span></div>
              <div class="slider" id="fBetSlider"><div class="track"></div><div class="fill"></div><div class="thumb"></div></div></div>
          </div>
        </div>
      </div>

      <div class="modal" id="confirmModal"><div class="dialog">
        <h2 id="confirmTitle"></h2><p id="confirmText"></p>
        <div class="btns"><button class="cta grey" data-close>CANCEL</button><button class="cta gold" id="confirmOk">CONFIRM</button></div>
      </div></div>

      <div class="modal" id="autoModal"><div class="dialog">
        <h2>AUTOPLAY</h2><p>Choose the number of spins. Autoplay stops on any feature or when you press stop.</p>
        <div class="opts" id="autoOpts">${[10, 25, 50, 100].map((n, i) => `<button data-n="${n}" class="${i === 0 ? "sel" : ""}">${n}</button>`).join("")}</div>
        <div class="btns"><button class="cta grey" data-close>CANCEL</button><button class="cta gold" id="autoOk">START</button></div>
      </div></div>

      <div class="modal" id="infoModal"><button class="x" data-close>${icon.close}</button><div class="info" id="infoBody"></div></div>
      <div class="toast" id="toast"></div>
    `
    document.body.appendChild(this.root)
    this.wire()
  }

  private wire() {
    const r = this.root
    $(r, "#spinBtn").onclick = () => {
      sfx.unlock()
      this.c.spin()
    }
    $(r, "#menuBtn").onclick = () => this.toggleMenu()
    $(r, "#minus").onclick = () => this.c.setBetIndex(this.c.betIndex() - 1)
    $(r, "#plus").onclick = () => this.c.setBetIndex(this.c.betIndex() + 1)
    $(r, "#featBtn").onclick = () => this.openFeatures()
    $(r, "#autoBtn").onclick = () => this.openModal("autoModal")
    $(r, "#turboBtn").onclick = () => $(r, "#turboBtn").classList.toggle("on", this.c.toggleTurbo())
    $(r, "#infoBtn").onclick = () => {
      this.toggleMenu(false)
      this.openInfo()
    }
    $(r, "#shareBtn").onclick = async () => {
      this.toggleMenu(false)
      try {
        await navigator.clipboard.writeText(location.origin + location.pathname)
        this.toast("Game link copied")
      } catch {
        this.toast("Sharing is not available here")
      }
    }
    $(r, "#muteBtn").onclick = () => {
      sfx.unlock()
      sfx.setMuted(!sfx.muted)
      $(r, "#muteBtn").innerHTML = `${sfx.muted ? icon.mute : icon.sound}<span>${sfx.muted ? "SOUND OFF" : "SOUND ON"}</span>`
    }
    new Slider($(r, "#musicVol"), 20, (i) => sfx.setMusic(i / 20)).set(Math.round(sfx.musicVolume * 20))
    new Slider($(r, "#sfxVol"), 20, (i) => sfx.setSfx(i / 20)).set(Math.round(sfx.sfxVolume * 20))

    r.querySelectorAll<HTMLElement>("[data-close]").forEach((b) => (b.onclick = () => this.closeModals()))
    r.querySelectorAll<HTMLElement>(".modal").forEach((m) =>
      m.addEventListener("click", (e) => {
        if (e.target === m) this.closeModals()
      }),
    )
    const opts = $(r, "#autoOpts")
    opts.onclick = (e) => {
      const b = (e.target as HTMLElement).closest("button")
      if (!b) return
      opts.querySelectorAll("button").forEach((x) => x.classList.toggle("sel", x === b))
    }
    $(r, "#autoOk").onclick = () => {
      const n = Number(opts.querySelector<HTMLElement>(".sel")?.dataset.n ?? 10)
      this.closeModals()
      sfx.unlock()
      this.c.startAuto(n)
    }
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape") this.closeModals()
    })
  }

  /** Build bet sliders once bet levels are known. */
  initBets() {
    const n = this.c.levels().length
    this.betSlider = new Slider($(this.root, "#betSlider"), n - 1, (i) => this.c.setBetIndex(i))
    new Slider($(this.root, "#fBetSlider"), n - 1, (i) => {
      this.c.setBetIndex(i)
      this.renderCards()
    })
  }

  private toggleMenu(force?: boolean) {
    this.menuOpen = force ?? !this.menuOpen
    $(this.root, "#pop").classList.toggle("open", this.menuOpen)
    const btn = $(this.root, "#menuBtn")
    btn.innerHTML = `<span class="in"></span>${this.menuOpen ? `<span style="color:var(--amber);width:34%;display:grid">${icon.close}</span>` : icon.menu}`
  }

  get anyModalOpen() {
    return !!this.root.querySelector(".modal.open")
  }

  private openModal(id: string) {
    this.closeModals()
    $(this.root, `#${id}`).classList.add("open")
  }

  closeModals() {
    this.root.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"))
  }

  toast(msg: string) {
    const t = $(this.root, "#toast")
    t.textContent = msg
    t.classList.add("on")
    setTimeout(() => t.classList.remove("on"), 1800)
  }

  // ---------- feature menu ----------
  openFeatures() {
    if (this.c.disabled().buy) {
      this.toast("Feature purchases are not available in your region")
      return
    }
    this.renderCards()
    this.openModal("featModal")
  }

  private renderCards() {
    const bet = this.c.betAmount()
    const active = this.c.activeMode()
    $(this.root, "#cards").innerHTML = MENU_ORDER.map((id) => {
      const m = MODES[id]
      const isBuy = m.kind === "buy"
      const on = active === id
      const stars = Array.from({ length: 5 }, (_, i) => icon.star.replace("<svg", `<svg class="${i < m.stars ? "on" : ""}"`)).join("")
      return `<div class="card">
        <div class="art">${cardArt[m.icon]}</div>
        <div class="crystal"></div>
        <h3>${m.name.toUpperCase()}</h3>
        <div class="stars ${isBuy ? "buy" : "act"}">${stars}</div>
        <p>${m.blurb}</p>
        <div class="price">${this.c.money(bet * m.cost)}</div>
        <button class="cta ${isBuy ? "gold" : on ? "active" : "blue"}" data-mode="${id}">${isBuy ? "BUY" : on ? "DEACTIVATE" : "ACTIVATE"}</button>
      </div>`
    }).join("")
    $(this.root, "#fBalance").textContent = this.c.money(this.c.balanceAmount())
    $(this.root, "#fBet").textContent = this.c.money(bet)
    this.root.querySelectorAll<HTMLElement>("#cards .cta").forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.mode as ModeId
        const m = MODES[id]
        if (m.kind === "activate") {
          this.c.activate(this.c.activeMode() === id ? null : id)
          this.closeModals()
          return
        }
        this.confirm(`BUY ${m.name.toUpperCase()}?`, `${m.blurb} Cost: ${this.c.money(bet * m.cost)}.`, () => this.c.buy(id))
      }
    })
  }

  confirm(title: string, text: string, ok: () => void) {
    $(this.root, "#confirmTitle").textContent = title
    $(this.root, "#confirmText").textContent = text
    $(this.root, "#confirmOk").onclick = () => {
      this.closeModals()
      sfx.unlock()
      ok()
    }
    this.openModal("confirmModal")
  }

  // ---------- info / rules ----------
  private openInfo() {
    const bet = this.c.betAmount()
    const showRtp = true // Stake requires RTP per mode in the rules
    const pay = PAYTABLE.map((p) => {
      const id = p.id as SymbolId
      return `<div><img alt="" src="${svgUrl(SYMBOL_SVG[id])}"><span><b>${NAMES[id]}</b>
        <small>5 · ${this.c.money(p.pays[2] * bet)}</small><small>4 · ${this.c.money(p.pays[1] * bet)}</small><small>3 · ${this.c.money(p.pays[0] * bet)}</small></span></div>`
    }).join("")
    const modes = (Object.values(MODES) as (typeof MODES)[ModeId][])
      .map((m) => `<tr><td>${m.name}</td><td>${m.cost}× (${this.c.money(m.cost * bet)})</td>${showRtp ? `<td>${RTP.toFixed(2)}%</td>` : ""}<td>${MAX_WIN_X.toLocaleString("en-US")}×</td></tr>`)
      .join("")
    const lines = PAYLINES.map(
      (l, i) =>
        `<svg viewBox="0 0 50 40" width="60" height="48" aria-label="Line ${i + 1}"><rect width="50" height="40" fill="#26252c"/><polyline points="${l.map((row, r) => `${5 + r * 10},${5 + row * 10}`).join(" ")}" fill="none" stroke="#f5b342" stroke-width="3"/><text x="2" y="38" font-size="8" fill="#8e8c96">${i + 1}</text></svg>`,
    ).join("")
    $(this.root, "#infoBody").innerHTML = `
      <h2>Claus &amp; Krampus</h2>
      <p>5 reels × 4 rows, 20 fixed paylines paying left to right from the leftmost reel, 3 or more of a kind. Only the highest win per line is paid. Wins on different lines are added. Maximum win is <b>${MAX_WIN_X.toLocaleString("en-US")}× bet</b> in every mode; a round ends immediately when it is reached.</p>
      <h2>Paytable (current bet ${this.c.money(bet)})</h2><div class="pay">${pay}</div>
      <h2>Gift Wilds</h2>
      <p>Gift Wilds substitute for all symbols except the Sleigh Bell. Before wins are counted every gift is unwrapped:</p>
      <ul><li><b>Nice</b> (gold ribbon): a Multiplier Wild. Base game and Ante ×2, ×3 or ×5; Sleigh Run Spins ×2, ×3, ×5 or ×10; Midnight Run Spins ×2, ×3, ×5, ×10 or ×25. Several multiplier wilds on one winning line multiply together.</li>
      <li><b>Naughty</b> (black ribbon): a Krampus Chain Wild. It turns 1–3 neighbouring cells (up, down, left, right; never a Sleigh Bell) into ×1 wilds.</li></ul>
      <p><b>Sleigh Run:</b> on a random base or Ante spin, Santa's sleigh drops 3–6 Gift Wilds on the reels before they are unwrapped.</p>
      <h2>Free Spins</h2>
      <p>3 Sleigh Bells award <b>Stocking Spins</b> (10 spins). 4 award <b>Golden Stocking Spins</b> (12 spins). 5 award the hidden <b>KRAMPUSNACHT</b> (10 spins). During free spins 2 Bells add +2 spins and 3 or more add +4.</p>
      <ul><li>A stocking hangs above each reel. Every Nice gift adds its value (+2, +3, +5 or +10) to the stocking of its reel; every chained cell adds +1 to the stocking of its reel. Stockings never reset during the feature.</li>
      <li>A line win is multiplied by the <b>sum</b> of the stockings over the reels the win covers (at least ×1).</li>
      <li>Stocking Spins: stockings start at ×1.</li>
      <li>Golden Stocking Spins: stockings start at ×2, and chained wilds stay in place for the rest of the feature.</li>
      <li>KRAMPUSNACHT: stockings start at ×1, Nice gifts add +1, +2 or +3, chained wilds stay in place, Krampus adds +1 to a random stocking every spin, and the stockings over a win are <b>multiplied together</b>.</li></ul>
      <h2>Bet Modes</h2>
      <table><tr><th>Mode</th><th>Cost</th>${showRtp ? "<th>RTP</th>" : ""}<th>Max win</th></tr>${modes}</table>
      <ul>${MENU_ORDER.map((id) => `<li><b>${MODES[id].name}</b>: ${MODES[id].blurb}</li>`).join("")}</ul>
      <p>Naughty List Ante, Sleigh Run Spins and Midnight Run Spins stay active for every spin until you deactivate them. No free spins can be triggered during Sleigh Run Spins or Midnight Run Spins.</p>
      <h2>Paylines</h2><div>${lines}</div>
      <h2>How to play</h2>
      <ul><li>☰ opens settings: info, share, sound on/off, music and effects volume.</li>
      <li>BET − / + or the slider changes the bet. The big hexagon button (or Space) spins.</li>
      <li>Gift button: feature menu. Circular arrows: autoplay (asks for confirmation; press spin to stop). Lightning: turbo.</li></ul>
      <p>Malfunction voids all pays and plays. The theoretical RTP is the long-term expected return and is calculated over a very large number of rounds.</p>`
    this.openModal("infoModal")
  }

  // ---------- state ----------
  setBalance(text: string) {
    $(this.root, "#balance").textContent = text
  }
  setBet(text: string, index: number, count: number) {
    $(this.root, "#bet").textContent = text
    this.betSlider?.set(index)
    $(this.root, "#minus").toggleAttribute("disabled", index <= 0)
    $(this.root, "#plus").toggleAttribute("disabled", index >= count - 1)
  }
  setWin(text: string) {
    $(this.root, "#win").innerHTML = text ? `<span class="lbl">WIN</span>${text}` : ""
  }
  setFs(text: string) {
    $(this.root, "#fsinfo").textContent = text
  }
  setMode(name: string) {
    const chip = $(this.root, "#modeChip")
    chip.textContent = name
    chip.classList.toggle("on", !!name)
  }
  setBusy(busy: boolean, auto: number) {
    const spin = $(this.root, "#spinBtn")
    spin.classList.toggle("spinning", busy && auto === 0)
    spin.classList.toggle("auto", auto > 0)
    spin.innerHTML = `<span class="in"></span>${auto > 0 ? icon.stop : icon.spin}`
    spin.setAttribute("aria-label", auto > 0 ? `Stop autoplay (${auto} left)` : "Spin (Space)")
    for (const id of ["#minus", "#plus", "#featBtn", "#autoBtn"]) $(this.root, id).toggleAttribute("disabled", busy || auto > 0)
    if (!busy && auto === 0) this.setBet($(this.root, "#bet").textContent ?? "", this.c.betIndex(), this.c.levels().length)
    const d = this.c.disabled()
    if (d.autoplay) $(this.root, "#autoBtn").setAttribute("disabled", "")
    if (d.turbo) $(this.root, "#turboBtn").setAttribute("disabled", "")
  }
}

/** Hex-thumb slider used for bet and volume. Value is an integer 0..max. */
class Slider {
  private value = 0
  constructor(private el: HTMLElement, private max: number, private onChange: (v: number) => void) {
    const pick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const v = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * this.max)
      if (v !== this.value) {
        this.set(v)
        this.onChange(v)
      }
    }
    el.addEventListener("pointerdown", (e) => {
      el.setPointerCapture(e.pointerId)
      pick(e)
      const move = (ev: PointerEvent) => pick(ev)
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerup", () => el.removeEventListener("pointermove", move), { once: true })
    })
  }
  set(v: number) {
    this.value = v
    const pct = this.max > 0 ? (v / this.max) * 100 : 0
    ;(this.el.querySelector(".fill") as HTMLElement).style.width = `${pct}%`
    ;(this.el.querySelector(".thumb") as HTMLElement).style.left = `${pct}%`
  }
}
