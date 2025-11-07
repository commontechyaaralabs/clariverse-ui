'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Flame,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { renderDefaultSentimentChart } from '../../../components/social/defaultSentimentChart';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

interface RedditDashboardProps {
  renderSentimentChart?: (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => React.ReactElement;
}

export default function RedditDashboard({
  renderSentimentChart = renderDefaultSentimentChart,
}: RedditDashboardProps) {
  const sentimentTrendData = useMemo(() => {
    const today = new Date();
    const results: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const sentimentBase = Math.sin(i * 0.22) * 0.4;
      const sentimentShock = i === 11 ? -0.45 : i === 4 ? 0.3 : 0;
      const sentiment = Math.max(-1, Math.min(1, sentimentBase + sentimentShock));

      const volumeBase = 310 + Math.sin(i * 0.27) * 90;
      const volumeSpike = i === 11 ? 220 : i === 8 ? 140 : 0;
      const reviewVolume = Math.max(70, Math.round(volumeBase + volumeSpike));

      results.push({ date: dateKey, sentiment, reviewVolume });
    }

    return results;
  }, []);

  const overviewKpis = useMemo(
    () => [
      {
        label: 'Active Threads (24h)',
        value: '824',
        delta: '+19%',
        positive: true,
        description: 'vs previous 24 hours',
      },
      {
        label: 'Escalations to Support',
        value: '58',
        delta: '+7',
        positive: false,
        description: 'Mentions tagged for agent follow-up',
      },
      {
        label: 'Moderator Response SLA',
        value: '42m',
        delta: '-5m',
        positive: true,
        description: 'Median mod reply time',
      },
      {
        label: 'Virality Risk Index',
        value: '6.8/10',
        delta: '+0.9',
        positive: false,
        description: 'Anomaly score from spike detector',
      },
    ],
    []
  );

  const subredditSignals = useMemo(
    () => [
      {
        name: 'r/fintechstories',
        change: '+41%',
        sentiment: 'negative',
        focus: 'Recurring payment failure reports in EU corridor',
      },
      {
        name: 'r/customerexperience',
        change: '+18%',
        sentiment: 'positive',
        focus: 'Community praising new onboarding checklist from CS team',
      },
      {
        name: 'r/startups',
        change: '+12%',
        sentiment: 'neutral',
        focus: 'Comparisons with competitors — watch for migrations.',
      },
    ],
    []
  );

  const escalationQueue = useMemo(
    () => [
      {
        id: 'RD-4821',
        priority: 'Critical',
        summary: 'Trending outage megathread requires engineering update',
        lastUpdate: '12 min ago',
      },
      {
        id: 'RD-4814',
        priority: 'High',
        summary: 'Refund policy AMA flagged by moderators for legal review',
        lastUpdate: '29 min ago',
      },
      {
        id: 'RD-4799',
        priority: 'Medium',
        summary: 'Feature comparison thread trending — marketing response needed',
        lastUpdate: '47 min ago',
      },
    ],
    []
  );

  const topThreads = useMemo(
    () => [
      {
        title: 'PSA: Weekend payment failures — here’s what we are seeing',
        subreddit: 'r/fintechstories',
        upvotes: '3.4K',
        comments: '612',
        sentiment: 'negative',
        age: '2h',
      },
      {
        title: 'Launch review: New onboarding flow actually saves time',
        subreddit: 'r/customerexperience',
        upvotes: '1.8K',
        comments: '214',
        sentiment: 'positive',
        age: '5h',
      },
      {
        title: 'Anyone else switching from CompetitorX? Pros/cons thread',
        subreddit: 'r/startups',
        upvotes: '980',
        comments: '189',
        sentiment: 'mixed',
        age: '7h',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-orange-400" />
            Reddit Pulse Summary
          </CardTitle>
          <CardDescription className="text-gray-400">
            Live health indicators and escalation risk across Reddit conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {overviewKpis.map((kpi) => (
              <div key={kpi.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-gray-400">{kpi.label}</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{kpi.value}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      kpi.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {kpi.delta}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{kpi.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            Sentiment Velocity (30 days)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Thread volume with sentiment overlay, highlighting emerging volatility spikes
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSentimentChart(sentimentTrendData, 'reddit')}</CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Flame className="h-5 w-5 text-orange-400" />
              Subreddit Watchlist
            </CardTitle>
            <CardDescription className="text-gray-400">
              Communities driving the highest mention velocity and brand impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subredditSignals.map((signal) => (
              <div key={signal.name} className="p-4 rounded-lg bg-gray-800 border border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{signal.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300">
                    {signal.change}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{signal.focus}</p>
                <div className="text-xs text-gray-500">
                  Sentiment trend: <span className="capitalize text-gray-300">{signal.sentiment}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-orange-400" />
              Escalation Queue
            </CardTitle>
            <CardDescription className="text-gray-400">
              Priority items flagged by moderators and automation for immediate action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {escalationQueue.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{item.id}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.priority === 'Critical'
                        ? 'bg-red-500/20 text-red-300'
                        : item.priority === 'High'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{item.summary}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Clock className="h-3 w-3" />
                  Last update {item.lastUpdate}
                </div>
              </div>
            ))}
            <Button variant="outline" className="border-gray-600 text-gray-200 hover:text-white text-xs">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              View full escalation board
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-orange-400" />
            High-Impact Threads
          </CardTitle>
          <CardDescription className="text-gray-400">
            Threads with the largest reach and engagement requiring monitoring or response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topThreads.map((thread) => (
            <div key={thread.title} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{thread.title}</span>
                  <span className="text-xs text-gray-500">· {thread.subreddit}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {thread.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {thread.comments} comments
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown
                      className={`h-3 w-3 ${
                        thread.sentiment === 'negative'
                          ? 'text-red-400'
                          : thread.sentiment === 'mixed'
                          ? 'text-yellow-300'
                          : 'text-emerald-400'
                      }`}
                    />
                    {thread.sentiment}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {thread.age} old
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Craft Response
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-200 hover:text-white text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Open Thread
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Next Best Actions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Automated recommendations driven by reputation scoring and moderator feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
              <div className="text-sm font-semibold text-white">Coordinate outage comms</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sync with incident command center before the next hourly update. Provide timeline & temporary workaround.
              </p>
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
              <div className="text-sm font-semibold text-white">Amplify success story</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Boost the onboarding success thread with official reply and share in proactive comms newsletter.
              </p>
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
              <div className="text-sm font-semibold text-white">Moderator sync</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Schedule AMA follow-up with moderators to review policy changes requested in legal thread.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
