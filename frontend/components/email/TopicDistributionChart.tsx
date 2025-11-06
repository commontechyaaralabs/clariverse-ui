'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TopicDistributionData } from '@/lib/api';
import { Tag, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface TopicDistributionChartProps {
  data: TopicDistributionData[];
  onTopicClick?: (topic: string) => void;
}

const COLORS = [
  '#5332ff', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export function TopicDistributionChart({ data, onTopicClick }: TopicDistributionChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">{data.topic}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-300">Total Threads:</span>
              <span className="text-white font-medium">{data.count}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-300">Percentage:</span>
              <span className="text-white font-medium">{data.percentage}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-300">Urgent:</span>
              <span className="text-red-400 font-medium">{data.urgentCount}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-300">Avg Sentiment:</span>
              <span className={`font-medium ${
                data.avgSentiment > 0.2 ? 'text-green-400' : 
                data.avgSentiment < -0.2 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {data.avgSentiment.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (data: any) => {
    if (data && onTopicClick) {
      onTopicClick(data.topic);
    }
  };

  const handleBarClick = (data: any) => {
    if (data && onTopicClick) {
      onTopicClick(data.topic);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-400" />
              Topic Distribution
            </CardTitle>
            <CardDescription>
              Thread distribution by topic and cluster analysis
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                chartType === 'pie'
                  ? 'bg-[#b90abd] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="h-3 w-3" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-[#b90abd] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ topic, percentage }) => `${topic} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  onClick={handlePieClick}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="topic"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#5332ff"
                  onClick={handleBarClick}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Topic Summary */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Topic Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.slice(0, 6).map((topic, index) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => onTopicClick?.(topic.topic)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{topic.topic}</p>
                    <p className="text-xs text-gray-400">{topic.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{topic.count}</span>
                    {topic.urgentCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        <span className="text-xs text-red-400">{topic.urgentCount}</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs ${
                    topic.avgSentiment > 0.2 ? 'text-green-400' : 
                    topic.avgSentiment < -0.2 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    Sentiment: {topic.avgSentiment.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-4">
            {data.slice(0, 4).map((topic, index) => (
              <div key={topic.topic} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-400">{topic.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
