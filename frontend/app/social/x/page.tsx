'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ThumbsUp, X as XIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getXKPIs,
  getXHashtagTrends,
  getXTrendingPosts,
  getXResponseAlerts,
  getXCreatorWatchlist,
  XKPI,
  XHashtagTrend,
  XTrendingPost,
  XResponseAlert,
  XCreatorWatch,
  X_SENTIMENT_LEVELS,
  getXComplianceFeatureDataset,
  getXComplianceFeatureAreaData,
  getXSentimentLevelTimeline,
  getXViralityTopics,
  getXTopicVolumeSplit,
  XTopicVolumeSplitEntry,
} from '@/lib/social/x';
import { XKPIRibbon } from '@/components/social/XKPIRibbon';
import { XEngagementColumn } from '@/components/social/XEngagementColumn';
import { XActionColumn } from '@/components/social/XActionColumn';
import { PositiveNegativeTopicVolumeChart } from '@/components/social/PositiveNegativeTopicVolumeChart';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_CHART_SURFACE } from '@/components/social/theme';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';

type DatePreset = '24h' | '3d' | '7d' | '30d' | 'custom';

interface DateRange {
  start: string;
  end: string;
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
];

export default function XIntelligenceDashboard() {
  const [kpis, setKpis] = useState<XKPI[]>([]);
  const [hashtags, setHashtags] = useState<XHashtagTrend[]>([]);
  const [posts, setPosts] = useState<XTrendingPost[]>([]);
  const [alerts, setAlerts] = useState<XResponseAlert[]>([]);
  const [creators, setCreators] = useState<XCreatorWatch[]>([]);
  const [preset, setPreset] = useState<DatePreset>('7d');
  const [range, setRange] = useState<DateRange>({ start: '', end: '' });
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<'compliance' | 'feature' | 'appreciation' | null>(null);

  const hydrate = () => {
    setKpis(getXKPIs());
    setHashtags(getXHashtagTrends());
    setPosts(getXTrendingPosts());
    setAlerts(getXResponseAlerts());
    setCreators(getXCreatorWatchlist());
  };

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    setRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
    hydrate();
  }, []);

  const updateRangeForPreset = (value: DatePreset) => {
    if (value === 'custom') return;
    const today = new Date();
    const start = new Date(today);
    switch (value) {
      case '24h':
        start.setDate(today.getDate() - 1);
        break;
      case '3d':
        start.setDate(today.getDate() - 3);
        break;
      case '7d':
        start.setDate(today.getDate() - 7);
        break;
      case '30d':
        start.setDate(today.getDate() - 30);
        break;
    }
    setRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
  };

  const handlePresetChange = (value: DatePreset) => {
    setPreset(value);
    updateRangeForPreset(value);
  };

  const complianceFeatureDataset = useMemo(() => getXComplianceFeatureDataset(), []);
  const sentimentAreaData = useMemo(() => getXComplianceFeatureAreaData(), []);
  const hasAreaData = sentimentAreaData.length > 0;
  const viralityTopics = useMemo(() => getXViralityTopics(), []);
  const topicVolumeSplit = useMemo<XTopicVolumeSplitEntry[]>(
    () => getXTopicVolumeSplit(),
    []
  );
  const sentimentLevelTimeline = useMemo(() => {
    const baseTimeline = getXSentimentLevelTimeline();
    const levelTopicWeights = X_SENTIMENT_LEVELS.reduce(
      (acc, level) => ({
        ...acc,
        [level.key]: viralityTopics
          .map((topic) => ({
            topic: topic.name,
            weight: (topic as any)[level.key] ?? 0,
            likes: topic.likes,
          }))
          .filter((entry) => entry.weight > 0),
      }),
      {} as Record<string, Array<{ topic: string; weight: number; likes: number }>>
    );

    return baseTimeline.map((point) => {
      const topicsByLevel: Record<string, Array<{ topic: string; tweets: number; likes: number }>> = {};

      X_SENTIMENT_LEVELS.forEach((level) => {
        const entries = levelTopicWeights[level.key] ?? [];
        if (entries.length === 0) {
          topicsByLevel[level.key] = [];
          return;
        }

        const sorted = [...entries].sort((a, b) => b.weight - a.weight);
        const limited = sorted.slice(0, 4);
        const totalWeight = limited.reduce((sum, entry) => sum + entry.weight, 0) || 1;
        let remainingTweets = point[level.key as keyof typeof point] as number;

        const topics = limited.map((entry, index) => {
          const proportionalTweets = Math.max(
            0,
            Math.round(((point[level.key as keyof typeof point] as number) * entry.weight) / totalWeight)
          );
          let tweets =
            index === limited.length - 1 ? remainingTweets : Math.min(proportionalTweets, remainingTweets);
          remainingTweets = Math.max(0, remainingTweets - tweets);

          const likesEstimate = Math.round((entry.likes * entry.weight) / (totalWeight || 1) * 0.5);
          return {
            topic: entry.topic,
            tweets,
            likes: likesEstimate,
          };
        });

        if (remainingTweets > 0 && topics.length > 0) {
          topics[topics.length - 1].tweets += remainingTweets;
        }

        topicsByLevel[level.key] = topics.filter((topic) => topic.tweets > 0);
      });

      return {
        ...point,
        dateLabel: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        topicsByLevel,
      };
    });
  }, [viralityTopics]);
  const [selectedPoint, setSelectedPoint] = useState<{
    date: string;
    levelKey: (typeof X_SENTIMENT_LEVELS)[number]['key'];
  } | null>(null);
  const selectedDetail = useMemo(() => {
    if (!selectedPoint) return null;
    const point = sentimentLevelTimeline.find((entry) => entry.date === selectedPoint.date);
    if (!point) return null;
    const levelIndex = X_SENTIMENT_LEVELS.findIndex((lvl) => lvl.key === selectedPoint.levelKey);
    if (levelIndex === -1) return null;
    const level = X_SENTIMENT_LEVELS[levelIndex];
    const topics = point.topicsByLevel?.[selectedPoint.levelKey] ?? [];
    const totalTweets = point[selectedPoint.levelKey as keyof typeof point] as number;
    const totalLikes = topics.reduce((sum, topic) => sum + topic.likes, 0);

    const baseColor = level.color;
    let panelClasses =
      'rounded-xl border border-white/10 bg-gray-900/80 p-4 mb-5';
    let topicClasses =
      'flex items-center justify-between rounded-lg border border-white/10 bg-gray-900/70 px-4 py-3';
    let metricLabelClass = 'text-xs uppercase tracking-wide text-gray-400';
    let tweetTextClass = 'text-xs text-gray-400';
    let likesTextClass = 'text-rose-300';

    if (levelIndex === 0) {
      panelClasses = 'rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 mb-5';
      topicClasses =
        'flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3';
      metricLabelClass = 'text-xs uppercase tracking-wide text-emerald-300';
      tweetTextClass = 'text-xs text-emerald-200';
      likesTextClass = 'text-emerald-200';
    } else if (levelIndex === 1) {
      panelClasses = 'rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 mb-5';
      topicClasses =
        'flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3';
      metricLabelClass = 'text-xs uppercase tracking-wide text-blue-300';
      tweetTextClass = 'text-xs text-blue-200';
      likesTextClass = 'text-blue-200';
    } else if (levelIndex === 2) {
      panelClasses = 'rounded-xl border border-slate-500/40 bg-slate-500/10 p-4 mb-5';
      topicClasses =
        'flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-500/5 px-4 py-3';
      metricLabelClass = 'text-xs uppercase tracking-wide text-slate-200';
      tweetTextClass = 'text-xs text-slate-200';
      likesTextClass = 'text-slate-300';
    } else if (levelIndex === 3) {
      panelClasses = 'rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-5';
      topicClasses =
        'flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3';
      metricLabelClass = 'text-xs uppercase tracking-wide text-amber-300';
      tweetTextClass = 'text-xs text-amber-200';
      likesTextClass = 'text-amber-200';
    } else if (levelIndex === 4) {
      panelClasses = 'rounded-xl border border-red-500/40 bg-red-500/10 p-4 mb-5';
      topicClasses =
        'flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3';
      metricLabelClass = 'text-xs uppercase tracking-wide text-red-300';
      tweetTextClass = 'text-xs text-red-200';
      likesTextClass = 'text-red-200';
    }

    return {
      point,
      level,
      levelIndex: levelIndex + 1,
      topics,
      totalTweets,
      totalLikes,
      styles: {
        panelClasses,
        topicClasses,
        metricLabelClass,
        tweetTextClass,
        likesTextClass,
        baseColor,
      },
    };
  }, [selectedPoint, sentimentLevelTimeline]);

  useEffect(() => {
    if (
      selectedCategoryKey &&
      !complianceFeatureDataset.summaries.some(summary => summary.key === selectedCategoryKey)
    ) {
      setSelectedCategoryKey(null);
    }
  }, [complianceFeatureDataset, selectedCategoryKey]);

  const selectedCategory = useMemo(
    () =>
      selectedCategoryKey
        ? complianceFeatureDataset.summaries.find(summary => summary.key === selectedCategoryKey)
        : undefined,
    [complianceFeatureDataset, selectedCategoryKey]
  );

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <XKPIRibbon data={kpis} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-6 items-start min-h-[560px]">
          <XEngagementColumn hashtagTrends={hashtags} trendingPosts={posts} />
          <div className="flex flex-col h-full min-h-0">
            <XActionColumn responseAlerts={alerts} creatorWatchlist={creators} />
          </div>
        </div>

        <Card className={SOCIAL_CARD_BASE}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Concern & Feature Request
            </CardTitle>
            <CardDescription className="text-gray-400">
              Surface regulated risk hotspots and product demand directly from X conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {complianceFeatureDataset.summaries.map(summary => (
                  <button
                    key={summary.key}
                    onClick={() => setSelectedCategoryKey(summary.key)}
                    className={`text-left rounded-xl border transition-all duration-200 ${
                      summary.key === selectedCategoryKey
                        ? 'border-purple-500/60 bg-gray-900 shadow-lg shadow-purple-500/10'
                        : 'border-gray-700 bg-gray-900/40 hover:border-white/30'
                    } p-4 space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                      <span>{summary.label}</span>
                      <span>{summary.dominantSentiment.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-2xl font-semibold text-white">
                        {summary.totalPosts.toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal ml-2">tweets</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {summary.totalTopics.toLocaleString()} topics
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Likes:{' '}
                      <span className="text-sm text-white font-semibold">
                        {summary.totalHelpfulVotes.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col xl:flex-row xl:items-stretch gap-6">
                <div
                  className={[
                    SOCIAL_PANEL_BASE,
                    'w-full h-[420px] p-4',
                    selectedCategory ? 'xl:w-2/3' : '',
                  ].join(' ')}
                >
                  {hasAreaData ? (
                    <div className={SOCIAL_CHART_SURFACE}>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={sentimentAreaData} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
                        <defs>
                          <linearGradient id="xComplianceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="xFeatureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="xAppreciationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.65} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="level"
                          tick={{ fill: '#CBD5F5', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={value => `${value}%`}
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                          }}
                          formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]}
                        />
                        <Legend verticalAlign="bottom" wrapperStyle={{ color: '#CBD5F5', fontSize: 12, paddingTop: 16 }} />
                        <Area
                          type="monotone"
                          name="Concern"
                          dataKey="compliance"
                          stroke="#f97316"
                          strokeWidth={selectedCategoryKey === 'compliance' ? 3 : 2}
                          fill="url(#xComplianceGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('compliance')}
                          cursor="pointer"
                        />
                        <Area
                          type="monotone"
                          name="Feature Requests"
                          dataKey="feature"
                          stroke="#38bdf8"
                          strokeWidth={selectedCategoryKey === 'feature' ? 3 : 2}
                          fill="url(#xFeatureGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('feature')}
                          cursor="pointer"
                        />
                        <Area
                          type="monotone"
                          name="Appreciation"
                          dataKey="appreciation"
                          stroke="#34d399"
                          strokeWidth={selectedCategoryKey === 'appreciation' ? 3 : 2}
                          fill="url(#xAppreciationGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('appreciation')}
                          cursor="pointer"
                        />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Not enough sentiment signals yet to visualise concerns, feature requests, and appreciation themes.
                    </div>
                  )}
                </div>

                {selectedCategory && (
                  <div
                    className={[
                      SOCIAL_PANEL_BASE,
                      'relative w-full xl:w-[420px] p-6 h-[420px] flex flex-col overflow-hidden',
                    ].join(' ')}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 text-gray-400 hover:text-white"
                      onClick={() => setSelectedCategoryKey(null)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col gap-4 h-full overflow-hidden">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{selectedCategory.label}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedCategory.totalTopics.toLocaleString()} topics ·{' '}
                          {selectedCategory.totalPosts.toLocaleString()} posts ·{' '}
                          {selectedCategory.totalHelpfulVotes.toLocaleString()} helpful votes
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 pt-2">
                        {selectedCategory.key === 'feature'
                          ? 'Requested capabilities & enhancements'
                          : selectedCategory.key === 'appreciation'
                          ? 'Customer delight stories & shout-outs'
                          : 'Key concern issues raised'}
                      </div>

                      <TooltipProvider delayDuration={150}>
                        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                          {selectedCategory.topics.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No dominant topics detected for this category.</p>
                          ) : (
                            selectedCategory.topics.map(topic => {
                              const hasWordCloud = Array.isArray(topic.wordCloud) && topic.wordCloud.length > 0;
                              const card = (
                                <div
                                  key={`${selectedCategory.key}-${topic.name}`}
                                  className={[
                                    'bg-gray-900/60 border rounded-lg p-3 transition-colors duration-200',
                                    selectedCategory.key === 'feature'
                                      ? 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-900/80'
                                      : selectedCategory.key === 'appreciation'
                                      ? 'border-emerald-500/40 hover:border-emerald-400/60 hover:bg-gray-900/80'
                                      : 'border-gray-700',
                                  ].join(' ')}
                                >
                                  <div>
                                    <div className="text-sm font-semibold text-white">{topic.name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1">
                                      {topic.totalPosts.toLocaleString()} tweets · {topic.helpfulVotes.toLocaleString()}{' '}
                                      likes
                                    </div>
                                  </div>
                                </div>
                              );

                              if ((selectedCategory.key === 'feature' || selectedCategory.key === 'appreciation') && hasWordCloud) {
                                const maxWeight = Math.max(...topic.wordCloud!.map(entry => entry.weight), 1);
                                const wordColor =
                                  selectedCategory.key === 'appreciation' ? 'text-emerald-300' : 'text-sky-300';
                                return (
                                  <UITooltip key={`${selectedCategory.key}-${topic.name}`}>
                                    <TooltipTrigger asChild>{card}</TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="start"
                                      className="max-w-sm bg-gray-900 border border-purple-700/40 text-white"
                                    >
                                      <div className="space-y-3">
                                        <div>
                                          <h4 className="text-sm font-semibold">
                                            {selectedCategory.key === 'feature'
                                              ? `Requested keywords for ${topic.name}`
                                              : `What customers loved about ${topic.name}`}
                                          </h4>
                                          <p className="text-[11px] text-gray-400">
                                            Weighted by frequency across X conversations
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                          {topic.wordCloud!.map(entry => {
                                            const ratio = entry.weight / maxWeight;
                                            const fontSize = 12 + ratio * 14;
                                            const opacity = 0.55 + ratio * 0.45;
                                            return (
                                              <span
                                                key={`${topic.name}-${entry.term}`}
                                                className={`font-semibold ${wordColor}`}
                                                style={{ fontSize, opacity }}
                                              >
                                                {entry.term}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </UITooltip>
                                );
                              }

                              return card;
                            })
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={SOCIAL_CARD_BASE}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ThumbsUp className="h-5 w-5 text-emerald-400" />
              Positive vs Negative Topic Volume
            </CardTitle>
            <CardDescription className="text-gray-400">
              X conversation clusters contrasting momentum of advocates versus detractors
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <PositiveNegativeTopicVolumeChart data={topicVolumeSplit} />
          </CardContent>
        </Card>

        <Card className={SOCIAL_CARD_BASE}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              Daily Social Media Posts by Sentiment Level
            </CardTitle>
            <CardDescription className="text-gray-400">
              Trend of X sentiment intensity across the past two weeks with total tweet volume
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="flex flex-col xl:flex-row gap-6">
              <div
                className={[
                  SOCIAL_PANEL_BASE,
                  'w-full p-4',
                  selectedDetail ? 'xl:w-2/3' : '',
                ].join(' ')}
              >
                <div className={SOCIAL_CHART_SURFACE}>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart
                    data={sentimentLevelTimeline}
                    margin={{ top: 12, right: 32, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value: number) => `${value}`}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Tweets', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ color: '#CBD5F5', fontSize: 12 }}
                      formatter={(value: string) => {
                        const match = X_SENTIMENT_LEVELS.find(level => level.key === value);
                        return match ? match.label : value;
                      }}
                    />
                    {selectedDetail && <ReferenceLine x={selectedDetail.point.dateLabel} stroke="#ffffff33" />}
                    {X_SENTIMENT_LEVELS.map(level => {
                      const renderDot = (props: any) => {
                        const { cx = 0, cy = 0, payload } = props;
                        const value = payload?.[level.key];
                        const isSelected =
                          value !== undefined &&
                          value !== null &&
                          selectedPoint?.date === payload.date &&
                          selectedPoint?.levelKey === level.key;
                        const radius = value === undefined || value === null ? 0 : isSelected ? 6 : 4;
                        return (
                          <circle
                            key={`${level.key}-${payload?.date ?? payload?.dateLabel ?? cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={level.color}
                            stroke="#0f172a"
                            strokeWidth={radius > 0 ? (isSelected ? 2 : 1.5) : 0}
                            cursor={radius > 0 ? 'pointer' : 'default'}
                            onClick={() =>
                              radius > 0 && setSelectedPoint({ date: payload.date, levelKey: level.key })
                            }
                          />
                        );
                      };
                      return (
                        <Line
                          key={level.key}
                          type="monotone"
                          dataKey={level.key}
                          name={level.key}
                          stroke={level.color}
                          strokeWidth={2.5}
                          strokeOpacity={0.8}
                          dot={renderDot}
                          activeDot={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
                </div>
              </div>

              {selectedDetail && (
                <div className="w-full xl:w-1/3">
                  <div className={[SOCIAL_PANEL_BASE, 'h-full p-5 flex flex-col'].join(' ')}>
                    <div className="flex items-start justify-between gap-3 mb-6">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-2 inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: selectedDetail.level.color }}
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">{selectedDetail.point.dateLabel}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Sentiment Level {selectedDetail.levelIndex}: {selectedDetail.level.label}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        onClick={() => setSelectedPoint(null)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className={selectedDetail.styles.panelClasses}>
                      <p className={selectedDetail.styles.metricLabelClass}>Total tweets</p>
                      <p className="text-3xl font-semibold text-white mt-1">
                        {selectedDetail.totalTweets.toLocaleString()}
                      </p>
                      {selectedDetail.totalLikes > 0 && (
                        <p className={`${selectedDetail.styles.likesTextClass} mt-2`}>
                          {selectedDetail.totalLikes.toLocaleString()} estimated likes
                        </p>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Topics for {selectedDetail.level.label} ({selectedDetail.topics.length})
                    </p>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                      {selectedDetail.topics.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center">
                          No trending topics captured for this sentiment level.
                        </p>
                      ) : (
                        selectedDetail.topics.map((topic, idx) => (
                          <div
                            key={`${selectedDetail.level.key}-${topic.topic}-${idx}`}
                            className={selectedDetail.styles.topicClasses}
                          >
                            <div className="flex-1 pr-3">
                              <p className="text-sm font-semibold text-white leading-snug">{topic.topic}</p>
                              <p className="text-[11px] text-inherit mt-1 opacity-70">
                                Signal from verified & high-reach accounts
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs">
                              <span className="font-semibold text-inherit">
                                {topic.tweets.toLocaleString()} tweets
                              </span>
                              {topic.likes > 0 && (
                                <span className={selectedDetail.styles.likesTextClass}>
                                  {topic.likes.toLocaleString()} likes
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
