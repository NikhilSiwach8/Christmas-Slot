import { RGSClient } from "stake-engine"

const GAME_ID = "claus-and-krampus"

/**
 * Dev convenience: with no sessionID in the URL, ask the local LGS
 * (math/ `npm run lgs`) for a session and reload with Stake-style launch params.
 * Production builds never do this; Stake always launches with ?sessionID&rgs_url.
 */
export async function ensureSession(): Promise<boolean> {
  const q = new URLSearchParams(location.search)
  if (q.get("sessionID") && q.get("rgs_url")) return true
  if (!import.meta.env.DEV) return false
  const lgs = q.get("lgs") ?? "localhost:7771"
  const res = await fetch(`http://${lgs}/lgs/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ gameId: GAME_ID }),
  })
  if (!res.ok) throw new Error(`LGS session failed: ${res.status}`)
  const { launchQuery } = (await res.json()) as { launchQuery: string }
  location.replace(`${location.pathname}?${launchQuery}`)
  return false
}

export function createClient() {
  const rgs = new URLSearchParams(location.search).get("rgs_url") ?? ""
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(rgs)
  return RGSClient({ url: location.href, protocol: local ? "http" : "https" })
}

export type Client = ReturnType<typeof createClient>
