import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLOR_PALETTE = [
  "#1565c0",
  "#2e7d32",
  "#f57f17",
  "#c62828",
  "#7b1fa2",
  "#00897b",
  "#6d4c41",
  "#546e7a",
];

const MinorIrrigationDonut = ({ data, height = 200 }) => {
  const { processed, total, colorMap } = useMemo(() => {
    const filtered = data
      .filter((d) => d.value && d.name && d.value > 0)
      .map((d) => ({ name: d.name, value: Number(d.value) }));

    const order = [
      "MI Tanks",
      "Percolation Tanks",
      "Forest Tanks",
      "Private Tanks",
      "Other Tanks",
      "Anicuts",
      "Check Dams",
    ];
    const ordered = order
      .filter((n) =>
        filtered.some((f) => f.name.toLowerCase().includes(n.toLowerCase())),
      )
      .map((n) =>
        filtered.find((f) => f.name.toLowerCase().includes(n.toLowerCase())),
      )
      .concat(
        filtered.filter(
          (f) =>
            !order.some((o) => f.name.toLowerCase().includes(o.toLowerCase())),
        ),
      );

    const normalized = ordered.map((item) => {
      let name = item.name;
      if (
        /^mi$/i.test(name) ||
        /\bmi\b/i.test(name) ||
        /mi\s*tanks?/i.test(name)
      )
        name = "MI Tanks";
      if (/other/i.test(name) || /others tanks?/i.test(name))
        name = "Other Tanks";
      return { ...item, name };
    });

    const total = normalized.reduce((s, x) => s + x.value, 0);

    // Build color map based on original index (before sorting)
    const cMap = {};
    normalized.forEach((item, idx) => {
      if (/^mi/i.test(item.name)) cMap[item.name] = "#1565c0";
      else if (/private/i.test(item.name)) cMap[item.name] = "#f57f17";
      else if (/anicut/i.test(item.name)) cMap[item.name] = "#00897b";
      else cMap[item.name] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    });

    // Sort descending by value for chart rendering
    const sorted = [...normalized].sort((a, b) => b.value - a.value);

    return { processed: sorted, total, colorMap: cMap };
  }, [data]);

  const getColor = (name) => colorMap[name] || "#546e7a";

  const renderLegend = (props) => {
    const { payload } = props;
    // Sort legend entries by value descending
    const sorted = [...payload].sort(
      (a, b) => b.payload.value - a.payload.value,
    );
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          fontSize: "12px",
          lineHeight: "1.8",
        }}
      >
        {sorted.map((entry, index) => {
          const pct =
            total > 0
              ? ((entry.payload.value / total) * 100).toFixed(1)
              : "0.0";
          return (
            <div
              key={`legend-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: entry.color,
                  marginRight: "8px",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#333" }}>
                {entry.value}: {entry.payload.value.toLocaleString()} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "60%",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "13px",
          marginBottom: "2px",
        }}
      >
        Minor Irrigation Sources
      </div>
      <div style={{ flex: 1, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processed}
              cx="35%"
              cy="50%"
              outerRadius="85%"
              fill="#8884d8"
              dataKey="value"
              label={false}
            >
              {processed.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : value
              }
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: 0, right: "5%" }}
              content={renderLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MinorIrrigationDonut;
