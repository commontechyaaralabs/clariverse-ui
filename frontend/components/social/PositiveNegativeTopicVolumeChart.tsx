import { useId } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

export interface TopicVolumeSplitEntry {
  name: string;
  volume: number;
  sentiment: 'positive' | 'negative';
}

interface PositiveNegativeTopicVolumeChartProps {
  data: TopicVolumeSplitEntry[];
  height?: number;
  className?: string;
  positiveGradient?: { start: string; end: string };
  negativeGradient?: { start: string; end: string };
}

const tooltipStyles = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  border: '1px solid #334155',
  maxWidth: '260px',
};

const PositiveNegativeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as TopicVolumeSplitEntry & { value: number };
  if (!entry) return null;

  return (
    <div className="p-3 text-xs text-gray-200 space-y-1" style={tooltipStyles}>
      <p className="text-sm font-semibold text-white">{entry.name}</p>
      <p className="text-gray-400 uppercase tracking-wide">
        Sentiment:{' '}
        <span className={entry.sentiment === 'positive' ? 'text-emerald-300' : 'text-rose-300'}>
          {entry.sentiment === 'positive' ? 'Positive' : 'Negative'}
        </span>
      </p>
      <p>
        Volume:{' '}
        <span className="text-white font-semibold">{Math.abs(entry.volume).toLocaleString()} threads</span>
      </p>
    </div>
  );
};

export function PositiveNegativeTopicVolumeChart({
  data,
  height = 360,
  className,
  positiveGradient = { start: '#34d399', end: '#0f766e' },
  negativeGradient = { start: '#f87171', end: '#9f1239' },
}: PositiveNegativeTopicVolumeChartProps) {
  const chartId = useId().replace(/:/g, '');
  const positiveGradientId = `positive-topic-volume-${chartId}`;
  const negativeGradientId = `negative-topic-volume-${chartId}`;

  const chartData = data.map(entry => ({
    ...entry,
    value: entry.sentiment === 'positive' ? entry.volume : -entry.volume,
  }));

  return (
    <div className={`w-full ${className ?? ''}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 12, bottom: 24 }}
          barCategoryGap={20}
        >
          <defs>
            <linearGradient id={positiveGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positiveGradient.start} stopOpacity={1} />
              <stop offset="100%" stopColor={positiveGradient.end} stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id={negativeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={negativeGradient.start} stopOpacity={1} />
              <stop offset="100%" stopColor={negativeGradient.end} stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            interval={0}
            angle={-40}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={value => `${value}`}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Tooltip cursor={{ fill: '#1e293b55' }} content={<PositiveNegativeTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} isAnimationActive={false}>
            {chartData.map(entry => (
              <Cell
                key={entry.name}
                fill={
                  entry.sentiment === 'positive'
                    ? `url(#${positiveGradientId})`
                    : `url(#${negativeGradientId})`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

