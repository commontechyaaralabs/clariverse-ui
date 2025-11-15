import { PlayStoreViralityTopic, PLAYSTORE_SENTIMENT_LEVELS } from '@/lib/social/playstore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList,
  Cell,
} from 'recharts';
import type { LabelProps } from 'recharts';
import { SOCIAL_CARD_BASE, SOCIAL_TOOLTIP_SURFACE } from './theme';

interface PlayStoreCommunityColumnProps {
  viralityTopics: PlayStoreViralityTopic[];
}

const HelpfulLabel = ({ x = 0, y = 0, width = 0, height = 0, value }: LabelProps) => {
  if (value === undefined || value === null) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  const xNum = typeof x === 'number' ? x : Number(x || 0);
  const widthNum = typeof width === 'number' ? width : Number(width || 0);
  const yNum = typeof y === 'number' ? y : Number(y || 0);
  const heightNum = typeof height === 'number' ? height : Number(height || 0);

  return (
    <g transform={`translate(${xNum + widthNum + 12}, ${yNum + heightNum / 2})`}>
      <text fontSize={12} fontWeight={600} dominantBaseline="middle" textAnchor="start">
        <tspan fill="#38bdf8">👍</tspan>
        <tspan fill="#ffffff" dx={4}>
          {numeric.toLocaleString()}
        </tspan>
      </text>
    </g>
  );
};

const GRADIENT_COLORS: Record<(typeof PLAYSTORE_SENTIMENT_LEVELS)[number]['key'], string> = {
  level1: '#10b981',
  level2: '#f59e0b',
  level3: '#f97316',
  level4: '#ef4444',
  level5: '#b91c1c',
};

export function PlayStoreCommunityColumn({ viralityTopics }: PlayStoreCommunityColumnProps) {
  const [viralitySortOrder, setViralitySortOrder] = useState<'desc' | 'asc'>('desc');
  const chartData = useMemo(() => viralityTopics.map(topic => {
    const total = topic.star1 + topic.star2 + topic.star3 + topic.star4 + topic.star5 || 1;

    const breakdown = PLAYSTORE_SENTIMENT_LEVELS.map(level => {
      const raw = topic[level.dataKey as keyof typeof topic] ?? 0;
      const pct = Number(((Number(raw) / total) * 100).toFixed(1));
      return {
        key: level.key,
        label: level.label,
        value: pct,
      };
    });

    const gradientStops = (() => {
      const stops: Array<{ offset: number; color: string }> = [];
      let cumulative = 0;

      breakdown.forEach(segment => {
        if (!segment.value || segment.value <= 0) {
          return;
        }

        if (stops.length === 0) {
          stops.push({ offset: 0, color: GRADIENT_COLORS[segment.key] });
        }

        cumulative = Math.min(100, cumulative + segment.value);
        stops.push({ offset: cumulative / 100, color: GRADIENT_COLORS[segment.key] });
      });

      if (stops.length === 0) {
        stops.push({ offset: 0, color: '#10b981' });
        stops.push({ offset: 1, color: '#10b981' });
      } else if (stops[stops.length - 1].offset < 1) {
        stops.push({ offset: 1, color: stops[stops.length - 1].color });
      }

      return stops;
    })();

    return {
      name: topic.name,
      reviewVolume: topic.reviewVolume,
      helpfulVotes: topic.helpfulVotes ?? Math.max(Math.round(topic.reviewVolume * 0.18), 12),
      totalPercent: 100,
      gradientStops,
      breakdown,
    };
  }), [viralityTopics]);

  const sortedChartData = useMemo(() => {
    const copy = [...chartData];
    copy.sort((a, b) =>
      viralitySortOrder === 'desc'
        ? (b.helpfulVotes ?? 0) - (a.helpfulVotes ?? 0)
        : (a.helpfulVotes ?? 0) - (b.helpfulVotes ?? 0)
    );
    return copy;
  }, [chartData, viralitySortOrder]);

  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-300 mt-2">
      {PLAYSTORE_SENTIMENT_LEVELS.map(level => (
        <div key={level.key} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: GRADIENT_COLORS[level.key] }} />
          <span>{level.label}</span>
        </div>
      ))}
    </div>
  );

  const renderTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const topic = payload[0].payload as (typeof sortedChartData)[number];

    return (
      <div className={SOCIAL_TOOLTIP_SURFACE}>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white leading-tight">{topic.name}</div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1 text-sky-300 font-semibold">⭐ {topic.helpfulVotes.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400">{Number(topic.reviewVolume ?? 0).toLocaleString()} reviews</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {topic.breakdown.map(segment => (
            <div key={`${topic.name}-${segment.key}`} className="flex items-center justify-between text-[11px]">
              <span
                className="font-medium"
                style={{ color: GRADIENT_COLORS[segment.key] }}
              >
                {segment.label}
              </span>
              <span className="text-gray-100 font-semibold">{segment.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Top 10 Dominant Topics by Virality
            </CardTitle>
            <button
              type="button"
              onClick={() => setViralitySortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              className="text-xs font-semibold uppercase tracking-wide text-purple-200 border border-white/15 bg-white/5 px-3 py-1 rounded-full hover:border-white/30 hover:text-white transition-colors"
            >
              Viral {viralitySortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          <CardDescription className="text-gray-400">
            Star mix for the most viral Play Store review themes this week
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={sortedChartData}
              layout="vertical"
              barCategoryGap="28%"
              barGap={8}
              margin={{ top: 20, right: 120, bottom: 20, left: 12 }}
            >
              <defs>
                {sortedChartData.map((topic, index) => (
                  <linearGradient
                    key={topic.name}
                    id={`playstore-topic-gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    {topic.gradientStops.map((stop, stopIdx) => (
                      <stop
                        key={`${topic.name}-stop-${stopIdx}`}
                        offset={`${stop.offset * 100}%`}
                        stopColor={stop.color}
                      />
                    ))}
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#9CA3AF"
                tickFormatter={(value: number) => `${value}%`}
                ticks={[0, 25, 50, 75, 100]}
                label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -6, fill: '#9CA3AF' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#9CA3AF"
                width={220}
                tick={{ fill: '#D1D5DB', fontSize: 12, dy: 4 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip content={renderTooltipContent} />
              <Legend verticalAlign="bottom" height={48} content={renderLegend} />
              <Bar dataKey="totalPercent" radius={[8, 8, 8, 8]} isAnimationActive={false}>
                {sortedChartData.map((topic, index) => (
                  <Cell key={`${topic.name}-bar`} fill={`url(#playstore-topic-gradient-${index})`} />
                ))}
                <LabelList dataKey="helpfulVotes" content={HelpfulLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
