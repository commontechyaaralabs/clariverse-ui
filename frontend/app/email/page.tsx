'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  getKPIs, 
  getEisenhowerThreads, 
  getThreadDetail,
  getThreadsOverTime,
  getSentimentTrend,
  getTopicDistribution,
  getPriorityResolutionData,
  generatePriorityResolutionDataForQuadrant,
  getActionableCards,
  getNetworkGraphData,
  KPIData, 
  EisenhowerThread, 
  ThreadDetail,
  ThreadsOverTimeData,
  SentimentTrendData,
  TopicDistributionData,
  PriorityResolutionData,
  ActionableCard,
  NetworkGraphData,
} from '@/lib/api';
import { KPICards } from '@/components/email/KPICards';
import { FilterState } from '@/components/email/EmailFilters';
import { ThreadDetailDrawer } from '@/components/email/ThreadDetailDrawer';
import { ThreadsOverTimeChart } from '@/components/email/ThreadsOverTimeChart';
import { SentimentTrendChart } from '@/components/email/SentimentTrendChart';
import { TopicDistributionChart } from '@/components/email/TopicDistributionChart';
import { PriorityResolutionChart } from '@/components/email/PriorityResolutionChart';
import { ActionableCards } from '@/components/charts/ActionableCards';
import { NetworkGraph } from '@/components/charts/NetworkGraph';
import { EisenhowerMatrix } from '@/components/email/EisenhowerMatrix';
import { RiskAssessmentCard } from '@/components/email/RiskAssessmentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Target, AlertCircle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';

