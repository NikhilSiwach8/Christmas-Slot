# Claus & Krampus

A Christmas-themed 5×4, 20-line slot for Stake Engine. It has two-faced Gift Wilds (Nice multipliers and Naughty Krampus chains), Stocking free spins and a 10,000× max win. The game has 7 bet modes, all at 96.2% RTP.

- Design: [`docs/GDD.md`](docs/GDD.md)
- Math: [`math/`](math). Built with [`@slot-engine/core`](https://github.com/slot-engine/slot-engine), it writes Stake-compatible books and lookup tables.
- Frontend: [`web/`](web). Vite, PixiJS 8 and the [`stake-engine`](https://github.com/engineio/ts-client) RGS client.

## Requirements

Node 22+ and npm.

## Build the math

```bash
cd math && npm install
SIMS=100000 OPTIMIZE=1 npm run sim   # ~10 min; publication run (Stake needs 100k–1M per mode)
npm run verify                       # independent RTP / hit-rate / max-win check + Stake approval rules
```

For a fast dev build, use `SIMS=10000 OPTIMIZE=1 npm run sim`. The upload files end up in `math/__build__/publish_files/`: `index.json`, `books_*.jsonl.zst` and `lookUpTable_*_0.csv`.

## Play locally

```bash
cd math && npm run lgs      # local RGS on :7771, serves the books above
```

```bash
cd web && npm install && npm run dev   # http://localhost:5173
```

In dev, the page creates an LGS session for you. In production, Stake launches the game with `?sessionID=…&rgs_url=…`.

## Production frontend

```bash
cd web && npm run build    # static files in web/dist (relative paths, no external requests)
```

## Claude Code skills

Run `tools/install-skills.sh` to reinstall the Stake Engine skills used to build this into `~/.claude/skills`.
