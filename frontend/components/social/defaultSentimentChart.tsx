'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

type TrendDatum = {
  date: string;
  sentiment: number;
  reviewVolume: number;
};

export function renderDefaultSentimentChart(
  trendData: TrendDatum[],
  channel: Channel,
): React.ReactElement {
  const chartData = trendData.map((entry) => ({
    ...entry,
    sentimentScore: Math.round((entry.sentiment + 1) * 50),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 10, right: 24, left: 16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} minTickGap={24} />
        <YAxis
          yAxisId="sentiment"
          domain={[0, 100]}
          stroke="#38bdf8"
          label={{ value: 'Sentiment (0-100)', angle: -90, position: 'insideLeft', fill: '#38bdf8' }}
          fontSize={12}
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
          stroke="#f97316"
          label={{ value: 'Review Volume', angle: 90, position: 'insideRight', fill: '#f97316' }}
          fontSize={12}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: 8 }}
          labelStyle={{ color: '#e5e7eb' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
        <Line
          yAxisId="sentiment"
          type="monotone"
          dataKey="sentimentScore"
          stroke="#38bdf8"
          strokeWidth={2}
          dot={false}
          name="Sentiment"
        />
        <Line
          yAxisId="volume"
          type="monotone"
          dataKey="reviewVolume"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          name="Review Volume"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
