// Synthesised placeholder audio (WebAudio, no files). Swap for recorded SFX/music later;
// keep the method names so game code does not change.

class Audio {
  private ctx?: AudioContext
  private sfxGain?: GainNode
  private musicGain?: GainNode
  private musicTimer?: number
  sfxVolume = 0.6
  musicVolume = 0.35
  muted = false
  private step = 0

  /** Must be called from a user gesture (browser autoplay rules). */
  unlock() {
    if (this.ctx) {
      void this.ctx.resume()
      return
    }
    try {
      this.ctx = new AudioContext()
    } catch {
      return
    }
    this.sfxGain = this.ctx.createGain()
    this.musicGain = this.ctx.createGain()
    this.sfxGain.connect(this.ctx.destination)
    this.musicGain.connect(this.ctx.destination)
    this.apply()
    this.startMusic()
  }

  setMuted(m: boolean) {
    this.muted = m
    this.apply()
  }
  setSfx(v: number) {
    this.sfxVolume = v
    this.apply()
  }
  setMusic(v: number) {
    this.musicVolume = v
    this.apply()
  }

  private apply() {
    if (!this.sfxGain || !this.musicGain) return
    this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume
    this.musicGain.gain.value = this.muted ? 0 : this.musicVolume * 0.25
  }

  private tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.3, when = 0, out?: GainNode) {
    const c = this.ctx
    if (!c || !this.sfxGain) return
    const t0 = c.currentTime + when
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t0)
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g).connect(out ?? this.sfxGain)
    o.start(t0)
    o.stop(t0 + dur + 0.02)
  }

  private bellTone(f: number, when = 0, vol = 0.25, out?: GainNode) {
    this.tone(f, 1.2, "sine", vol, when, out)
    this.tone(f * 2.76, 0.6, "sine", vol * 0.35, when, out)
    this.tone(f * 5.4, 0.3, "sine", vol * 0.15, when, out)
  }

  private startMusic() {
    // Gentle bell ostinato in C major (original pattern).
    const notes = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587]
    this.musicTimer = window.setInterval(() => {
      if (!this.musicGain) return
      const n = notes[this.step % notes.length]
      this.bellTone(n / 2, 0, 0.2, this.musicGain)
      if (this.step % 4 === 0) this.tone(n / 4, 1.6, "triangle", 0.12, 0, this.musicGain)
      this.step++
    }, 360)
  }

  reelStop = () => this.tone(110, 0.12, "triangle", 0.25)
  thud = () => this.tone(80, 0.2, "triangle", 0.35)
  bell = () => this.bellTone(1318, 0, 0.3)
  anticipate = () => {
    for (let i = 0; i < 6; i++) this.bellTone(880 + i * 80, i * 0.1, 0.12)
  }
  nice = () => {
    this.bellTone(1047, 0, 0.25)
    this.bellTone(1568, 0.06, 0.18)
  }
  naughty = () => {
    this.tone(70, 0.35, "sawtooth", 0.12)
    this.tone(55, 0.45, "square", 0.06, 0.05)
  }
  chain = () => {
    for (let i = 0; i < 4; i++) this.tone(1800 - i * 200, 0.05, "square", 0.05, i * 0.03)
  }
  stock = () => this.tone(660, 0.15, "triangle", 0.18)
  win = (big: boolean) => {
    const seq = big ? [523, 659, 784, 1047, 1319] : [784, 1047]
    seq.forEach((f, i) => this.bellTone(f, i * 0.09, 0.22))
  }
  click = () => this.tone(1200, 0.04, "square", 0.05)
  sleigh = () => {
    for (let i = 0; i < 12; i++) this.bellTone(1400 + (i % 3) * 120, i * 0.06, 0.08)
  }
}

export const sfx = new Audio()
