'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getKPIs,
  getEisenhowerThreads,
  KPIData,
  EisenhowerThread,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle, FileCheck, Zap, Users, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinanceDashboard() {
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
      console.error('Error loading finance dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh disabled - data only loads on mount or manual refresh
  }, []);

  // Helper function to determine stage (same as IntentFlowMap and BottleneckHeatmap)
  const getStage = useCallback((thread: EisenhowerThread): string => {
    if (thread.resolution_status === 'closed') {
      if (thread.action_pending_status === 'completed' && (thread.follow_up_required || thread.next_action_suggestion)) {
        return 'Report';
      }
      return 'Close';
    }
    if (thread.resolution_status === 'escalated' || thread.escalation_count > 0) {
      return 'Escalation';
    }
    if (thread.action_pending_status === 'completed') {
      return 'Resolved';
    }
    if (thread.resolution_status === 'in_progress' && thread.action_pending_status === 'in_progress') {
      return 'Resolution';
    }
    if (thread.resolution_status === 'in_progress' || thread.action_pending_status === 'in_progress') {
      return 'Update';
    }
    if (thread.resolution_status === 'open') {
      if (thread.action_pending_status === 'pending') {
        if (!thread.action_pending_from || thread.action_pending_from === 'company') {
          const hash = thread.thread_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const stageIndex = hash % 3;
          const earlyStages = ['Receive', 'Authenticate', 'Categorize'];
          return earlyStages[stageIndex];
        }
        return 'Update';
      }
      // Handle other action_pending_status values for open threads (in_progress, overdue, completed)
      return 'Resolution';
    }
    return 'Receive';
  }, []);

  // Enhanced approval analysis
  const approvalAnalysis = useMemo(() => {
    // Filter threads that might need approval (based on stages, priority, or business impact)
    const approvalThreads = threads.filter((t) => {
      const stage = getStage(t);
      const needsApproval = 
        stage.toLowerCase().includes('approval') ||
        stage.toLowerCase().includes('review') ||
        stage.toLowerCase().includes('finance') ||
        stage.toLowerCase().includes('budget') ||
        stage === 'Resolution' || // Resolution stage often needs approval
        stage === 'Escalation' || // Escalated items need approval
        (t.business_impact_score || 0) > 70 ||
        t.priority === 'P1' || t.priority === 'P2';
      
      return needsApproval && t.resolution_status !== 'closed';
    });

    // Calculate metrics
    const totalValue = approvalThreads.reduce((sum, t) => sum + ((t.business_impact_score || 50) * 10000), 0);
    const avgLatency = approvalThreads.length > 0
      ? approvalThreads.reduce((sum, t) => {
          const age = (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + age;
        }, 0) / approvalThreads.length
      : 0;

    // Group by priority
    const byPriority = approvalThreads.reduce((acc, t) => {
      const priority = t.priority || 'P3';
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(t);
      return acc;
    }, {} as Record<string, EisenhowerThread[]>);

    // Group by stage
    const byStage = approvalThreads.reduce((acc, t) => {
      const stage = getStage(t);
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(t);
      return acc;
    }, {} as Record<string, EisenhowerThread[]>);

    // Calculate stage latency
    const stageLatency = Object.entries(byStage).map(([stage, stageThreads]) => {
      const avgAge = stageThreads.reduce((sum, t) => {
        const age = (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
        return sum + age;
      }, 0) / stageThreads.length;
      
      return {
        stage,
        avgAge: avgAge,
        count: stageThreads.length,
        totalValue: stageThreads.reduce((sum, t) => sum + ((t.business_impact_score || 50) * 10000), 0),
      };
    }).sort((a, b) => b.avgAge - a.avgAge);

    // Calculate approval velocity (approvals per day)
    const closedApprovals = threads.filter((t) => {
      const stage = getStage(t);
      const wasApproval = stage.toLowerCase().includes('approval') || stage.toLowerCase().includes('review');
      return wasApproval && t.resolution_status === 'closed';
    });

    // Generate trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayThreads = approvalThreads.filter((t) => {
        const threadDate = new Date(t.last_message_at).toISOString().split('T')[0];
        return threadDate === dateStr;
      });
      
      trendData.push({
        date: dateStr,
        pending: dayThreads.length,
        value: dayThreads.reduce((sum, t) => sum + ((t.business_impact_score || 50) * 10000), 0),
      });
    }

    // At-risk approvals (stuck > 3 days)
    const atRisk = approvalThreads.filter((t) => {
      const age = (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
      return age > 3;
    });

    // Approval owner distribution
    const byOwner = approvalThreads.reduce((acc, t) => {
      const owner = t.owner || t.assigned_to || 'Unassigned';
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(t);
      return acc;
    }, {} as Record<string, EisenhowerThread[]>);

    const ownerStats = Object.entries(byOwner).map(([owner, ownerThreads]) => {
      const avgAge = ownerThreads.reduce((sum, t) => {
        const age = (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
        return sum + age;
      }, 0) / ownerThreads.length;
      
      return {
        owner,
        count: ownerThreads.length,
        avgAge: avgAge,
        totalValue: ownerThreads.reduce((sum, t) => sum + ((t.business_impact_score || 50) * 10000), 0),
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalApprovals: approvalThreads.length,
      totalValue,
      avgLatency,
      byPriority,
      stageLatency,
      trendData,
      atRisk,
      ownerStats,
      closedCount: closedApprovals.length,
      approvalRate: threads.length > 0 ? (closedApprovals.length / threads.length) * 100 : 0,
    };
  }, [threads]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
              <span className="text-white text-lg">Loading finance dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityColors = {
    P1: '#ef4444',
    P2: '#f97316',
    P3: '#eab308',
    P4: '#3b82f6',
    P5: '#6b7280',
  };

  const priorityData = Object.entries(approvalAnalysis.byPriority).map(([priority, threads]) => ({
    name: priority,
    value: threads.length,
    color: priorityColors[priority as keyof typeof priorityColors] || '#6b7280',
  }));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Finance Dashboard
                <span className="text-lg">🧑‍💼</span>
              </h1>
            </div>
            <p className="text-gray-400 mt-1 mb-2">
              Approval Gravity & Financial Impact Analysis
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
                  className="bg-green-600/10 border-green-500/30 text-green-300 hover:bg-green-600/20 border-2"
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
          <Button
            onClick={loadData}
            variant="outline"
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300 hover:from-green-600/30 hover:to-emerald-600/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Total Value at Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  ₹{(approvalAnalysis.totalValue / 100000).toFixed(1)}Cr
                </div>
                <p className="text-xs text-gray-400">{approvalAnalysis.totalApprovals} pending approvals</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">High impact items</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Avg Approval Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {approvalAnalysis.avgLatency.toFixed(1)} days
                </div>
                <p className="text-xs text-gray-400">Time waiting for approval</p>
                <div className="flex items-center gap-2 mt-2">
                  {approvalAnalysis.avgLatency > 3 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-400" />
                      <span className="text-xs text-red-400">Above target</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">On track</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:border-red-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  At-Risk Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {approvalAnalysis.atRisk.length}
                </div>
                <p className="text-xs text-gray-400">Pending &gt; 3 days</p>
                <div className="flex items-center gap-2 mt-2">
                  <Zap className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400">Requires attention</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-purple-400" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {approvalAnalysis.approvalRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-400">{approvalAnalysis.closedCount} completed</p>
                <div className="flex items-center gap-2 mt-2">
                  <Target className="h-3 w-3 text-purple-400" />
                  <span className="text-xs text-purple-400">Processing efficiency</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approval Funnel by Priority */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Approval Distribution by Priority
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pending approvals grouped by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { name, value, percent } = props;
                        return `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #4b5563',
                        borderRadius: '0.5rem',
                        color: '#ffffff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Approval Trend */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Approval Trend (7 Days)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pending approvals and value over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={approvalAnalysis.trendData}>
                    <defs>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                      yAxisId="left"
                      label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <YAxis
                      orientation="right"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      yAxisId="right"
                      label={{ value: 'Value (₹)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
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
                      yAxisId="left"
                      type="monotone"
                      dataKey="pending"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#pendingGradient)"
                      name="Pending Approvals"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="value"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      name="Value (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Owner Performance */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Approval Owner Performance
            </CardTitle>
            <CardDescription className="text-gray-400">
              Workload and performance by approval owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvalAnalysis.ownerStats.slice(0, 8).map((owner, index) => (
                <motion.div
                  key={owner.owner}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{owner.owner}</div>
                      <div className="text-xs text-gray-400">
                        {owner.count} approvals • Avg: {owner.avgAge.toFixed(1)} days
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      ₹{(owner.totalValue / 100000).toFixed(1)}Cr
                    </div>
                    <div className="text-xs text-gray-500">Total value</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Approvals Table */}
        {approvalAnalysis.atRisk.length > 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                At-Risk Approvals (Stuck &gt; 3 Days)
              </CardTitle>
              <CardDescription className="text-gray-400">
                High-priority approvals requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-sm font-medium text-gray-400 p-3">Subject</th>
                      <th className="text-left text-sm font-medium text-gray-400 p-3">Priority</th>
                      <th className="text-left text-sm font-medium text-gray-400 p-3">Stage</th>
                      <th className="text-right text-sm font-medium text-gray-400 p-3">Age</th>
                      <th className="text-right text-sm font-medium text-gray-400 p-3">Value</th>
                      <th className="text-left text-sm font-medium text-gray-400 p-3">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalAnalysis.atRisk.slice(0, 10).map((thread) => {
                      const age = (new Date().getTime() - new Date(thread.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
                      const value = (thread.business_impact_score || 50) * 10000;
                      return (
                        <tr key={thread.thread_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-3 text-sm text-white">{thread.subject_norm}</td>
                          <td className="p-3">
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: priorityColors[thread.priority] + '20',
                                color: priorityColors[thread.priority],
                              }}
                            >
                              {thread.priority}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-300">{getStage(thread)}</td>
                          <td className="p-3 text-sm text-red-400 text-right font-medium">
                            {age.toFixed(1)}d
                          </td>
                          <td className="p-3 text-sm text-green-400 text-right font-medium">
                            ₹{(value / 100000).toFixed(1)}Cr
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {thread.owner || thread.assigned_to || 'Unassigned'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
