# CLAUS & KRAMPUS — Game Design Document (v0.1, planning draft)

> Working title. Alternates: *Coal & Cocoa*, *Stocking Stuffer*, *Krampusnacht*. Run a trademark check before locking.

| | |
|---|---|
| Theme | Christmas: Santa (Nice) vs Krampus (Naughty) |
| Grid | 5 reels × 4 rows |
| Pays | 20 fixed paylines, left to right, 3+ of a kind |
| Wilds | Two-faced Gift Wilds (Nice = multiplier, Naughty = spreading chain) |
| Max win | **10,000× bet**, hard cap. The round ends as soon as it is reached |
| Target RTP | 96.20% in **every** mode (base, ante, feature spins, buys) |
| Volatility | Base: High · Ante: High · Feature spins & buys: Very High |
| Round model | Stateless. Nothing carries over between paid rounds, so it fits Stake-Engine-style RGS rules |

---

## 1. Core fantasy and hook

The player is opening presents. **Every wild is a wrapped gift that gets unwrapped on screen.** It can be good (Santa's gold ribbon, a multiplier) or chaotic (Krampus's black ribbon, chains that spread wilds). So every spin has a small reveal moment before the result settles. That reveal is the main hook. On top of it sit three layers of progression:

1. **Per spin:** unwrapping gifts, plus the random *Sleigh Run* that drops extra gifts.
2. **Per bonus:** filling **Stockings** above each reel. The multipliers grow and stay for the whole bonus.
3. **Meta:** the *Mystery Present* buy, a coal-or-glory reveal that is the only way to buy the hidden bonus.

---

## 2. Symbols and paytable

Pays are multiples of **total bet** for 3 / 4 / 5 of a kind on a line.

| Tier | Symbol | 3 | 4 | 5 |
|---|---|---|---|---|
| H1 | Santa | 1.00 | 3.00 | 10.00 |
| H2 | Krampus | 0.75 | 2.50 | 7.50 |
| H3 | Reindeer | 0.50 | 1.50 | 5.00 |
| H4 | Snowman | 0.40 | 1.00 | 3.00 |
| L1 | Gingerbread | 0.15 | 0.30 | 1.00 |
| L2 | Candy Cane | 0.10 | 0.25 | 0.80 |
| L3 | Ornament | 0.10 | 0.20 | 0.60 |
| L4 | Holly | 0.05 | 0.20 | 0.50 |
| L5 | Mitten | 0.05 | 0.15 | 0.40 |
| W | Gift Wild | pays as Santa (10× for 5), substitutes for everything except the scatter |
| S | Sleigh Bell (scatter) | reels 1–5, any position, no line pay |

The lows are themed objects, not A-K-Q-J-10 card ranks. That matches the reference style and looks less generic.

### Paylines (rows 0 = top … 3 = bottom, one row index per reel)
```
L1  1 1 1 1 1    L6  1 0 0 0 1    L11 0 1 0 1 0    L16 1 1 0 1 1
L2  2 2 2 2 2    L7  2 3 3 3 2    L12 3 2 3 2 3    L17 2 2 3 2 2
L3  0 0 0 0 0    L8  0 1 2 1 0    L13 1 2 1 2 1    L18 0 0 1 0 0
L4  3 3 3 3 3    L9  3 2 1 2 3    L14 2 1 2 1 2    L19 3 3 2 3 3
L5  0 1 2 3 3    L10 3 2 1 0 0    L15 1 0 1 0 1    L20 2 3 2 3 2
```

---

## 3. Mechanics (the unique part)

### 3.1 Gift Wilds: "Nice or Naughty?"
A Gift Wild lands wrapped. Before line evaluation, each gift is unwrapped one by one: the ribbon pulls, the box shakes, and the lid pops.

| Reveal | Base weight | Effect |
|---|---|---|
| **Nice** (gold ribbon, Santa) | 65% | Becomes a **Multiplier Wild**: ×2 / ×3 / ×5 in base (×10 / ×25 rare in feature modes) |
| **Naughty** (black ribbon, Krampus) | 35% | Becomes a **Chain Wild**: Krampus's chain lashes out 1–3 cells up, down, left or right and turns those cells into plain ×1 wilds |

