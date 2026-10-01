# DESIGN — The British Empire Atlas

**Owner:** the design-system agent.
**Files I own:** `app/css/tokens.css`, `app/css/base.css`, this document,
`app/design-preview.html`, `app/assets/fonts/`, `tools/design/`.
**Everyone else:** consume the tokens. Do not fork a value, do not paste a hex, do not
invent a second grey. If a token you need is missing, that is a bug in this file — say so.

Live specimen: **http://localhost:8777/app/design-preview.html**
Colour proof: `node tools/design/cvd-check.js --both` (exit 0 = the palette still holds)

---

## 1. What this is meant to feel like

A magnificent printed historical atlas — hand-tinted plates, engraved lettering, rag
paper — that has come alive under glass. Warm, authoritative, precise, a little
awe-inspiring.

It is **not** a SaaS dashboard, not a dark-mode data app, and not vintage pastiche. There
is no fake sepia, no torn-paper edge, no coffee ring, no "aged" filter. An earlier draft
of `.paper` laid a 1px repeating gradient over every panel to suggest laid stock; on a 2×
display it aliased into visible corduroy and was cut. **Restraint is the style.** The
atlas feeling comes from four things only:

1. a warm paper ground and a warm near-black ink — never `#000` on `#fff`;
2. a transitional serif carrying every word that teaches;
3. ruled lines with exactly four weights, and square corners;
4. flat hand-tinted fills separated by a hairline coastline, with engraved hatching where
   colour alone cannot do the job.

Reference points: the Times Atlas, Bartholomew's engraved plates, Tufte, Penguin History
covers, the British Library map room.

---

## 2. The map palette

This is the most important colour decision in the app, so it was solved numerically and
the working is checked in.

### 2.1 The problem, honestly stated

Ten status categories must be told apart as **large flat areas** by someone with normal
vision, protanopia, deuteranopia **or** tritanopia. That is not fully achievable. A free
simulated-annealing search over the whole OKLCH gamut (`tools/design/optimise.js`, 8
restarts, 26 000 iterations each) never got the worst pair above **7.8 ΔE00**. Ten flat
fills and three dichromacies is over-subscribed: dichromats have one usable chromatic
axis plus lightness, and ten steps do not fit on it.

So the standard here is two-tier, and it is stated on the specimen page rather than hidden:

| Tier | Worst-case ΔE00 across all four vision models | What carries the meaning |
|------|----------------------------------------------|--------------------------|
| **A** | ≥ 12 | colour alone is enough |
| **B** | ≥ 6 | colour **plus** a different engraved texture |
| Fail | < 6 | not shippable at any texture |

**Result: 36 pairs are tier A, 9 are tier B, none fail.** Every tier-B pair is checked by
`tools/design/textures.js` for having genuinely different plate textures — that check is a
backtracking graph colouring, so it is proved, not asserted.

The palette itself was not left to the optimiser, which produced a garish set
(`#339AC3`, `#4C3C00`). It was hand-picked as atlas-plate colours and then *polished* by a
constrained local search (`tools/design/polish.js`) that maximises the minimum pairwise
separation while an OKLCH-distance penalty holds each colour near its aesthetic anchor.
That reached **6.81 ΔE00** — within 1 unit of the free ceiling — while staying beautiful.

### 2.2 The paper palette

Sea `#BCD8EB` · paper `#F8F5F0` · ink `#241F19` · coastline `#6E7F8C`

