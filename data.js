/**
 * Sample time-series data for the chart.
 * Replace this array with your own data — see README.md "Feeding your own data".
 *
 * Each point needs: date (YYYY-MM-DD) + the 4 metric values.
 */
window.CHART_DATA = [
  { date: '2026-06-07', cost: 12.10, cpa: 0.90, roi: 210.30, conversions: 4 },
  { date: '2026-06-08', cost: 18.40, cpa: 1.05, roi: 188.60, conversions: 10 },
  { date: '2026-06-09', cost: 27.80, cpa: 1.15, roi: 150.20, conversions: 18 },
  { date: '2026-06-10', cost: 35.20, cpa: 1.20, roi: 120.90, conversions: 24 },
  { date: '2026-06-11', cost: 41.00, cpa: 1.22, roi: 118.40, conversions: 29 },
  { date: '2026-06-12', cost: 44.36, cpa: 1.23, roi: 161.47, conversions: 36 },
  { date: '2026-06-13', cost: 46.90, cpa: 1.30, roi: 175.80, conversions: 40 },
  { date: '2026-06-14', cost: 49.50, cpa: 1.35, roi: 205.10, conversions: 46 },
];

/**
 * Left-hand stat rail next to the chart — a period pill ("Tdy") followed by
 * a stack of small value cells. Replace freely: each entry after the first
 * is rendered as its own rounded cell, top to bottom.
 */
window.STAT_RAIL = [
  { label: 'Tdy', period: true },
  { value: '0%' },
  { value: '$0' },
  { value: '$0' },
  { value: '0' },
  { value: '0' },
  { value: '—' },
];
