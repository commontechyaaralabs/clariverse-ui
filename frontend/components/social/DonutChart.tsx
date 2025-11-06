'use client';

import { useMemo } from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ data, size = 200, strokeWidth = 30 }: DonutChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth / 2);
  
  const segments = useMemo(() => {
    let cumulativePercent = 0;
    return data.map((item, idx) => {
      const percent = (item.value / total) * 100;
      const offset = cumulativePercent * circumference / 100;
      cumulativePercent += percent;
      return {
        ...item,
        percent,
        offset,
        dashArray: (percent * circumference) / 100,
      };
    });
  }, [data, total, circumference]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((segment, idx) => (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth / 2}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={-segment.offset}
            className="transition-all duration-500"
            style={{
              strokeLinecap: 'round',
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-xs text-gray-400">Total</div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300">{item.label}</span>
            <span className="text-gray-400 ml-auto">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