| Status | Fill | L\* | ΔE00 off the sea (worst of 4) | Nearest status (worst of 4) | Texture | Label on fill |
|---|---|---|---|---|---|---|
| Never British | `#EEE9DE` | 92.5 | 16.9 | Dominion 7.7 | plain | 15.55:1 |
| Formerly British (lost) | `#BBB6B1` | 74.3 | 15.8 | Dominion 7.1 | hatch-45 | 9.36:1 |
| Dominion | `#FDC3B9` | 83.7 | 20.0 | Company rule 6.8 | rule-h | 12.26:1 |
| Settlement colony | `#CF786F` | 59.8 | 32.2 | Company rule 7.8 | stipple | 5.89:1 |
| Crown / conquered | `#AE3D35` | 42.1 | 48.1 | Occupied 10.0 | plain | 5.63:1 |
| Company rule | `#DAAF64` | 73.9 | 35.5 | Dominion 6.8 | cross | 9.23:1 |
| Lease | `#61A093` | 61.5 | 20.3 | Protectorate 7.7 | rule-v | 6.24:1 |
| Protectorate | `#5583B0` | 53.3 | 25.5 | Lease 7.7 | hatch-135 | 4.71:1 |
| Mandate / trust | `#694479` | 35.0 | 42.7 | Occupied 8.2 | stipple-coarse | 7.33:1 |
| Occupied | `#493A2F` | 25.7 | 59.3 | Mandate 8.2 | hatch-135-dense | 10.27:1 |

Every state is generated, gamut-clamped and checked; see `tools/design/palette.js` for
`-hover`, `-selected`, `-stroke` and `-on` for all ten in both themes.

**The nine tier-B pairs, with the textures that separate them:**

```
 6.8  tritan   company-rule    vs  dominion          cross           / rule-h
 7.1  protan   dominion        vs  lost-former       rule-h          / hatch-45
 7.7  protan   dominion        vs  never-british     rule-h          / plain
 7.7  tritan   lease           vs  protectorate      rule-v          / hatch-135
 7.8  tritan   company-rule    vs  settlement        cross           / stipple
 8.2  tritan   mandate         vs  occupied          stipple-coarse  / hatch-135-dense
 8.4  protan   lease           vs  lost-former       rule-v          / hatch-45
 9.5  protan   lease           vs  settlement        rule-v          / stipple
10.0  protan   crown-conquered vs  occupied          plain           / hatch-135-dense
```

**Where the pink comes from.** The empire is traditionally pink or red, and that heritage
is kept — but made to do work. The three most *direct* forms of British rule are one hue
family (H ≈ 27° in OKLCH) separated by lightness, so the ladder itself teaches:

- **Dominion** `#FDC3B9`, L\* 84 — self-governing, palest.
- **Settlement colony** `#CF786F`, L\* 60 — settled, mid.
- **Crown / conquered** `#AE3D35`, L\* 42 — ruled from London, deepest madder.

Everything else gets a hue that is *not* in the madder family, so "how British was it"
and "what kind of rule was it" are two separate readings of the same map.

### 2.3 The lamplit palette

Sea `#0B1B2A` · paper `#15120E` · ink `#EFE7D7` · coastline `#6E8496`

Tuned in its own right (`tools/design/polish-night.js`), not derived by a formula from the
day set — an affine lightness map of the day palette collapsed four pairs below the floor.

| Status | Fill | L\* | | Status | Fill | L\* |
|---|---|---|---|---|---|---|
| Never British | `#27231E` | 14.0 | | Company rule | `#D6AC60` | 72.7 |
| Formerly British | `#423F3B` | 26.8 | | Lease | `#6AA69A` | 63.9 |
| Dominion | `#FFC9BF` | 85.4 | | Protectorate | `#5587B6` | 54.7 |
| Settlement colony | `#C57670` | 58.0 | | Mandate / trust | `#795288` | 41.0 |
| Crown / conquered | `#B14936` | 44.8 | | Occupied | `#5B4431` | 30.8 |

Worst-case separation **8.44 ΔE00** (lease / protectorate under tritanopia) — better than
the day palette, because a dark surround leaves more lightness room.

One honest caveat: at night the land ground and the sea are both near-black, and CIEDE2000
compresses down there. The floor for land-off-sea is therefore 12 rather than 15, and **the
night theme must always draw the coastline** (`--map-coast`, 1px). The check enforces both.

### 2.4 The tenure ramp

How long a place was held: one hue, seven steps, `--tenure-1` … `--tenure-7`.

`#F5E6E2` `#E6C4BC` `#D6A299` `#C58177` `#B25F57` `#9E3C3A` `#890C1D`

