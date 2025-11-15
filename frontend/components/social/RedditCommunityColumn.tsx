import { useMemo, useState } from 'react';
import {
  RedditCommunitySignal,
  RedditViralityTopic,
  REDDIT_SENTIMENT_LEVELS,
} from '@/lib/social/reddit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  Cell,
} from 'recharts';
import type { LabelProps } from 'recharts';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_TOOLTIP_SURFACE } from './theme';

interface RedditCommunityColumnProps {
  communitySignals: RedditCommunitySignal[];
  viralityTopics: RedditViralityTopic[];
}

const GRADIENT_COLORS: Record<(typeof REDDIT_SENTIMENT_LEVELS)[number]['key'], string> = {
  level1: '#10b981',
  level2: '#f59e0b',
  level3: '#f97316',
  level4: '#ef4444',
  level5: '#b91c1c',
};

const MOMENTUM_STYLES = {
  risk: {
    label: 'NEGATIVE',
    badgeClass: 'text-red-400',
  },
  neutral: {
    label: 'NEUTRAL',
    badgeClass: 'text-slate-300',
  },
  advocacy: {
    label: 'POSITIVE',
    badgeClass: 'text-emerald-400',
  },
} satisfies Record<RedditCommunitySignal['momentumType'], { label: string; badgeClass: string }>;

export function RedditCommunityColumn({ communitySignals, viralityTopics }: RedditCommunityColumnProps) {
  const [viralitySortOrder, setViralitySortOrder] = useState<'desc' | 'asc'>('desc');
  const chartViralityTopics = useMemo(
    () =>
      viralityTopics.map(topic => {
        const viewCount = Math.max(28000, Math.round(topic.viralityScore * 210));
        const upvotes = Math.max(1200, Math.round(topic.highImpactThreads * 32));

        const breakdown = REDDIT_SENTIMENT_LEVELS.map(level => ({
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
          viewCount,
          helpfulVotes: upvotes,
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
        ? (b.helpfulVotes ?? 0) - (a.helpfulVotes ?? 0)
        : (a.helpfulVotes ?? 0) - (b.helpfulVotes ?? 0)
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
          <tspan fill="#22c55e">⬆</tspan>
          <tspan fill="#ffffff" dx={4}>
            {numeric.toLocaleString()}
          </tspan>
        </text>
      </g>
    );
  };

  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-300 mt-2">
      {REDDIT_SENTIMENT_LEVELS.map(level => (
        <div key={level.key} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: GRADIENT_COLORS[level.key] }}
          />
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
          <div className="flex items-center gap-1 text-emerald-300 font-semibold">
            ⬆ {topic.helpfulVotes.toLocaleString()}
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
    <div className="flex flex-col gap-6">
      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Community Signals</CardTitle>
          <CardDescription>Key topics and their sentiment mix from Reddit banking threads</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {communitySignals.map((signal, index) => {
              const style = MOMENTUM_STYLES[signal.momentumType];
              return (
                <div key={index} className={SOCIAL_PANEL_BASE}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-white uppercase tracking-wide">{signal.signalLabel}</p>
                    <span className={`text-xs uppercase tracking-wide font-semibold ${style.badgeClass}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{signal.subreddit}</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl text-white font-semibold">
                      {signal.growthPercent.toLocaleString()}%
                    </span>
                    <span className="text-xs text-gray-400">
                      Momentum · {(signal.threadVolume ?? 0).toLocaleString()} threads
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{signal.insight}</p>
                  {signal.topMentions && signal.topMentions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {signal.topMentions.map(tag => (
                        <span
                          key={`${signal.subreddit}-${tag}`}
                          className="text-[11px] text-purple-200 bg-purple-500/10 border border-purple-500/30 rounded-full px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                Top 10 Dominant Topics by Virality
              </CardTitle>
              <CardDescription>
                Sentiment mix for the most viral Reddit banking threads this week
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={() => setViralitySortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              className="text-xs font-semibold uppercase tracking-wide text-purple-200 border border-white/15 bg-white/5 px-3 py-1 rounded-full hover:border-white/30 hover:text-white transition-colors"
            >
              Viral {viralitySortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedViralityTopics}
                layout="vertical"
                barCategoryGap="24%"
                barGap={8}
                margin={{ top: 12, right: 110, bottom: 12, left: 16 }}
              >
                <defs>
                  {sortedViralityTopics.map((topic, index) => (
                    <linearGradient
                      key={topic.name}
                      id={`reddit-topic-gradient-${index}`}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  tickFormatter={(value: number) => `${value}%`}
                  label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -8, fill: '#9CA3AF' }}
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
                <Legend verticalAlign="bottom" height={52} content={renderLegend} />
                <Bar dataKey="totalPercent" radius={[8, 8, 8, 8]} isAnimationActive={false}>
                  {sortedViralityTopics.map((topic, index) => (
                    <Cell key={`${topic.name}-cell`} fill={`url(#reddit-topic-gradient-${index})`} />
                  ))}
                  <LabelList dataKey="helpfulVotes" content={ViralityLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

