'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ThreadsOverTimeData, EisenhowerThread } from '@/lib/api';
import { TrendingUp, Users, Building, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ThreadsOverTimeChartProps {
  data: ThreadsOverTimeData[];
  threads?: EisenhowerThread[];
  onDataPointClick?: (date: string, type: string) => void;
}

const COLORS = [
  '#5332ff', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export function ThreadsOverTimeChart({ data, threads = [], onDataPointClick }: ThreadsOverTimeChartProps) {
  const [selectedActionType, setSelectedActionType] = useState<'customer' | 'company' | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calculate topic distribution for selected action type and date
  const topicDistributionData = useMemo(() => {
    if (!selectedActionType || !selectedDate || !threads.length) return [];

    const filteredThreads = threads.filter(thread => {
      const threadDate = new Date(thread.last_message_at).toISOString().split('T')[0];
      return thread.resolution_status === 'open' && 
             thread.action_pending_from === selectedActionType &&
             threadDate === selectedDate;
    });

    const topicCounts: Record<string, number> = {};
    filteredThreads.forEach(thread => {
      topicCounts[thread.topic] = (topicCounts[thread.topic] || 0) + 1;
    });

    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [threads, selectedActionType, selectedDate]);

  // Calculate customer distribution for selected action type and date
  const customerDistributionData = useMemo(() => {
    if (!selectedActionType || selectedActionType !== 'customer' || !selectedDate || !threads.length) return [];

    const filteredThreads = threads.filter(thread => {
      const threadDate = new Date(thread.last_message_at).toISOString().split('T')[0];
      return thread.resolution_status === 'open' && 
             thread.action_pending_from === 'customer' &&
             threadDate === selectedDate;
    });

    const customerCounts: Record<string, { count: number; topics: Record<string, number> }> = {};
    filteredThreads.forEach(thread => {
      const customerName = thread.participants.find(p => p.type === 'customer')?.name || 'Unknown';
      if (!customerCounts[customerName]) {
        customerCounts[customerName] = { count: 0, topics: {} };
      }
      customerCounts[customerName].count++;
      customerCounts[customerName].topics[thread.topic] = (customerCounts[customerName].topics[thread.topic] || 0) + 1;
    });

    return Object.entries(customerCounts)
      .map(([customer, data]) => ({ customer, count: data.count, topics: data.topics }))
      .sort((a, b) => b.count - a.count);
  }, [threads, selectedActionType, selectedDate]);

  // Calculate company distribution for selected action type and date
  const companyDistributionData = useMemo(() => {
    if (!selectedActionType || selectedActionType !== 'company' || !selectedDate || !threads.length) return [];

    const filteredThreads = threads.filter(thread => {
      const threadDate = new Date(thread.last_message_at).toISOString().split('T')[0];
      return thread.resolution_status === 'open' && 
             thread.action_pending_from === 'company' &&
             threadDate === selectedDate;
    });

    const assigneeCounts: Record<string, { count: number; topics: Record<string, number> }> = {};
    filteredThreads.forEach(thread => {
      const assignee = thread.assigned_to || thread.owner || 'Unassigned';
      if (!assigneeCounts[assignee]) {
        assigneeCounts[assignee] = { count: 0, topics: {} };
      }
      assigneeCounts[assignee].count++;
      assigneeCounts[assignee].topics[thread.topic] = (assigneeCounts[assignee].topics[thread.topic] || 0) + 1;
    });

    return Object.entries(assigneeCounts)
      .map(([assignee, data]) => ({ assignee, count: data.count, topics: data.topics }))
      .sort((a, b) => b.count - a.count);
  }, [threads, selectedActionType, selectedDate]);

  const handleLineClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      const dataKey = data.activePayload[0].dataKey;
      
      if (dataKey === 'openCustomer') {
        setSelectedActionType('customer');
        setSelectedDate(payload.date);
      } else if (dataKey === 'openCompany') {
        setSelectedActionType('company');
        setSelectedDate(payload.date);
      }
    }
  };

  const handleBackClick = () => {
    setSelectedActionType(null);
    setSelectedDate(null);
  };

  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.openCustomer + data.openCompany + data.closed;
      const hoverDate = new Date(label).toISOString().split('T')[0];
      
      // Calculate cluster distribution for the hovered date (optimized)
      const clusterDistribution = (() => {
        if (!threads.length) return [];
        
        const dayThreads = threads.filter(thread => {
          const threadDate = new Date(thread.last_message_at).toISOString().split('T')[0];
          return threadDate === hoverDate;
        });
        
        const clusterCounts: Record<string, number> = {};
        dayThreads.forEach(thread => {
          const cluster = thread.dominant_cluster_name;
          clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        });
        
        return Object.entries(clusterCounts)
          .map(([cluster, count]) => ({ cluster, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Show top 5 clusters
      })();

      // Calculate topic breakdown for the hovered date (optimized)
      const topicBreakdown = (() => {
        if (!threads.length) return [];
        
        const dayThreads = threads.filter(thread => {
          const threadDate = new Date(thread.last_message_at).toISOString().split('T')[0];
          return threadDate === hoverDate;
        });
        
        const topicCounts: Record<string, { 
          count: number; 
          urgentCount: number; 
          totalSentiment: number; 
          sentimentCount: number;
        }> = {};
        
        dayThreads.forEach(thread => {
          const topic = thread.topic;
          if (!topicCounts[topic]) {
            topicCounts[topic] = { 
              count: 0, 
              urgentCount: 0, 
              totalSentiment: 0, 
              sentimentCount: 0
            };
          }
          topicCounts[topic].count++;
          topicCounts[topic].totalSentiment += thread.overall_sentiment;
          topicCounts[topic].sentimentCount++;
          
          if (thread.urgency === 'critical' || thread.urgency === 'high') {
            topicCounts[topic].urgentCount++;
          }
        });
        
        // Calculate percentages and average sentiment
        const totalThreads = dayThreads.length;
        return Object.entries(topicCounts)
          .map(([topic, data]) => ({
            topic,
            count: data.count,
            urgentCount: data.urgentCount,
            percentage: totalThreads > 0 ? Math.round((data.count / totalThreads) * 100) : 0,
            avgSentiment: data.sentimentCount > 0 ? (data.totalSentiment / data.sentimentCount - 3) / 2 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Show top 6 topics
      })();

      // Calculate tooltip position to appear just above the chart lines
      const tooltipStyle = {
        position: 'absolute' as const,
        left: coordinate?.x ? `${Math.max(10, Math.min(coordinate.x - 300, window.innerWidth - 620))}px` : '50%',
        top: coordinate?.y ? `${coordinate.y + 10}px` : '50%',
        transform: 'translate(-50%, -100%)',
        zIndex: 1000
      };

      return (
        <div 
          className="border border-gray-600 rounded-lg p-2.5 shadow-xl min-w-[500px] max-w-[640px] bg-gray-900"
          style={tooltipStyle}
        >
          <p className="font-semibold text-white text-sm mb-1.5 text-center">
            {new Date(label).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          
          <div className="grid gap-2.5 md:grid-cols-[145px_minmax(0,1fr)]">
            {/* Left Column - Pie Chart and Thread Status */}
            <div className="space-y-1">
              {/* Cluster Distribution Pie Chart */}
              {clusterDistribution.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-black/30 px-1.5 shadow-inner flex flex-col items-center w-[130px] mx-auto -my-0.5">
                  <PieChart width={80} height={70} className="-my-2">
                    <Pie
                      data={clusterDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={33}
                      innerRadius={16}
                      stroke="#0f172a"
                      strokeWidth={2}
                      dataKey="count"
                      animationDuration={200}
                    >
                      {clusterDistribution.map((entry, index) => (
                        <Cell 
                          key={`${entry.cluster}-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                  <p className="text-center text-[8px] uppercase tracking-[0.3em] text-gray-500 -mt-2 pb-1">
                    Cluster share
                  </p>
                </div>
              )}
              
              {/* Thread Status Legend */}
              <div className="rounded-lg border border-white/10 bg-black/40 p-1.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5332ff]" />
                    <span className="text-gray-300 text-[10px]">Open - Customer</span>
                  </div>
                  <span className="text-white font-semibold text-[11px]">{data.openCustomer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-gray-300 text-[10px]">Open - Company</span>
                  </div>
                  <span className="text-white font-semibold text-[11px]">{data.openCompany}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-gray-300 text-[10px]">Closed</span>
                  </div>
                  <span className="text-white font-semibold text-[11px]">{data.closed}</span>
                </div>
                <div className="border-t border-gray-700 pt-1 mt-1 flex items-center justify-between font-semibold text-white">
                  <span className="text-gray-300 text-[10px]">Total</span>
                  <span className="text-[11px]">{total}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="flex-1 min-w-0">
              {/* Cluster Distribution Details */}
              {clusterDistribution.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-[10px] font-medium text-gray-300 mb-1">Dominant Clusters</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {clusterDistribution.map((item, index) => (
                      <div key={item.cluster} className="flex items-center justify-between text-[10px] bg-gray-800/30 rounded p-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <div 
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)` 
                            }}
                          />
                          <span className="text-gray-300 truncate text-[10px]">{item.cluster}</span>
                        </div>
                        <span className="text-white font-medium flex-shrink-0 ml-1">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Breakdown */}
              {topicBreakdown.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-medium text-gray-300 mb-1">Topic Breakdown</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {topicBreakdown.map((item, index) => (
                      <div key={item.topic} className="bg-gray-800/50 rounded p-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h5 className="text-[10px] font-medium text-white truncate">{item.topic}</h5>
                          <span className="text-[9px] text-gray-400 flex-shrink-0 ml-1">{item.percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-white font-bold">{item.count}</span>
                            {item.urgentCount > 0 && (
                              <span className="text-red-400 text-[9px]">{item.urgentCount}</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-medium ${
                            item.avgSentiment > 0.2 ? 'text-green-400' : 
                            item.avgSentiment < -0.2 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {item.avgSentiment.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (selectedActionType && selectedDate) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Threads Over Time
              </button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedActionType === 'customer' ? (
                    <Users className="h-5 w-5 text-[#b90abd]" />
                  ) : (
                    <Building className="h-5 w-5 text-orange-400" />
                  )}
                  Action Pending from {selectedActionType === 'customer' ? 'Customer' : 'Company'} - {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of pending actions by topic and {selectedActionType === 'customer' ? 'customer' : 'assignee'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Topic Distribution */}
        {topicDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Topic Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of pending actions by topic for {selectedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topicDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
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
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={selectedActionType === 'customer' ? '#5332ff' : '#f97316'}
                      fillOpacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Distribution (for customer pending) */}
        {selectedActionType === 'customer' && customerDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#b90abd]" />
                Customer Distribution
              </CardTitle>
              <CardDescription>
                Pending actions by customer for {selectedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerDistributionData.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{item.customer}</h4>
                      <span className="text-sm text-gray-400">{item.count} threads</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.topics).map(([topic, count]) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs bg-[#b90abd]/20 text-[#b90abd] rounded border border-[#b90abd]/30"
                        >
                          {topic} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Distribution (for company pending) */}
        {selectedActionType === 'company' && companyDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-400" />
                Assignee Distribution
              </CardTitle>
              <CardDescription>
                Pending actions by assignee for {selectedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyDistributionData.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{item.assignee}</h4>
                      <span className="text-sm text-gray-400">{item.count} threads</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.topics).map(([topic, count]) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded border border-orange-500/30"
                        >
                          {topic} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#b90abd]" />
            Threads Over Time
          </CardTitle>
          <CardDescription>
            Daily thread creation trends and action pending analysis. Click on lines to drill down.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onClick={handleLineClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}
                  iconType="line"
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  formatter={(value, entry) => (
                    <span style={{ 
                      marginRight: '20px',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="openCustomer"
                  stroke="#5332ff"
                  strokeWidth={2}
                  dot={{ fill: '#5332ff', strokeWidth: 2, r: 4 }}
                  name="Open - Customer"
                />
                <Line
                  type="monotone"
                  dataKey="openCompany"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  name="Open - Company"
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Closed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}