Monotone in L\* under **all four** vision models — minimum step 8.3 L\* (tritanopia), 11.5
(protanopia). Because it is single-hue and strictly ordered, it can never be confused for a
categorical status. Buckets: `<10 · 10–24 · 25–49 · 50–74 · 75–99 · 100–149 · 150+ years`.

### 2.5 How to prove it yourself

```
node tools/design/cvd-check.js --both     # full audit, both themes, exits non-zero on failure
node tools/design/textures.js             # the texture graph colouring
node tools/design/build-palette.js        # regenerate palette.js + the CSS block
```

`tools/design/colour.js` has no dependencies: sRGB ↔ linear ↔ XYZ ↔ CIELAB ↔ OKLab/OKLCH,
CIEDE2000, WCAG contrast, and the Viénot/Brettel/Mollon (1999) LMS dichromat projection.
The specimen page runs the same maths in the browser, so the ΔE numbers printed on each
swatch card are computed live from the tokens, not typed in.

---

## 3. Type

| Role | Family | Why |
|---|---|---|
| Prose, headings, display | **Source Serif 4** (variable 200–900, roman + italic) | A transitional serif in the Fournier/Baskerville line with a real optical-size axis. Engraved gravity at 61px; still legible at 12px in a dossier table. |
| UI chrome | **Source Sans 3** (variable 300–700) | Humanist sans drawn to the same proportions by the same foundry, so the two never argue. Buttons, legend, controls, captions. |
| Every figure | **IBM Plex Mono** (400/500/600 + 400 italic) | Tabular digits. 1815 and 1947 line up in a column the way they do in a printed gazetteer. |

All three are SIL Open Font License, vendored under `app/assets/fonts/` as woff2 with
`font-display: swap` and `unicode-range` (latin + latin-ext, so the macrons in *Aotearoa*
and *Māori* work without loading a byte extra for anyone else). Total 718 KB across 16
files; the critical path — serif roman latin + sans roman latin + mono 400 latin — is
161 KB. Nothing is fetched at runtime.

Fallback stacks are real, not `serif`/`sans-serif`:

```css
--font-serif: 'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', Palatino,
              'Book Antiqua', Georgia, 'Times New Roman', serif;
--font-sans:  'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI',
              'Helvetica Neue', 'Lucida Grande', Arial, sans-serif;
--font-mono:  'IBM Plex Mono', ui-monospace, 'SF Mono', SFMono-Regular, Menlo,
              Consolas, 'DejaVu Sans Mono', monospace;
```

### 3.1 The scale

Ratio ≈ 1.213, hand-corrected at the small end. **Nothing below 12px exists.**

| Token | px | Family | Use |
|---|---|---|---|
| `--fs-plate` | 61 | serif 680 | the title plate. Once. |
| `--fs-display` | 49 | serif 600 | chapter openers |
| `--fs-h1` | 40 | serif 680 | page title |
| `--fs-h2` | 33 | serif 600 | section |
| `--fs-h3` | 27 | serif 600 | sub-section |
| `--fs-h4` | 22 | serif 600 | panel title, big figure |
| `--fs-lede` | 19 | serif 300 | standfirst, pull quote |
| `--fs-prose` | 17 | serif 380 | **the reading size** |
| `--fs-base` | 16 | sans 400 | UI body, buttons |
| `--fs-small` | 14 | sans 400 | dense tables, control labels |
| `--fs-caption` | 13 | sans 400 | captions, table notes |
| `--fs-micro` | 12 | sans 600 | legend keys, source sigla — **the floor** |

Leading: `--lh-tight 1.14` (display) · `--lh-snug 1.28` (headings) · `--lh-ui 1.42` ·
`--lh-prose 1.62` · `--lh-loose 1.78`.
Measure: `--measure 66ch` (default), `--measure-narrow 48ch`, `--measure-wide 74ch`.

### 3.2 Small caps

Source Serif 4 has no true small-cap glyphs in this build, so `.sc` is an honest
simulation: `font-variant-caps: all-small-caps` (in case a face ever provides them),
uppercase, 0.86em, weight 520 to match the surrounding stem weight, tracked `0.075em`.
Never simulate small caps above `--fs-h4` — at display size the fake shows.

