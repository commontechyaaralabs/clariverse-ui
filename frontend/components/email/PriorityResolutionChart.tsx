'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';                                                    
import { PriorityResolutionData, EisenhowerThread } from '@/lib/api';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { useMemo } from 'react';

interface PriorityResolutionChartProps {
  data: PriorityResolutionData[];
  threads?: EisenhowerThread[];
  selectedQuadrant?: string | null;
  selectedPriority?: string | null;
  onPriorityClick?: (priority: string, status: string) => void;
}

export function PriorityResolutionChart({ data, threads = [], selectedQuadrant, selectedPriority, onPriorityClick }: PriorityResolutionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">Priority {label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{entry.dataKey}:</span>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-600">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">Total:</span>
                <span className="text-white font-medium">
                  {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (data && onPriorityClick) {
      // Find which status was clicked based on the bar position
      const status = data.activePayload?.[0]?.dataKey;
      onPriorityClick(data.activeLabel, status);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return '#ef4444'; // red
      case 'P2': return '#f97316'; // orange
      case 'P3': return '#eab308'; // yellow
      case 'P4': return '#3b82f6'; // blue
      case 'P5': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'P1': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'P2': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'P3': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'P4': return <Target className="h-4 w-4 text-blue-400" />;
      case 'P5': return <Target className="h-4 w-4 text-gray-400" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const totalOpen = data.reduce((sum, d) => sum + d.openCustomer + d.openCompany, 0);                                                                           
  const totalInProgress = 0; // No inProgress property in the interface
  const totalClosed = data.reduce((sum, d) => sum + d.closed, 0);
  const totalThreads = totalOpen + totalInProgress + totalClosed;

  // Calculate topic distribution grouped by priority
  const topicsByPriority = useMemo(() => {
    if (!threads.length || !selectedQuadrant) return {};

    // Filter threads by quadrant
    let filteredThreads = threads.filter(thread => thread.quadrant === selectedQuadrant);

    // Get priorities from the data
    const prioritiesInData = data.map(d => d.priority);

    // Group topics by priority
    const topicsByPriorityMap: Record<string, Array<{ topic: string; count: number }>> = {};

    prioritiesInData.forEach(priority => {
      // Filter threads for this specific priority
      const priorityThreads = filteredThreads.filter(thread => thread.priority === priority);
      
      // Count topics for this priority
      const topicCounts: Record<string, number> = {};
      priorityThreads.forEach(thread => {
        const topic = thread.topic || 'Unknown';
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });

      // Convert to array and sort by count (descending)
      topicsByPriorityMap[priority] = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);
    });

    return topicsByPriorityMap;
  }, [threads, selectedQuadrant, data]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="priority"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="openCustomer"
                stackId="a"
                fill="#3b82f6"
                name="Open - Customer"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="openCompany"
                stackId="a"
                fill="#f97316"
                name="Open - Company"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="closed"
                stackId="a"
                fill="#10b981"
                name="Closed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topics Summary - Grouped by Priority */}
        <div className="mt-6 space-y-6">
          <h4 className="text-sm font-medium text-gray-300">Topics by Priority</h4>
          {Object.keys(topicsByPriority).length > 0 ? (
            <div className="space-y-4">
              {data.map((priorityData) => {
                const priority = priorityData.priority;
                const topics = topicsByPriority[priority] || [];
                
                if (topics.length === 0) return null;

                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(priority)}
                      <h5 className="text-sm font-semibold text-white">
                        {priority} Topics
                      </h5>
                      <span className="text-xs text-gray-400">
                        ({topics.length} {topics.length === 1 ? 'topic' : 'topics'})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((item) => (
                        <div
                          key={`${priority}-${item.topic}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <Target className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white">
                            {item.topic}
                          </span>
                          <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No topics found for the selected criteria
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
