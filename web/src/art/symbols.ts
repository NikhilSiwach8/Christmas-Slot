// Hand-authored vector placeholders for every symbol (128×128 viewBox).
// One palette, one outline weight, one light direction (top-left) so the set
// reads as a single style. Replace with final illustrated art later; the ids
// and frame tiers stay the same.

export const INK = "#1d1424"
const O = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`
const O3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`

export type SymbolId = "W" | "S" | "H1" | "H2" | "H3" | "H4" | "L1" | "L2" | "L3" | "L4" | "L5"

export const TIER: Record<SymbolId, "wild" | "scatter" | "high" | "low"> = {
  W: "wild",
  S: "scatter",
  H1: "high",
  H2: "high",
  H3: "high",
  H4: "high",
  L1: "low",
  L2: "low",
  L3: "low",
  L4: "low",
  L5: "low",
}

/** Frame gem colour per premium (Santa ruby, Krampus amethyst, Reindeer emerald, Snowman sapphire). */
export const FRAME: Record<SymbolId, { base: number; light: number; dark: number }> = {
  W: { base: 0xe0a73a, light: 0xffe08a, dark: 0x7a4a12 },
  S: { base: 0xd9d4c7, light: 0xffffff, dark: 0x6d6a63 },
  H1: { base: 0xc2283a, light: 0xff6b6b, dark: 0x5e0d18 },
  H2: { base: 0x6e3fb3, light: 0xa883ff, dark: 0x2d1458 },
  H3: { base: 0x2f8f57, light: 0x7be0a0, dark: 0x0f4426 },
  H4: { base: 0x2f6fc2, light: 0x86c2ff, dark: 0x0f2f63 },
  L1: { base: 0x3a3142, light: 0x5d5068, dark: 0x1d1424 },
  L2: { base: 0x3a3142, light: 0x5d5068, dark: 0x1d1424 },
  L3: { base: 0x3a3142, light: 0x5d5068, dark: 0x1d1424 },
  L4: { base: 0x3a3142, light: 0x5d5068, dark: 0x1d1424 },
  L5: { base: 0x3a3142, light: 0x5d5068, dark: 0x1d1424 },
}

export const NAMES: Record<SymbolId, string> = {
  W: "Gift Wild",
  S: "Sleigh Bell",
  H1: "Santa",
  H2: "Krampus",
  H3: "Reindeer",
  H4: "Snowman",
  L1: "Gingerbread",
  L2: "Candy Cane",
  L3: "Ornament",
  L4: "Holly",
  L5: "Mitten",
}

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">${body}</svg>`

