'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Target, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowRight, Bot, Wand2, Zap, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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
  const [selectedPriorityForTopics, setSelectedPriorityForTopics] = useState<string | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    status: [],
    urgency: [],
    priority: [],
    topic: [],
    search: '',
  });
  
  // Date filter preset state
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('One Month');
  
  // Calculate date range based on preset
  const calculateDateRange = useCallback((preset: string, currentDateRange?: { start: string; end: string }) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    
    switch (preset) {
      case 'All':
        // Return empty date range to show all data
        return { start: '', end: '' };
      case 'Current day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'One Week':
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'One Month':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6 Months':
        startDate.setMonth(today.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'Custom':
        // Don't auto-calculate for custom - use provided range or return empty
        return currentDateRange || { start: '', end: '' };
      default:
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
    }
    
    // Format dates as YYYY-MM-DD for date inputs
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate)
    };
  }, []); // Removed filters.dateRange dependency to prevent re-renders
  
  // Handle preset change
  const handlePresetChange = useCallback((preset: string) => {
    setDateFilterPreset(preset);
    if (preset !== 'Custom') {
      const dateRange = calculateDateRange(preset);
      setFilters(prev => ({
        ...prev,
        dateRange
      }));
    } else {
      // For Custom, keep existing date range
      // Date range will be updated when user selects dates
    }
  }, [calculateDateRange]); // calculateDateRange is now stable (no dependencies)

  // Initialize date range on mount
  useEffect(() => {
    if (dateFilterPreset !== 'Custom') {
      const dateRange = calculateDateRange(dateFilterPreset);
      setFilters(prev => ({
        ...prev,
        dateRange
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - calculateDateRange is stable
  
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
    // Set selected priority for topic filtering
    setSelectedPriorityForTopics(priority === selectedPriorityForTopics ? null : priority);
    setFilters(prev => ({ 
      ...prev, 
      priority: prev.priority.includes(priority) 
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  }, [selectedPriorityForTopics]);

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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Fluid Intelligence Dashboard - Email
              </h1>
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="text-lg">✨</span>
              AI-powered insights for email threads, priorities, and team performance
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link href="/email">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 border-2"
                >
                  📊 Executive Summary
                </Button>
              </Link>
              <Link href="/email/executive">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                >
                  🧭 Executive Cockpit
                </Button>
              </Link>
              <Link href="/email/manager">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-600/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
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
                  className="bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/20"
                >
                  🧑‍💼 Ops View
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {/* AI Insights Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  // Handle AI insights generation
                  console.log('Generate your day in 2 minutes');
                }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 group h-[38px] px-6"
              >
                <span className="text-lg mr-2 group-hover:rotate-180 transition-transform duration-500 inline-block">✨</span>
                Generate your day in 2 minutes
              </Button>
            </div>
            
            {/* Date Filters */}
            <div className="flex items-center gap-2 justify-end">
              <label className="text-xs text-gray-400 whitespace-nowrap">Filters:</label>
              <div className="relative z-50">
                <Select value={dateFilterPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white text-sm h-[38px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white z-[9999]">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Current day">Current day</SelectItem>
                    <SelectItem value="One Week">One Week</SelectItem>
                    <SelectItem value="One Month">One Month</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Date Pickers - Only show when Custom is selected */}
              {dateFilterPreset === 'Custom' && (
                <>
                  <label className="text-xs text-gray-400 whitespace-nowrap">Start Date:</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
                  />
                  <label className="text-xs text-gray-400 whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
                  />
                </>
              )}
              
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 h-[38px]"
              >
                Apply
                <RefreshCw className="h-4 w-4 ml-2" />
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

            {/* Eisenhower Quadrant Distribution with Side Panel */}
            {eisenhowerThreads.length > 0 && (
              <div className={`grid gap-6 ${selectedQuadrant ? 'grid-cols-1 xl:grid-cols-2 items-stretch' : 'grid-cols-1'}`}>
                {/* Left Side - Eisenhower Quadrant Distribution */}
                <Card className={`bg-gray-900 border-gray-700 ${selectedQuadrant ? 'h-full flex flex-col' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-purple-400" />
                        Eisenhower Quadrant Distribution
                      </CardTitle>
                      <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
                        <span className="text-sm">✨</span>
                        <span className="text-xs text-purple-300 font-medium">AI Priority Analysis</span>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400 flex items-center gap-2">
                      <span>Focus on critical items first</span>
                      <span className="text-purple-400">•</span>
                      <span>Thread distribution across priority quadrants</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={selectedQuadrant ? 'flex-1 flex flex-col' : ''}>
                    <div className={`relative ${selectedQuadrant ? 'flex-1' : ''}`}>
                      {/* Quadrant Grid */}
                      <div className={`grid grid-cols-2 gap-0 border border-gray-600 rounded-lg overflow-hidden ${selectedQuadrant ? 'h-full' : ''}`}>
                        {['do', 'schedule', 'delegate', 'delete'].map((quadrant) => {
                        const quadrantThreads = eisenhowerThreads.filter(thread => thread.quadrant === quadrant);
                        const percentageValue = (quadrantThreads.length / eisenhowerThreads.length) * 100;
                        const percentage = percentageValue < 1 ? parseFloat(percentageValue.toFixed(1)) : Math.round(percentageValue);
                        const colors = {
                          do: { bg: 'bg-red-500' },
                          schedule: { bg: 'bg-yellow-500' },
                          delegate: { bg: 'bg-blue-500' },
                          delete: { bg: 'bg-gray-500' }
                        }[quadrant] || { bg: 'bg-gray-500' };
                        
                        const labels = {
                          do: 'Do - Now',
                          schedule: 'Schedule - Later',
                          delegate: 'Delegate - Team',
                          delete: 'Postponed'
                        };
                        
                        const descriptions = {
                          do: 'Important & Urgent',
                          schedule: 'Important, Not Urgent',
                          delegate: 'Not Important, Urgent',
                          delete: 'Not Important, Not Urgent'
                        };
                        
                        const isSelected = selectedQuadrant === quadrant;
                        // Add borders for separators: right border for left column, bottom border for top row
                        const isLeftColumn = quadrant === 'do' || quadrant === 'delegate';
                        const isTopRow = quadrant === 'do' || quadrant === 'schedule';
                        const isDoQuadrant = quadrant === 'do';
                        const hasHighPriority = isDoQuadrant && quadrantThreads.length > 500;
                        
                        return (
                          <div 
                            key={quadrant} 
                            className={`relative text-center cursor-pointer hover:bg-gray-800/50 p-4 transition-all duration-200 group ${
                              isSelected ? 'bg-gray-800/70 ring-2 ring-purple-400 shadow-lg' : ''
                            } ${
                              isLeftColumn ? 'border-r border-gray-600' : ''
                            } ${
                              isTopRow ? 'border-b border-gray-600' : ''
                            } ${
                              hasHighPriority ? 'hover:ring-2 hover:ring-purple-400/50' : ''
                            }`}
                            onClick={() => handleQuadrantClick(quadrant)}
                          >
                            {/* Purple glow for Do quadrant when high priority */}
                            {hasHighPriority && (
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
                            )}
                            <div className="flex items-center justify-center mb-2 relative z-10">
                              {hasHighPriority && (
                                <span className="absolute -left-2 text-sm animate-pulse">✨</span>
                              )}
                              <div className={`w-4 h-4 rounded-full ${colors.bg} mr-2 relative z-10`} />
                              <span className="text-sm font-medium text-gray-300 relative z-10">
                                {labels[quadrant as keyof typeof labels]}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                              {quadrantThreads.length}
                            </div>
                            <div className="text-xs text-gray-400 mb-2">
                              {percentage}%
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                              {descriptions[quadrant as keyof typeof descriptions]}
                            </div>
                            
                            {/* Action Button for Do quadrant */}
                            {quadrant === 'do' && quadrantThreads.length > 0 && (
                              <Button
                                size="sm"
                                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs border-0 shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuadrantClick(quadrant);
                                }}
                              >
                                <Target className="h-3 w-3 mr-1.5" />
                                Work on Top Priority
                                <ArrowRight className="h-3 w-3 ml-1.5" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

                {/* Right Side - Priority vs Resolution Status (only when quadrant selected) */}
                {selectedQuadrant && (
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
                          onClick={() => {
                            setSelectedQuadrant(null);
                            setSelectedPriorityForTopics(null);
                          }}
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
                            threads={eisenhowerThreads}
                            selectedQuadrant={selectedQuadrant}
                            selectedPriority={selectedPriorityForTopics}
                          onPriorityClick={handlePriorityClick}
                        />
                      )}
                    </CardContent>
                  </Card>
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
