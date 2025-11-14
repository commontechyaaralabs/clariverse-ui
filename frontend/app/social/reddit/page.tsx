'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getRedditKPIs,
  getRedditCommunitySignals,
  getRedditModerationAlerts,
  getRedditInfluencers,
  getRedditComplianceFeatureDataset,
  getRedditComplianceFeatureAreaData,
  getRedditSentimentLevelTimeline,
  getRedditViralityTopics,
  REDDIT_SENTIMENT_LEVELS,
  RedditKPI,
  RedditCommunitySignal,
  RedditModerationAlert,
  RedditInfluencer,
} from '@/lib/social/reddit';
import { RedditKPIRibbon } from '@/components/social/RedditKPIRibbon';
import { RedditCommunityColumn } from '@/components/social/RedditCommunityColumn';
import { RedditActionColumn } from '@/components/social/RedditActionColumn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';

export default function RedditDashboardPage() {
  const [kpis, setKpis] = useState<RedditKPI[]>([]);
  const [signals, setSignals] = useState<RedditCommunitySignal[]>([]);
  const [moderationAlerts, setModerationAlerts] = useState<RedditModerationAlert[]>([]);
  const [influencers, setInfluencers] = useState<RedditInfluencer[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<'moderation' | 'feature' | 'appreciation' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; levelKey: (typeof REDDIT_SENTIMENT_LEVELS)[number]['key'] } | null>(null);

  const loadData = () => {
    setKpis(getRedditKPIs());
    setSignals(getRedditCommunitySignals());
    setModerationAlerts(getRedditModerationAlerts());
    setInfluencers(getRedditInfluencers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const complianceFeatureDataset = useMemo(() => getRedditComplianceFeatureDataset(), []);
  const sentimentAreaData = useMemo(() => getRedditComplianceFeatureAreaData(), []);
  const hasAreaData = sentimentAreaData.length > 0;
  const viralityTopics = useMemo(() => getRedditViralityTopics(), []);
  const sentimentLevelTimeline = useMemo(() => getRedditSentimentLevelTimeline(), []);

  const selectedCategory = useMemo(
    () =>
      selectedCategoryKey
        ? complianceFeatureDataset.summaries.find(summary => summary.key === selectedCategoryKey)
        : undefined,
    [complianceFeatureDataset, selectedCategoryKey]
  );

  const selectedDetail = useMemo(() => {
    if (!selectedPoint) return null;
    const point = sentimentLevelTimeline.find(entry => entry.date === selectedPoint.date);
    if (!point) return null;
    const levelIndex = REDDIT_SENTIMENT_LEVELS.findIndex(level => level.key === selectedPoint.levelKey);
    if (levelIndex === -1) return null;
    const level = REDDIT_SENTIMENT_LEVELS[levelIndex];
    const dateLabel = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const topics = viralityTopics
      .map(topic => ({
        topic: topic.name,
        threads: Math.max(1, Math.round((point[selectedPoint.levelKey as keyof typeof point] as number) * (topic.viralityScore / 600))),
        upvotes: Math.round(topic.highImpactThreads * (0.6 + levelIndex * 0.12)),
      }))
      .filter(topic => topic.threads > 0)
      .slice(0, 4);

    const totalThreads = point[selectedPoint.levelKey as keyof typeof point] as number;
    const totalUpvotes = topics.reduce((sum, topic) => sum + topic.upvotes, 0);

    const panelClasses =
      levelIndex === 0
        ? 'rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 mb-5'
        : levelIndex === 1
        ? 'rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 mb-5'
        : levelIndex === 2
        ? 'rounded-xl border border-slate-500/40 bg-slate-500/10 p-4 mb-5'
        : levelIndex === 3
        ? 'rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-5'
        : 'rounded-xl border border-red-500/40 bg-red-500/10 p-4 mb-5';

    const topicClasses =
      levelIndex === 0
        ? 'flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3'
        : levelIndex === 1
        ? 'flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3'
        : levelIndex === 2
        ? 'flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-500/5 px-4 py-3'
        : levelIndex === 3
        ? 'flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3'
        : 'flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3';

  const metricLabelClass =
    levelIndex === 0
      ? 'text-xs uppercase tracking-wide text-emerald-300'
      : levelIndex === 1
      ? 'text-xs uppercase tracking-wide text-blue-300'
      : levelIndex === 2
      ? 'text-xs uppercase tracking-wide text-slate-200'
      : levelIndex === 3
      ? 'text-xs uppercase tracking-wide text-amber-300'
      : 'text-xs uppercase tracking-wide text-red-300';

  const upvoteTextClass =
    levelIndex === 0
      ? 'text-emerald-200'
      : levelIndex === 1
      ? 'text-blue-200'
      : levelIndex === 2
      ? 'text-slate-200'
      : levelIndex === 3
      ? 'text-amber-200'
      : 'text-red-200';

    return {
      point,
      level,
      levelIndex: levelIndex + 1,
      topics,
      totalThreads,
      totalUpvotes,
      dateLabel,
      styles: {
        panelClasses,
        topicClasses,
        metricLabelClass,
        upvoteTextClass,
      },
    };
  }, [selectedPoint, sentimentLevelTimeline, viralityTopics]);

  useEffect(() => {
    if (
      selectedCategoryKey &&
      !complianceFeatureDataset.summaries.some(summary => summary.key === selectedCategoryKey)
    ) {
      setSelectedCategoryKey(null);
    }
  }, [complianceFeatureDataset, selectedCategoryKey]);
  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <RedditKPIRibbon data={kpis} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-6 items-start min-h-[560px]">
          <RedditCommunityColumn communitySignals={signals} viralityTopics={viralityTopics} />
          <RedditActionColumn moderationAlerts={moderationAlerts} influencers={influencers} />
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Moderation & Feature Demand
            </CardTitle>
            <CardDescription className="text-gray-400">
              Surface Reddit moderation hotspots and community feature demand across EU banking threads
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
                        : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'
                    } p-4 space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                      <span>{summary.label}</span>
                      <span>{REDDIT_SENTIMENT_LEVELS.find(level => level.key === summary.dominantSentiment)?.short}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-2xl font-semibold text-white">
                        {summary.totalThreads.toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal ml-2">threads</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {summary.totalTopics.toLocaleString()} themes
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Upvotes:{' '}
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
                    'w-full bg-gray-800/60 border border-gray-700 rounded-xl p-4 h-[420px]',
                    selectedCategory ? 'xl:w-2/3' : '',
                  ].join(' ')}
                >
                  {hasAreaData ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={sentimentAreaData} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
                        <defs>
                          <linearGradient id="redditModerationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="redditFeatureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="redditAppreciationGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <Legend verticalAlign="bottom" wrapperStyle={{ color: '#CBD5F5', fontSize: 12, paddingTop: 16 }} />
                        <Area
                          type="monotone"
                          name="Moderation Load"
                          dataKey="moderation"
                          stroke="#f97316"
                          strokeWidth={selectedCategoryKey === 'moderation' ? 3 : 2}
                          fill="url(#redditModerationGradient)"
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
                          fill="url(#redditFeatureGradient)"
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
                          fill="url(#redditAppreciationGradient)"
                          activeDot={{ r: 6 }}
                          onClick={() => setSelectedCategoryKey('appreciation')}
                          cursor="pointer"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Not enough sentiment signals yet to visualise moderation, feature demand, and appreciation themes.
                    </div>
                  )}
                </div>

                {selectedCategory && (
                  <div className="relative w-full xl:w-[420px] bg-gray-800/60 border border-gray-700 rounded-xl p-6 shadow-inner h-[420px] flex flex-col overflow-hidden">
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
                          {selectedCategory.totalThreads.toLocaleString()} threads ·{' '}
                          {selectedCategory.totalHelpfulVotes.toLocaleString()} upvotes
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 pt-2">
                        {selectedCategory.key === 'feature'
                          ? 'Requested capabilities & enhancements'
                          : selectedCategory.key === 'appreciation'
                          ? 'Community delight stories & shout-outs'
                          : 'Key moderation pressure points'}
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
                                    {topic.totalThreads.toLocaleString()} threads · {topic.helpfulVotes.toLocaleString()}{' '}
                                    upvotes
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
                                            : `What the community loved about ${topic.name}`}
                                        </h4>
                                        <p className="text-[11px] text-gray-400">
                                          Weighted by frequency across Reddit feedback
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

                            return (
                              <UITooltip key={`${selectedCategory.key}-${topic.name}`}>
                                <TooltipTrigger asChild>{card}</TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="start"
                                  className="max-w-sm bg-gray-900 border border-purple-700/40 text-white"
                                >
                                  <p className="text-xs text-gray-400">
                                    Surface moderator note: escalate threads that cross security or compliance policies.
                                  </p>
                                </TooltipContent>
                              </UITooltip>
                            );
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

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              Daily Reddit Threads by Sentiment Level
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sentiment intensity across EU banking subreddits with upvote momentum
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="flex flex-col xl:flex-row gap-6">
              <div className={`w-full ${selectedDetail ? 'xl:w-2/3' : ''}`}>
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart
                    data={sentimentLevelTimeline.map(point => ({
                      ...point,
                      dateLabel: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    }))}
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
                      label={{ value: 'Threads', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ color: '#CBD5F5', fontSize: 12 }}
                      formatter={(value: string) => {
                        const match = REDDIT_SENTIMENT_LEVELS.find(level => level.key === value);
                        return match ? match.label : value;
                      }}
                    />
                    {selectedDetail && <ReferenceLine x={selectedDetail.dateLabel} stroke="#ffffff33" />}
                    {REDDIT_SENTIMENT_LEVELS.map(level => (
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
                            selectedPoint?.date === payload.date && selectedPoint?.levelKey === level.key;
                          const radius =
                            value === undefined || value === null ? 0 : isSelected ? 6 : 4;
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

              {selectedDetail && (
              <div className="w-full xl:w-1/3">
                <div className="h-full rounded-xl border border-white/10 bg-gray-900/70 p-5 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-6">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-2 inline-flex h-3 w-3 rounded-full"
                            style={{ backgroundColor: selectedDetail.level.color }}
                          />
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {selectedDetail.dateLabel}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              Sentiment Level {selectedDetail.levelIndex}: {selectedDetail.level.short}
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
                        <p className={selectedDetail.styles.metricLabelClass}>Total threads</p>
                        <p className="text-3xl font-semibold text-white mt-1">
                          {selectedDetail.totalThreads.toLocaleString()}
                        </p>
                        {selectedDetail.totalUpvotes > 0 && (
                          <p className={`${selectedDetail.styles.upvoteTextClass} mt-2`}>
                            {selectedDetail.totalUpvotes.toLocaleString()} estimated upvotes
                          </p>
                        )}
                      </div>

                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Topics for {selectedDetail.level.short} ({selectedDetail.topics.length})
                      </p>

                      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                        {selectedDetail.topics.length === 0 ? (
                          <p className="text-sm text-gray-400 italic text-center">
                            No surface topics captured for this sentiment level.
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
                                  High-signal Reddit threads driving this sentiment cluster
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 text-xs">
                                <span className="font-semibold text-inherit">
                                  {topic.threads.toLocaleString()} threads
                                </span>
                                {topic.upvotes > 0 && (
                                  <span className={selectedDetail.styles.upvoteTextClass}>
                                    {topic.upvotes.toLocaleString()} upvotes
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
