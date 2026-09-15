/**
 * Sample time-series data for the chart.
 * Replace this array with your own data — see README.md "Feeding your own data".
 *
 * Each point needs: date (YYYY-MM-DD) + the 4 metric values.
 */
window.CHART_DATA = [
  { date: '2026-06-10', cost: 2.04, cpa: 0.68, roi: 610.78, conversions: 3 },
  { date: '2026-06-11', cost: 15.50, cpa: 0.95, roi: 210.00, conversions: 11 },
  { date: '2026-06-12', cost: 44.36, cpa: 1.23, roi: 161.47, conversions: 36 },
  { date: '2026-06-13', cost: 47.20, cpa: 1.28, roi: 118.90, conversions: 41 },
  { date: '2026-06-14', cost: 49.50, cpa: 1.35, roi: 175.30, conversions: 46 },
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
