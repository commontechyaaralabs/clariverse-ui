'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrustpilotDashboardData,
  TrustpilotEnhancedDashboardData,
  TrustpilotCluster,
  TrustpilotReview,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Clock,
  AlertCircle,
  MessageSquare,
  Star,
  ThumbsUp,
  Grid3x3,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import type { LabelProps } from 'recharts';

import { renderDefaultSentimentChart } from '../../../components/social/defaultSentimentChart';
import {
  buildTrustpilotInsights,
  SENTIMENT_LEVELS,
  expandToDailyDates,
  getTrustpilotTopicVolumeSplit,
  TrustpilotTopicVolumeSplitEntry,
} from '@/lib/social/trustpilot/trustpilotInsights';
import { PositiveNegativeTopicVolumeChart } from '@/components/social/PositiveNegativeTopicVolumeChart';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_CHART_SURFACE } from '@/components/social/theme';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

export interface TrustpilotDashboardProps {
  trustpilotEnhancedData: TrustpilotEnhancedDashboardData | null;
  trustpilotData: TrustpilotDashboardData | null;
  selectedCluster: TrustpilotCluster | null;
  setSelectedCluster: (cluster: TrustpilotCluster | null) => void;
  selectedSubcluster: string | null;
  setSelectedSubcluster: (subcluster: string | null) => void;
  reviewFilters: {
    urgency: string[];
    priority: string[];
    resolution_status: string[];
    sentiment: string[];
    searchQuery: string;
  };
  setReviewFilters: (filters: any) => void;
  reviewSortBy: 'recency' | 'urgency' | 'sentiment' | 'influence';
  setReviewSortBy: (sort: 'recency' | 'urgency' | 'sentiment' | 'influence') => void;
  filteredAndSortedReviews: TrustpilotReview[];
  getReviewsForSelection: () => TrustpilotReview[];
  renderSentimentChart?: (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => React.ReactElement;
}

const TrustpilotDashboard = (props: any) => {
  const {
    trustpilotEnhancedData,
    trustpilotData,
    selectedCluster,
    setSelectedCluster,
    selectedSubcluster,
    setSelectedSubcluster,
    reviewFilters,
    setReviewFilters,
    reviewSortBy,
    setReviewSortBy,
    filteredAndSortedReviews,
    getReviewsForSelection,
    renderSentimentChart = renderDefaultSentimentChart,
  } = props as TrustpilotDashboardProps;
  if (!trustpilotEnhancedData && !trustpilotData) {
    return (
      <div className="space-y-6">
        <Card className={SOCIAL_CARD_BASE}>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading Trustpilot Intelligence Dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use enhanced data if available, otherwise fallback to legacy data
  const enhancedData = trustpilotEnhancedData;
  const legacyData = trustpilotData;
  
  // Helper functions for enhanced dashboard
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'LOW': return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'REGULATORY_COMPLIANCE': return 'text-purple-400 bg-purple-500/20';
      case 'REVENUE_IMPACT': return 'text-red-400 bg-red-500/20';
      case 'CUSTOMER_SATISFACTION': return 'text-blue-400 bg-blue-500/20';
      case 'INTERNAL_PROCESS': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-400';
      case 'NEGATIVE': return 'text-red-400';
      case 'NEUTRAL': return 'text-gray-400';
      case 'MIXED': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getResolutionStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-400 bg-green-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      case 'ESCALATED': return 'text-orange-400 bg-orange-500/20';
      case 'REQUIRES_INTERVENTION': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Use the filtered and sorted reviews from top-level hooks
  const displayReviews = selectedCluster || selectedSubcluster ? getReviewsForSelection() : filteredAndSortedReviews;

  const {
    metadata,
    negativeReviewsPercent,
    dominantTopicData,
    complianceFeatureDataset,
    viralNegativePosts,
    sentimentAreaData,
    hasAreaData,
  } = useMemo(
    () => buildTrustpilotInsights({ enhancedData, legacyData }),
    [enhancedData, legacyData]
  );

  const gradientColors: Record<(typeof SENTIMENT_LEVELS)[number]['key'], string> = {
    level1: '#10b981',
    level2: '#f59e0b',
    level3: '#f97316',
    level4: '#ef4444',
    level5: '#b91c1c',
  };

  const legacyKpis = legacyData?.kpis;
  const legacyTrendData = legacyData?.trendData || [];

  const [dominantSortOrder, setDominantSortOrder] = useState<'desc' | 'asc'>('desc');
  const topicVolumeSplit = useMemo<TrustpilotTopicVolumeSplitEntry[]>(
    () => getTrustpilotTopicVolumeSplit(),
    []
  );
  const sortedDominantTopicData = useMemo(() => {
    const copy = [...dominantTopicData];
    copy.sort((a, b) =>
      dominantSortOrder === 'desc'
        ? b.helpfulVotes - a.helpfulVotes
        : a.helpfulVotes - b.helpfulVotes
    );

    return copy.slice(0, 10).map(topic => {
      const breakdown = SENTIMENT_LEVELS.map(level => ({
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
            stops.push({ offset: 0, color: gradientColors[segment.key] });
          }

          cumulative = Math.min(100, cumulative + segment.value);
          stops.push({ offset: cumulative / 100, color: gradientColors[segment.key] });
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
        totalPercent: 100,
        breakdown,
        gradientStops,
      };
    });
  }, [dominantTopicData, dominantSortOrder]);

  const HelpfulLabel = ({ x = 0, y = 0, width = 0, height = 0, value }: LabelProps) => {
    if (value === undefined || value === null) {
      return null;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    const xNum = typeof x === 'number' ? x : Number(x || 0);
    const yNum = typeof y === 'number' ? y : Number(y || 0);
    const widthNum = typeof width === 'number' ? width : Number(width || 0);
    const heightNum = typeof height === 'number' ? height : Number(height || 0);
    const baseX = xNum + widthNum + 14;
    const baseY = yNum + heightNum / 2 + 4;

    return (
      <g transform={`translate(${baseX}, ${baseY})`}>
        <text fill="#ffffff" fontSize={12} fontWeight={600} dominantBaseline="middle" textAnchor="start">
          {'👍'} {numeric.toLocaleString()}
        </text>
      </g>
    );
  };
 
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<'compliance' | 'feature' | 'appreciation' | null>(null);

  useEffect(() => {
    if (
      selectedCategoryKey &&
      !complianceFeatureDataset.summaries.some(summary => summary.key === selectedCategoryKey)
    ) {
      setSelectedCategoryKey(null);
    }
  }, [complianceFeatureDataset, selectedCategoryKey]);

  const selectedCategory =
    (selectedCategoryKey
      ? complianceFeatureDataset.summaries.find(summary => summary.key === selectedCategoryKey)
      : undefined);

  // Expand Trustpilot trendData to daily dates if needed
  const expandToDailyDates = (data: Array<{ date: string; sentiment: number; reviewVolume: number }>) => {
    if (data.length === 0) return data;
    
    // Check if data is already daily (more than 20 data points likely means daily)
    if (data.length > 20) {
      // Already daily, just ensure dates are properly formatted
      return data.map(d => ({
        ...d,
        date: new Date(d.date).toISOString().split('T')[0] // Ensure YYYY-MM-DD format
      }));
    }
    
    // If not daily, expand to daily dates
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const dailyData: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];
    
    // Create a map of existing data points
    const dataMap = new Map<string, { sentiment: number; reviewVolume: number }>();
    sortedData.forEach(d => {
      const dateKey = new Date(d.date).toISOString().split('T')[0];
      dataMap.set(dateKey, { sentiment: d.sentiment, reviewVolume: d.reviewVolume });
    });
    
    // Generate daily dates
    const currentDate = new Date(firstDate);
    let lastKnownData: { date: string; sentiment: number; reviewVolume: number } = sortedData[0];
    
    while (currentDate <= lastDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingData = dataMap.get(dateKey);
      
      if (existingData) {
        const dataPoint = {
          date: dateKey,
          sentiment: existingData.sentiment,
          reviewVolume: existingData.reviewVolume
        };
        dailyData.push(dataPoint);
        lastKnownData = dataPoint;
      } else {
        // Interpolate or use last known value for missing days
        dailyData.push({
          date: dateKey,
          sentiment: lastKnownData.sentiment,
          reviewVolume: Math.round(lastKnownData.reviewVolume * 0.8) // Slightly lower for missing days
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyData;
  };

  const renderViralityTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const topic = payload[0].payload as (typeof sortedDominantTopicData)[number];

    return (
      <div className="rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-xl text-xs text-gray-200 space-y-2 min-w-[220px]">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white leading-tight">{topic.name}</div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1 text-sky-300 font-semibold">👍 {topic.helpfulVotes.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400">{Number(topic.viralityScore ?? 0).toLocaleString()} virality score</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {topic.breakdown.map(segment => (
            <div key={`${topic.name}-${segment.key}`} className="flex items-center justify-between text-[11px]">
              <span
                className="font-medium"
                style={{ color: gradientColors[segment.key] }}
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
      {/* Enhanced Data Indicator */}
      
      {/* Trustpilot KPI Cards */}
      {(() => {
        // Calculate KPI metrics from enhanced metadata or fallback to legacy data
        const avgRating = metadata?.trustscore || legacyKpis?.avgRating || 0;
        const totalReviews = metadata?.total_reviews || legacyKpis?.totalReviews || 0;
        const calculatedNegativePercent = negativeReviewsPercent;
        const positiveReviewsPercent = 100 - calculatedNegativePercent;
        
        // Calculate replied vs not replied (using metadata response_rate or default 68%)
        const repliedPercent = metadata?.response_rate ? Math.round(metadata.response_rate * 100) : 68;
        const notRepliedPercent = 100 - repliedPercent;
        const notRepliedCount = totalReviews - Math.round((totalReviews * repliedPercent) / 100);
        
        // Calculate average response time (in hours) from metadata
        const avgResponseTimeHours = metadata?.avg_response_time_hours || 4.2;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Average Rating */}
            <Card className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl ${
              avgRating < 4.0 ? 'border-l-4 border-l-[#b90abd] hover:border-l-[#a009b3]' : 'hover:border-[#b90abd]/30'
            } hover:scale-[1.02] hover:-translate-y-1`}>
              {avgRating < 4.0 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-lg animate-pulse">✨</span>
                </div>
              )}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                avgRating < 4.0 ? 'bg-linear-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent' : ''
              }`} />
              <CardContent className={`p-6 relative z-10 ${avgRating < 4.0 ? 'pt-8' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Average Rating
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-yellow-400 group-hover:scale-110 transition-transform duration-200">
                    <Star className="h-5 w-5 fill-yellow-400" />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-2">{avgRating.toFixed(1)}</div>
                  <div className="text-sm text-slate-400">out of 5.0 stars</div>
                </div>
                <div className={`p-3 rounded-md text-xs leading-relaxed ${
                  avgRating < 4.0 ? 'bg-[#b90abd]/10 border border-[#b90abd]/20 text-[#b90abd]' : 'bg-gray-800/50 text-gray-400'
                }`}>
                  {avgRating >= 4.0
                    ? 'Excellent rating – maintain quality standards'
                    : avgRating >= 3.5
                    ? 'Good rating – focus on improvement areas'
                    : 'Needs improvement – prioritize customer satisfaction'}
                </div>
              </CardContent>
            </Card>

            {/* Replied vs Not Replied */}
            <Card className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl ${
              repliedPercent < 70 ? 'border-l-4 border-l-[#b90abd] hover:border-l-[#a009b3]' : 'hover:border-[#b90abd]/30'
            } hover:scale-[1.02] hover:-translate-y-1`}>
              {repliedPercent < 70 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-lg animate-pulse">✨</span>
                </div>
              )}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                repliedPercent < 70 ? 'bg-linear-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent' : ''
              }`} />
              <CardContent className={`p-6 relative z-10 ${repliedPercent < 70 ? 'pt-8' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Replied vs Not Replied
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-2">{repliedPercent}%</div>
                  <div className="text-sm text-slate-400">vs {notRepliedPercent}% Not Replied</div>
                </div>
                <div className={`p-3 rounded-md text-xs leading-relaxed ${
                  repliedPercent < 70 ? 'bg-[#b90abd]/10 border border-[#b90abd]/20 text-[#b90abd]' : 'bg-gray-800/50 text-gray-400'
                }`}>
                  {notRepliedCount} reviews need responses – prioritize negative reviews
                </div>
              </CardContent>
            </Card>

            {/* Average Response Time */}
            <Card className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl ${
              avgResponseTimeHours > 4 ? 'border-l-4 border-l-[#b90abd] hover:border-l-[#a009b3]' : 'hover:border-[#b90abd]/30'
            } hover:scale-[1.02] hover:-translate-y-1`}>
              {avgResponseTimeHours > 4 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-lg animate-pulse">✨</span>
                </div>
              )}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                avgResponseTimeHours > 4 ? 'bg-linear-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent' : ''
              }`} />
              <CardContent className={`p-6 relative z-10 ${avgResponseTimeHours > 4 ? 'pt-8' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Average Response Time
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-sky-400 group-hover:scale-110 transition-transform duration-200">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-2">{avgResponseTimeHours.toFixed(1)}h</div>
                  <div className="text-sm text-slate-400">Average response time</div>
                </div>
                <div className={`p-3 rounded-md text-xs leading-relaxed ${
                  avgResponseTimeHours > 4 ? 'bg-[#b90abd]/10 border border-[#b90abd]/20 text-[#b90abd]' : 'bg-gray-800/50 text-gray-400'
                }`}>
                  {avgResponseTimeHours <= 4
                    ? 'Response time within target – maintain playbooks'
                    : 'Response time above target – optimize workflow'}
                </div>
              </CardContent>
            </Card>

            {/* Positive vs Negative Review */}
            <Card className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl ${
              positiveReviewsPercent < 70 ? 'border-l-4 border-l-[#b90abd] hover:border-l-[#a009b3]' : 'hover:border-[#b90abd]/30'
            } hover:scale-[1.02] hover:-translate-y-1`}>
              {positiveReviewsPercent < 70 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-lg animate-pulse">✨</span>
                </div>
              )}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                positiveReviewsPercent < 70 ? 'bg-linear-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent' : ''
              }`} />
              <CardContent className={`p-6 relative z-10 ${positiveReviewsPercent < 70 ? 'pt-8' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Positive vs Negative
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                    {positiveReviewsPercent >= 70 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-2">{positiveReviewsPercent.toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">vs {negativeReviewsPercent.toFixed(1)}% Negative</div>
                </div>
                <div className={`p-3 rounded-md text-xs leading-relaxed ${
                  positiveReviewsPercent < 70 ? 'bg-[#b90abd]/10 border border-[#b90abd]/20 text-[#b90abd]' : 'bg-gray-800/50 text-gray-400'
                }`}>
                  {Math.round((totalReviews * negativeReviewsPercent) / 100)} negative reviews need attention – focus on top issues
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Virality & Sentiment Panels with Viral Negative Posts */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Combined Viral Topic Sentiment Chart */}
          <Card className={SOCIAL_CARD_BASE}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Grid3x3 className="h-5 w-5 text-purple-400" />
                  Top 10 Dominant Topics by Virality
                </CardTitle>
                <button
                  type="button"
                  onClick={() =>
                    setDominantSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))
                  }
                  className="text-xs font-semibold uppercase tracking-wide text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full hover:border-purple-400 hover:text-purple-200 transition-colors"
                >
                  Viral {dominantSortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
              <CardDescription className="text-gray-400">
                Sentiment distribution (5 levels) for the most viral Trustpilot topics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <ResponsiveContainer width="100%" height={480}>
                <BarChart
                  data={sortedDominantTopicData}
                  layout="vertical"
                  barCategoryGap="28%"
                  barGap={8}
                  margin={{ top: 20, right: 120, bottom: 20, left: 12 }}
                >
                  <defs>
                    {sortedDominantTopicData.map((topic, index) => (
                      <linearGradient
                        key={topic.name}
                        id={`trustpilot-topic-gradient-${index}`}
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
                    label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -4, fill: '#9CA3AF' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#9CA3AF"
                    width={220}
                    tick={{ fill: '#D1D5DB', fontSize: 13, dy: 4 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <Tooltip content={renderViralityTooltip} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    content={() => (
                      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-300 mt-2">
                        {SENTIMENT_LEVELS.map(level => (
                          <div key={level.key} className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: gradientColors[level.key] }} />
                            <span>{level.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <Bar dataKey="totalPercent" radius={[8, 8, 8, 8]} isAnimationActive={false}>
                    {sortedDominantTopicData.map((topic, index) => (
                      <Cell key={`${topic.name}-bar`} fill={`url(#trustpilot-topic-gradient-${index})`} />
                    ))}
                    <LabelList dataKey="helpfulVotes" content={HelpfulLabel} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trustpilot Viral Negative Post Summaries Column */}
          <Card className={`${SOCIAL_CARD_BASE} xl:h-full`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Trustpilot Viral Negative Post Summaries
              </CardTitle>
              <CardDescription className="text-gray-400">
                Hover over posts to view Trustpilot review details and action suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="xl:max-h-[460px] xl:h-full xl:overflow-y-auto">
              <div className="space-y-3 pr-2">
                <TooltipProvider delayDuration={200}>
                  {viralNegativePosts.map((post) => (
                    <UITooltip key={post.id}>
                      <TooltipTrigger asChild>
                        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-red-500/50 transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {post.trending === 'Yes' && (
                                  <span className="text-xs font-semibold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Trending
                                  </span>
                                )}
                                <div className="flex items-center gap-1 ml-auto">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < post.starRating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <h4 className="text-sm font-semibold text-white mb-1">{post.topic}</h4>
                              <p className="text-xs text-gray-300 line-clamp-2">{post.summary}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.helpfulVotes} helpful
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        align="start"
                        className="max-w-md p-4 bg-gray-800 border-gray-700 shadow-xl z-50"
                        sideOffset={10}
                      >
                        <div className="space-y-3">
                          <div>
                          <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-white">{post.topic}</h3>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-400">By {post.author}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-400">
                                {new Date(post.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < post.starRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-400 ml-2">{post.starRating} stars</span>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-700 pt-2">
                            <h4 className="text-xs font-semibold text-gray-300 mb-1">Review Content:</h4>
                            <p className="text-xs text-gray-400 mb-3">{post.postContent}</p>
                          </div>

                          <div className="border-t border-gray-700 pt-2">
                            <h4 className="text-xs font-semibold text-gray-300 mb-2">Trustpilot Metrics:</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Helpful Votes:</span>
                                <span className="text-white ml-2 font-semibold">{post.helpfulVotes.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Star Rating:</span>
                                <span className="text-yellow-400 ml-2 font-semibold">{post.starRating}/5</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-700 pt-2">
                            <h4 className="text-xs font-semibold text-gray-300 mb-2">Sentiment & Analysis:</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Sentiment:</span>
                                <span className={`ml-2 font-semibold ${
                                  post.sentimentLevel >= 4 ? 'text-red-400' : 
                                  post.sentimentLevel === 3 ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  Level {post.sentimentLevel}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Urgency:</span>
                                <span className={`ml-2 font-semibold ${
                                  post.urgency === 'High' ? 'text-red-400' : 
                                  post.urgency === 'Medium' ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  {post.urgency}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Virality Score:</span>
                                <span className="text-orange-400 ml-2 font-semibold">{post.viralityScore}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Trending:</span>
                                <span className={`ml-2 font-semibold ${
                                  post.trending === 'Yes' ? 'text-orange-400' : 'text-gray-400'
                                }`}>
                                  {post.trending}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-700 pt-2">
                            <h4 className="text-xs font-semibold text-yellow-400 mb-1">Next Action Suggestion:</h4>
                            <p className="text-xs text-gray-300">{post.nextAction}</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </UITooltip>
                  ))}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Concern vs Feature Request Insights */}
      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Concern & Feature Request
          </CardTitle>
          <CardDescription className="text-gray-400">
            Surface regulated risk hotspots and product demand directly from Trustpilot feedback
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
                    <span>{SENTIMENT_LEVELS.find(level => level.key === summary.dominantSentiment.key)?.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-2xl font-semibold text-white">
                      {summary.totalPosts.toLocaleString()}
                      <span className="text-xs text-gray-400 font-normal ml-2">posts</span>
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
                {hasAreaData ? (
                  <div className={SOCIAL_CHART_SURFACE}>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={sentimentAreaData} margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
                      <defs>
                        <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="featureGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="appreciationGradient" x1="0" y1="0" x2="0" y2="1">
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                        }}
                        formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ color: '#CBD5F5', fontSize: 12, paddingTop: 16 }}
                      />
                      <Area
                        type="monotone"
                        name="Concern"
                        dataKey="compliance"
                        stroke="#f97316"
                        strokeWidth={selectedCategoryKey === 'compliance' ? 3 : 2}
                        fill="url(#complianceGradient)"
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
                        fill="url(#featureGradient)"
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
                        fill="url(#appreciationGradient)"
                        activeDot={{ r: 6 }}
                        onClick={() => setSelectedCategoryKey('appreciation')}
                        cursor="pointer"
                      />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    Not enough sentiment signals yet to visualise compliance, feature requests, and appreciation themes.
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
                    <X className="h-4 w-4" />
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
                      ? 'Customer delight themes & shout-outs'
                      : 'Key concern issues raised'}
                  </div>

                    <TooltipProvider delayDuration={150}>
                      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                        {selectedCategory.topics.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">
                            No dominant topics detected for this category.
                          </p>
                        ) : (
                          (() => {
                            const isFeatureCategory = selectedCategory.key === 'feature';
                            const isAppreciationCategory = selectedCategory.key === 'appreciation';
                            return selectedCategory.topics.map(topic => {
                              const hasWordCloud = Array.isArray(topic.wordCloud) && topic.wordCloud.length > 0;
                              const cardClasses = [
                                'bg-gray-900/60 border rounded-lg p-3 transition-colors duration-200',
                                isFeatureCategory
                                  ? 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-900/80'
                                  : isAppreciationCategory
                                  ? 'border-emerald-500/40 hover:border-emerald-400/60 hover:bg-gray-900/80'
                                  : '',
                              ].join(' ');
                              const wordCloudColor = isAppreciationCategory ? 'text-emerald-300' : 'text-sky-300';
                              const card = (
                                <div key={`${selectedCategory.key}-${topic.name}`} className={cardClasses}>
                                  <div>
                                    <div className="text-sm font-semibold text-white">{topic.name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1">
                                      {topic.totalPosts.toLocaleString()} posts ·{' '}
                                      {topic.helpfulVotes.toLocaleString()} helpful votes
                                    </div>
                                  </div>
                                </div>
                              );
                              if ((isFeatureCategory || isAppreciationCategory) && hasWordCloud) {
                                const maxWeight = Math.max(...topic.wordCloud!.map(entry => entry.weight), 1);
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
                                            Weighted by frequency across Trustpilot feedback
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
                                                style={{
                                                  fontSize,
                                                  opacity,
                                                }}
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
                            });
                          })()
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

      {/* Daily Social Media Posts by Sentiment Level */}
      {/* Positive vs Negative Topic Volume */}
      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ThumbsUp className="h-5 w-5 text-emerald-400" />
            Positive vs Negative Topic Volume
          </CardTitle>
          <CardDescription className="text-gray-400">
            EU banking clusters ranked by review volume for uplifting vs detracting Trustpilot narratives
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <PositiveNegativeTopicVolumeChart data={topicVolumeSplit} />
        </CardContent>
      </Card>

      {/* Daily Social Media Posts by Sentiment Level */}
      {(() => {
        const dailyTrendData = expandToDailyDates(legacyTrendData);
        return renderSentimentChart(dailyTrendData, 'trustpilot');
      })()}

      {/* Root cause analysis removed */}

      {/* ========== ENHANCED DASHBOARD COMPONENTS ========== */}
      {enhancedData && null}
      {/* ========== END ENHANCED DASHBOARD COMPONENTS ========== */}
    </div>
  );
};

export default TrustpilotDashboard;

