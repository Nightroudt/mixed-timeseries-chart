/**
 * Mixed time-series chart: area + bar + spline + straight line, one shared
 * value axis, ECharts axis-tooltip with per-series colored bullets.
 *
 * To use with your own data, edit data.js (window.CHART_DATA) — see README.md.
 */
(function () {
  const raw = window.CHART_DATA || [];

  // ---- series metadata: order here drives legend + tooltip row order -------
  const SERIES_META = [
    {
      key: 'cost',
      name: 'Cost',
      chartType: 'area',
      color: getVar('--color-cost'),
      fill: getVar('--color-cost-fill'),
      format: (v) => v.toFixed(2),
    },
    {
      key: 'cpa',
      name: 'CPA',
      chartType: 'bar',
      color: getVar('--color-cpa'),
      format: (v) => v.toFixed(2),
    },
    {
      key: 'roi',
      name: 'ROI confirmed',
      chartType: 'spline',
      color: getVar('--color-roi'),
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

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ---- legend ---------------------------------------------------------------
  function renderLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    SERIES_META.forEach((s) => {
      const item = document.createElement('div');
      item.className = 'legend__item';

      const dot = document.createElement('span');
      dot.className = 'legend__dot';
      dot.style.background = s.color;

      const label = document.createElement('span');
      label.textContent = s.name;

      item.appendChild(dot);
      item.appendChild(label);
      legend.appendChild(item);
    });
  }

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
        lineStyle: { width: 1, color: meta.color, opacity: 0.6 },
        areaStyle: { color: meta.fill, opacity: 0.65 },
        z: 1,
      };
    }

    if (meta.chartType === 'bar') {
      return {
        name: meta.name,
        type: 'bar',
        data,
        barWidth: 10,
        itemStyle: { color: meta.color, borderRadius: [2, 2, 0, 0] },
        z: 2,
      };
    }

    if (meta.chartType === 'spline') {
      return {
        name: meta.name,
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 2.5, color: meta.color },
        itemStyle: { color: meta.color },
        // hover: soft glowing halo behind a white-centered ring, matching
        // the reference's blurred highlight circle at the active point
        emphasis: {
          scale: 2.5,
          itemStyle: {
            color: '#ffffff',
            borderColor: meta.color,
            borderWidth: 3,
            shadowBlur: 26,
            shadowColor: meta.color,
          },
        },
        z: 3,
      };
    }

    // straight line, square markers, drawn on top
    return {
      name: meta.name,
      type: 'line',
      data,
      smooth: false,
      symbol: 'rect',
      symbolSize: 9,
      lineStyle: { width: 2, color: meta.color },
      itemStyle: { color: meta.color },
      // same white-centered glow treatment as the spline series — a same-
      // color shadow on a same-color fill is invisible on a dark surface,
      // so light the core white the way the ROI point does
      emphasis: {
        scale: 2.2,
        itemStyle: {
          color: '#ffffff',
          borderColor: meta.color,
          borderWidth: 3,
          shadowBlur: 26,
          shadowColor: meta.color,
        },
      },
      z: 4,
    };
  }

  // ---- tooltip ---------------------------------------------------------------
  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }

  function tooltipFormatter(params) {
    if (!params || !params.length) return '';
    const date = formatDate(raw[params[0].dataIndex].date);

    const rows = SERIES_META.map((meta) => {
      const p = params.find((p) => p.seriesName === meta.name);
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
    renderLegend();
    renderStatRail();

    const chart = echarts.init(document.getElementById('chart'));

    const option = {
      grid: { left: 12, right: 12, top: 16, bottom: 8, containLabel: false },
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
      series: SERIES_META.map(buildSeries),
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());

    // The reference glows exactly one point per hover — whichever series'
    // marker sits closest (vertically) to the actual cursor — not every
    // series sharing that date. ECharts' axis-trigger tooltip highlights
    // all of them by default, so on every axis-pointer update we downplay
    // everything and re-highlight only the nearest markable (line/spline)
    // series ourselves.
    const markableIndices = SERIES_META
      .map((meta, index) => ((meta.chartType === 'spline' || meta.chartType === 'line') ? index : -1))
      .filter((index) => index !== -1);

    chart.on('updateAxisPointer', (event) => {
      const dataIndex = event.dataIndex;
      const mouseY = event.event && event.event.offsetY;
      if (dataIndex == null || mouseY == null) return;

      let nearestIndex = -1;
      let nearestDist = Infinity;
      markableIndices.forEach((seriesIndex) => {
        const meta = SERIES_META[seriesIndex];
        const value = raw[dataIndex][meta.key];
        const px = chart.convertToPixel({ seriesIndex }, [dataIndex, value]);
        if (!px) return;
        const dist = Math.abs(px[1] - mouseY);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = seriesIndex;
        }
      });

      chart.dispatchAction({ type: 'downplay' });
      if (nearestIndex !== -1) {
        chart.dispatchAction({ type: 'highlight', seriesIndex: nearestIndex, dataIndex });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
