'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentPerformance, SkillGapData } from '@/lib/voiceData';
import { AlertCircle, TrendingUp, TrendingDown, User } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ActionCoachingColumnProps {
  agentsNeedingAttention: AgentPerformance[];
  agentLeaderboard: AgentPerformance[];
  skillGapData: SkillGapData[];
  emotionData: {
    positive: number;
    neutral: number;
    negative: number;
    timeline: number[];
  };
  dateRange?: {
    start: string;
    end: string;
  };
  onAgentClick: (agentId: string) => void;
}

export function ActionCoachingColumn({
  agentsNeedingAttention,
  agentLeaderboard,
  skillGapData,
  emotionData,
  dateRange,
  onAgentClick
}: ActionCoachingColumnProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

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
    <div className="space-y-4 w-[22%] flex-shrink-0">
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
                      border: '2px solid rgba(185, 10, 189, 0.4)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      boxShadow: 'none',
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

      {/* Agents Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Agents Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {agentsNeedingAttention.filter(a => a.severity !== 'low').map((agent) => (
            <Card
              key={agent.agentId}
              className={`p-3 border ${getSeverityColor(agent.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => onAgentClick(agent.agentId)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-semibold text-white">{agent.agentName}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(agent.severity)}`}>
                    {agent.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">QA Score: <span className={getScoreColor(agent.qaScore)}>{agent.qaScore.toFixed(1)}%</span></p>
                {agent.issues.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Last 3 Issues:</p>
                    <ul className="space-y-0.5">
                      {agent.issues.slice(0, 3).map((issue, idx) => (
                        <li key={idx} className="text-xs text-white flex items-center gap-1">
                          <span className="w-1 h-1 bg-orange-500 rounded-full" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Agent Performance Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground grid grid-cols-5 gap-1 mb-2">
              <div>Agent</div>
              <div className="text-center">QA</div>
              <div className="text-center">Comp</div>
              <div className="text-center">AHT</div>
              <div className="text-center">Sent</div>
            </div>
            {agentLeaderboard.slice(0, 5).map((agent) => (
              <div
                key={agent.agentId}
                className="grid grid-cols-5 gap-1 text-xs p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => onAgentClick(agent.agentId)}
              >
                <div className="truncate text-white">{agent.agentName.split(' ')[0]}</div>
                <div className={`text-center font-semibold ${getScoreColor(agent.qaScore)}`}>
                  {agent.qaScore.toFixed(0)}
                </div>
                <div className={`text-center font-semibold ${getScoreColor(agent.complianceScore)}`}>
                  {agent.complianceScore.toFixed(0)}
                </div>
                <div className={`text-center ${agent.aht > 350 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.round(agent.aht)}s
                </div>
                <div className={`text-center ${agent.sentimentHandling >= 4 ? 'text-green-500' : agent.sentimentHandling >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {agent.sentimentHandling.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Skill Gap Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Skill Gap Matrix</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Compares current team performance vs. target goals. Shows where training is needed to reach excellence.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 rounded bg-gradient-to-r from-[#b90abd] to-[#5332ff]"></div>
                <span className="text-muted-foreground">Current Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 rounded bg-gray-600"></div>
                <span className="text-muted-foreground">Target Goal</span>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {skillGapData.map((skill, idx) => {
                const gap = skill.expected - skill.current;
                const gapPercent = (gap / skill.expected) * 100;
                const currentPercent = (skill.current / skill.expected) * 100;
                const isCritical = gapPercent > 10;
                const isModerate = gapPercent > 5 && gapPercent <= 10;
                
                return (
                  <div key={idx} className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{skill.skill}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {skill.skill === 'Empathy' && 'Ability to understand and respond to customer emotions'}
                          {skill.skill === 'Product Knowledge' && 'Understanding of banking products and services'}
                          {skill.skill === 'Fraud Handling' && 'Expertise in detecting and handling fraud cases'}
                          {skill.skill === 'Clarity of Explanation' && 'How clearly agents explain complex information'}
                          {skill.skill === 'Process Accuracy' && 'Following correct procedures and workflows'}
                          {skill.skill === 'Listening Skill' && 'Active listening and understanding customer needs'}
                          {skill.skill === 'Tone Stability' && 'Consistent professional tone throughout calls'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-white">
                          {skill.current}<span className="text-muted-foreground">/{skill.expected}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{currentPercent.toFixed(0)}% of target</p>
                      </div>
                    </div>
                    
                    {/* Progress Bars */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Current: {skill.current} points</span>
                          <span className="text-white font-semibold">{currentPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#b90abd] to-[#5332ff] transition-all" 
                            style={{ width: `${currentPercent}%` }} 
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Target: {skill.expected} points</span>
                          <span className="text-muted-foreground">100%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Gap Information */}
                    {gap > 0 && (
                      <div className={`pt-2 border-t border-white/10 ${isCritical ? 'bg-red-500/10' : isModerate ? 'bg-orange-500/10' : 'bg-yellow-500/10'} rounded p-2`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCritical && <span className="text-red-400">🔴</span>}
                            {isModerate && <span className="text-orange-400">🟡</span>}
                            {!isCritical && !isModerate && <span className="text-yellow-400">🟢</span>}
                            <span className="text-xs font-semibold text-white">
                              Gap: {gap.toFixed(1)} points ({gapPercent.toFixed(1)}% below target)
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isCritical 
                            ? '⚠️ Critical gap - Priority training needed'
                            : isModerate
                            ? 'Training recommended to close gap'
                            : 'Minor gap - Monitor and provide feedback'}
                        </p>
                      </div>
                    )}
                    {gap === 0 && (
                      <div className="pt-2 border-t border-white/10 bg-green-500/10 rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="text-xs font-semibold text-green-400">Target achieved!</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

