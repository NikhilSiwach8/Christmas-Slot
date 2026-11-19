// Independent check of the published math: reads publish_files/ (LUT + books),
// recomputes RTP, hit rate, max-win odds and per-feature stats, and checks
// Stake Engine approval rules. Exits non-zero if a rule fails.
//
//   node tools/verify.mjs [__build__/publish_files]

import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
const { Decompress } = createRequire(import.meta.url)("fzstd")

const dir = process.argv[2] ?? path.join(import.meta.dirname, "..", "__build__", "publish_files")
const MAX_WIN = 10_000
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"))

async function readBooks(file) {
  const out = new Map()
  const chunks = []
  new Decompress((c) => chunks.push(c)).push(fs.readFileSync(file), true)
  for (const line of Buffer.concat(chunks).toString("utf8").split("\n")) {
    if (!line.trim()) continue
    const b = JSON.parse(line)
    const fsStart = b.events.find((e) => e.type === "freeSpinsStart")
    const mystery = b.events.find((e) => e.type === "mysteryReveal")
    const sleigh = b.events.find((e) => e.type === "sleighRun")
    out.set(b.id, {
      payout: b.payoutMultiplier,
      feature: mystery?.data.outcome === "coal" ? "coal" : (fsStart?.data.kind ?? (sleigh ? "sleigh" : "none")),
    })
  }
  return out
}

const fmtN = (p) => (p > 0 ? `1 in ${Math.round(1 / p).toLocaleString("en-US")}` : "never")
const results = []
let failed = false

for (const mode of index.modes) {
  const books = await readBooks(path.join(dir, mode.events))
  const rows = fs.readFileSync(path.join(dir, mode.weights), "utf8").trim().split("\n")

  let W = 0, R = 0, R2 = 0, hitW = 0, maxW = 0, zeroWeightBooks = 0, mismatches = 0
  const feat = {}
  for (const row of rows) {
    const [idS, wS, pS] = row.split(",")
    const id = Number(idS), w = Number(wS), payout = Number(pS) / 100
    const book = books.get(id)
    if (!book) { mismatches++; continue }
    if (Math.abs(book.payout - Number(pS)) > 0) mismatches++
    if (w === 0) zeroWeightBooks++
    const x = payout / mode.cost
    W += w; R += w * x; R2 += w * x * x
    if (payout > 0) hitW += w
    if (payout >= MAX_WIN) maxW += w
    const f = (feat[book.feature] ??= { w: 0, r: 0 })
    f.w += w; f.r += w * payout
  }
  const rtp = R / W
  const sd = Math.sqrt(R2 / W - rtp * rtp)
  const r = {
    mode: mode.name, cost: mode.cost, books: rows.length, rtp, hit: hitW / W, maxwin: maxW / W, sd, zeroWeightBooks, mismatches,
    features: Object.fromEntries(Object.entries(feat).map(([k, v]) => [k, { freq: v.w / W, avg: v.w ? v.r / v.w : 0 }])),
  }
  results.push(r)
}

console.log("\nmode     cost   books    RTP      hit rate        max win (10,000x)    std dev")
for (const r of results) {
  console.log(
    `${r.mode.padEnd(8)} ${String(r.cost).padStart(5)} ${String(r.books).padStart(7)}  ${(r.rtp * 100).toFixed(3)}%  ${fmtN(r.hit).padEnd(14)}  ${fmtN(r.maxwin).padEnd(20)} ${r.sd.toFixed(1)}`,
  )
  for (const [k, v] of Object.entries(r.features)) {
    if (k === "none") continue
    console.log(`           ${k.padEnd(8)} ${fmtN(v.freq).padEnd(16)} avg ${v.avg.toFixed(1)}x`)
  }
}

// --- Stake Engine approval checks (see stake-math-sdk/references/approval-math.md)
const checks = []
const rtps = results.map((r) => r.rtp)
checks.push(["RTP 90–98% in every mode", rtps.every((x) => x >= 0.9 && x <= 0.98)])
checks.push(["RTP spread between modes ≤ 0.5%", Math.max(...rtps) - Math.min(...rtps) <= 0.005])
checks.push(["Max win reachable in every mode (> 1 in 10M)", results.every((r) => r.maxwin > 1e-7)])
checks.push(["Base hit rate better than 1 in 20", results.find((r) => r.mode === "base").hit > 1 / 20])
checks.push(["Lookup tables match books", results.every((r) => r.mismatches === 0)])
checks.push(["≥ 100,000 sims per mode (publication)", results.every((r) => r.books >= 100_000)])

console.log("\nApproval checks")
for (const [name, ok] of checks) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`)
  if (!ok && !name.includes("publication")) failed = true
}
fs.writeFileSync(path.join(dir, "..", "verify_report.json"), JSON.stringify({ results, checks }, null, 2))
process.exit(failed ? 1 : 0)