---

## 4. Ink and paper

Never `#000`, never `#fff`. Printed ink on printed paper does not do that, and the eye
tires under it.

| Token | Hex | On paper | Use |
|---|---|---|---|
| `--paper` | `#F8F5F0` | — | the page (L\* 97) |
| `--paper-raised` | `#FDFBF7` | 1.05:1 | panels, the dossier |
| `--paper-sunk` | `#F0EBE2` | 1.09:1 | wells, table stripes |
| `--paper-edge` | `#E7E0D4` | 1.21:1 | the margin outside the map plate |
| `--ink-strong` | `#14110D` | 17.31:1 | headings only |
| `--ink` | `#241F19` | **15.03:1** | body text (L\* 12) |
| `--ink-muted` | `#5A5148` | 7.14:1 | captions, secondary prose |
| `--ink-faint` | `#776E64` | **4.60:1** | the floor for any text at all |
| `--ink-ghost` | `#A79D90` | 2.45:1 | **decorative only — never set type in this** |
| `--accent` | `#AE3D35` | 5.49:1 | marks, rules. Same madder as the crown-colony fill. |
| `--accent-ink` | `#8A2B26` | 7.87:1 | links, primary button |
| `--accent-2-ink` | `#244B69` | 8.45:1 | admiralty blue — timeline, "you are here" |
| `--ok` | `#3F6B45` | 5.68:1 | independence |
| `--warn` | `#8A6116` | 5.08:1 | a date historians dispute |
| `--danger` | `#99342B` | 6.70:1 | war, partition, famine |
| `--info` | `#2F5D80` | 6.44:1 | editorial aside |

Night: `--ink #EFE7D7` on `--paper #15120E` = **15.19:1**; `--ink-muted #B4A891` = 8.0:1;
`--ink-faint #8C8271` = 4.93:1.

The accent is not decoration. It is the *same* red as the crown-colony fill, so the
interface and the territory speak with one voice. Use it for links, the current year and
the focus ring, and almost nowhere else.

---

## 5. Space, rules, radii, shadows, motion, layers

- **Space** — 11 steps, `--space-3xs` (2px) … `--space-5xl` (96px).
- **Rules** — four weights and no more: `--rule-hair` 0.5px (graticule, table rows),
  `--rule-fine` 1px (panel edges, coastline), `--rule-mid` 1.5px (selected outline, active
  tab), `--rule-heavy` 3px (chapter openers). Plus `.rule--double` for a title-page rule.
- **Radii** — this is print. `--radius-sm` 2px / `--radius-md` 3px / `--radius-lg` 5px.
  `--radius-pill` exists for status chips and nothing else.
- **Shadows** — warm, low, never blue-black, never glowing. Each one carries a hairline so
  the edge survives on a light ground: `--shadow-raised`, `--shadow-panel`,
  `--shadow-lifted`, `--shadow-well`, and `--shadow-plate` (the inset "under glass" for
  the map itself).
- **Motion** — paper does not bounce; things settle. `--ease-standard`, `--ease-out`,
  `--ease-in`, `--ease-in-out`, `--ease-settle`. Durations `--dur-instant` 80ms …
  `--dur-deliberate` 560ms, plus `--dur-map-year` 700ms for one year of playback.
  No spring, no overshoot, no bounce. Ever.
- **Layers** — ten named: `--z-base` 0, `--z-map-overlay` 10, `--z-panel` 20,
  `--z-sticky` 30, `--z-header` 40, `--z-popover` 50, `--z-tooltip` 60, `--z-modal` 70,
  `--z-toast` 80, `--z-max` 90 (the skip link, nothing else).
  **Nobody writes `z-index: 9999`.**

---

## 6. Rules other agents must follow

These are not suggestions. A reviewer should reject a diff that breaks one.

1. **Never pure black, never pure white.** `#000` and `#fff` appear nowhere but the print
   stylesheet. Use `--ink*` and `--paper*`.
