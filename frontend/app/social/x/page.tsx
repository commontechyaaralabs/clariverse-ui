'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowUpRight,
  Clock,
  Hash,
  MessageCircle,
  Share2,
  Sparkles,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { renderDefaultSentimentChart } from '../../../components/social/defaultSentimentChart';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

interface XDashboardProps {
  renderSentimentChart?: (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => React.ReactElement;
}

export default function XDashboard({
  renderSentimentChart = renderDefaultSentimentChart,
}: XDashboardProps) {
  const sentimentTrendData = useMemo(() => {
    const today = new Date();
    const results: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const baseSentiment = Math.sin(i * 0.24) * 0.35;
      const newsShock = i === 7 ? -0.35 : i === 2 ? 0.28 : 0;
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + newsShock));

      const volumeBase = 420 + Math.sin(i * 0.18) * 120;
      const volumeSpike = i === 12 ? 260 : i === 5 ? 190 : 0;
      const reviewVolume = Math.max(90, Math.round(volumeBase + volumeSpike));

      results.push({ date: dateKey, sentiment, reviewVolume });
    }

    return results;
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Active Mentions (24h)',
        value: '1.2K',
        delta: '+12%',
        positive: true,
        description: 'vs previous 24h window',
      },
      {
        label: 'Engagement Rate',
        value: '6.4%',
        delta: '+1.1%',
        positive: true,
        description: 'Audience interactions per post',
      },
      {
        label: 'Influencer Share',
        value: '31%',
        delta: '-4%',
        positive: false,
        description: 'Mentions from verified / high-follower accounts',
      },
      {
        label: 'Response SLA',
        value: '28m',
        delta: '-6m',
        positive: true,
        description: 'Average time to first reply',
      },
    ],
    []
  );

  const sentimentMix = useMemo(
    () => [
      { label: 'Positive', value: 42, color: 'text-emerald-400 bg-emerald-500/20' },
      { label: 'Neutral', value: 33, color: 'text-blue-400 bg-blue-500/20' },
      { label: 'Negative', value: 25, color: 'text-red-400 bg-red-500/20' },
    ],
    []
  );

  const conversationThemes = useMemo(
    () => [
      {
        tag: '#PaymentFailure',
        change: '+32%',
        description: 'Real-time payment outages detected by fintech influencers.',
        severity: 'High',
        positive: false,
      },
      {
        tag: '#OnboardingWins',
        change: '+18%',
        description: 'Product-led growth champions highlight simplified onboarding flow.',
        severity: 'Medium',
        positive: true,
      },
      {
        tag: '#TrustAndSafety',
        change: '-9%',
        description: 'Moderation team cleared backlog, reducing negative chatter.',
        severity: 'Low',
        positive: true,
      },
    ],
    []
  );

  const topPosts = useMemo(
    () => [
      {
        author: '@fintechwatch',
        followers: '182K',
        summary: 'Payment failures in EU region — seeing 3x spike today. Are others impacted?',
        impressions: '910K',
        engagement: '12.4K',
        sentiment: 'negative',
        timeAgo: '1h ago',
      },
      {
        author: '@growthstories',
        followers: '96K',
        summary: 'Onboarding just got faster — <2 minutes from install to activation. Teams nailed it!',
        impressions: '540K',
        engagement: '8.1K',
        sentiment: 'positive',
        timeAgo: '3h ago',
      },
      {
        author: '@support360',
        followers: '55K',
        summary: 'Resolved refund backlog within hours. Impressed with support velocity today.',
        impressions: '320K',
        engagement: '4.7K',
        sentiment: 'positive',
        timeAgo: '5h ago',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-sky-400" />
            X Channel Signal Summary
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Real-time performance and sentiment signals from the X (Twitter) channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((item) => (
              <div key={item.label} className="bg-app-black/60 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{item.value}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {item.delta}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-sky-400" />
            Sentiment & Volume Trend (30 days)
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Daily post volume with sentiment overlay and anomaly detection highlights
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSentimentChart(sentimentTrendData, 'x')}</CardContent>
      </Card>

      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Hash className="h-5 w-5 text-sky-400" />
            Emerging Conversations
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Live hashtags and narratives driving the conversation in the last 6 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {conversationThemes.map((theme) => (
              <div key={theme.tag} className="p-4 rounded-lg bg-app-black/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{theme.tag}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      theme.positive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {theme.change}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{theme.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last 6h
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className={`h-3 w-3 ${theme.positive ? 'text-emerald-400' : 'text-red-400'}`} />
                    {theme.severity} impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5 text-sky-400" />
            Top Live Posts
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            High-visibility posts requiring review, response, or amplification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPosts.map((post) => (
              <div
                key={post.author}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-app-black/60 border border-white/10 rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{post.author}</span>
                    <span className="text-xs text-muted-foreground">· {post.followers} followers</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{post.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {post.impressions} impressions
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {post.engagement} engagements
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp
                        className={`h-3 w-3 ${post.sentiment === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}
                      />
                      {post.sentiment}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.timeAgo}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Respond
                  </Button>
                  <Button variant="outline" className="border-white/10 text-foreground/80 hover:text-white text-xs">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    View Thread
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingDown className="h-5 w-5 text-amber-400" />
            Risk Monitor
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Potential risk indicators detected by anomaly models and manual triage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sentimentMix.map((item) => (
              <div key={item.label} className="p-4 bg-app-black/60 border border-white/10 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                    {item.value}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.label === 'Negative'
                    ? 'Escalate posts mentioning payment failures or outage reports.'
                    : item.label === 'Positive'
                    ? 'Amplify positive stories from verified influencers to balance sentiment.'
                    : 'Monitor customer support threads for unresolved questions.'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
