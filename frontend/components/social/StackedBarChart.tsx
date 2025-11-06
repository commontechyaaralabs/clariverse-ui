'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StackedBarData {
  cluster: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  title?: string;
  onBarClick?: (cluster: string) => void;
}

export function StackedBarChart({ data, title, onBarClick }: StackedBarChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.positive + d.negative + d.neutral));
  }, [data]);

  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      <div className="space-y-4">
        {data.map((item, idx) => {
          const total = item.positive + item.negative + item.neutral;
          const positivePercent = (item.positive / total) * 100;
          const negativePercent = (item.negative / total) * 100;
          const neutralPercent = (item.neutral / total) * 100;
          const barWidth = (total / maxValue) * 100;

          return (
            <div
              key={idx}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onBarClick?.(item.cluster)}
            >
              <div className="flex items-center gap-4 mb-1">
                <span className="text-sm text-gray-300 w-32 truncate">{item.cluster}</span>
                <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${barWidth * (positivePercent / 100)}%` }}
                    title={`Positive: ${item.positive}`}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
                    style={{
                      left: `${barWidth * (positivePercent / 100)}%`,
                      width: `${barWidth * (negativePercent / 100)}%`,
                    }}
                    title={`Negative: ${item.negative}`}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-500 transition-all duration-300"
                    style={{
                      left: `${barWidth * ((positivePercent + negativePercent) / 100)}%`,
                      width: `${barWidth * (neutralPercent / 100)}%`,
                    }}
                    title={`Neutral: ${item.neutral}`}
                  />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{total}</span>
              </div>
              <div className="flex items-center gap-4 ml-36 text-xs text-gray-500">
                <span className="text-green-400">+{item.positive}</span>
                <span className="text-red-400">-{item.negative}</span>
                <span className="text-gray-400">~{item.neutral}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

