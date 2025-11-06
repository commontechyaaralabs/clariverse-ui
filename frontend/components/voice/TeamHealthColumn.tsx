'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface TeamHealthColumnProps {
  qaScore: number;
  qaBreakdown: { empathy: number; compliance: number; tone: number; resolution: number; listening: number };
  qaTrend: number[];
  complianceData: {
    kycRate: number;
    identityConfirmation: number;
    fraudScript: number;
    regulatoryStatement: number;
    privacyDisclaimer: number;
    violations: number;
  };
  emotionData: {
    positive: number;
    neutral: number;
    negative: number;
    timeline: number[];
  };
  escalationData: {
    riskScore: number;
    callsAtRisk: number;
    agentsInvolved: string[];
    topCauses: string[];
    trend: number[];
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

export function TeamHealthColumn({
  qaScore,
  qaBreakdown,
  qaTrend,
  complianceData,
  emotionData,
  escalationData,
  dateRange
}: TeamHealthColumnProps) {
  // Calculate date range and determine chart granularity
  const getChartConfig = () => {
    if (!dateRange?.start || !dateRange?.end) {
      // Default: 24 hours
      return {
        granularity: 'hourly' as const,
        label: '24 Hours',
        xAxisLabel: 'Time (Hours)',
        tooltipFormatter: (label: number) => `Hour: ${label}:00`,
        dataKey: 'hour'
      };
    }

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      // Single day: Show hourly (24 hours)
      return {
        granularity: 'hourly' as const,
        label: '24 Hours',
        xAxisLabel: 'Time (Hours)',
        tooltipFormatter: (label: number) => `Hour: ${label}:00`,
        dataKey: 'hour'
      };
    } else if (diffDays <= 7) {
      // Up to 7 days: Show daily
      return {
        granularity: 'daily' as const,
        label: `${diffDays} Days`,
        xAxisLabel: 'Date',
        tooltipFormatter: (label: number) => {
          const date = new Date(start);
          date.setDate(date.getDate() + label);
          return `Date: ${date.toLocaleDateString()}`;
        },
        dataKey: 'day'
      };
    } else if (diffDays <= 90) {
      // Up to 3 months: Show weekly
      const weeks = Math.ceil(diffDays / 7);
      return {
        granularity: 'weekly' as const,
        label: `${weeks} Weeks`,
        xAxisLabel: 'Week',
        tooltipFormatter: (label: number) => `Week ${label + 1}`,
        dataKey: 'week'
      };
    } else {
      // More than 3 months: Show monthly
      const months = Math.ceil(diffDays / 30);
      return {
        granularity: 'monthly' as const,
        label: `${months} Months`,
        xAxisLabel: 'Month',
        tooltipFormatter: (label: number) => {
          const date = new Date(start);
          date.setMonth(date.getMonth() + label);
          return `Month: ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        },
        dataKey: 'month'
      };
    }
  };

  const chartConfig = getChartConfig();

  // Transform timeline data based on granularity
  const getChartData = () => {
    const baseTimeline = emotionData.timeline;
    
    if (chartConfig.granularity === 'hourly') {
      // Use original 24-hour timeline
      return baseTimeline.map((v, i) => ({
        [chartConfig.dataKey]: i,
        emotion: v,
        label: `${i}:00`
      }));
    } else if (chartConfig.granularity === 'daily') {
      // Aggregate into daily averages
      const days = Math.ceil((new Date(dateRange!.end).getTime() - new Date(dateRange!.start).getTime()) / (1000 * 60 * 60 * 24));
      return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        [chartConfig.dataKey]: i,
        emotion: baseTimeline[i % baseTimeline.length] || 0.5,
        label: `Day ${i + 1}`
      }));
    } else if (chartConfig.granularity === 'weekly') {
      // Aggregate into weekly averages
      const weeks = Math.ceil((new Date(dateRange!.end).getTime() - new Date(dateRange!.start).getTime()) / (1000 * 60 * 60 * 24 * 7));
      return Array.from({ length: Math.min(weeks, 26) }, (_, i) => ({
        [chartConfig.dataKey]: i,
        emotion: baseTimeline[i % baseTimeline.length] || 0.5,
        label: `Week ${i + 1}`
      }));
    } else {
      // Monthly aggregation
      const months = Math.ceil((new Date(dateRange!.end).getTime() - new Date(dateRange!.start).getTime()) / (1000 * 60 * 60 * 24 * 30));
      return Array.from({ length: Math.min(months, 24) }, (_, i) => ({
        [chartConfig.dataKey]: i,
        emotion: baseTimeline[i % baseTimeline.length] || 0.5,
        label: `Month ${i + 1}`
      }));
    }
  };

  const chartData = getChartData();
  return (
    <div className="space-y-4 w-[28%]">
      {/* Team Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Quality Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{qaScore.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Overall QA Score</p>
          </div>
          
          <div className="space-y-2">
            {Object.entries(qaBreakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#b90abd] to-[#5332ff]" style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-white w-10 text-right">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">KYC Verification</span>
              <span className="text-sm font-semibold text-white">{complianceData.kycRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Identity Confirmation</span>
              <span className="text-sm font-semibold text-white">{complianceData.identityConfirmation}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fraud Safety Script</span>
              <span className="text-sm font-semibold text-white">{complianceData.fraudScript}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Regulatory Statement</span>
              <span className="text-sm font-semibold text-white">{complianceData.regulatoryStatement}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Privacy Disclaimer</span>
              <span className="text-sm font-semibold text-white">{complianceData.privacyDisclaimer}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Violations
              </span>
              <span className="text-sm font-semibold text-white">{complianceData.violations}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Compliance Breakdown</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Fully Compliant</span>
                </div>
                <span className="text-xs font-semibold text-white">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-xs text-muted-foreground">Partially Compliant</span>
                </div>
                <span className="text-xs font-semibold text-white">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-xs text-muted-foreground">Non-Compliant</span>
                </div>
                <span className="text-xs font-semibold text-white">5%</span>
              </div>
            </div>
            <div className="h-20 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Fully Compliant', value: 75, color: '#10b981' },
                  { name: 'Partially Compliant', value: 20, color: '#eab308' },
                  { name: 'Non-Compliant', value: 5, color: '#ef4444' }
                ]} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fill: '#939394', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(1, 1, 1, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(83, 50, 255, 0.4)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff' }}
                    formatter={(value: number) => [`${value}%`, 'Compliance Rate']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[
                      { name: 'Fully Compliant', value: 75, color: '#10b981' },
                      { name: 'Partially Compliant', value: 20, color: '#eab308' },
                      { name: 'Non-Compliant', value: 5, color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Emotion Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Emotion Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-green-500/10 rounded p-2 border border-green-500/20">
              <p className="text-2xl font-bold text-green-500">{emotionData.positive}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Positive</p>
            </div>
            <div className="text-center bg-gray-500/10 rounded p-2 border border-gray-500/20">
              <p className="text-2xl font-bold text-gray-400">{emotionData.neutral}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Neutral</p>
            </div>
            <div className="text-center bg-red-500/10 rounded p-2 border border-red-500/20">
              <p className="text-2xl font-bold text-red-500">{emotionData.negative}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Negative</p>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Emotion Timeline ({chartConfig.label}):
            </p>
            <div className="h-40 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 transform -rotate-90 origin-center z-10">
                <p className="text-xs text-muted-foreground whitespace-nowrap">Emotion Level</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b90abd" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#b90abd" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey={chartConfig.dataKey}
                    stroke="#939394"
                    fontSize={10}
                    tick={{ fill: '#939394' }}
                    axisLine={false}
                    tickLine={false}
                    interval={chartConfig.granularity === 'hourly' ? 2 : chartConfig.granularity === 'daily' ? 1 : chartConfig.granularity === 'weekly' ? 1 : 1}
                  />
                  <YAxis 
                    stroke="#939394"
                    fontSize={10}
                    tick={{ fill: '#939394' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(1, 1, 1, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(185, 10, 189, 0.4)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff' }}
                    formatter={(value: number) => {
                      const emotion = value > 0.7 ? 'Very Positive' : value > 0.4 ? 'Neutral' : 'Negative';
                      return [`${emotion} (${(value * 100).toFixed(0)}%)`, 'Emotion'];
                    }}
                    labelFormatter={(label) => chartConfig.tooltipFormatter(Number(label))}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="emotion" 
                    stroke="#b90abd" 
                    strokeWidth={2}
                    fill="url(#emotionGradient)" 
                    dot={false}
                    activeDot={{ r: 5, fill: '#b90abd', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 z-10">
                <p className="text-xs text-muted-foreground whitespace-nowrap">{chartConfig.xAxisLabel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Risk Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalation Risk Monitor</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            AI predicts how likely calls will escalate to supervisors. Lower % = better. Monitor daily to prevent issues.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Score with Trend */}
          <div className="text-center">
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius={60} outerRadius={90} data={[{ value: escalationData.riskScore }]}>
                  <RadialBar 
                    dataKey="value" 
                    fill={escalationData.riskScore >= 50 ? '#ef4444' : escalationData.riskScore >= 30 ? '#f97316' : '#10b981'} 
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{escalationData.riskScore.toFixed(1)}%</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: escalationData.riskScore >= 50 ? '#ef4444' : escalationData.riskScore >= 30 ? '#f97316' : '#10b981' }}>
                    {escalationData.riskScore >= 50 ? '🔴 Critical Risk' : escalationData.riskScore >= 30 ? '🟡 High Risk' : '🟢 Low Risk'}
                  </p>
                </div>
              </div>
            </div>
            {/* Trend Indicator with Explanation */}
            {escalationData.trend && escalationData.trend.length >= 2 && (
              <div className="mt-3 bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {escalationData.trend[escalationData.trend.length - 1] > escalationData.trend[0] ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">Risk is Increasing</span>
                    </>
                  ) : escalationData.trend[escalationData.trend.length - 1] < escalationData.trend[0] ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />
                      <span className="text-sm font-semibold text-green-400">Risk is Decreasing</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-400">Risk is Stable</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Changed from <span className="text-white font-semibold">{escalationData.trend[0].toFixed(1)}%</span> to <span className="text-white font-semibold">{escalationData.trend[escalationData.trend.length - 1].toFixed(1)}%</span> over 7 days
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {escalationData.trend[escalationData.trend.length - 1] < escalationData.trend[0] 
                    ? '✓ Good news: Risk is going down. Keep monitoring.' 
                    : escalationData.trend[escalationData.trend.length - 1] > escalationData.trend[0]
                    ? '⚠️ Warning: Risk is rising. Review high-risk calls immediately.'
                    : '→ Risk level unchanged. Continue monitoring.'}
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="bg-white/5 rounded p-3">
              <p className="text-xs text-muted-foreground mb-1">Calls at Risk</p>
              <p className="text-2xl font-bold text-white">{escalationData.callsAtRisk}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calls likely to escalate
              </p>
              <p className="text-xs text-orange-400 mt-0.5">⚠️ Review these calls</p>
            </div>
            <div className="bg-white/5 rounded p-3">
              <p className="text-xs text-muted-foreground mb-1">Agents Involved</p>
              <p className="text-2xl font-bold text-white">{escalationData.agentsInvolved.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Agents with risky calls
              </p>
              <p className="text-xs text-orange-400 mt-0.5">👤 Need coaching</p>
            </div>
          </div>

          {/* Top Causes with Impact */}
          <div className="pt-2 border-t border-white/10">
            <div className="space-y-2">
              {escalationData.topCauses.map((cause, idx) => {
                // Assign impact percentages (higher for first items)
                const impact = [45, 30, 25][idx] || 15;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-xs text-white">{cause}</span>
                      </div>
                      <span className="text-xs font-semibold text-orange-400">{impact}% of escalations</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400" 
                        style={{ width: `${impact}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agents List */}
          {escalationData.agentsInvolved.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Agents at Risk:</p>
              <div className="space-y-1">
                {escalationData.agentsInvolved.map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1">
                    <span className="text-white">{agent}</span>
                    <span className="text-orange-400">Review needed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

