import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Area,
} from 'recharts';
import type { AITrustForecastData, AITrustDriver } from '@/lib/social/trustpilot/trustpilotInsights';

interface AITrustForecastSectionProps {
  data: AITrustForecastData;
}

const positiveColor = '#22c55e';
const negativeColor = '#ef4444';
const neutralColor = '#94a3b8';

const driverColor = (direction: AITrustDriver['direction']) => {
  switch (direction) {
    case 'positive':
      return positiveColor;
    case 'negative':
      return negativeColor;
    default:
      return neutralColor;
  }
};

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload as {
    isForecast: boolean;
    actualScore: number | null;
    forecastScore: number | null;
    confidenceLower: number;
    confidenceUpper: number;
  };

  const score = point.isForecast ? point.forecastScore : point.actualScore;

  return (
    <div className="rounded-xl border border-purple-500/40 bg-gray-900/95 px-4 py-3 text-sm shadow-xl">
      <div className="text-xs font-semibold text-purple-200 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">
        {score !== null ? score.toFixed(1) : 'N/A'}
      </div>
      <div className="text-xs text-gray-400">
        {point.isForecast ? 'AI forecast · 30-day outlook' : 'Historical trust score'}
      </div>
      {point.isForecast && (
        <div className="mt-1 text-xs text-gray-500">
          Confidence band: {point.confidenceLower.toFixed(1)} – {point.confidenceUpper.toFixed(1)}
        </div>
      )}
    </div>
  );
};

const AITrustForecastSection: React.FC<AITrustForecastSectionProps> = ({ data }) => {
  const maxImpact = useMemo(
    () => Math.max(...data.drivers.map(driver => Math.abs(driver.impact)), 1),
    [data.drivers]
  );

  return (
    <Card className="bg-gray-900 border border-gray-700 rounded-3xl shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-white text-lg">AI Trust Index Forecast &amp; Drivers</CardTitle>
        <CardDescription className="text-gray-400">
          AI forecast of customer trust trajectory with the strongest leading indicators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart
                data={data.points}
                margin={{ top: 16, right: 16, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="trustConfidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2937' }}
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 3', 'dataMax + 3']}
                  tickFormatter={value => `${value}`}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2937' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="confidenceLower"
                  stackId="confidence"
                  stroke="none"
                  fill="transparent"
                  activeDot={false}
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="confidenceBand"
                  stackId="confidence"
                  stroke="none"
                  fill="url(#trustConfidenceGradient)"
                  activeDot={false}
                  isAnimationActive
                />

                <Line
                  type="monotone"
                  dataKey="actualScore"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="forecastScore"
                  stroke="#c084fc"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, stroke: '#c084fc', strokeWidth: 3, fill: '#0f172a' }}
                  strokeDasharray="5 5"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full xl:w-[320px] space-y-5">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
                Top Drivers
              </h4>
              {data.drivers.map(driver => (
                <div
                  key={driver.label}
                  className="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 shadow-inner"
                >
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span className="font-medium">{driver.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: driverColor(driver.direction) }}
                    >
                      {driver.impact > 0 ? `+${driver.impact.toFixed(1)}` : driver.impact.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((Math.abs(driver.impact) / maxImpact) * 100, 6)}%`,
                        backgroundColor: driverColor(driver.direction),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-800/70 bg-gray-900/60 p-4 text-sm text-gray-300">
              {data.summary}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITrustForecastSection;

