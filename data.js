/**
 * Sample time-series data for the chart.
 * Replace this array with your own data — see README.md "Feeding your own data".
 *
 * Each point needs: date (YYYY-MM-DD) + the 4 metric values.
 */
// These 5 points were reconstructed by measuring pixel positions directly
// off the reference recording's resting (no-hover) frame and converting
// them to values on one consistent scale, calibrated against the one
// on-screen number confirmed for that exact frame (Conversions: 36 at the
// 3rd point) — see README.md. Different hover moments in that recording
// showed numbers on what turned out to be an unrelated scale (a different
// account/date range), so those weren't usable here.
window.CHART_DATA = [
  { date: '2026-06-10', cost: 1.70, cpa: 0.60, roi: 94.10, conversions: 3.10 },
  { date: '2026-06-11', cost: 41.60, cpa: 0.90, roi: 60.00, conversions: 29.60 },
  { date: '2026-06-12', cost: 71.30, cpa: 1.20, roi: 25.80, conversions: 36.00 },
  { date: '2026-06-13', cost: 89.30, cpa: 1.30, roi: 9.20, conversions: 69.30 },
  { date: '2026-06-14', cost: 101.70, cpa: 1.40, roi: 56.40, conversions: 89.30 },
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
