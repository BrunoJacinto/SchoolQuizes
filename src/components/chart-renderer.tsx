"use client";

import type { BarChartData, ChartData, GroupedBarChartData } from "@/types/game";
import styles from "./chart-renderer.module.css";

const SERIES_COLORS = ["#5b9eff", "#d46ef9", "#4ecdc4", "#f7b731"];
const GRID_LINES = 4;

function niceMax(max: number): number {
  if (max === 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function BarChart({ data }: { data: BarChartData }) {
  const W = 480;
  const H = 220;
  const ML = 40;
  const MR = 12;
  const MT = 16;
  const MB = 52;

  const innerW = W - ML - MR;
  const innerH = H - MT - MB;
  const maxVal = niceMax(Math.max(...data.values));
  const barSlot = innerW / data.labels.length;
  const barW = barSlot * 0.55;

  const yTicks = Array.from({ length: GRID_LINES + 1 }, (_, i) => (maxVal * i) / GRID_LINES);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.chart}
      aria-label={data.title ?? "Gráfico de barras"}
    >
      {/* Grid lines + Y labels */}
      {yTicks.map((tick) => {
        const y = MT + innerH - (tick / maxVal) * innerH;
        const label = tick % 1 === 0 ? String(tick) : tick.toFixed(1);
        return (
          <g key={tick}>
            <line x1={ML} y1={y} x2={ML + innerW} y2={y} className={styles.gridLine} />
            <text x={ML - 6} y={y + 4} className={styles.axisLabel} textAnchor="end">
              {label}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.values.map((val, i) => {
        const x = ML + i * barSlot + (barSlot - barW) / 2;
        const barH = (val / maxVal) * innerH;
        const y = MT + innerH - barH;
        const labelX = ML + i * barSlot + barSlot / 2;
        const labelY = MB > 0 ? H - MB + 18 : H - 6;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7db3ff" />
                <stop offset="100%" stopColor="#4264d0" />
              </linearGradient>
            </defs>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={`url(#bar-grad-${i})`}
              className={styles.bar}
            />
            <text x={x + barW / 2} y={y - 5} className={styles.valueLabel} textAnchor="middle">
              {val}
            </text>
            <text
              x={labelX}
              y={labelY}
              className={styles.xLabel}
              textAnchor="middle"
              transform={`rotate(-30 ${labelX} ${labelY})`}
            >
              {data.labels[i]}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + innerH} className={styles.axis} />
      <line x1={ML} y1={MT + innerH} x2={ML + innerW} y2={MT + innerH} className={styles.axis} />

      {data.title && (
        <text x={W / 2} y={12} className={styles.chartTitle} textAnchor="middle">
          {data.title}
        </text>
      )}
    </svg>
  );
}

function GroupedBarChart({ data }: { data: GroupedBarChartData }) {
  const W = 520;
  const H = 240;
  const ML = 40;
  const MR = 12;
  const MT = 16;
  const MB = 60;

  const innerW = W - ML - MR;
  const innerH = H - MT - MB;

  const allValues = data.series.flatMap((s) => s.values);
  const maxVal = niceMax(Math.max(...allValues));
  const numCategories = data.labels.length;
  const numSeries = data.series.length;
  const groupSlot = innerW / numCategories;
  const barW = (groupSlot * 0.7) / numSeries;
  const groupPad = groupSlot * 0.15;

  const yTicks = Array.from({ length: GRID_LINES + 1 }, (_, i) => (maxVal * i) / GRID_LINES);

  const legendY = H - 16;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.chart}
      aria-label={data.title ?? "Gráfico de barras justapostas"}
    >
      {/* Grid lines + Y labels */}
      {yTicks.map((tick) => {
        const y = MT + innerH - (tick / maxVal) * innerH;
        const label = tick % 1 === 0 ? String(tick) : tick.toFixed(1);
        return (
          <g key={tick}>
            <line x1={ML} y1={y} x2={ML + innerW} y2={y} className={styles.gridLine} />
            <text x={ML - 6} y={y + 4} className={styles.axisLabel} textAnchor="end">
              {label}
            </text>
          </g>
        );
      })}

      {/* Grouped bars */}
      {data.labels.map((label, ci) => {
        const groupX = ML + ci * groupSlot + groupPad;
        const labelX = ML + ci * groupSlot + groupSlot / 2;
        const labelY = MT + innerH + 18;
        return (
          <g key={ci}>
            {data.series.map((series, si) => {
              const val = series.values[ci] ?? 0;
              const x = groupX + si * barW;
              const barH = (val / maxVal) * innerH;
              const y = MT + innerH - barH;
              const color = SERIES_COLORS[si % SERIES_COLORS.length];
              return (
                <g key={si}>
                  <rect x={x} y={y} width={barW - 2} height={barH} rx={3} fill={color} opacity={0.9} />
                  {barH > 14 && (
                    <text x={x + (barW - 2) / 2} y={y - 4} className={styles.valueLabel} textAnchor="middle">
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              x={labelX}
              y={labelY}
              className={styles.xLabel}
              textAnchor="middle"
              transform={`rotate(-20 ${labelX} ${labelY})`}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + innerH} className={styles.axis} />
      <line x1={ML} y1={MT + innerH} x2={ML + innerW} y2={MT + innerH} className={styles.axis} />

      {/* Legend */}
      {data.series.map((series, si) => {
        const totalLegendW = data.series.reduce((acc) => acc + 90, 0);
        const startX = (W - totalLegendW) / 2 + si * 90;
        const color = SERIES_COLORS[si % SERIES_COLORS.length];
        return (
          <g key={si}>
            <rect x={startX} y={legendY - 8} width={12} height={12} rx={2} fill={color} />
            <text x={startX + 16} y={legendY + 2} className={styles.legendLabel}>
              {series.name}
            </text>
          </g>
        );
      })}

      {data.title && (
        <text x={W / 2} y={12} className={styles.chartTitle} textAnchor="middle">
          {data.title}
        </text>
      )}
    </svg>
  );
}

export function ChartRenderer({ data }: { data: ChartData }) {
  if (data.type === "bar") return <BarChart data={data} />;
  if (data.type === "grouped-bar") return <GroupedBarChart data={data} />;
  return null;
}
