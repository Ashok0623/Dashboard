import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

type DataItem = { name: string; value: number };

interface Props {
  data: DataItem[];
  height?: number | string;
}

const COLOR_PALETTE = ["#1565c0", "#2e7d32", "#f57f17", "#c62828", "#7b1fa2", "#00897b", "#6d4c41", "#546e7a"];

const MinorIrrigationDonut: React.FC<Props> = ({ data, height = 200 }) => {
  const processed = useMemo(() => {
    // Keep all specified minor irrigation sources (no grouping) and preserve full names
    const filtered = data.filter((d) => d.value && d.name && d.value > 0).map(d => ({ name: d.name, value: Number(d.value) }));
    const total = filtered.reduce((s, x) => s + x.value, 0);

    // Ensure consistent ordering and normalize names
    const order = ["MI Tanks", "Percolation Tanks", "Forest Tanks", "Private Tanks", "Other Tanks", "Anicuts", "Check Dams"];
    // Place known items first (case-insensitive matching), then append any others
    const ordered = order.filter(n => filtered.some(f => f.name.toLowerCase().includes(n.toLowerCase())))
      .map(n => filtered.find(f => f.name.toLowerCase().includes(n.toLowerCase()))!)
      .concat(filtered.filter(f => !order.some(o => f.name.toLowerCase().includes(o.toLowerCase()))));

    // Normalize names (rename MI abbreviations to 'MI Tanks', 'Others Tanks' -> 'Other Tanks')
    const normalized = ordered.map(item => {
      let name = item.name;
      if (/^mi$/i.test(name) || /\bmi\b/i.test(name) || /mi\s*tanks?/i.test(name)) name = 'MI Tanks';
      if (/other/i.test(name) || /others tanks?/i.test(name)) name = 'Other Tanks';
      return { ...item, name };
    });

    // Assign explicit colors for MI, Private tanks and Anicuts; fallback to palette for others
    const colored = normalized.map((item, idx) => {
      let color: string;
      if (/^mi/i.test(item.name)) color = '#1565c0'; // MI -> Blue
      else if (/private/i.test(item.name)) color = '#f57f17'; // Private -> Orange
      else if (/anicut/i.test(item.name)) color = '#00897b'; // Anicuts -> Teal (distinct from orange)
      else color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      return { ...item, itemStyle: { color } };
    });

    return { data: colored, total };
  }, [data]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    // legend removed — labels show beside slices and tooltip is used
    legend: { show: false },
    color: COLOR_PALETTE,
    series: [
      {
        name: 'Minor Irrigation Sources',
        type: 'pie',
        radius: '68%',
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => `{name|${params.name}} {pct|${params.percent?.toFixed(1)}%}`,
          fontSize: 11,
          color: '#333',
          align: 'left',
          rich: {
            name: { fontSize: 12, fontWeight: 600, color: '#222' },
            pct: { fontSize: 11, color: '#555', padding: [0, 0, 0, 6] }
          }
        },
        // Using a full pie (no inner hole) instead of a donut
        // labelLine and other settings remain the same to preserve external labeling
        
        legendHoverLink: true,
        labelLine: {
          length: 28,
          length2: 12,
          smooth: true,
          lineStyle: { width: 1, color: '#bdbdbd' }
        },
        labelLayout: {
          hideOverlap: true
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.25)'
          }
        },
        data: processed.data
      }
    ]
  }), [processed]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default MinorIrrigationDonut;