**Line rule:** if several Multiplier Wilds sit on one winning line, their multipliers **multiply** (×3 and ×5 gives ×15). This is the main route to big wins. Chain Wilds don't add a multiplier, but they connect lines, so Nice and Naughty need each other.

### 3.2 Sleigh Run (random base feature, about 1 in 45 spins)
The sky darkens, bells ring, and Santa's sleigh flies across the top of the grid dropping **3–6 Gift Wilds** on random cells. The spin then evaluates normally. The **Mini and Mega Feature Spins modes guarantee this feature on every spin.**

### 3.3 Stockings (free-spins engine)
In every bonus, a **Stocking hangs above each reel**, five in total.
- Every Gift Wild that lands on a reel drops its unwrapped value into that reel's stocking. Nice adds +2/+3/+5. Naughty adds +1 for every cell its chain converts.
- **Stockings persist for the whole bonus.** They never reset between free spins.
- A winning line pays **line win × (sum of the stockings on the reels the win covers)**. A 3-of-a-kind only uses stockings 1–3, so filling the right-hand stockings rewards long wins.
- Inside a bonus, wilds feed the stockings instead of carrying their own multiplier, so there is one easy-to-read multiplier system.

---

## 4. Game modes and the purchase menu

The menu copies the reference layout: a 3×2 card grid with volatility stars, a price, and a **blue ACTIVATE** button (persistent modes) or a **gold BUY** button (one-off purchases), plus the balance and bet bar underneath.

| # | Menu card | Type | Cost | What it does |
|---|---|---|---|---|
| 1 | — | Base | 1× | Standard play |
| 2 | **Naughty List Ante** | Activate | 3× | Bonus triggers about 5.6× more often, plus **at least 1 Gift Wild guaranteed** every spin |
| 3 | **Sleigh Run Spins** (Mini) | Activate | 100× | Every spin is a guaranteed Sleigh Run (4–8 gifts, Nice values up to ×10) |
| 4 | **Midnight Run Spins** (Mega) | Activate | 1,000× | Every spin is a guaranteed Golden Sleigh Run: 8–14 gifts, at least ×3 Nice, values up to ×25, one guaranteed Chain Wild |
| 5 | **Stocking Spins** (Bonus) | Buy | 250× | Bonus: 10 free spins, stockings start at ×0 |
| 6 | **Golden Stocking Spins** (Super Bonus) | Buy | 500× | 12 free spins, **every stocking starts at ×2**, Gift Wilds are **sticky** |
| 7 | **Mystery Present** (Hidden Bonus) | Buy | 500× | Unwrap one giant present: **40% Coal** (no bonus) · **40% Golden Stocking Spins** · **20% KRAMPUSNACHT** |

### 4.1 Bonuses in detail
**Stocking Spins (Bonus).** Triggered naturally by 3 Bells. 10 spins. Stockings as in §3.3. Retriggers: 2 Bells give +2 spins, 3 Bells give +4.

**Golden Stocking Spins (Super Bonus).** Triggered naturally by 4 Bells. 12 spins. All stockings start at ×2. Gift Wilds stay sticky for the rest of the bonus and feed their stocking again on every spin they stay.

**KRAMPUSNACHT (Hidden Bonus).** Triggered naturally by 5 Bells, which is very rare and stays secret: it isn't in the paytable until the player has seen it once. Otherwise it only comes from the Mystery Present. 10 spins. A blizzard covers the board. Stockings **multiply together** instead of adding (for example, stockings 2, 3 and 4 give ×24), Chain Wilds are sticky, and Krampus fills one random stocking by +1 every spin. Almost all 10,000× wins come from here.

> **Compliance flag for the Mystery Present:** a buy that can return nothing (the 40% Coal outcome) is allowed on some RGS and jurisdictions and banned on others. If the target platform doesn't allow it, the fallback is: 40% Stocking Spins / 40% Golden / 20% Krampusnacht, with the odds rebalanced to the same RTP.

---

## 5. Math model (targets to tune by simulation)

All modes target **96.20% RTP**. The numbers below are design targets. The final reel strips and weights get tuned with a simulation of 10⁸ or more rounds per mode.

