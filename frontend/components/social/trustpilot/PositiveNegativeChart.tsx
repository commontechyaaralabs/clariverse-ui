import { TrustpilotPositiveNegativePoint } from '@/lib/social/trustpilot/trustpilotInsights';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface PositiveNegativeChartProps {
  data: TrustpilotPositiveNegativePoint[];
}

const tooltipStyles = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  border: '1px solid #334155',
};

const PositiveNegativeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as TrustpilotPositiveNegativePoint;

  return (
    <div className="p-3 text-xs text-gray-200 space-y-1" style={tooltipStyles}>
      <p className="text-gray-400 uppercase tracking-wide">Day {point.day}</p>
      <p>
        <span className="text-emerald-300 font-semibold">Positive:</span>{' '}
        <span className="text-white font-semibold">{point.positive.toLocaleString()}</span>
      </p>
      <p>
        <span className="text-rose-300 font-semibold">Negative:</span>{' '}
        <span className="text-white font-semibold">{Math.abs(point.negative).toLocaleString()}</span>
      </p>
    </div>
  );
};

export function PositiveNegativeChart({ data }: PositiveNegativeChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          barCategoryGap="35%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-30, 60]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={value => `${value}`}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Tooltip content={<PositiveNegativeTooltip />} cursor={{ fill: '#1e293b55' }} />
          <Bar
            dataKey="positive"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="negative"
            fill="#f87171"
            radius={[0, 0, 4, 4]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

