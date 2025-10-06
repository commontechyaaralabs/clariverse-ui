'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { SentimentTrendData } from '@/lib/api';
import { Heart, Frown, Meh, TrendingUp, AlertCircle } from 'lucide-react';

interface SentimentTrendChartProps {
  data: SentimentTrendData[];
  threadId?: string;
  showArea?: boolean;
}

export function SentimentTrendChart({ data, threadId, showArea = false }: SentimentTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">
            {new Date(data.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-300">Sentiment:</span>
              <span className={`font-medium ${
                data.sentiment === 1 ? 'text-green-400' : 
                data.sentiment === 2 ? 'text-lime-400' :
                data.sentiment === 3 ? 'text-yellow-400' :
                data.sentiment === 4 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {data.sentiment}/5
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-300">Positive:</span>
              <span className="text-white font-medium">{(data.positive * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-300">Neutral:</span>
              <span className="text-white font-medium">{(data.neutral * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-300">Negative:</span>
              <span className="text-white font-medium">{(data.negative * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment === 1) return '#10b981'; // green - Calm
    if (sentiment === 2) return '#84cc16'; // light green - Bit Irritated
    if (sentiment === 3) return '#eab308'; // yellow - Moderately Concerned
    if (sentiment === 4) return '#f97316'; // orange - Anger
    return '#ef4444'; // red - Frustrated
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment === 1) return <Heart className="h-4 w-4 text-green-400" />;
    if (sentiment === 2) return <Meh className="h-4 w-4 text-lime-400" />;
    if (sentiment === 3) return <Meh className="h-4 w-4 text-yellow-400" />;
    if (sentiment === 4) return <Frown className="h-4 w-4 text-orange-400" />;
    return <Frown className="h-4 w-4 text-red-400" />;
  };

  const avgSentiment = data.reduce((sum, d) => sum + d.sentiment, 0) / data.length;
  const isDeclining = data.length > 1 && data[data.length - 1].sentiment < data[0].sentiment;
  const isCritical = avgSentiment < -1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Sentiment Trend
              {threadId && (
                <span className="text-sm text-gray-400">(Thread {threadId})</span>
              )}
            </CardTitle>
            <CardDescription>
              Sentiment analysis across messages {threadId ? 'in this thread' : 'over time'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getSentimentIcon(avgSentiment)}
            <span className={`text-sm font-medium ${
              avgSentiment > 0.5 ? 'text-green-400' : 
              avgSentiment < -0.5 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {avgSentiment.toFixed(1)}/5
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Alert for critical sentiment */}
        {isCritical && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">
              Critical sentiment detected - consider immediate action
            </span>
          </div>
        )}

        {/* Alert for declining sentiment */}
        {isDeclining && !isCritical && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              Sentiment declining - monitor closely
            </span>
          </div>
        )}

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {showArea ? (
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="messageId"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <YAxis
                  domain={[-2.5, 2.5]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8b5cf6"
                  fill="url(#sentimentGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="messageId"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <YAxis
                  domain={[-2.5, 2.5]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Positive</span>
            </div>
            <div className="text-lg font-bold text-white">
              {Math.round(data.reduce((sum, d) => sum + d.positive, 0) / data.length * 100)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Meh className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Neutral</span>
            </div>
            <div className="text-lg font-bold text-white">
              {Math.round(data.reduce((sum, d) => sum + d.neutral, 0) / data.length * 100)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Frown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-gray-300">Negative</span>
            </div>
            <div className="text-lg font-bold text-white">
              {Math.round(data.reduce((sum, d) => sum + d.negative, 0) / data.length * 100)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
