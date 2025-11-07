'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  Clock,
  MessageSquare,
  Smartphone,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { renderDefaultSentimentChart } from '../../../components/social/defaultSentimentChart';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

interface PlayStoreDashboardProps {
  renderSentimentChart?: (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => React.ReactElement;
}

export default function PlayStoreDashboard({
  renderSentimentChart = renderDefaultSentimentChart,
}: PlayStoreDashboardProps) {
  const sentimentTrendData = useMemo(() => {
    const today = new Date();
    const results: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const baseSentiment = 0.1 + Math.sin(i * 0.2) * 0.25;
      const outageDip = i === 6 ? -0.5 : 0;
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + outageDip));

      const volumeBase = 360 + Math.sin(i * 0.21) * 80;
      const outageVolume = i === 6 ? 240 : 0;
      const reviewVolume = Math.max(60, Math.round(volumeBase + outageVolume));

      results.push({ date: dateKey, sentiment, reviewVolume });
    }

    return results;
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Average Rating',
        value: '4.2',
        delta: '-0.3',
        positive: false,
        description: '7-day rolling average after latest update',
      },
      {
        label: 'ANR Rate',
        value: '0.28%',
        delta: '-0.05%',
        positive: true,
        description: 'App not responding incidents across device classes',
      },
      {
        label: 'Store Listing CTR',
        value: '9.6%',
        delta: '+1.2%',
        positive: true,
        description: 'Conversion from listing impressions to installs',
      },
      {
        label: 'Crash Free Sessions',
        value: '97.1%',
        delta: '-1.9%',
        positive: false,
        description: 'Google Play Console stability score',
      },
    ],
    []
  );

  const versionInsights = useMemo(
    () => [
      {
        version: 'v12.4.1',
        installs: '62%',
        highlight: 'Primary rollout build with crash fix for biometric login.',
      },
      {
        version: 'v12.3.0',
        installs: '28%',
        highlight: 'Legacy build still active in LATAM market — monitor crash reports.',
      },
      {
        version: 'Beta channel',
        installs: '10%',
        highlight: 'Testing new purchase flow + Firebase remote config toggles.',
      },
    ],
    []
  );

  const reviewQueue = useMemo(
    () => [
      {
        id: 'PS-9921',
        sentiment: 'negative',
        summary: 'Post-update login loop on Samsung Galaxy S22',
        status: 'Triage',
      },
      {
        id: 'PS-9912',
        sentiment: 'negative',
        summary: 'In-app purchase pending for 48h — multiple follow-ups',
        status: 'Escalated',
      },
      {
        id: 'PS-9904',
        sentiment: 'positive',
        summary: 'Kudos for new budgeting widgets — suggestion to add more currencies',
        status: 'Queued',
      },
    ],
    []
  );

  const upcomingActions = useMemo(
    () => [
      {
        title: 'Deploy hotfix to stabilize login loop',
        owner: 'Mobile Backend',
        due: 'In progress',
      },
      {
        title: 'Update Play Store listing screenshots',
        owner: 'Growth Marketing',
        due: 'Due tomorrow',
      },
      {
        title: 'Run targeted push to recover churned users',
        owner: 'Lifecycle Ops',
        due: 'Planned',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Smartphone className="h-5 w-5 text-green-400" />
            Play Store Health Overview
          </CardTitle>
          <CardDescription className="text-gray-400">
            Ratings, stability, and listing performance indicators from Google Play
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((item) => (
              <div key={item.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-gray-400">{item.label}</div>
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
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-green-400" />
            Sentiment & Review Trend (30 days)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Review cadence with sentiment overlay and outage anomaly detection
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSentimentChart(sentimentTrendData, 'playstore')}</CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BadgePercent className="h-5 w-5 text-green-400" />
              Version Adoption Insights
            </CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of installs across production and beta tracks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {versionInsights.map((version) => (
              <div key={version.version} className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-200">
                  <span>{version.version}</span>
                  <span>{version.installs}</span>
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">{version.highlight}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Priority Reviews Queue
            </CardTitle>
            <CardDescription className="text-gray-400">
              Reviews triaged by automation for immediate follow-up or amplification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQueue.map((item) => (
              <div key={item.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>{item.summary}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.sentiment === 'positive'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>ID: {item.id}</span>
                  <span>Status: {item.status}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="border-gray-600 text-gray-200 hover:text-white text-xs">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Open review response console
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-green-400" />
            Next Actions & Ownership
          </CardTitle>
          <CardDescription className="text-gray-400">
            Mitigation and growth initiatives tracked against Play Store metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingActions.map((action) => (
            <div key={action.title} className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
              <div className="text-sm font-semibold text-white">{action.title}</div>
              <div className="text-xs text-gray-400">Owner: {action.owner}</div>
              <div className="text-xs text-gray-500">Status: {action.due}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
