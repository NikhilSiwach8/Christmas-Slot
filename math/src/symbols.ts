import { GameSymbol, defineSymbols } from "@slot-engine/core"

// Pays are multiples of TOTAL bet for 3 / 4 / 5 of a kind on a line.
export const symbols = defineSymbols({
  W: new GameSymbol({ id: "W", properties: { isWild: true }, pays: { 3: 1, 4: 3, 5: 10 } }),
  S: new GameSymbol({ id: "S", properties: { isScatter: true } }),
  H1: new GameSymbol({ id: "H1", pays: { 3: 1, 4: 3, 5: 10 } }), // Santa
  H2: new GameSymbol({ id: "H2", pays: { 3: 0.75, 4: 2.5, 5: 7.5 } }), // Krampus
  H3: new GameSymbol({ id: "H3", pays: { 3: 0.5, 4: 1.5, 5: 5 } }), // Reindeer
  H4: new GameSymbol({ id: "H4", pays: { 3: 0.4, 4: 1, 5: 3 } }), // Snowman
  L1: new GameSymbol({ id: "L1", pays: { 3: 0.15, 4: 0.3, 5: 1 } }), // Gingerbread
  L2: new GameSymbol({ id: "L2", pays: { 3: 0.1, 4: 0.25, 5: 0.8 } }), // Candy Cane
  L3: new GameSymbol({ id: "L3", pays: { 3: 0.1, 4: 0.2, 5: 0.6 } }), // Ornament
  L4: new GameSymbol({ id: "L4", pays: { 3: 0.05, 4: 0.2, 5: 0.5 } }), // Holly
  L5: new GameSymbol({ id: "L5", pays: { 3: 0.05, 4: 0.15, 5: 0.4 } }), // Mitten
})

export type SymbolsType = typeof symbols
