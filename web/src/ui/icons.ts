// Inline SVG icons for the HUD (no external requests).
const I = "#16141a"
const s = (vb: string, body: string) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`

export const icon = {
  menu: s("0 0 24 24", `<path d="M4 6h16M4 12h16M4 18h16" stroke="${I}" stroke-width="3.2" stroke-linecap="square"/>`),
  close: s("0 0 24 24", `<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.4" stroke-linecap="square"/>`),
  /** Studio emblem: snowflake crossed with Krampus horns (original). */
  emblem: s(
    "0 0 64 64",
    `<g fill="none" stroke="${I}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 10v44M13 21l38 22M51 21L13 43"/>
      <path d="M26 14l6 5 6-5M26 50l6-5 6 5"/>
      <path d="M20 8c-8 4-9 14-3 18M44 8c8 4 9 14 3 18" stroke-width="6"/>
    </g>`,
  ),
  spin: s(
    "0 0 64 64",
    `<path d="M50 30a18 18 0 1 1-6-13" fill="none" stroke="${I}" stroke-width="9" stroke-linecap="square"/>
     <path d="M40 6l14 12-17 5z" fill="${I}"/>`,
  ),
  stop: s("0 0 64 64", `<rect x="18" y="18" width="28" height="28" rx="3" fill="${I}"/>`),
  auto: s(
    "0 0 32 32",
    `<path d="M24 14a8 8 0 1 0-2 7" fill="none" stroke="${I}" stroke-width="4"/><path d="M19 9l7 4-7 4z" fill="${I}"/><circle cx="16" cy="16" r="2.5" fill="${I}"/>`,
  ),
  turbo: s("0 0 32 32", `<path d="M19 3L7 18h8l-3 11 13-16h-8z" fill="${I}"/>`),
  gift: s(
    "0 0 32 32",
    `<rect x="5" y="13" width="22" height="15" fill="${I}"/><rect x="3" y="8" width="26" height="6" fill="${I}"/><path d="M16 8v20" stroke="#e8e8ea" stroke-width="3"/><path d="M16 8c-3-6-9-5-7-1 1 2 4 1 7 1zm0 0c3-6 9-5 7-1-1 2-4 1-7 1z" fill="${I}"/>`,
  ),
  info: s("0 0 24 24", `<circle cx="12" cy="5" r="2.4" fill="currentColor"/><path d="M9 10h4v10h2" stroke="currentColor" stroke-width="3.2" fill="none"/>`),
  share: s("0 0 24 24", `<path d="M3 17l6-6 4 4 8-8M15 7h6v6" stroke="currentColor" stroke-width="3" fill="none"/>`),
  music: s("0 0 24 24", `<path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="2.6" fill="none"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/>`),
  sound: s("0 0 24 24", `<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14" stroke="currentColor" stroke-width="2.4" fill="none"/>`),
  mute: s("0 0 24 24", `<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.6"/>`),
  star: s("0 0 24 24", `<path d="M12 2l3 7 7 .6-5.4 4.7L18 22l-6-3.8L6 22l1.4-7.7L2 9.6 9 9z" fill="currentColor"/>`),
}

/** Feature-card art (simple, flat, outlined to match the symbol set). */
const O = `stroke="#1d1424" stroke-width="4" stroke-linejoin="round"`
export const cardArt = {
  coal: s("0 0 120 90", `<path d="M20 70l14-30 22-8 26 10 18 28z" fill="#2a2333" ${O}/><path d="M40 46l14-4 10 8" stroke="#ff7a3d" stroke-width="4" fill="none"/><circle cx="72" cy="58" r="5" fill="#ff7a3d"/><path d="M44 18c-6-6-14-2-12 6M76 18c6-6 14-2 12 6" stroke="#d9c7a3" stroke-width="6" fill="none"/>`),
  stocking: s("0 0 120 90", `<rect x="38" y="6" width="40" height="14" rx="5" fill="#f4f8ff" ${O}/><path d="M42 20h32l2 34c18 2 22 20 6 26-14 4-34 2-42-8z" fill="#c2283a" ${O}/><rect x="42" y="38" width="34" height="6" fill="#fff"/>`),
  goldStocking: s("0 0 120 90", `<g transform="translate(-24 0)"><rect x="38" y="6" width="40" height="14" rx="5" fill="#fff6d8" ${O}/><path d="M42 20h32l2 34c18 2 22 20 6 26-14 4-34 2-42-8z" fill="#e2a83c" ${O}/></g><g transform="translate(26 0)"><rect x="38" y="6" width="40" height="14" rx="5" fill="#fff6d8" ${O}/><path d="M42 20h32l2 34c18 2 22 20 6 26-14 4-34 2-42-8z" fill="#e2a83c" ${O}/></g><text x="60" y="56" font-family="Lilita One" font-size="22" text-anchor="middle" fill="#fff" stroke="#1d1424" stroke-width="4" paint-order="stroke">×2</text>`),
  sleigh: s("0 0 120 90", `<path d="M14 40h56c10 0 14 6 14 14v8H22c-8 0-12-10-8-22z" fill="#c2283a" ${O}/><path d="M10 72h80c8 0 12-6 10-12" stroke="#f2c14e" stroke-width="6" fill="none"/><rect x="26" y="20" width="18" height="18" fill="#2f8f57" ${O}/><rect x="46" y="24" width="16" height="16" fill="#f2c14e" ${O}/><path d="M90 30l8-18M98 30l10-14" stroke="#a5713f" stroke-width="5"/>`),
  moon: s("0 0 120 90", `<circle cx="60" cy="44" r="34" fill="#fff3d0" ${O}/><circle cx="76" cy="36" r="30" fill="#141a44"/><path d="M14 74h56c10 0 14-6 12-12H20c-6 0-8 6-6 12z" fill="#e2a83c" ${O}/><circle cx="96" cy="18" r="3" fill="#fff"/><circle cx="104" cy="40" r="2" fill="#fff"/>`),
  mystery: s("0 0 120 90", `<rect x="28" y="34" width="64" height="50" rx="6" fill="#3b2a6b" ${O}/><rect x="22" y="24" width="76" height="16" rx="5" fill="#4d3a8a" ${O}/><rect x="54" y="24" width="12" height="60" fill="#1d1424"/><path d="M60 24c-12-18-28-10-20-2 4 4 12 3 20 2zm0 0c12-18 28-10 20-2-4 4-12 3-20 2z" fill="#1d1424"/><text x="60" y="72" font-family="Lilita One" font-size="30" text-anchor="middle" fill="#ffd34d" stroke="#1d1424" stroke-width="4" paint-order="stroke">?</text>`),
  gift: s("0 0 120 90", `<rect x="30" y="34" width="60" height="48" rx="6" fill="#c2283a" ${O}/><rect x="24" y="24" width="72" height="16" rx="5" fill="#de3b48" ${O}/><rect x="54" y="24" width="12" height="58" fill="#f6c443" ${O}/>`),
}
