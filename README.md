# Mixed Time-Series Chart

A widget combining four series types on one shared value axis — **area**, **bar**,
**spline**, and **straight line** — with an axis-synced tooltip and a
single-nearest-marker hover glow, matching a reference dashboard widget
(Cost / CPA / ROI confirmed / Conversions, plus a left-hand stat rail).

Built with [Apache ECharts](https://echarts.apache.org/) (loaded from CDN, no build step).

| Metric        | Chart type | Notes                                       |
|---------------|-----------|-----------------------------------------------|
| Cost          | area      | solid fill, no outline                        |
| CPA           | bar       | thin two-tone gradient bars                   |
| ROI confirmed | spline    | smoothed curve, gradient stroke (see below)   |
| Conversions   | line      | straight segments, square markers             |

Every color in this build was **sampled pixel-by-pixel from the reference
recording** (a screen-capture .gif, extracted frame by frame with Pillow),
not eyeballed from a screenshot — see "Where the exact values came from" below.

## Quick start

No build step is required — it's a static page.

```bash
git clone <this-repo-url>
cd <repo-folder>
# open index.html directly, or serve it:
npx serve .
```

Then open the printed local URL (or just double-click `index.html`).

## Files

- `index.html` — page markup + styles (widget background, stat rail, chart box, edit button)
- `chart.js` — ECharts configuration: series types, gradients, tooltip formatting,
  stat rail rendering, single-nearest-marker hover behavior
- `data.js` — the data sources: `window.CHART_DATA` and `window.STAT_RAIL`

## Feeding your own 4 time-series

Edit `data.js`. Each point is one date with the four metric values:

```js
window.CHART_DATA = [
  { date: '2026-06-07', cost: 12.10, cpa: 0.90, roi: 210.30, conversions: 4 },
  { date: '2026-06-08', cost: 18.40, cpa: 1.05, roi: 188.60, conversions: 10 },
  // ...as many points as you need, sorted by date
];
```

- `date` — `YYYY-MM-DD`, shown in the tooltip as `DD.MM.YYYY`
- `cost`, `cpa`, `roi`, `conversions` — numbers, plotted on one shared value axis
  (this mirrors the reference: metrics with very different scales sit on the
  same axis, so a small-magnitude series like CPA reads as thin bars near the
  baseline — that's expected, not a bug)

No other code changes are needed — the chart re-reads `window.CHART_DATA` on load.

## Customizing the stat rail

The narrow column to the left of the chart (a "Tdy" period pill above a stack
of value cells) is driven by `window.STAT_RAIL` in `data.js`:

```js
window.STAT_RAIL = [
  { label: 'Tdy', period: true },
  { value: '0%' },
  { value: '$0' },
  { value: '$0' },
  { value: '0' },
  { value: '0' },
  { value: '—' },
];
```

The first `period: true` entry renders as the bold white period pill; every
other entry is one rounded value cell, top to bottom. Add, remove, or relabel
cells freely — the rail lays them out with `flex: 1` each, so it always fills
the same height as the chart box next to it.

## Customizing colors

All colors are CSS variables at the top of `index.html`:

```css
--widget-bg: #fcebeb;         /* the widget's own background (not a page bg) */
--chart-border: #cdcccc;      /* thin outline around the chart box           */

--color-cost-fill: #fff0bf;   /* area fill                                   */
--color-cost-dot: #fcf792;    /* tooltip bullet — brighter than the fill     */
--color-cpa-top: #6695fe;     /* bar gradient, top                           */
--color-cpa-bottom: #4562c4;  /* bar gradient, bottom                        */
--color-cpa-dot: #3670fc;     /* tooltip bullet                              */
--color-roi: #0c8400;         /* spline base color                          */
--color-roi-bright: #3ac201;  /* spline gradient highlight, near its low point */
--color-conversions: #b500fe; /* line + square markers + tooltip bullet      */

--rail-cell-bg: #f8f6f5;      /* stat rail cell background                   */
--pill-bg: #ffffff;           /* "Tdy" period pill background                */
```

**Series → metric mapping, names, and chart type** live in `SERIES_META` at the
top of `chart.js`. To rename a series, change its `name`. To change which metric
gets which chart type, change `chartType` (`'area' | 'bar' | 'spline' | 'line'`).

**Tooltip** formatting (date format, decimal places, row layout) is in the
`tooltipFormatter` function in `chart.js`.

## Behavior notes (matching the reference)

- **No title, no legend, no card surface.** The reference chart has none of
  these — it sits directly on the widget's pink background, bordered only by
  a thin gray outline. If you need a legend for accessibility (recommended
  for production use with real users), add one; it was intentionally left out
  here to match the reference exactly.
- Hovering shows the tooltip for the nearest date (axis-triggered), but only
  **one** marker glows — whichever line/spline series sits closest to the
  cursor's actual vertical position, not every series sharing that date.
  There's no crosshair guide line.
- The glowing marker is a white-centered ring in that series' color, sitting
  on top of a soft, wider translucent halo in the same color (a separate
  low-opacity scatter point) — a plain shadow ring alone read too crisp
  next to the reference's blurred glow.
- The ROI spline's stroke is a vertical gradient (`--color-roi` →
  `--color-roi-bright`), weighted so it only brightens sharply near the
  bottom of its own drawn range (i.e. near a dip) — confirmed from a
  hover-free resting frame of the recording, so it's a permanent style, not
  a hover effect.
- CPA bars use a two-tone vertical gradient rather than a flat fill.
- The tooltip is a white rounded card with a round colored bullet + name +
  bold value per series, headed by the hovered date. Bullet colors are their
  own accent shades, distinct from (and more saturated than) the area/bar
  fill colors.
- A small "✏️ ▾" edit button floats outside the chart box's top-right corner
  (inert — wire it up to whatever it should open).

## Where the exact values came from

The reference was a screen-recording `.gif`. Rather than estimate colors from
a compressed chat screenshot, it was located locally, extracted into its 119
individual frames with Python/Pillow, and sampled pixel-by-pixel (including a
hover-free resting frame, which is what revealed the ROI gradient isn't a
hover artifact, and that the widget's pink background is a real design color
rather than a redacted/blurred area). If you're adapting this for a different
reference, the same approach — extract frames, sample pixels — beats eyeballing.
