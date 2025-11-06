'use client';

import { useMemo } from 'react';

interface RadarData {
  label: string;
  value: number; // -1 to 1 for sentiment
  volume?: number;
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
}

export function RadarChart({ data, size = 300 }: RadarChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  const maxValue = 1; // sentiment is -1 to 1

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((item, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const normalizedValue = (item.value + 1) / 2; // Convert -1 to 1 range to 0 to 1
      const distance = radius * normalizedValue;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      return {
        ...item,
        angle,
        x,
        y,
        normalizedValue,
        labelX: centerX + (radius + 30) * Math.cos(angle),
        labelY: centerY + (radius + 30) * Math.sin(angle),
      };
    });
  }, [data, radius, centerX, centerY]);

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    const path = points.map((point, idx) => {
      return idx === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
    });
    return `${path.join(' ')} Z`;
  }, [points]);

  const getColor = (value: number) => {
    if (value > 0) return 'rgba(34, 197, 94, 0.6)'; // green
    if (value < 0) return 'rgba(239, 68, 68, 0.6)'; // red
    return 'rgba(156, 163, 175, 0.6)'; // gray
  };

  return (
    <div className="w-full">
      <svg width={size} height={size} className="mx-auto">
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth="1"
          />
        ))}
        
        {/* Grid lines */}
        {points.map((point, idx) => (
          <line
            key={idx}
            x1={centerX}
            y1={centerY}
            x2={centerX + radius * Math.cos(point.angle)}
            y2={centerY + radius * Math.sin(point.angle)}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth="1"
          />
        ))}
        
        {/* Data area */}
        <path
          d={pathData}
          fill={getColor(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          stroke="rgba(147, 51, 234, 0.8)"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Data points */}
        {points.map((point, idx) => (
          <g key={idx}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getColor(point.value)}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-300"
            >
              {point.label}
            </text>
            <text
              x={point.x}
              y={point.y - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-purple-300 font-semibold"
            >
              {point.value > 0 ? '+' : ''}{point.value.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

