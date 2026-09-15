# Mixed Time-Series Chart

A single chart combining four series types on one shared axis — **area**, **bar**,
**spline**, and **straight line** — with an axis-synced tooltip and crosshair,
built to match a reference dashboard chart (Cost / CPA / ROI confirmed / Conversions).

Built with [Apache ECharts](https://echarts.apache.org/) (loaded from CDN, no build step).

| Metric        | Chart type | Notes                                  |
|---------------|-----------|------------------------------------------|
| Cost          | area      | filled area, no visible outline          |
| CPA           | bar       | thin bars                                |
| ROI confirmed | spline    | smoothed curve                           |
| Conversions   | line      | straight segments, square markers        |

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

- `index.html` — page markup + styles (stat rail, card, legend, chart container)
- `chart.js` — ECharts configuration: series types, colors, tooltip formatting,
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

The first `period: true` entry renders as the bold period pill; every other
entry is one rounded value cell, top to bottom. Add, remove, or relabel cells
freely — the rail lays them out with `flex: 1` each, so it always fills the
same height as the chart card next to it.

## Customizing

**Series → metric mapping, names, and chart type** live in `SERIES_META` at the
top of `chart.js`. To rename a series, change its `name`. To change which metric
gets which chart type, change `chartType` (`'area' | 'bar' | 'spline' | 'line'`).

**Colors** are CSS variables at the top of `index.html`:

```css
--color-cost: #f2c94c;        /* area fill line color   */
--color-cost-fill: #fbe79a;   /* area fill color         */
--color-cpa: #4a8fe0;         /* bar color               */
--color-roi: #2f8f3f;         /* spline color            */
--color-conversions: #b026c7; /* line + square markers   */
```

**Tooltip** formatting (date format, decimal places, row layout) is in the
`tooltipFormatter` function in `chart.js`.

## Behavior notes (matching the reference)

- Hovering the chart shows the tooltip for the nearest date (axis-triggered),
  but only **one** marker glows — whichever line/spline series sits closest to
  the cursor's actual vertical position, not every series sharing that date.
  There's no full-height crosshair guide line, matching the reference.
- The glowing marker is a white-centered ring in that series' color with a
  soft shadow blur, not a plain thin highlight ring.
- The tooltip is a white rounded card with a round colored bullet + name +
  bold value per series (all bullets are circles, regardless of the series'
  on-chart marker shape), headed by the hovered date.
- The card has a small "✏️ ▾" edit button in its top-right corner (inert —
  wire it up to whatever the button should open).