export default function EmailDashboard() {
  // Data states
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [eisenhowerThreads, setEisenhowerThreads] = useState<EisenhowerThread[]>([]);
  const [threadsOverTime, setThreadsOverTime] = useState<ThreadsOverTimeData[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendData[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<TopicDistributionData[]>([]);
  const [priorityResolution, setPriorityResolution] = useState<PriorityResolutionData[]>([]);
  const [actionableCards, setActionableCards] = useState<ActionableCard[]>([]);
  const [networkGraph, setNetworkGraph] = useState<NetworkGraphData | null>(null);
  
  // UI states
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    status: [],
    urgency: [],
    priority: [],
    topic: [],
    search: '',
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load data with current filters
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        kpis, 
        threads, 
        overTime, 
        topics, 
        priorities,
        cards,
        network
      ] = await Promise.all([
        getKPIs(),
        getEisenhowerThreads(),
        getThreadsOverTime(),
        getTopicDistribution(),
        getPriorityResolutionData(),
        getActionableCards(),
        getNetworkGraphData(),
      ]);
      
      setKpiData(kpis);
      setEisenhowerThreads(threads);
      setThreadsOverTime(overTime);
      setTopicDistribution(topics);
      setPriorityResolution(priorities);
      setActionableCards(cards);
      setNetworkGraph(network);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    if (!eisenhowerThreads.length) return { threads: [], topics: [], priorities: [] };

    let filteredThreads = eisenhowerThreads;

    // Apply filters
    if (filters.status.length > 0) {
      filteredThreads = filteredThreads.filter(thread => 
        filters.status.includes(thread.resolution_status)
      );
    }

    if (filters.urgency.length > 0) {
      filteredThreads = filteredThreads.filter(thread => 
        filters.urgency.includes(thread.urgency)
      );
    }

    if (filters.priority.length > 0) {
      filteredThreads = filteredThreads.filter(thread => 
        filters.priority.includes(thread.priority)
      );
    }


    return {
      threads: filteredThreads,
      topics: topicDistribution,
      priorities: priorityResolution
    };
  }, [eisenhowerThreads, topicDistribution, priorityResolution, filters]);

  // Compute quadrant-specific priority resolution data
  const quadrantPriorityData = useMemo(() => {
    if (!selectedQuadrant || !eisenhowerThreads.length) {
      return [];
    }
    return generatePriorityResolutionDataForQuadrant(eisenhowerThreads, selectedQuadrant);
  }, [selectedQuadrant, eisenhowerThreads]);

  // Prepare radar chart data for quadrant performance
  const radarData = useMemo(() => {
    const quadrants = ['do', 'schedule', 'delegate', 'delete'] as const;
    
    return quadrants.map(quadrant => {
      const quadrantThreads = eisenhowerThreads.filter(thread => thread.quadrant === quadrant);
      
      // Calculate performance metrics for this quadrant
      const avgImportance = quadrantThreads.reduce((sum, thread) => sum + thread.importance_score, 0) / quadrantThreads.length || 0;
      const avgUrgency = quadrantThreads.reduce((sum, thread) => sum + thread.urgency_flag, 0) / quadrantThreads.length || 0;
      const avgBusinessImpact = quadrantThreads.reduce((sum, thread) => sum + thread.business_impact_score, 0) / quadrantThreads.length || 0;
      const avgSentiment = quadrantThreads.reduce((sum, thread) => sum + thread.overall_sentiment, 0) / quadrantThreads.length || 0;
      const escalationRate = quadrantThreads.filter(thread => thread.escalation_count > 0).length / quadrantThreads.length || 0;

      // Normalize metrics to 0-100 scale
      const normalizedMetrics = {
        importance: Math.round(avgImportance * 100),
        urgency: Math.round(avgUrgency * 100),
        businessImpact: Math.round(avgBusinessImpact),
        sentiment: Math.round((avgSentiment / 5) * 100),
        escalationRate: Math.round(escalationRate * 100),
        resolutionRate: Math.round((quadrantThreads.filter(t => t.resolution_status === 'closed').length / quadrantThreads.length) * 100),
        efficiency: Math.round((100 - escalationRate * 100) * (avgSentiment / 5)),
        workload: Math.round(Math.min(100, quadrantThreads.length * 2)) // Scale thread count to 0-100
      };

      return {
        quadrant: quadrant.charAt(0).toUpperCase() + quadrant.slice(1),
        ...normalizedMetrics,
        threadCount: quadrantThreads.length
      };
    });
  }, [eisenhowerThreads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      const name = payload[0].name;
      return (
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="font-medium">{name}: {value}</div>
        </div>
      );
    }
    return null;
  };

  // Event handlers
  const handleThreadClick = useCallback(async (thread: EisenhowerThread) => {
    try {
      const [threadDetail, sentimentData] = await Promise.all([
        getThreadDetail(thread.thread_id),
        getSentimentTrend(thread.thread_id),
      ]);
      setSelectedThread(threadDetail);
      setSentimentTrend(sentimentData);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error loading thread detail:', error);
    }
  }, []);

  const handleQuadrantClick = useCallback((quadrant: string) => {
    setSelectedQuadrant(quadrant);
  }, []);


  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      dateRange: { start: '', end: '' },
      status: [],
      urgency: [],
      priority: [],
      topic: [],
      search: '',
    });
  }, []);

  const handleKPIAction = useCallback((action: string, kpiType: string) => {
    console.log(`KPI action: ${action} for ${kpiType}`);
    // Apply KPI-based filtering
    switch (kpiType) {
      case 'Urgent Threads':
        setFilters(prev => ({ ...prev, urgency: ['critical', 'high'] }));
        break;
      case 'Critical Issues':
        setFilters(prev => ({ ...prev, priority: ['P1'] }));
        break;
      default:
        break;
    }
  }, []);

  const handleTopicClick = useCallback((topic: string) => {
    console.log(`Topic clicked: ${topic}`);
    setFilters(prev => ({ 
      ...prev, 
      topic: prev.topic.includes(topic) 
        ? prev.topic.filter(t => t !== topic)
        : [...prev.topic, topic]
    }));
  }, []);

  const handlePriorityClick = useCallback((priority: string, status: string) => {
    console.log(`Priority clicked: ${priority}, Status: ${status}`);
    setFilters(prev => ({ 
      ...prev, 
      priority: prev.priority.includes(priority) 
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  }, []);

  const handleActionableCardAction = useCallback((action: string, cardId: string) => {
    console.log(`Actionable card action: ${action} for card ${cardId}`);
    // Handle actionable card actions
    switch (action) {
      case 'escalate':
        // Escalate logic
        break;
      case 'assign_owner':
        // Assign owner logic
        break;
      case 'reply':
        // Reply logic
        break;
      case 'mark_resolved':
        // Mark resolved logic
        break;
      default:
        break;
    }
  }, []);

  const handleApplyFilters = useCallback(() => {
    console.log('Applying filters:', filters);
    loadDashboardData();
  }, [filters, loadDashboardData]);

  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Risk Assessment calculations
  const calculateSLABreachRisk = useCallback((threads: EisenhowerThread[]) => {
    if (threads.length === 0) return 0;
    const today = new Date();
    // Calculate SLA breach risk based on multiple factors
    const breachRiskThreads = threads.filter(thread => {
      const daysSinceLastMessage = (today.getTime() - new Date(thread.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
      const daysSinceFirstMessage = (today.getTime() - new Date(thread.first_message_at).getTime()) / (1000 * 60 * 60 * 24);
      
      // Consider threads at risk if:
      // 1. High priority and not closed for more than 1 day
      // 2. Any thread not closed for more than 3 days
      // 3. Threads with escalation count > 0 and not closed
      return (
        (thread.priority === 'P1' && thread.resolution_status !== 'closed' && daysSinceLastMessage > 1) ||
        (thread.resolution_status !== 'closed' && daysSinceFirstMessage > 3) ||
        (thread.escalation_count > 0 && thread.resolution_status !== 'closed')
      );
    });
    return (breachRiskThreads.length / threads.length) * 100;
  }, []);

  const calculateEscalationRate = useCallback((threads: EisenhowerThread[]) => {
    if (threads.length === 0) return 0;
    const escalatedThreads = threads.filter(thread => thread.escalation_count > 0);
    return (escalatedThreads.length / threads.length) * 100;
  }, []);

  const calculateCustomerWaiting = useCallback((threads: EisenhowerThread[]) => {
    if (threads.length === 0) return 0;
    const customerWaitingThreads = threads.filter(thread => thread.action_pending_from === 'customer');
    return (customerWaitingThreads.length / threads.length) * 100;
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
              <span className="text-white text-lg">Loading dashboard...</span>
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Email Management Dashboard
            </h1>
            <p className="text-gray-400">
              Comprehensive view of email threads, priorities, and team performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Filters */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>


        {/* Dashboard Content */}
        <div className="space-y-8">
            {/* KPI Cards */}
            {kpiData && (
                <KPICards data={kpiData} />
            )}

            {/* Radar Chart Section - Can split when quadrant selected */}
            {eisenhowerThreads.length > 0 && (
              <div className={`${selectedQuadrant ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 items-start' : 'w-full'}`}>
                {/* Left Side - Radar Chart Only */}
                <div className={`${selectedQuadrant ? 'w-full' : 'w-full'}`}>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-purple-400" />
                        Email Thread Analysis Dashboard
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Comprehensive performance metrics and quadrant distribution
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Quadrant Summary at Top */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {['do', 'schedule', 'delegate', 'delete'].map((quadrant) => {
                          const quadrantThreads = eisenhowerThreads.filter(thread => thread.quadrant === quadrant);
                          const percentage = Math.round((quadrantThreads.length / eisenhowerThreads.length) * 100);
                          const colors = {
                            do: { color: 'text-red-400', bg: 'bg-red-500' },
                            schedule: { color: 'text-yellow-400', bg: 'bg-yellow-500' },
                            delegate: { color: 'text-blue-400', bg: 'bg-blue-500' },
                            delete: { color: 'text-gray-400', bg: 'bg-gray-500' }
                          }[quadrant] || { color: 'text-gray-400', bg: 'bg-gray-500' };
                          
                          const labels = {
                            do: 'Do',
                            schedule: 'Schedule', 
                            delegate: 'Delegate',
                            delete: 'Delete'
                          };
                          
                          const isSelected = selectedQuadrant === quadrant;
                          
                          return (
                            <div 
                              key={quadrant} 
                              className={`text-center cursor-pointer hover:bg-gray-800/50 rounded-lg p-4 transition-all duration-200 ${
                                isSelected ? 'bg-gray-800/70 ring-2 ring-purple-400 shadow-lg' : ''
                              }`}
                              onClick={() => handleQuadrantClick(quadrant)}
                            >
                              <div className="flex items-center justify-center mb-3">
                                <div className={`w-4 h-4 rounded-full ${colors.bg} mr-2 flex-shrink-0`} />
                                <span className="text-sm font-medium text-gray-300">
                                  {labels[quadrant as keyof typeof labels]}
                                </span>
                              </div>
                              <div className="text-3xl font-bold text-white mb-2">
                                {quadrantThreads.length}
                              </div>
                              <div className="text-sm text-gray-400 mb-3">
                                {percentage}%
                              </div>
                              <div className="text-xs text-gray-500 leading-tight">
                                {quadrant === 'do' && 'Important & Urgent'}
                                {quadrant === 'schedule' && 'Important, Not Urgent'}
                                {quadrant === 'delegate' && 'Not Important, Urgent'}
                                {quadrant === 'delete' && 'Not Important, Not Urgent'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Radar Chart Visualization */}
                      <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart 
                            data={radarData} 
                            margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
                            startAngle={45}
                          >
                            <PolarGrid 
                              stroke="#374151" 
                              strokeWidth={1}
                              radialLines={true}
                            />
                            <PolarAngleAxis 
                              dataKey="quadrant" 
                              tick={{ 
                                fill: '#ffffff', 
                                fontSize: 14, 
                                fontWeight: 'bold'
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 100]} 
                              tick={{ 
                                fill: '#9ca3af', 
                                fontSize: 11
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickCount={5}
                            />
                            
                            {/* Performance metrics as colored segments */}
                            <Radar
                              name="Importance"
                              dataKey="importance"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Urgency"
                              dataKey="urgency"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Business Impact"
                              dataKey="businessImpact"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Sentiment"
                              dataKey="sentiment"
                              stroke="#ec4899"
                              fill="#ec4899"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Resolution Rate"
                              dataKey="resolutionRate"
                              stroke="#8b5cf6"
                              fill="#8b5cf6"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Efficiency"
                              dataKey="efficiency"
                              stroke="#06b6d4"
                              fill="#06b6d4"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Workload"
                              dataKey="workload"
                              stroke="#84cc16"
                              fill="#84cc16"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                            />
                            <Radar
                              name="Escalation Rate"
                              dataKey="escalationRate"
                              stroke="#f97316"
                              fill="#f97316"
                              fillOpacity={0.8}
                              strokeWidth={2}
                              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                            />
                              
                            <Tooltip content={<CustomTooltip />} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side - Priority vs Resolution Status (only when quadrant selected) */}
                {selectedQuadrant && (
                  <div className="w-full h-full">
                    <Card className="h-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Target className="h-5 w-5 text-purple-400 flex-shrink-0" />
                            <CardTitle className="text-lg truncate">
                              Priority vs Resolution Status - {selectedQuadrant.charAt(0).toUpperCase() + selectedQuadrant.slice(1)}
                            </CardTitle>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuadrant(null)}
                            className="text-gray-400 hover:text-white flex-shrink-0 ml-2"
                          >
                            ✕ Close
                          </Button>
                        </div>
                        <CardDescription className="text-sm">
                          Analysis for {selectedQuadrant} quadrant threads ({eisenhowerThreads.filter(thread => thread.quadrant === selectedQuadrant).length} threads)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {quadrantPriorityData.length > 0 && (
                          <PriorityResolutionChart 
                            data={quadrantPriorityData} 
                            onPriorityClick={handlePriorityClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Quadrant Cards - Always full width, never split */}
            {eisenhowerThreads.length > 0 && (
              <EisenhowerMatrix 
                data={eisenhowerThreads} 
                onThreadClick={handleThreadClick}
                onQuadrantClick={handleQuadrantClick}
                selectedQuadrant={selectedQuadrant}
              />
            )}

            {/* Risk Assessment Card */}
            {eisenhowerThreads.length > 0 && (
              <RiskAssessmentCard 
                data={{
                  slaBreach: calculateSLABreachRisk(eisenhowerThreads),
                  escalationRate: calculateEscalationRate(eisenhowerThreads),
                  customerWaiting: calculateCustomerWaiting(eisenhowerThreads)
                }}
              />
            )}

            {/* Threads Over Time Chart */}
            {threadsOverTime.length > 0 && (
              <ThreadsOverTimeChart data={threadsOverTime} threads={eisenhowerThreads} />
            )}

            {/* Actionable Cards */}
            {actionableCards.length > 0 && (
              <ActionableCards 
                data={actionableCards} 
                onActionClick={handleActionableCardAction}
              />
            )}

            {/* Network Graph */}
            {networkGraph && (
              <NetworkGraph data={networkGraph} />
            )}
        </div>

        {/* Thread Detail Drawer */}
        <ThreadDetailDrawer
          thread={selectedThread}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