### 5.1 Bonus expected values (EV = cost × RTP)
| Feature | EV per entry |
|---|---|
| Stocking Spins | 240.5× |
| Golden Stocking Spins | 481× |
| Krampusnacht | 1,443× (so that the Mystery Present comes out at 96.2%) |

**Mystery Present check:** 0.4 × 0 + 0.4 × 481 + 0.2 × 1,443 = **481.0×** = 500 × 96.2% ✔

### 5.2 RTP split by mode
| Source | Base 1× (RTP) | Ante 3× (return per spin, divide by 3 for RTP) |
|---|---|---|
| Line wins incl. wilds | 48.0% | 0.70× |
| Sleigh Run | 12.0% | 0.18× |
| Stocking Spins | 28.0% → **1 in 860** | 1.60× → **1 in 150** |
| Golden Stocking Spins | 7.0% → **1 in 6,900** | 0.35× → **1 in 1,370** |
| Krampusnacht | 1.2% → **1 in 120,000** | 0.056× → **1 in 25,800** |
| **Total** | **96.2%** | **2.886× / 3 = 96.2%** |

| Metric | Base target |
|---|---|
| Hit frequency | about 27% |
| Any bonus | about 1 in 750 |
| 10,000× max win | about 1 in 8–15 M spins in base. More often via Mega spins and Krampusnacht |
| Sleigh Run Spins avg / max | 96.2× / 10,000× |
| Midnight Run Spins avg / max | 962× / 10,000× (cap hit about 1 in 3,000) |

### 5.3 Volatility stars (menu)
Ante ★★★ · Sleigh Run ★★★★ · Midnight Run ★★★★★ · Stocking ★★★ · Golden ★★★★ · Mystery Present ★★★★★

---

## 6. Retention hooks (honest ones)

- **The unwrap loop:** every wild has a quick reveal (under 400 ms each, sped up when there are many). The player feels involved without sitting through long animations.
- **Visible progress:** the stockings get physically fuller and bulgier, glowing brighter as they climb from ×5 to ×10 to ×25.
- **Anticipation:** when 2 Bells are on screen, the remaining reels slow down and the sleigh-bell jingle rises in pitch. This only happens when a trigger is actually still possible, never as a fake.
- **Secret bonus:** Krampusnacht is discovered, not advertised. A "?" card unlocks in the info screen after the first time a player sees it.
- **Win tiers:** Jolly (10×) → Merry (25×) → Festive (50×) → Legendary (100×) → **KRAMPUS WIN** (1,000×+), plus a full-scene celebration at max win.
- **Share button** (from the reference menu): a one-tap share card for big wins.
- **Guard rails:** no fake near misses, no losses dressed up as wins (a win smaller than the bet gets no celebration), the same RTP in every mode, shown in the info screen, and a quick-spin/turbo option.

---

## 7. Art direction

### 7.1 Style target
Same *style family* as the reference (stylized, painterly 2.5D like premium modern slots), but with our own characters, frames and logo. Don't copy any existing game's assets or logo.
- Chunky, readable silhouettes with strong rim light and one consistent light direction (key light top-left, warm).
- Ornate, beveled **symbol frames by tier**: premiums get carved gold and brass with gem inlays (Santa ruby, Krampus amethyst, Reindeer emerald, Snowman sapphire). Lows are framed objects with no gems.
- Saturated but controlled palette: **warm** (Nice: crimson, gold, cocoa) against **cold** (Naughty: violet, ice blue, soot).

### 7.2 Avoiding the "AI look"
- Concept sketches by an illustrator first. AI is used only for reference and moodboards, and every final asset gets painted over by hand.
- No noisy micro-detail or random filigree. Ornaments are symmetric and built from a shared library of frame parts.
- Faces and hands get correct anatomy, and every character has a consistent model sheet.
- Every symbol is checked for readability at 64 px, in grayscale, and by silhouette alone.
- A limited material set (gold, wood, fur, ice, cloth), each with one rendering recipe.

### 7.3 Typography
Heavy, slightly rounded geometric display sans, all caps, with a dark outline and drop shadow, like the reference.
- Headings and win titles: **Lilita One** or **Rubik Black** (both OFL), with a custom gold or ice fill for win tiers.
- UI labels and numbers: **Rubik Bold/ExtraBold** with tabular figures, so balance and bet don't jitter.