export const SYMBOL_SVG: Record<SymbolId, string> = {
  // Wrapped present with ribbon + bow and the word WILD on a tag
  W: svg(`
    <rect x="18" y="46" width="92" height="66" rx="8" fill="#c2283a" ${O}/>
    <rect x="18" y="46" width="92" height="14" fill="#e2434f"/>
    <rect x="12" y="34" width="104" height="22" rx="6" fill="#de3b48" ${O}/>
    <rect x="56" y="34" width="16" height="78" fill="#f6c443" ${O}/>
    <path d="M64 34 C44 8 22 16 34 30 C40 36 54 36 64 34 Z" fill="#f6c443" ${O}/>
    <path d="M64 34 C84 8 106 16 94 30 C88 36 74 36 64 34 Z" fill="#f6c443" ${O}/>
    <rect x="30" y="74" width="68" height="24" rx="6" fill="#fff3d6" ${O}/>
    <text x="64" y="93" font-family="Lilita One, sans-serif" font-size="21" text-anchor="middle" fill="${INK}">WILD</text>`),

  // Brass sleigh bell with slot, holly sprig and ring
  S: svg(`
    <circle cx="64" cy="18" r="9" fill="none" ${O}/>
    <circle cx="64" cy="70" r="44" fill="#e8b23a" ${O}/>
    <path d="M30 60 C36 36 56 28 70 30" fill="none" stroke="#fff1b8" stroke-width="7" stroke-linecap="round"/>
    <path d="M24 76 H104" ${O} fill="none"/>
    <rect x="42" y="82" width="44" height="12" rx="6" fill="${INK}"/>
    <circle cx="64" cy="102" r="6" fill="${INK}"/>
    <path d="M44 30 C34 20 22 26 26 36 C34 34 40 36 44 30 Z" fill="#2f8f57" ${O}/>
    <path d="M84 30 C94 20 106 26 102 36 C94 34 88 36 84 30 Z" fill="#2f8f57" ${O}/>
    <circle cx="64" cy="30" r="7" fill="#c2283a" ${O}/>`),

  // Santa: hat, face, beard, rosy cheeks
  H1: svg(`
    <path d="M28 58 C30 22 70 6 100 30 L108 52 Z" fill="#c2283a" ${O}/>
    <circle cx="108" cy="54" r="10" fill="#fff" ${O}/>
    <rect x="20" y="52" width="88" height="18" rx="9" fill="#fff" ${O}/>
    <ellipse cx="64" cy="82" rx="30" ry="22" fill="#f4c19a" ${O}/>
    <path d="M24 84 C26 124 102 124 104 84 C96 98 82 92 64 104 C46 92 32 98 24 84 Z" fill="#fff" ${O}/>
    <path d="M44 98 C52 90 60 92 64 98 C68 92 76 90 84 98" fill="#fff" ${O}/>
    <circle cx="52" cy="78" r="4" fill="${INK}"/><circle cx="76" cy="78" r="4" fill="${INK}"/>
    <circle cx="44" cy="88" r="6" fill="#ef8a8a"/><circle cx="84" cy="88" r="6" fill="#ef8a8a"/>
    <circle cx="64" cy="88" r="7" fill="#e7837a" ${O}/>`),

  // Krampus: curled horns, dark fur, glowing eyes, long tongue
  H2: svg(`
    <path d="M38 48 C14 40 10 14 26 8 C22 24 34 34 48 38 Z" fill="#d9c7a3" ${O}/>
    <path d="M90 48 C114 40 118 14 102 8 C106 24 94 34 80 38 Z" fill="#d9c7a3" ${O}/>
    <path d="M26 60 C26 32 102 32 102 60 L98 96 C90 116 38 116 30 96 Z" fill="#4a2f5e" ${O}/>
    <path d="M38 62 L58 70 L38 74 Z" fill="#ffd34d" ${O}/>
    <path d="M90 62 L70 70 L90 74 Z" fill="#ffd34d" ${O}/>
    <path d="M44 88 Q64 102 84 88 L80 96 Q64 108 48 96 Z" fill="#1d1424" ${O}/>
    <path d="M60 98 C58 116 70 120 68 104 Z" fill="#e35d7a" ${O}/>
    <path d="M48 88 L52 96 M80 88 L76 96" ${O}/>`),

  // Reindeer: antlers, brown face, red nose
  H3: svg(`
    <path d="M40 44 C28 30 30 14 38 8 M34 26 L22 20 M36 34 L24 36" fill="none" stroke="#a5713f" stroke-width="9" stroke-linecap="round"/>
    <path d="M88 44 C100 30 98 14 90 8 M94 26 L106 20 M92 34 L104 36" fill="none" stroke="#a5713f" stroke-width="9" stroke-linecap="round"/>
    <path d="M40 44 C28 30 30 14 38 8 M88 44 C100 30 98 14 90 8" fill="none" ${O3}/>
    <ellipse cx="30" cy="58" rx="14" ry="8" fill="#a5713f" ${O} transform="rotate(-25 30 58)"/>
    <ellipse cx="98" cy="58" rx="14" ry="8" fill="#a5713f" ${O} transform="rotate(25 98 58)"/>
    <path d="M36 54 C36 36 92 36 92 54 L86 100 C80 120 48 120 42 100 Z" fill="#b97d47" ${O}/>
    <ellipse cx="64" cy="100" rx="20" ry="14" fill="#e8c49c" ${O}/>
    <circle cx="52" cy="66" r="5" fill="${INK}"/><circle cx="76" cy="66" r="5" fill="${INK}"/>
    <circle cx="64" cy="92" r="11" fill="#e02f3d" ${O}/>
    <circle cx="60" cy="88" r="3" fill="#ffb3b3"/>`),

  // Snowman: top hat, carrot nose, scarf
  H4: svg(`
    <rect x="40" y="10" width="48" height="30" rx="4" fill="#2a2333" ${O}/>
    <rect x="30" y="38" width="68" height="10" rx="5" fill="#2a2333" ${O}/>
    <rect x="40" y="30" width="48" height="8" fill="#c2283a"/>
    <circle cx="64" cy="76" r="34" fill="#f4f8ff" ${O}/>
    <path d="M40 66 C44 54 56 48 66 48" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="52" cy="68" r="5" fill="${INK}"/><circle cx="76" cy="68" r="5" fill="${INK}"/>
    <path d="M64 78 L92 84 L64 88 Z" fill="#f08a24" ${O}/>
    <path d="M30 98 C50 110 78 110 98 98 L100 110 C78 122 50 122 28 110 Z" fill="#2f8f57" ${O}/>
    <rect x="82" y="104" width="12" height="20" rx="3" fill="#2f8f57" ${O}/>`),

  // Gingerbread man with icing
  L1: svg(`
    <path d="M64 12 a18 18 0 1 1 -0.1 0 Z M46 46 L20 56 C12 60 16 74 26 70 L44 64 L38 104 C36 114 48 118 52 108 L64 86 L76 108 C80 118 92 114 90 104 L84 64 L102 70 C112 74 116 60 108 56 L82 46 Z" fill="#c98547" ${O}/>
    <path d="M24 62 C28 60 30 64 34 62 M94 62 C98 60 100 64 104 62 M42 104 C46 102 48 106 52 104 M76 104 C80 102 82 106 86 104" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="56" cy="28" r="3.5" fill="${INK}"/><circle cx="72" cy="28" r="3.5" fill="${INK}"/>
    <path d="M56 38 Q64 44 72 38" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="64" cy="60" r="5" fill="#c2283a" ${O3}/><circle cx="64" cy="76" r="5" fill="#2f8f57" ${O3}/>`),

  // Candy cane with stripes
  L2: svg(`
    <path d="M44 116 L44 46 C44 14 96 14 96 46 L96 54" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/>
    <path d="M44 116 L44 46 C44 14 96 14 96 46 L96 54" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round"/>
    <path d="M44 116 L44 46 C44 14 96 14 96 46 L96 54" fill="none" stroke="#d72f3f" stroke-width="17" stroke-dasharray="9 11"/>`),

  // Glass bauble with cap and shine
  L3: svg(`
    <rect x="52" y="14" width="24" height="16" rx="3" fill="#e8b23a" ${O}/>
    <circle cx="64" cy="72" r="42" fill="#2f6fc2" ${O}/>
    <path d="M24 66 H104 M26 82 H102" stroke="#ffd34d" stroke-width="7"/>
    <path d="M36 52 C42 40 52 34 62 34" fill="none" stroke="#bfe0ff" stroke-width="7" stroke-linecap="round"/>
    <circle cx="64" cy="74" r="6" fill="#ffd34d"/>`),

  // Holly: two leaves and berries
  L4: svg(`
    <path d="M62 66 C50 42 30 40 14 48 C22 52 18 60 26 62 C22 68 30 72 30 78 C40 74 54 78 62 66 Z" fill="#2f8f57" ${O}/>
    <path d="M66 66 C78 42 98 40 114 48 C106 52 110 60 102 62 C106 68 98 72 98 78 C88 74 74 78 66 66 Z" fill="#2f8f57" ${O}/>
    <path d="M62 66 C44 56 32 58 26 62 M66 66 C84 56 96 58 102 62" fill="none" stroke="#7be0a0" stroke-width="3"/>
    <circle cx="54" cy="80" r="11" fill="#d72f3f" ${O}/><circle cx="74" cy="80" r="11" fill="#d72f3f" ${O}/><circle cx="64" cy="96" r="11" fill="#d72f3f" ${O}/>
    <circle cx="50" cy="76" r="3" fill="#ffb3b3"/><circle cx="70" cy="76" r="3" fill="#ffb3b3"/>`),

  // Knitted mitten with cuff
  L5: svg(`
    <path d="M40 92 L36 44 C34 20 70 12 76 38 L78 52 C84 40 102 44 98 60 L88 92 Z" fill="#2f6fc2" ${O}/>
    <rect x="34" y="88" width="60" height="26" rx="8" fill="#f4f8ff" ${O}/>
    <path d="M44 52 L52 60 L60 52 L68 60 M44 68 L52 76 L60 68 L68 76" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
}

export const SYMBOL_IDS = Object.keys(SYMBOL_SVG) as SymbolId[]
