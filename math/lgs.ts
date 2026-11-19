// Local gaming server: serves the Stake Engine RGS API from __build__/publish_files.
//   npm run sim     (once, to build books)
//   npm run lgs     -> http://localhost:7771
import { EngineLgs, InMemoryStorage } from "@slot-engine/lgs"
import { game } from "./index"

const lgs = new EngineLgs({
  storage: new InMemoryStorage(),
  games: [game],
  port: Number(process.env.LGS_PORT ?? 7771),
  balance: { starting: 10000 },
  bets: {
    min: 0.1,
    max: 1000,
    step: 0.1,
    default: 1,
    levels: [0.1, 0.2, 0.4, 0.6, 0.8, 1, 2, 4, 6, 8, 10, 20, 40, 60, 80, 100],
  },
})

lgs.start()
