'use client';

import { useMemo } from 'react';

interface HeatmapData {
  topic: string;
  sentiment: number; // -1 to 1
  volume: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  onCellClick?: (topic: string) => void;
}

export function HeatmapChart({ data, onCellClick }: HeatmapChartProps) {
  const maxVolume = useMemo(() => Math.max(...data.map(d => d.volume)), [data]);
  const minVolume = useMemo(() => Math.min(...data.map(d => d.volume)), [data]);
  const volumeRange = maxVolume - minVolume || 1;

  const getColor = (sentiment: number, volume: number) => {
    const volumeIntensity = (volume - minVolume) / volumeRange;
    const baseOpacity = 0.3 + volumeIntensity * 0.7;
    
    if (sentiment > 0) {
      const intensity = Math.abs(sentiment);
      return `rgba(34, 197, 94, ${baseOpacity * intensity})`; // green
    } else if (sentiment < 0) {
      const intensity = Math.abs(sentiment);
      return `rgba(239, 68, 68, ${baseOpacity * intensity})`; // red
    }
    return `rgba(156, 163, 175, ${baseOpacity})`; // gray
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: getColor(item.sentiment, item.volume),
              borderColor: item.sentiment > 0 ? 'rgba(34, 197, 94, 0.5)' : item.sentiment < 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(156, 163, 175, 0.5)',
            }}
            onClick={() => onCellClick?.(item.topic)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-sm">{item.topic}</h4>
              <span className={`text-xs font-medium ${
                item.sentiment > 0 ? 'text-green-300' : item.sentiment < 0 ? 'text-red-300' : 'text-gray-300'
              }`}>
                {item.sentiment > 0 ? '+' : ''}{item.sentiment.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Volume:</span>
              <span className="text-white font-semibold">{item.volume}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

