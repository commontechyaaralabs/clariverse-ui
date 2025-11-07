'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  TrustpilotDashboardData,
  TrustpilotEnhancedDashboardData,
  TrustpilotCluster,
  TrustpilotReview,
  BANK_SOCIAL_TOPICS,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Shield,
  CheckCircle,
  Flag,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { renderDefaultSentimentChart } from '../../../components/social/defaultSentimentChart';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

interface TrustpilotDashboardProps {
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

export default function TrustpilotDashboard({
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
}: TrustpilotDashboardProps) {
  if (!trustpilotEnhancedData && !trustpilotData) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-700">
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

  const renderViralityLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || typeof value !== 'string') {
      return null;
    }

    const labelX = (x ?? 0) + (width ?? 0) + 12;
    const labelY = (y ?? 0) + (height ?? 0) / 2;
    const boxWidth = 140;
    const boxHeight = 24;
    const iconOffsetX = 10;
    const textOffsetX = 28;

    return (
      <g transform={`translate(${labelX}, ${labelY})`}>
        <rect
          x={0}
          y={-boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          rx={boxHeight / 2}
          fill="rgba(55, 65, 81, 0.6)"
          stroke="rgba(107, 114, 128, 0.6)"
        />
        <text
          x={iconOffsetX}
          y={2}
          fill="#FBBF24"
          fontSize={12}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {'👍'}
        </text>
        <text
          x={textOffsetX}
          y={2}
          fill="#F3F4F6"
          fontSize={12}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  // Use the filtered and sorted reviews from top-level hooks
  const displayReviews = selectedCluster || selectedSubcluster ? getReviewsForSelection() : filteredAndSortedReviews;

  // Calculate metrics from enhanced data or fallback to legacy
  const metadata = enhancedData?.metadata || (legacyData ? {
    last_updated: new Date().toISOString(),
    update_frequency_seconds: 60,
    total_reviews: legacyData.kpis.totalReviews,
    trustscore: legacyData.kpis.avgRating,
    response_rate: 0.87,
    avg_response_time_hours: 18,
    reputation_risk_score: 4.2,
    clv_at_risk: 2300000,
    unresolved_alerts: 12,
    fake_reviews_flagged: 3,
    top_complaint: legacyData.clusters[0] || 'N/A',
    top_complaint_percentage: 28
  } : null);
  
  // Calculate negative reviews percentage from enhanced data if available
  const calculateNegativeReviewsPercent = () => {
    if (enhancedData?.clusters) {
      const totalVolume = enhancedData.clusters.reduce((sum, c) => sum + c.volume, 0);
      const negativeVolume = enhancedData.clusters.reduce((sum, c) => 
        sum + (c.volume * c.sentiment.negative), 0
      );
      return totalVolume > 0 ? Math.round((negativeVolume / totalVolume) * 100) : 0;
    }
    return legacyKpis?.negativeReviewsPercent || 0;
  };
  
  const negativeReviewsPercent = calculateNegativeReviewsPercent();

  if (!metadata) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading Trustpilot Intelligence Dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Legacy data fallback (only used if enhanced data is not available)
  const legacyKpis = legacyData?.kpis;
  const legacyTopicBubbles = legacyData?.topicBubbles || [];
  const legacyTrendData = legacyData?.trendData || [];
  const legacyActionFunnel = legacyData?.actionFunnel || [];

  // Bank-related topics
  const bankTopics = BANK_SOCIAL_TOPICS;

  // Calculate virality and get top 10 negative topics
  const calculateTop10NegativeTopics = () => {
    // Ensure we have at least 10 topics by combining topicBubbles with bankTopics
    const allTopics = [...legacyTopicBubbles];
    
    // If we don't have enough topics, add from bankTopics with mock data
    if (allTopics.length < 10) {
      const existingTopicNames = new Set(allTopics.map(t => t.topic.toLowerCase()));
      bankTopics.forEach((bankTopic, idx) => {
        if (!existingTopicNames.has(bankTopic.toLowerCase()) && allTopics.length < 10) {
          // Create mock topic data for missing topics
          const mockSentiment = (idx % 5 - 2) * 0.3; // Vary sentiment
          const mockVolume = 50 + (idx * 10); // Vary volume
          allTopics.push({
            topic: bankTopic,
            volume: mockVolume,
            sentiment: mockSentiment,
            aiSummary: `AI summary for ${bankTopic}`,
          });
        }
      });
    }

    // Calculate virality score for each topic
    const topicsWithVirality = allTopics.map(topic => {
      const engagementMultiplier = topic.sentiment < -0.3 ? 1.5 : topic.sentiment > 0.3 ? 1.2 : 1.0;
      const viralityScore = topic.volume * engagementMultiplier * (1 + Math.abs(topic.sentiment));
      return {
        ...topic,
        viralityScore,
      };
    });

    // Filter negative topics (sentiment < 0) and sort by virality
    const negativeTopics = topicsWithVirality
      .filter(topic => topic.sentiment < 0)
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, 10);

    return negativeTopics;
  };

  // Generate action suggestions based on topic summaries
  const generateActionSuggestion = (topic: { topic: string; sentiment: number; aiSummary?: string; volume: number }): string => {
    const topicLower = topic.topic.toLowerCase();
    const sentiment = topic.sentiment;
    
    // Base suggestions on topic type and sentiment
    if (topicLower.includes('payment') || topicLower.includes('transaction')) {
      if (sentiment < -0.5) {
        return 'Urgent: Investigate payment gateway issues. Contact payment provider and review recent system updates. Notify affected customers immediately.';
      }
      return 'Monitor payment processing logs. Review error rates and implement fallback mechanisms.';
    } else if (topicLower.includes('app') || topicLower.includes('mobile') || topicLower.includes('crash')) {
      if (sentiment < -0.5) {
        return 'Critical: Review crash reports and recent app updates. Prioritize hotfix release. Communicate with affected users about resolution timeline.';
      }
      return 'Analyze crash logs and device compatibility. Schedule app stability improvements in next release.';
    } else if (topicLower.includes('support') || topicLower.includes('call')) {
      if (sentiment < -0.5) {
        return 'High Priority: Review support team response times. Implement additional training. Escalate complex cases to senior support staff.';
      }
      return 'Enhance support documentation. Provide additional training resources for support team.';
    } else if (topicLower.includes('access') || topicLower.includes('account')) {
      if (sentiment < -0.5) {
        return 'Urgent: Review authentication system. Check for security issues or system outages. Provide alternative access methods.';
      }
      return 'Improve account recovery process. Enhance user authentication experience.';
    } else if (topicLower.includes('fee') || topicLower.includes('charge')) {
      if (sentiment < -0.5) {
        return 'Review fee structure transparency. Communicate fee changes clearly. Consider fee adjustments for affected customer segments.';
      }
      return 'Improve fee disclosure in terms and conditions. Provide fee calculator tool for customers.';
    } else if (topicLower.includes('system') || topicLower.includes('outage')) {
      if (sentiment < -0.5) {
        return 'Critical: Investigate system stability. Review infrastructure capacity. Implement redundancy measures. Communicate status updates.';
      }
      return 'Monitor system performance metrics. Schedule preventive maintenance.';
    } else if (topicLower.includes('digital') || topicLower.includes('innovation')) {
      return 'Leverage positive feedback. Highlight digital innovation in marketing materials. Continue investment in digital transformation.';
    } else if (topicLower.includes('trade') || topicLower.includes('finance')) {
      return 'Review trade finance processes. Enhance customer communication about trade services.';
    } else if (topicLower.includes('information') || topicLower.includes('request')) {
      return 'Improve information accessibility. Enhance self-service options. Provide comprehensive FAQ section.';
    }
    
    // Default suggestion based on sentiment
    if (sentiment < -0.5) {
      return `Urgent action required for ${topic.topic}. Review customer feedback and implement immediate resolution measures.`;
    }
    return `Monitor ${topic.topic} closely. Review processes and implement improvements to address customer concerns.`;
  };

  // Generate negative post summaries
  const generateNegativePostSummary = (topic: { topic: string; sentiment: number; volume: number }) => {
    const topicLower = topic.topic.toLowerCase();
    const summaries: Record<string, string[]> = {
      'payment': [
        'Multiple users reporting payment failures during checkout. Transactions are being declined without clear error messages.',
        'Customers experiencing delays in payment processing. Some payments are stuck in pending status for hours.',
        'Payment gateway errors causing transaction failures. Users unable to complete purchases.',
        'Recurring payment issues affecting customer trust. Refunds are also delayed.',
      ],
      'app': [
        'App crashes frequently on iOS devices after latest update. Users unable to access their accounts.',
        'Mobile app freezes during login process. Multiple force-close incidents reported.',
        'App performance degraded significantly. Slow loading times and frequent crashes.',
        'Critical bug causing app to crash when accessing payment section.',
      ],
      'support': [
        'Customer support response times have increased significantly. Users waiting hours for assistance.',
        'Support team unable to resolve payment-related issues. Escalation process is slow.',
        'Poor communication from support team. Customers feel ignored and frustrated.',
        'Support agents lack proper training on new features. Inconsistent responses to queries.',
      ],
      'access': [
        'Users unable to log into their accounts. Password reset functionality not working.',
        'Account access blocked without explanation. Security verification process is broken.',
        'Two-factor authentication causing login failures. Users locked out of accounts.',
        'Account recovery process is too complex. Users unable to regain access.',
      ],
      'fee': [
        'Hidden fees discovered after transactions. Customers feel misled about charges.',
        'Unexpected fee increases without prior notification. Transparency issues with fee structure.',
        'High transaction fees making service unaffordable. Customers considering alternatives.',
        'Fee structure unclear and confusing. Multiple charges applied without explanation.',
      ],
      'system': [
        'System outage affecting all services. No communication about downtime duration.',
        'Platform experiencing intermittent failures. Services unavailable during peak hours.',
        'System performance degraded. Slow response times across all features.',
        'Critical system maintenance causing extended downtime. No backup service available.',
      ],
    };

    // Find matching summary category
    for (const [key, summaryList] of Object.entries(summaries)) {
      if (topicLower.includes(key)) {
        const index = Math.floor(Math.abs(topic.sentiment) * summaryList.length) % summaryList.length;
        return summaryList[index];
      }
    }

    // Default summaries
    const defaultSummaries = [
      `Multiple negative reports about ${topic.topic}. Users expressing frustration with service quality.`,
      `Significant volume of complaints regarding ${topic.topic}. Issue affecting customer satisfaction.`,
      `Growing concerns about ${topic.topic}. Negative sentiment increasing across platforms.`,
      `Critical issues reported with ${topic.topic}. Immediate attention required to address customer concerns.`,
    ];
    const index = Math.floor(Math.abs(topic.sentiment) * defaultSummaries.length) % defaultSummaries.length;
    return defaultSummaries[index];
  };

  const top10NegativeTopics = calculateTop10NegativeTopics();

  // Generate viral negative Trustpilot post summaries with metadata
  const generateViralNegativePosts = () => {
    return top10NegativeTopics.map((topic, index) => {
      const postContent = generateNegativePostSummary(topic);
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const author = `User${Math.floor(Math.random() * 1000)}`;
      const sentimentLevel = topic.sentiment <= -0.6 ? 5 : topic.sentiment <= -0.2 ? 4 : 3;
      
      // Trustpilot-specific metrics
      const reviewViews = Math.round(topic.volume * (15 + Math.random() * 25)); // Review views based on volume
      const helpfulVotes = Math.round(reviewViews * (0.02 + Math.random() * 0.05)); // 2-7% helpful votes
      const notHelpfulVotes = Math.round(helpfulVotes * (0.02 + Math.random() * 0.08)); // 2-10% of helpful votes are not helpful
      
      // Star rating: negative sentiment topics get lower ratings (1-3 stars), neutral get 3-4, positive get 4-5
      let starRating: number;
      if (topic.sentiment <= -0.6) {
        starRating = Math.random() > 0.5 ? 1 : 2; // Very negative = 1-2 stars
      } else if (topic.sentiment <= -0.2) {
        starRating = Math.random() > 0.3 ? 2 : 3; // Negative = 2-3 stars
      } else if (topic.sentiment <= 0.2) {
        starRating = Math.random() > 0.5 ? 3 : 4; // Neutral = 3-4 stars
      } else {
        starRating = Math.random() > 0.3 ? 4 : 5; // Positive = 4-5 stars
      }
      
      return {
        id: `trustpilot-post-${index}`,
        topic: topic.topic,
        summary: postContent,
        postContent: postContent,
        timestamp,
        author,
        sentiment: topic.sentiment,
        sentimentLevel,
        viralityScore: Math.round(topic.viralityScore),
        nextAction: generateActionSuggestion(topic),
        // Trustpilot-specific metadata
        helpfulVotes,
        notHelpfulVotes,
        reviewViews,
        starRating,
        sentimentScore: Math.round((topic.sentiment + 1) * 50), // Convert -1 to 1 scale to 0-100
        urgency: sentimentLevel >= 4 ? 'High' : sentimentLevel === 3 ? 'Medium' : 'Low',
        trending: reviewViews > 500 ? 'Yes' : 'No',
      };
    });
  };

  const viralNegativePosts = generateViralNegativePosts();

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

  return (
    <div className="space-y-6">
      {/* Enhanced Data Indicator */}
      {enhancedData && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Enhanced Trustpilot Intelligence Dashboard Active</span>
            <span className="text-xs text-gray-400">
              ({enhancedData.clusters.length} clusters, {enhancedData.reviews.length} reviews)
            </span>
          </div>
        </div>
      )}
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Rating */}
            <Card className="bg-gray-900 border-l-4 border-purple-500 border-t-0 border-r-0 border-b-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <CardTitle className="text-sm font-semibold text-white">
                      Average Rating
                    </CardTitle>
                  </div>
                  <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-400 mt-1">out of 5.0 stars</div>
                </div>
                <div className="pt-2">
                  <div className="bg-purple-900/30 rounded-md px-3 py-2">
                    <p className="text-xs text-white">
                      {avgRating >= 4.0 ? 'Excellent rating - maintain quality standards' : avgRating >= 3.5 ? 'Good rating - focus on improvement areas' : 'Needs improvement - prioritize customer satisfaction'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replied vs Not Replied */}
            <Card className="bg-gray-900 border-l-4 border-purple-500 border-t-0 border-r-0 border-b-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <CardTitle className="text-sm font-semibold text-white">
                      Replied vs Not Replied
                    </CardTitle>
                  </div>
                  <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-3xl font-bold text-white">{repliedPercent}%</div>
                  <div className="text-xs text-gray-400 mt-1">vs {notRepliedPercent}% Not Replied</div>
                </div>
                <div className="pt-2">
                  <div className="bg-purple-900/30 rounded-md px-3 py-2">
                    <p className="text-xs text-white">
                      {notRepliedCount} reviews need responses - prioritize negative reviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="bg-gray-900 border-l-4 border-purple-500 border-t-0 border-r-0 border-b-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <CardTitle className="text-sm font-semibold text-white">
                      Avg Response Time
                    </CardTitle>
                  </div>
                  <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-3xl font-bold text-white">{avgResponseTimeHours.toFixed(1)}h</div>
                  <div className="text-xs text-gray-400 mt-1">Average response time</div>
                </div>
                <div className="pt-2">
                  <div className="bg-purple-900/30 rounded-md px-3 py-2">
                    <p className="text-xs text-white">
                      {avgResponseTimeHours <= 4 ? 'Response time within target - maintain SLA' : 'Response time above target - optimize workflow'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positive vs Negative Review */}
            <Card className="bg-gray-900 border-l-4 border-purple-500 border-t-0 border-r-0 border-b-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <CardTitle className="text-sm font-semibold text-white">
                      Positive vs Negative
                    </CardTitle>
                  </div>
                  <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                    {positiveReviewsPercent >= 70 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-3xl font-bold text-white">{positiveReviewsPercent.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400 mt-1">vs {negativeReviewsPercent.toFixed(1)}% Negative</div>
                </div>
                <div className="pt-2">
                  <div className="bg-purple-900/30 rounded-md px-3 py-2">
                    <p className="text-xs text-white">
                      {Math.round((totalReviews * negativeReviewsPercent) / 100)} negative reviews need attention - focus on top issues
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Top 10 Dominant Topics by Virality - Sentiment Distribution with Viral Negative Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Grid3x3 className="h-5 w-5 text-purple-400" />
              Top 10 Dominant Topics by Virality
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sentiment distribution (5 levels) for most viral topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={(() => {
                // Map sentiment (-1 to 1) to sentiment level (1-5)
                const mapSentimentToLevel = (sentiment: number): number => {
                  if (sentiment <= -0.6) return 5; // Very frustrated
                  if (sentiment <= -0.2) return 4; // Frustrated
                  if (sentiment <= 0.2) return 3; // Neutral
                  if (sentiment <= 0.6) return 2; // Satisfied
                  return 1; // Calm/Positive
                };

                // Ensure we have at least 10 topics by combining topicBubbles with bankTopics
                const allTopics = [...legacyTopicBubbles];
                const helpfulVotesByTopic = viralNegativePosts.reduce((map, post) => {
                  map.set(post.topic, (map.get(post.topic) || 0) + (post.helpfulVotes || 0));
                  return map;
                }, new Map<string, number>());
                
                // If we don't have enough topics, add from bankTopics with mock data
                if (allTopics.length < 10) {
                  const existingTopicNames = new Set(allTopics.map(t => t.topic.toLowerCase()));
                  bankTopics.forEach((bankTopic, idx) => {
                    if (!existingTopicNames.has(bankTopic.toLowerCase()) && allTopics.length < 10) {
                      // Create mock topic data for missing topics
                      const mockSentiment = (idx % 5 - 2) * 0.3; // Vary sentiment
                      const mockVolume = 50 + (idx * 10); // Vary volume
                      allTopics.push({
                        topic: bankTopic,
                        volume: mockVolume,
                        sentiment: mockSentiment,
                        aiSummary: `AI summary for ${bankTopic}`,
                      });
                    }
                  });
                }

                // Calculate virality score for each topic (volume * engagement factor)
                const topicsWithVirality = allTopics.map(topic => {
                  // Virality = volume * (1 + sentiment_impact) * engagement_multiplier
                  const engagementMultiplier = topic.sentiment < -0.3 ? 1.5 : topic.sentiment > 0.3 ? 1.2 : 1.0;
                  const viralityScore = topic.volume * engagementMultiplier * (1 + Math.abs(topic.sentiment));
                  return {
                    ...topic,
                    viralityScore,
                  };
                });

                // Get top 10 by virality
                const top10Topics = topicsWithVirality
                  .sort((a, b) => b.viralityScore - a.viralityScore)
                  .slice(0, 10);

                // For each topic, calculate sentiment distribution across 5 levels
                  return top10Topics.map(topic => {
                  const sentimentLevel = mapSentimentToLevel(topic.sentiment);
                  
                  // Distribute volume across sentiment levels based on topic's sentiment
                  // Topics with strong sentiment will have more concentration in that level
                  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                  
                  if (sentimentLevel === 1) {
                    // Calm - mostly level 1, some level 2
                    distribution[1] = Math.round(topic.volume * 0.7);
                    distribution[2] = Math.round(topic.volume * 0.25);
                    distribution[3] = Math.round(topic.volume * 0.05);
                  } else if (sentimentLevel === 2) {
                    // Satisfied - mostly level 2, some level 1 and 3
                    distribution[1] = Math.round(topic.volume * 0.2);
                    distribution[2] = Math.round(topic.volume * 0.65);
                    distribution[3] = Math.round(topic.volume * 0.15);
                  } else if (sentimentLevel === 3) {
                    // Neutral - spread across levels 2, 3, 4
                    distribution[2] = Math.round(topic.volume * 0.25);
                    distribution[3] = Math.round(topic.volume * 0.5);
                    distribution[4] = Math.round(topic.volume * 0.25);
                  } else if (sentimentLevel === 4) {
                    // Frustrated - mostly level 4, some level 3 and 5
                    distribution[3] = Math.round(topic.volume * 0.15);
                    distribution[4] = Math.round(topic.volume * 0.65);
                    distribution[5] = Math.round(topic.volume * 0.2);
                  } else {
                    // Very Frustrated - mostly level 5, some level 4
                    distribution[4] = Math.round(topic.volume * 0.25);
                    distribution[5] = Math.round(topic.volume * 0.7);
                    distribution[3] = Math.round(topic.volume * 0.05);
                  }

                  const total = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];
                  
                    const toPercent = (value: number) => Number(((value / total) * 100).toFixed(1));

                    const helpfulVotes = helpfulVotesByTopic.get(topic.topic) ?? Math.max(Math.round(topic.viralityScore / 20), 0);
                    const viralityLabel = helpfulVotes > 0 ? `${helpfulVotes.toLocaleString()} helpful` : '';

                    return {
                      name: topic.topic,
                      'Level 1': total > 0 ? toPercent(distribution[1]) : 0,
                      'Level 2': total > 0 ? toPercent(distribution[2]) : 0,
                      'Level 3': total > 0 ? toPercent(distribution[3]) : 0,
                      'Level 4': total > 0 ? toPercent(distribution[4]) : 0,
                      'Level 5': total > 0 ? toPercent(distribution[5]) : 0,
                    viralityScore: Math.round(topic.viralityScore),
                    totalPosts: topic.volume,
                      helpfulVotes,
                      viralityLabel,
                  };
                });
                })()}
                layout="vertical"
                barCategoryGap="20%"
                margin={{ top: 16, right: 180, bottom: 16, left: 56 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  tickFormatter={(value: number) => `${value}%`}
                  label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={180} fontSize={14} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name: string) => [`${value.toFixed(1)}%`, name]}
                  labelFormatter={(label: string) => `Topic: ${label}`}
                />
                <Bar dataKey="Level 1" stackId="a" fill="#10b981" name="Level 1: Calm" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Level 2" stackId="a" fill="#3b82f6" name="Level 2: Satisfied" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Level 3" stackId="a" fill="#9CA3AF" name="Level 3: Neutral" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Level 4" stackId="a" fill="#f59e0b" name="Level 4: Frustrated" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Level 5" stackId="a" fill="#ef4444" name="Level 5: Very Frustrated" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="viralityLabel" position="right" content={renderViralityLabel} />
                </Bar>
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  content={({ payload }) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                      {payload?.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '12px', height: '12px', backgroundColor: entry.color, borderRadius: '2px' }}></div>
                          <span style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trustpilot Viral Negative Post Summaries Column */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Trustpilot Viral Negative Post Summaries
            </CardTitle>
            <CardDescription className="text-gray-400">
              Hover over posts to view Trustpilot review details and action suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
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
                            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                              Trustpilot
                            </span>
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