2. **Every date, year, count, duration and percentage is tabular.** Wrap it in
   `<span class="num">` or `<time>`. `1815` and `1947` must line up in a column.
3. **Captions never below 12px.** `--fs-micro` is the floor for any text in the app,
   including legend keys and axis labels. Do not "just make it 11 to fit".
4. **Colour is never the only signal.** Every status fill also carries its texture
   (`--tex-*`), its legend label and, on the map, a coastline. Every state colour
   (`--ok`, `--warn`, `--danger`) is paired with a word or an icon.
5. **The map always draws the coastline** (`--map-coast`) and, when selected, the
   `--map-*-stroke` outline. Selection is never carried by fill alone: two selected fills
   sit within 7 ΔE00 of another category's base fill, and the outline is what disambiguates.
6. **Map labels use `--map-label` on `--map-label-halo`**, not the fill's own contrast.
   `--map-*-on` is for legend patches and badges, where the text sits inside a solid
   swatch — all ten of those clear 4.6:1.
7. **Reach for a semantic alias first** (`--surface-panel`, `--text-secondary`,
   `--border-default`). Reaching past it into a raw `--paper-*` or `--map-*` needs a reason.
8. **Do not add a colour.** If you need one, the palette is short a token — raise it here
   and it gets audited, generated and added properly.
9. **`prefers-reduced-motion` and `forced-colors` are already handled in `base.css`.**
   If you write a new animation, it must survive both; do not re-implement the queries.
10. **Contrast is not negotiable.** Body text ≥ 4.5:1, large text ≥ 3:1, and every
    interactive control has a visible `:focus-visible` ring. Check before you ship.
11. **Two themes, always.** Anything you colour must work on `--paper` and on the lamplit
    ground. Test with `[data-theme="lamplit"]`, not just the system preference.
12. **Textures are `--tex-*` gradients in CSS and `<pattern>` elements in SVG.** Use the
    assigned texture for a status; do not invent a new one, and do not drop one because it
    "looks busy" — that texture is what a colour-blind student is reading.

---

## 7. Do / don't, with real examples

**Do** set a date in the mono, in a `.num` span:
`On <span class="num">22 June 1948</span> the Empire Windrush docked at Tilbury.`
**Don't** let a year inherit the serif's oldstyle figures in a table — the columns stop lining up.

**Do** mark doubt in the UI: `<span class="num num--contested">1627</span>` plus a
`chip--warn` saying *why*. **Don't** silently pick one historian's date.

**Do** write `background: var(--map-settlement)`. **Don't** write `background: #CF786F` —
the night theme will not follow you.

**Do** use `--shadow-panel` for a floating dossier. **Don't** stack four box-shadows with
`rgba(0,0,0,.3)`; that is a dashboard, and it is blue-black, and it is not this.

**Do** put UI chrome in the sans and everything that teaches in the serif.
**Don't** set a paragraph of history in Source Sans 3 because it "looks cleaner".

**Do** give a hover state a fill shift **and** an outline. **Don't** rely on a 2 ΔE00 tint
change that nobody with a cheap monitor will ever see.

**Do** keep prose to `--measure` (66ch). **Don't** let a dossier paragraph run the full
width of a 1440px window.

**Don't** add paper grain, a torn edge, a coffee stain, a sepia overlay, a "vintage"
filter, a compass-rose watermark, or a serif with swashes. Every one of those was
considered and refused. The atlas feeling is warm colour, real type and ruled lines — and
nothing else.

---

## 8. The specimen page

`app/design-preview.html` is the proof and the reference. It renders every token, the full
type scale, all ten statuses on a schematic engraved plate, live protanopia / deuteranopia
/ tritanopia simulation of that plate, both themes, the controls, and a worked dossier.
The ΔE00 figures printed on the swatch cards are computed in the browser from the same
tokens the app uses, so if someone changes a hex and the separation collapses, the page
says so.

Re-shoot it with:

```
node tools/inspect.js tools/scenarios/design-specimen.js --out /tmp/spec --url http://localhost:8777/app/design-preview.html
```
