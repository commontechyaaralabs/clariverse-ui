import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Bar,
} from 'recharts';

export interface ChannelSentimentSplitEntry {
  channel: string;
  positive: number;
  negative: number;
  topPositive: string[];
  topNegative: string[];
}

interface ChannelSentimentSplitChartProps {
  data: ChannelSentimentSplitEntry[];
  height?: number;
}

const tooltipStyles = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  border: '1px solid #334155',
  maxWidth: '280px',
};

const ChannelTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as ChannelSentimentSplitEntry & {
    positiveValue: number;
    negativeValue: number;
  };
  if (!entry) return null;

  const renderList = (title: string, topics: string[], colorClass: string) => (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${colorClass}`}>{title}</p>
      {topics.length === 0 ? (
        <p className="text-[11px] text-gray-400">No standout clusters</p>
      ) : (
        <ul className="list-disc list-inside text-[11px] text-gray-100 space-y-0.5">
          {topics.map(topic => (
            <li key={`${title}-${topic}`}>{topic}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="p-3 text-xs text-gray-200 space-y-2" style={tooltipStyles}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{entry.channel}</p>
        <div className="text-[11px] text-gray-400">
          Total:{' '}
          <span className="text-white font-semibold">
            {(entry.positive + entry.negative).toLocaleString()} threads
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-semibold text-emerald-300">Positive</p>
          <p className="text-sm font-semibold text-white">{entry.positive.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-rose-300">Negative</p>
          <p className="text-sm font-semibold text-white">{entry.negative.toLocaleString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {renderList('Top positive clusters', entry.topPositive, 'text-emerald-300')}
        {renderList('Top negative clusters', entry.topNegative, 'text-rose-300')}
      </div>
    </div>
  );
};

export function ChannelSentimentSplitChart({ data, height = 360 }: ChannelSentimentSplitChartProps) {
  const chartData = useMemo(
    () =>
      data.map(entry => ({
        ...entry,
        positiveValue: entry.positive,
        negativeValue: entry.negative * -1,
      })),
    [data]
  );

  const maxMagnitude = Math.max(
    10,
    ...chartData.map(entry => Math.max(entry.positiveValue, entry.negativeValue * -1))
  );
  const domain = [-Math.ceil(maxMagnitude * 1.2), Math.ceil(maxMagnitude * 1.2)];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 16, left: 16, bottom: 32 }}
          barCategoryGap={24}
        >
          <defs>
            <linearGradient id="channelPositiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="channelNegativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="100%" stopColor="#9f1239" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="channel"
            tick={{ fill: '#cbd5f5', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={value => `${Math.abs(Number(value)).toLocaleString()}`}
            domain={domain as [number, number]}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Tooltip content={<ChannelTooltip />} cursor={{ fill: '#1e293b55' }} />
          <Bar
            dataKey="positiveValue"
            name="Positive volume"
            radius={[6, 6, 0, 0]}
            fill="url(#channelPositiveGradient)"
            isAnimationActive={false}
          />
          <Bar
            dataKey="negativeValue"
            name="Negative volume"
            radius={[0, 0, 6, 6]}
            fill="url(#channelNegativeGradient)"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