      {/* Daily Social Media Posts by Sentiment Level */}
      {(() => {
        const dailyTrendData = expandToDailyDates(legacyTrendData);
        return renderSentimentChart(dailyTrendData, 'trustpilot');
      })()}

      {/* ========== ENHANCED DASHBOARD COMPONENTS ========== */}
      {enhancedData && (
        <>
          {/* Section 1: Executive Summary Strip */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Executive Summary
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time reputation intelligence with AI confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
                {/* Reputation Risk Score */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                  onClick={() => setReviewFilters({...reviewFilters, urgency: ['CRITICAL', 'HIGH']})}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Reputation Risk</div>
                    <div className="text-lg font-bold text-white">
                      {metadata?.reputation_risk_score?.toFixed(1) || '4.2'}/5
                    </div>
                    <div className="text-xs text-gray-500">98% confidence</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                </div>

                {/* CLV at Risk */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                  onClick={() => setReviewFilters({...reviewFilters, priority: ['REVENUE_IMPACT']})}
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">CLV at Risk</div>
                    <div className="text-lg font-bold text-white">
                      €{(metadata?.clv_at_risk || 2300000) / 1000000}M
                    </div>
                    <div className="text-xs text-gray-500">94% confidence</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-red-400" />
                </div>

                {/* Unresolved Alerts */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                  onClick={() => setReviewFilters({...reviewFilters, resolution_status: ['PENDING', 'REQUIRES_INTERVENTION']})}
                >
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Unresolved Alerts</div>
                    <div className="text-lg font-bold text-white">
                      {metadata?.unresolved_alerts || 12}
                    </div>
                    <div className="text-xs text-gray-500">96% confidence</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-yellow-400" />
                </div>

                {/* Fake Reviews Flagged */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Fake Reviews</div>
                    <div className="text-lg font-bold text-white">
                      {metadata?.fake_reviews_flagged || 3}
                    </div>
                    <div className="text-xs text-gray-500">87% confidence</div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>

                {/* Response Rate */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Response Rate</div>
                    <div className="text-lg font-bold text-white">
                      {metadata?.response_rate ? Math.round(metadata.response_rate * 100) : 87}%
                    </div>
                    <div className="text-xs text-gray-500">99% confidence</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>

                {/* Avg Response Time */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Avg Response</div>
                    <div className="text-lg font-bold text-white">
                      {metadata?.avg_response_time_hours?.toFixed(1) || '18.0'}h
                    </div>
                    <div className="text-xs text-gray-500">97% confidence</div>
                  </div>
                  <TrendingDown className="h-4 w-4 text-orange-400" />
                </div>

                {/* Top Complaint */}
                <div 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer min-w-[200px]"
                  onClick={() => {
                    const topCluster = enhancedData.clusters.find(c => c.cluster_name === metadata?.top_complaint);
                    if (topCluster) setSelectedCluster(topCluster);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Flag className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Top Complaint</div>
                    <div className="text-sm font-bold text-white truncate">
                      {metadata?.top_complaint || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {metadata?.top_complaint_percentage || 28}% • 92% confidence
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {/* ========== END ENHANCED DASHBOARD COMPONENTS ========== */}
    </div>
  );
}

