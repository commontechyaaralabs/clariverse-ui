'use client';

import { useMemo } from 'react';

interface TimelineData {
  date: string;
  value: number;
  sentiment?: number;
  label?: string;
}

interface TimelineChartProps {
  data: TimelineData[];
  showSentiment?: boolean;
  onPointClick?: (date: string) => void;
}

export function TimelineChart({ data, showSentiment = false, onPointClick }: TimelineChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const valueRange = maxValue - minValue || 1;

  const points = useMemo(() => {
    return data.map((item, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / valueRange) * 100;
      return { ...item, x, y };
    });
  }, [data, minValue, valueRange]);

  return (
    <div className="w-full h-64 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Area fill */}
        <path
          d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`}
          fill="rgba(147, 51, 234, 0.1)"
        />
        
        {/* Line */}
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(147, 51, 234, 0.8)"
          strokeWidth="1.5"
        />
        
        {/* Points */}
        {points.map((point, idx) => {
          const sentimentColor = point.sentiment
            ? point.sentiment > 0
              ? 'rgba(34, 197, 94, 0.8)'
              : 'rgba(239, 68, 68, 0.8)'
            : 'rgba(147, 51, 234, 0.8)';
          
          return (
            <g key={idx}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={sentimentColor}
                stroke="white"
                strokeWidth="0.5"
                className="cursor-pointer hover:r-2 transition-all"
                onClick={() => onPointClick?.(point.date)}
              />
              {showSentiment && point.sentiment !== undefined && (
                <text
                  x={point.x}
                  y={point.y - 3}
                  textAnchor="middle"
                  className="text-xs fill-gray-400"
                  fontSize="2"
                >
                  {point.sentiment > 0 ? '+' : ''}{point.sentiment.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
        <span>{new Date(data[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

