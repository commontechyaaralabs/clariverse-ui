'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getKPIs,
  getEisenhowerThreads,
  KPIData,
  EisenhowerThread,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingDown, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Link from 'next/link';

export default function OpsDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [threads, setThreads] = useState<EisenhowerThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpis, threadsData] = await Promise.all([
        getKPIs(),
        getEisenhowerThreads(),
      ]);

      setKpiData(kpis);
      setThreads(threadsData);
    } catch (error) {
      console.error('Error loading ops dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh disabled - data only loads on mount or manual refresh
  }, []);

  // Calculate sentiment trends
  const sentimentData = threads
    .filter((t) => t.overall_sentiment !== undefined)
    .map((t, index) => ({
      index,
      sentiment: t.overall_sentiment || 3,
      date: new Date(t.last_message_at).toISOString().split('T')[0],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  // Customer segments
  const customerSegments = threads.reduce((acc, thread) => {
    const segment = thread.overall_sentiment! < 2.5 ? 'negative' : thread.overall_sentiment! > 3.5 ? 'positive' : 'neutral';
    acc[segment] = (acc[segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-[#b90abd]" />
              <span className="text-white text-lg">Loading ops dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Customer Ops Dashboard - Friction Monitor
              </h1>
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="text-lg">🧑‍💼</span>
              Sentiment trend + customer segments table
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link href="/email">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20"
                >
                  📊 Executive Summary
                </Button>
              </Link>
              <Link href="/email/executive">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20"
                >
                  🧭 Executive Cockpit
                </Button>
              </Link>
              <Link href="/email/manager">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20"
                >
                  ⚙️ Manager View
                </Button>
              </Link>
              <Link href="/email/finance">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-600/10 border-green-500/30 text-green-300 hover:bg-green-600/20"
                >
                  🧑‍💼 Finance View
                </Button>
              </Link>
              <Link href="/email/ops">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/20 border-2"
                >
                  🧑‍💼 Ops View
                </Button>
              </Link>
            </div>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Friction Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[#b90abd]" />
                Friction Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {customerSegments.negative ? ((customerSegments.negative / threads.length) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Negative sentiment threads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-[#b90abd]" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Positive:</span>
                  <span className="text-green-400 font-medium">{customerSegments.positive || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Neutral:</span>
                  <span className="text-yellow-400 font-medium">{customerSegments.neutral || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Negative:</span>
                  <span className="text-red-400 font-medium">{customerSegments.negative || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#b90abd]" />
                Avg Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {kpiData?.customer_sentiment_index
                  ? (kpiData.customer_sentiment_index * 20).toFixed(0)
                  : '0'}/100
              </div>
              <p className="text-xs text-gray-400 mt-1">Customer satisfaction score</p>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Trend Chart */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sentiment Trend</CardTitle>
            <CardDescription className="text-gray-400">
              Customer sentiment over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentData}>
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 5]}
                    label={{ value: 'Sentiment (1-5)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#7c3aed"
                    fillOpacity={1}
                    fill="url(#sentimentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments Table */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Customer Segments</CardTitle>
            <CardDescription className="text-gray-400">
              Thread distribution by sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-sm font-medium text-gray-400 p-3">Segment</th>
                    <th className="text-right text-sm font-medium text-gray-400 p-3">Count</th>
                    <th className="text-right text-sm font-medium text-gray-400 p-3">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(customerSegments).map(([segment, count]) => (
                    <tr key={segment} className="border-b border-gray-800">
                      <td className="p-3 text-sm text-white capitalize">{segment}</td>
                      <td className="p-3 text-sm text-white text-right">{count}</td>
                      <td className="p-3 text-sm text-gray-400 text-right">
                        {((count / threads.length) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

