import { XHashtagTrend, XTrendingPost, getXViralityTopics, X_SENTIMENT_LEVELS } from '@/lib/social/x';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Hash, Grid3x3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList, Cell } from 'recharts';
import type { LabelProps } from 'recharts';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_TOOLTIP_SURFACE } from './theme';

interface XEngagementColumnProps {
  hashtagTrends: XHashtagTrend[];
  trendingPosts: XTrendingPost[];
}

const GRADIENT_COLORS: Record<(typeof X_SENTIMENT_LEVELS)[number]['key'], string> = {
  level1: '#10b981',
  level2: '#f59e0b',
  level3: '#f97316',
  level4: '#ef4444',
  level5: '#b91c1c',
};

export function XEngagementColumn({ hashtagTrends, trendingPosts }: XEngagementColumnProps) {
  const [viralitySortOrder, setViralitySortOrder] = useState<'desc' | 'asc'>('desc');
  const viralityTopics = useMemo(() => getXViralityTopics(), []);
  const chartViralityTopics = useMemo(
    () =>
      viralityTopics.map(topic => {
        const breakdown = X_SENTIMENT_LEVELS.map(level => ({
          key: level.key,
          label: level.label,
          short: level.short,
          value: Number(topic[level.key as keyof typeof topic] ?? 0),
        }));

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
          ...topic,
          helpfulVotes: topic.likes,
          totalPercent: 100,
          gradientStops,
          breakdown,
        };
      }),
    [viralityTopics]
  );

  const sortedViralityTopics = useMemo(() => {
    const copy = [...chartViralityTopics];
    copy.sort((a, b) =>
      viralitySortOrder === 'desc'
        ? (b.helpfulVotes ?? b.likes ?? 0) - (a.helpfulVotes ?? a.likes ?? 0)
        : (a.helpfulVotes ?? a.likes ?? 0) - (b.helpfulVotes ?? b.likes ?? 0)
    );
    return copy;
  }, [chartViralityTopics, viralitySortOrder]);

  const ViralityLabel = ({ x = 0, y = 0, width = 0, height = 0, value }: LabelProps) => {
    if (value === undefined || value === null) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;

    const xNum = typeof x === 'number' ? x : Number(x || 0);
    const widthNum = typeof width === 'number' ? width : Number(width || 0);
    const yNum = typeof y === 'number' ? y : Number(y || 0);
    const heightNum = typeof height === 'number' ? height : Number(height || 0);

    return (
      <g transform={`translate(${xNum + widthNum + 14}, ${yNum + heightNum / 2})`}>
        <text fontSize={12} fontWeight={600} dominantBaseline="middle" textAnchor="start">
          <tspan fill="#fb7185">❤️</tspan>
          <tspan fill="#ffffff" dx={4}>
            {numeric.toLocaleString()}
          </tspan>
        </text>
      </g>
    );
  };

  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-300 mt-2">
      {X_SENTIMENT_LEVELS.map(level => (
        <div key={level.key} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: GRADIENT_COLORS[level.key] }} />
          <span>{level.label}</span>
        </div>
      ))}
    </div>
  );

  const renderTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) {
      return null;
    }

    const topic = payload[0].payload as (typeof sortedViralityTopics)[number];

    return (
      <div className={SOCIAL_TOOLTIP_SURFACE}>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white leading-tight">{topic.name}</div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1 text-pink-300 font-semibold">❤️ {topic.likes.toLocaleString()}</span>
            {'views' in topic ? (
              <span className="text-[10px] text-gray-400">{Number((topic as any).views ?? 0).toLocaleString()} views</span>
            ) : null}
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
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Hash className="h-5 w-5 text-purple-400" />
            Momentum Hashtags
          </CardTitle>
          <CardDescription className="text-gray-400">
            Fastest growing conversation entry points
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {hashtagTrends.map((hashtag) => (
            <div key={hashtag.hashtag} className={`${SOCIAL_PANEL_BASE} space-y-2`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{hashtag.hashtag}</p>
                <span className={`text-xs uppercase tracking-wide ${hashtag.sentiment === 'positive' ? 'text-emerald-400' : hashtag.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
                  {hashtag.sentiment}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl text-white font-semibold">{hashtag.growthPercent}%</span>
                <span className="text-xs text-gray-400">Growth · {hashtag.volume.toLocaleString()} posts</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{hashtag.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Grid3x3 className="h-5 w-5 text-purple-400" />
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
            Sentiment distribution (5 levels) for the most viral X conversations this week
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={sortedViralityTopics}
              layout="vertical"
              barCategoryGap="28%"
              barGap={8}
              margin={{ top: 20, right: 120, bottom: 20, left: 12 }}
            >
              <defs>
                {sortedViralityTopics.map((topic, index) => (
                  <linearGradient
                    key={topic.name}
                    id={`x-topic-gradient-${index}`}
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
                {sortedViralityTopics.map((topic, index) => (
                  <Cell key={`${topic.name}-bar`} fill={`url(#x-topic-gradient-${index})`} />
                ))}
                <LabelList dataKey="helpfulVotes" content={ViralityLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}

