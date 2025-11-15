'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getAppStoreKPIs,
  getAppStoreViralityTopics,
  getAppStoreReviewAlerts,
  getAppStoreModerationDataset,
  getAppStoreModerationAreaData,
  getAppStoreSentimentLevelTimeline,
  getAppStoreTopicVolumeSplit,
  APPSTORE_SENTIMENT_LEVELS,
  AppStoreKPI,
  AppStoreViralityTopic,
  AppStoreReviewAlert,
  AppStoreTopicVolumeSplitEntry,
} from '@/lib/social/appstore';
import { AppStoreKPIRibbon } from '@/components/social/AppStoreKPIRibbon';
import { AppStoreCommunityColumn } from '@/components/social/AppStoreCommunityColumn';
import { AppStoreActionColumn } from '@/components/social/AppStoreActionColumn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, ThumbsUp, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { PositiveNegativeTopicVolumeChart } from '@/components/social/PositiveNegativeTopicVolumeChart';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_CHART_SURFACE } from '@/components/social/theme';

export default function AppStoreDashboardPage() {
  const [kpis, setKpis] = useState<AppStoreKPI[]>([]);
  const [viralityTopics, setViralityTopics] = useState<AppStoreViralityTopic[]>([]);
  const [reviewAlerts, setReviewAlerts] = useState<AppStoreReviewAlert[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<'moderation' | 'feature' | 'appreciation' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; levelKey: (typeof APPSTORE_SENTIMENT_LEVELS)[number]['key'] } | null>(null);

  const moderationDataset = useMemo(() => getAppStoreModerationDataset(), []);
  const moderationAreaData = useMemo(() => getAppStoreModerationAreaData(), []);
  const sentimentLevelTimeline = useMemo(() => getAppStoreSentimentLevelTimeline(), []);
  const topicVolumeSplit = useMemo<AppStoreTopicVolumeSplitEntry[]>(
    () => getAppStoreTopicVolumeSplit(),
    []
  );

  const selectedCategory = useMemo(
    () =>
      selectedCategoryKey
        ? moderationDataset.summaries.find(summary => summary.key === selectedCategoryKey)
        : undefined,
    [moderationDataset, selectedCategoryKey]
  );

  const selectedDetail = useMemo(() => {
    if (!selectedPoint) return null;
    const point = sentimentLevelTimeline.find(entry => entry.date === selectedPoint.date);
    if (!point) return null;
    const levelIndex = APPSTORE_SENTIMENT_LEVELS.findIndex(level => level.key === selectedPoint.levelKey);
    if (levelIndex === -1) return null;
    const level = APPSTORE_SENTIMENT_LEVELS[levelIndex];
    const share = point[selectedPoint.levelKey as keyof typeof point] as number;
    const totalReviews = Math.round((point.reviewVolume * share) / 100);
    const topics = point.topicsByLevel?.[selectedPoint.levelKey] ?? [];
    const totalHelpfulVotes = topics.reduce((sum, topic) => sum + topic.helpfulVotes, 0);
    const dateLabel = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let panelClasses = 'rounded-xl border border-white/10 bg-gray-900/80 p-4 mb-5';
    let metricLabelClass = 'text-xs uppercase tracking-wide text-gray-400';
    let reviewTextClass = 'text-xs text-gray-400';
    let helpfulTextClass = 'text-sky-200';
    let topicClasses = 'flex items-center justify-between rounded-lg border border-white/10 bg-gray-900/70 px-4 py-3';

    if (levelIndex === 0) {
      panelClasses = 'rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 mb-5';
      metricLabelClass = 'text-xs uppercase tracking-wide text-emerald-300';
      reviewTextClass = 'text-xs text-emerald-200';
      helpfulTextClass = 'text-emerald-200';
      topicClasses = 'flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3';
    } else if (levelIndex === 1) {
      panelClasses = 'rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 mb-5';
      metricLabelClass = 'text-xs uppercase tracking-wide text-sky-300';
      reviewTextClass = 'text-xs text-sky-200';
      helpfulTextClass = 'text-sky-200';
      topicClasses = 'flex items-center justify-between rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3';
    } else if (levelIndex === 2) {
      panelClasses = 'rounded-xl border border-slate-500/40 bg-slate-500/10 p-4 mb-5';
      metricLabelClass = 'text-xs uppercase tracking-wide text-slate-200';
      reviewTextClass = 'text-xs text-slate-200';
      helpfulTextClass = 'text-slate-200';
      topicClasses = 'flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-500/5 px-4 py-3';
    } else if (levelIndex === 3) {
      panelClasses = 'rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-5';
      metricLabelClass = 'text-xs uppercase tracking-wide text-amber-300';
      reviewTextClass = 'text-xs text-amber-200';
      helpfulTextClass = 'text-amber-200';
      topicClasses = 'flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3';
    } else if (levelIndex === 4) {
      panelClasses = 'rounded-xl border border-red-500/40 bg-red-500/10 p-4 mb-5';
      metricLabelClass = 'text-xs uppercase tracking-wide text-red-300';
      reviewTextClass = 'text-xs text-red-200';
      helpfulTextClass = 'text-red-200';
      topicClasses = 'flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3';
    }

    return {
      point,
      level,
      levelIndex: levelIndex + 1,
      topics,
      totalReviews,
      totalHelpfulVotes,
      dateLabel,
      styles: {
        panelClasses,
        metricLabelClass,
        reviewTextClass,
        helpfulTextClass,
        topicClasses,
      },
    };
  }, [selectedPoint, sentimentLevelTimeline]);

  useEffect(() => {
    if (
      selectedCategoryKey &&
      !moderationDataset.summaries.some(summary => summary.key === selectedCategoryKey)
    ) {
      setSelectedCategoryKey(null);
    }
  }, [moderationDataset, selectedCategoryKey]);

  useEffect(() => {
    setKpis(getAppStoreKPIs());
    setViralityTopics(getAppStoreViralityTopics());
    setReviewAlerts(getAppStoreReviewAlerts());
  }, []);

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <AppStoreKPIRibbon data={kpis} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-6 items-start min-h-[560px]">
          <AppStoreCommunityColumn viralityTopics={viralityTopics} />
          <div className="flex flex-col gap-6 min-h-0">
            <AppStoreActionColumn alerts={reviewAlerts} />
          </div>
        </div>

        <Card className={SOCIAL_CARD_BASE}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Moderation & Feature Demand
            </CardTitle>
            <CardDescription className="text-gray-400">
              Surface App Store moderation hotspots and feature demand emerging from review streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {moderationDataset.summaries.map(summary => (
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
                      <span>{APPSTORE_SENTIMENT_LEVELS.find(level => level.key === summary.dominantSentiment)?.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-2xl font-semibold text-white">
                        {summary.totalReviews.toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal ml-2">reviews</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {summary.totalTopics.toLocaleString()} topics
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Helpful votes:{' '}
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
                  {moderationAreaData.length > 0 ? (
                    <div className={SOCIAL_CHART_SURFACE}>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={moderationAreaData} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
                        <defs>
                          <linearGradient id="appStoreModerationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="appStoreFeatureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="appStoreAppreciationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.65} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="level" tick={{ fill: '#CBD5F5', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={value => `${value}%`}
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                          formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]}
                        />
                        <Legend verticalAlign="bottom" wrapperStyle={{ color: '#CBD5F5', fontSize: 12, paddingTop: 16 }} />
                        <Area
                          type="monotone"
                          name="Moderation Load"
                          dataKey="moderation"
                          stroke="#f97316"
                          strokeWidth={selectedCategoryKey === 'moderation' ? 3 : 2}
                          fill="url(#appStoreModerationGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('moderation')}
                          cursor="pointer"
                        />
                        <Area
                          type="monotone"
                          name="Feature Demand"
                          dataKey="feature"
                          stroke="#38bdf8"
                          strokeWidth={selectedCategoryKey === 'feature' ? 3 : 2}
                          fill="url(#appStoreFeatureGradient)"
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
                          fill="url(#appStoreAppreciationGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('appreciation')}
                          cursor="pointer"
                        />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Not enough review signals yet to visualise moderation, feature demand, and appreciation.
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
                          {selectedCategory.totalReviews.toLocaleString()} reviews ·{' '}
                          {selectedCategory.totalHelpfulVotes.toLocaleString()} helpful votes
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 pt-2">
                        {selectedCategory.key === 'feature'
                          ? 'Requested capabilities & enhancements'
                          : selectedCategory.key === 'appreciation'
                          ? 'Customer delight stories & shout-outs'
                          : 'Key moderation pressure points'}
                      </div>

                      <TooltipProvider delayDuration={150}>
                        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                          {selectedCategory.topics.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">
                              No dominant topics detected for this category.
                            </p>
                          ) : (
                            selectedCategory.topics.map(topic => {
                              const hasWordCloud = Array.isArray(topic.wordCloud) && topic.wordCloud.length > 0;
                              const card = (
                                <div
                                  key={`${selectedCategory.key}-${topic.name}`}
                                  className={`bg-gray-900/60 border rounded-lg p-3 transition-colors duration-200 ${
                                    selectedCategory.key === 'feature'
                                      ? 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-900/80'
                                      : selectedCategory.key === 'appreciation'
                                      ? 'border-emerald-500/40 hover:border-emerald-400/60 hover:bg-gray-900/80'
                                      : 'border-gray-700'
                                  }`}
                                >
                                  <div>
                                    <div className="text-sm font-semibold text-white">{topic.name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1">
                                      {topic.totalReviews.toLocaleString()} reviews · {topic.helpfulVotes.toLocaleString()} helpful votes
                                    </div>
                                  </div>
                                </div>
                              );

                              if ((selectedCategory.key === 'feature' || selectedCategory.key === 'appreciation') && hasWordCloud) {
                                const maxWeight = Math.max(...topic.wordCloud!.map(entry => entry.weight), 1);
                                const wordCloudColor =
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
                                            Weighted by frequency across App Store feedback
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
                                                className={`font-semibold ${wordCloudColor}`}
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
              App Store clusters comparing delight versus detractor review volume across EU audiences
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <PositiveNegativeTopicVolumeChart data={topicVolumeSplit} />
          </CardContent>
        </Card>

        <Card className={SOCIAL_CARD_BASE}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              Daily App Store Reviews by Sentiment Level
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sentiment intensity across App Store reviews with helpful-vote momentum
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
                    data={sentimentLevelTimeline.map(point => ({
                      ...point,
                      dateLabel: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    }))}
                    margin={{ top: 12, right: 32, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="dateLabel" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value: number) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Share of reviews', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ color: '#CBD5F5', fontSize: 12 }}
                      formatter={(value: string) => {
                        const match = APPSTORE_SENTIMENT_LEVELS.find(level => level.key === value);
                        return match ? match.label : value;
                      }}
                    />
                    {selectedDetail && <ReferenceLine x={selectedDetail.dateLabel} stroke="#ffffff33" />}
                    {APPSTORE_SENTIMENT_LEVELS.map(level => (
                      <Line
                        key={level.key}
                        type="monotone"
                        dataKey={level.key}
                        name={level.key}
                        stroke={level.color}
                        strokeWidth={2.5}
                        strokeOpacity={0.8}
                        dot={(props: any) => {
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
                              fill={radius > 0 ? level.color : 'transparent'}
                              stroke={radius > 0 ? '#0f172a' : 'none'}
                              strokeWidth={radius > 0 ? (isSelected ? 2 : 1.5) : 0}
                              cursor={radius > 0 ? 'pointer' : 'default'}
                              onClick={() =>
                                radius > 0 && setSelectedPoint({ date: payload.date, levelKey: level.key })
                              }
                            />
                          );
                        }}
                        activeDot={false}
                      />
                    ))}
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
                          <h3 className="text-white font-semibold text-lg">{selectedDetail.dateLabel}</h3>
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
                      <p className={selectedDetail.styles.metricLabelClass}>Total reviews</p>
                      <p className="text-3xl font-semibold text-white mt-1">
                        {selectedDetail.totalReviews.toLocaleString()}
                      </p>
                      {selectedDetail.totalHelpfulVotes > 0 && (
                        <p className={`${selectedDetail.styles.helpfulTextClass} mt-2`}>
                          {selectedDetail.totalHelpfulVotes.toLocaleString()} helpful votes
                        </p>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Topics for {selectedDetail.level.label} ({selectedDetail.topics.length})
                    </p>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                      {selectedDetail.topics.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center">
                          No surfaced topics captured for this sentiment level.
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
                                Review segment with highest traction for this sentiment cluster
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs">
                              <span className="font-semibold text-inherit">
                                {topic.reviews.toLocaleString()} reviews
                              </span>
                              {topic.helpfulVotes > 0 && (
                                <span className={selectedDetail.styles.helpfulTextClass}>
                                  {topic.helpfulVotes.toLocaleString()} helpful
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