### 7.4 A background that moves
Layered parallax scenes (Spine or particle systems), with a different scene per mode:
| Mode | Scene | Motion |
|---|---|---|
| Base | Snowy rooftop village at dusk | Three depths of snowfall, chimney smoke, flickering windows, drifting aurora, Krampus's silhouette sometimes leaping between rooftops |
| Ante active | Same scene, colder | The aurora turns violet and coal embers glow in the chimneys |
| Stocking Spins | Fireplace in Santa's workshop | Fire flicker, swaying stockings, elves passing in the background |
| Golden Stocking | Gilded workshop at midnight | Gold dust and a glowing Nice List scroll unrolling |
| Krampusnacht | Blizzard on a frozen square | Heavy wind-blown snow, rattling chains, lightning revealing Krampus's huge silhouette |

### 7.5 Bonus intro clips (4–6 s, skippable after 1 s)
1. **Stocking Spins:** a camera push down a chimney into the workshop. Five stockings drop onto their hooks above the reels.
2. **Golden Stocking Spins:** Santa unrolls the Nice List, gold light spills over everything, and the stockings fill to ×2.
3. **Mystery Present reveal:** a giant gift shakes and the ribbon snaps.
   - Coal: a puff of soot and Krampus laughs (short, 2 s).
   - Golden: Santa's hand lifts the lid.
   - Krampusnacht: the lid explodes, chains whip out and the screen freezes over.
4. **Krampusnacht:** the bells stop ringing, the lights go out one by one, Krampus's eyes open in the dark, and frost cracks across the grid.
5. **Sleigh Run / Midnight Run:** a short 1.5 s sky-darkening fly-by, so it doesn't get in the way of repeated paid spins.

---

## 8. UI and HUD (based on the reference)

**Bottom bar** (dark charcoal `#1C1C21`, with angled parallelogram label tabs):
- **Left:** a light-gray hex with ☰ (opens the settings popover) and an **amber hex logo** (`#F5B342`) with our own emblem, for example a snowflake crossed with Krampus antlers. A tab labelled `BALANCE` over the value.
- **Center:** the win readout, and a bet-level slider (an amber fill with a white hex thumb) placed bottom center as in the reference.
- **Right:** a `BET` tab with the value and − / + buttons. A **large light-gray hex spin button** with a circular-arrow icon. Small stacked hexes for **Autoplay** and **Turbo** (⚡). A gift-icon hex opens the **Feature Menu**.

**Settings popover** (from ☰, and ☰ turns into an amber ×): INFO, SHARE, a music slider and an SFX slider, all in the same amber and white hex style.

**Feature Menu:** a full-screen overlay with a blurred live background and the 3×2 cards from §4:
- Top row (ACTIVATE): Naughty List Ante · Sleigh Run Spins · Midnight Run Spins
- Bottom row (BUY): Stocking Spins · Golden Stocking Spins · Mystery Present
- Each card shows its art (stocking, sleigh, gift, ...), a blue crystal bar under the art as in the reference, a volatility star strip, and a **price that updates live with the bet slider** in the footer.
- Active modes show a glowing "ACTIVE" state, and the spin button tints to match the mode.

---

## 9. Audio
- The base theme reworks classic carols with a jingle-bell motif. The Krampus layers (low brass, chains) fade in as more Naughty wilds land.
- Each unwrap has a stinger: a bright chime for Nice, a chain rattle for Naughty. The pitch rises across consecutive reveals.
- Every bonus gets its own track. Krampusnacht is dark, with choir and taiko.

---

## 10. Next steps
1. Sign off on this concept, the names and the mode list.
2. Build the math simulator: reel strips, wild reveal weights, Sleigh Run, stocking logic, and the 10,000× cap. Iterate until every mode hits 96.20%.
3. Art: moodboard, then character sketches (Santa, Krampus), then a symbol frame kit, then UI kit (hex buttons, bar, menu cards).
4. Playable greybox (web, PixiJS + Spine): base, wild reveals, bonus, and the feature menu.
5. Intro clip animatics, then final art, audio and polish.
