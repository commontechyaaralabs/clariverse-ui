'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AppWindow,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { renderDefaultSentimentChart } from '../components/defaultSentimentChart';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

interface AppStoreDashboardProps {
  renderSentimentChart?: (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => React.ReactElement;
}

export default function AppStoreDashboard({
  renderSentimentChart = renderDefaultSentimentChart,
}: AppStoreDashboardProps) {
  const sentimentTrendData = useMemo(() => {
    const today = new Date();
    const results: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const baseSentiment = 0.45 + Math.sin(i * 0.23) * 0.2;
      const launchBump = i === 3 ? 0.25 : 0;
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + launchBump));

      const volumeBase = 240 + Math.sin(i * 0.3) * 60;
      const launchVolume = i === 3 ? 160 : 0;
      const reviewVolume = Math.max(40, Math.round(volumeBase + launchVolume));

      results.push({ date: dateKey, sentiment, reviewVolume });
    }

    return results;
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Average Rating',
        value: '4.6',
        icon: <Star className="h-4 w-4 text-yellow-400" />,
        delta: '+0.2',
        positive: true,
        description: 'Rolling 30-day average rating',
      },
      {
        label: 'Review Velocity',
        value: '186/day',
        icon: <Sparkles className="h-4 w-4 text-blue-400" />,
        delta: '+14%',
        positive: true,
        description: 'vs previous 30-day window',
      },
      {
        label: 'Crash Reports',
        value: '0.18%',
        icon: <TrendingDown className="h-4 w-4 text-rose-400" />,
        delta: '-0.04%',
        positive: true,
        description: 'App Store Connect stability signal',
      },
      {
        label: 'Update Adoption',
        value: '72%',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
        delta: '+9%',
        positive: true,
        description: 'Users on latest iOS build',
      },
    ],
    []
  );

  const ratingDistribution = useMemo(
    () => [
      { stars: 5, percent: 58 },
      { stars: 4, percent: 26 },
      { stars: 3, percent: 9 },
      { stars: 2, percent: 4 },
      { stars: 1, percent: 3 },
    ],
    []
  );

  const featuredReviews = useMemo(
    () => [
      {
        title: '“Finally feels polished”',
        body: 'New release fixed the login crashes and added widgets I actually use. Performance feels buttery smooth.',
        rating: 5,
        author: 'iOSDevQueen',
        age: '18h ago',
      },
      {
        title: '“Dark mode tweaks appreciated”',
        body: 'Accessibility update is a huge win. Would love a way to schedule notifications but overall great job.',
        rating: 4,
        author: 'AccessibilityNinja',
        age: '2d ago',
      },
      {
        title: '“Still missing offline support”',
        body: 'The redesign looks clean but offline mode is still a pain point whenever I travel. Please prioritize this.',
        rating: 3,
        author: 'globetrotter88',
        age: '3d ago',
      },
    ],
    []
  );

  const releaseChecklist = useMemo(
    () => [
      {
        task: 'Respond to critical feedback within 4h',
        status: 'In Progress',
      },
      {
        task: 'Push hotfix for biometric login edge case',
        status: 'Pending',
      },
      {
        task: 'Publish App Store “What’s New” video snippet',
        status: 'Completed',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AppWindow className="h-5 w-5 text-blue-400" />
            App Store Performance Snapshot
          </CardTitle>
          <CardDescription className="text-gray-400">
            Ratings, stability, and adoption signals from the Apple App Store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((item) => (
              <div key={item.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                  <span>{item.label}</span>
                  {item.icon}
                </div>
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
            <Sparkles className="h-5 w-5 text-blue-400" />
            Sentiment & Rating Volume (30 days)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Review velocity paired with sentiment trajectory for the latest iOS builds
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSentimentChart(sentimentTrendData, 'appstore')}</CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              Rating Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
              Share of reviews by star rating for the current major release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ratingDistribution.map((bucket) => (
              <div key={bucket.stars} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{bucket.stars} Star{bucket.stars === 1 ? '' : 's'}</span>
                  <span>{bucket.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Featured Reviews
            </CardTitle>
            <CardDescription className="text-gray-400">
              High-signal reviews to amplify, respond, or funnel into product feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredReviews.map((review) => (
              <div key={review.title} className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{review.title}</span>
                  <span className="text-xs text-gray-500">· {review.rating}★</span>
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">{review.body}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {review.age} · {review.author}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            Release Quality Checklist
          </CardTitle>
          <CardDescription className="text-gray-400">
            Launch-readiness items for the current release cadence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {releaseChecklist.map((item) => (
              <div key={item.task} className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
                <div className="text-sm font-semibold text-white">{item.task}</div>
                <div className="text-xs text-gray-400">Status: {item.status}</div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 border-gray-600 text-gray-200 hover:text-white text-xs">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            View detailed rollout plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
