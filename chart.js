/**
 * Mixed time-series chart: area + bar + spline + straight line, one shared
 * value axis, ECharts axis-tooltip with per-series colored bullets.
 *
 * Colors, the widget's pink background, the ROI line's gradient, and the
 * single-nearest-marker hover halo were all measured from the reference
 * recording (frame-by-frame pixel sampling) — see README.md.
 *
 * To use with your own data, edit data.js (window.CHART_DATA) — see README.md.
 */
(function () {
  const raw = window.CHART_DATA || [];

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ---- series metadata: order here drives tooltip row order -----------------
  // `color` is each series' on-chart accent (line/marker/dot color); area and
  // bar fills are their own, paler colors, read directly from CSS in
  // buildSeries — the reference's tooltip bullets are more saturated than
  // either fill, so they get their own dotColor too.
  const SERIES_META = [
    {
      key: 'cost',
      name: 'Cost',
      chartType: 'area',
      color: getVar('--color-cost-dot'),
      format: (v) => v.toFixed(2),
    },
    {
      key: 'cpa',
      name: 'CPA',
      chartType: 'bar',
      color: getVar('--color-cpa-dot'),
      format: (v) => v.toFixed(2),
    },
    {
      key: 'roi',
      name: 'ROI confirmed',
      chartType: 'spline',
      color: getVar('--color-roi'),
      colorBright: getVar('--color-roi-bright'),
      format: (v) => v.toFixed(2),
    },
    {
      key: 'conversions',
      name: 'Conversions',
      chartType: 'line',
      color: getVar('--color-conversions'),
      format: (v) => Math.round(v).toString(),
    },
  ];

  // ---- stat rail --------------------------------------------------------------
  function renderStatRail() {
    const rail = document.getElementById('statRail');
    if (!rail) return;
    rail.innerHTML = '';
    (window.STAT_RAIL || []).forEach((cell) => {
      const el = document.createElement('div');
      el.className = 'stat-rail__cell' + (cell.period ? ' stat-rail__cell--period' : '');
      el.textContent = cell.period ? cell.label : cell.value;
      rail.appendChild(el);
    });
  }

  // ---- ECharts series builders ----------------------------------------------
  function buildSeries(meta) {
    const data = raw.map((d) => d[meta.key]);

    if (meta.chartType === 'area') {
      return {
        name: meta.name,
        type: 'line',
        data,
        smooth: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: getVar('--color-cost-fill'), opacity: 1 },
        z: 1,
      };
    }

    if (meta.chartType === 'bar') {
      return {
        name: meta.name,
        type: 'bar',
        data,
        barWidth: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: getVar('--color-cpa-top') },
            { offset: 1, color: getVar('--color-cpa-bottom') },
          ]),
          borderRadius: [2, 2, 0, 0],
        },
        z: 2,
      };
    }

    if (meta.chartType === 'spline') {
      return {
        id: 'series-roi',
        name: meta.name,
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          // mostly the base green, brightening sharply only near the
          // bottom of the line's own vertical span (i.e. its lowest dip) —
          // matches the reference, which is *not* a smooth end-to-end fade
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: meta.color },
            { offset: 0.75, color: meta.color },
            { offset: 0.92, color: meta.colorBright },
            { offset: 1, color: meta.colorBright },
          ]),
        },
        itemStyle: { color: meta.color },
        emphasis: {
          scale: 2.5,
          itemStyle: {
            color: '#ffffff',
            borderColor: meta.colorBright,
            borderWidth: 3,
          },
        },
        z: 3,
      };
    }

    // straight line, square markers, drawn on top
    return {
      id: 'series-conversions',
      name: meta.name,
      type: 'line',
      data,
      smooth: false,
      symbol: 'rect',
      symbolSize: 9,
      lineStyle: { width: 2, color: meta.color },
      itemStyle: { color: meta.color },
      emphasis: {
        scale: 2.2,
        itemStyle: {
          color: '#ffffff',
          borderColor: meta.color,
          borderWidth: 3,
        },
      },
      z: 4,
    };
  }

  // A soft translucent aura sits *behind* the emphasized marker — ECharts'
  // emphasis styling alone (a ring) is too crisp; the reference's highlight
  // is a wide, blurred glow. One silent scatter series per markable metric,
  // empty until hover moves a single point into it.
  function buildHalo(meta) {
    return {
      id: 'halo-' + meta.key,
      name: meta.name + ' halo',
      type: 'scatter',
      data: raw.map(() => null),
      symbolSize: 46,
      itemStyle: {
        color: meta.colorBright || meta.color,
        opacity: 0.32,
        shadowBlur: 22,
        shadowColor: meta.colorBright || meta.color,
      },
      silent: true,
      tooltip: { show: false },
      z: 2,
    };
  }

  // ---- tooltip ---------------------------------------------------------------
  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }

  function tooltipFormatter(params) {
    const points = params.filter((p) => p.seriesType !== 'scatter');
    if (!points.length) return '';
    const date = formatDate(raw[points[0].dataIndex].date);

    const rows = SERIES_META.map((meta) => {
      const p = points.find((p) => p.seriesName === meta.name);
      const value = p ? meta.format(p.value) : '—';
      return `
        <div class="tt-row">
          <span class="tt-row__label">
            <span class="tt-dot" style="background:${meta.color}"></span>
            ${meta.name}:
          </span>
          <span class="tt-row__value">&nbsp;${value}</span>
        </div>`;
    }).join('');

    return `<div class="tt-date">${date}</div>${rows}`;
  }

  // ---- chart init -------------------------------------------------------------
  function init() {
    renderStatRail();

    const chart = echarts.init(document.getElementById('chart'));

    const markable = SERIES_META.filter((m) => m.chartType === 'spline' || m.chartType === 'line');

    const option = {
      grid: { left: 8, right: 8, top: 10, bottom: 6, containLabel: false },
      xAxis: {
        type: 'category',
        data: raw.map((d) => d.date),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      tooltip: {
        trigger: 'axis',
        // no crosshair line/shadow — the reference has no visible vertical
        // guide, only the glowing point itself
        axisPointer: { type: 'none' },
        backgroundColor: '#ffffff',
        borderWidth: 0,
        padding: 20,
        extraCssText: 'border-radius:16px; box-shadow:0 12px 32px rgba(31,36,48,0.18); min-width:280px;',
        formatter: tooltipFormatter,
      },
      series: [...SERIES_META.map(buildSeries), ...markable.map(buildHalo)],
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());

    // The reference glows exactly one point per hover — whichever series'
    // marker sits closest (vertically) to the actual cursor — not every
    // series sharing that date. ECharts' axis-trigger tooltip highlights
    // all of them by default, so on every axis-pointer update we downplay
    // everything and re-highlight only the nearest markable series, and
    // move its halo scatter point to match.
    function clearHover() {
      chart.dispatchAction({ type: 'downplay' });
      chart.setOption({
        series: markable.map((m) => ({ id: 'halo-' + m.key, data: raw.map(() => null) })),
      });
    }

    chart.on('updateAxisPointer', (event) => {
      const dataIndex = event.dataIndex;
      const mouseY = event.event && event.event.offsetY;
      if (dataIndex == null || mouseY == null) return;

      let nearest = null;
      let nearestDist = Infinity;
      markable.forEach((meta) => {
        const seriesIndex = SERIES_META.indexOf(meta);
        const value = raw[dataIndex][meta.key];
        const px = chart.convertToPixel({ seriesIndex }, [dataIndex, value]);
        if (!px) return;
        const dist = Math.abs(px[1] - mouseY);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = meta;
        }
      });

      chart.dispatchAction({ type: 'downplay' });
      if (nearest) {
        chart.dispatchAction({ type: 'highlight', seriesIndex: SERIES_META.indexOf(nearest), dataIndex });
      }
      chart.setOption({
        series: markable.map((m) => ({
          id: 'halo-' + m.key,
          data: raw.map((d, i) => (m === nearest && i === dataIndex ? d[m.key] : null)),
        })),
      });
    });

    chart.getZr().on('globalout', clearHover);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
