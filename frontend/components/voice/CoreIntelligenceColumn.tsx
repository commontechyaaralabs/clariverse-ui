'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { HighRiskCall, IntentDistribution, IssueHeatmapData, SkillGapData } from '@/lib/voiceData';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface CoreIntelligenceColumnProps {
  highRiskCalls: HighRiskCall[];
  intentDistribution: IntentDistribution[];
  issueHeatmap: IssueHeatmapData[];
  skillGapData: SkillGapData[];
  onCallClick: (callId: string) => void;
}

const COLORS = ['#b90abd', '#5332ff', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316'];

export function CoreIntelligenceColumn({
  highRiskCalls,
  intentDistribution,
  issueHeatmap,
  skillGapData,
  onCallClick
}: CoreIntelligenceColumnProps) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 30) return '#ef4444';
    if (value >= 20) return '#f59e0b';
    if (value >= 10) return '#fbbf24';
    return '#10b981';
  };

  return (
    <div className="space-y-4 w-[50%]">
      {/* High-Risk Calls Carousel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            High-Risk Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {highRiskCalls.slice(0, 6).map((call) => (
              <Card key={call.callId} className="p-3 border-red-500/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">{call.riskCategory}</span>
                    <span className={`text-sm font-bold ${getRiskColor(call.riskScore)}`}>
                      {call.riskScore.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{call.intent}</p>
                    <p className="text-xs text-muted-foreground">Agent: {call.agentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Customer Emotion Timeline</p>
                    <div className="h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={call.emotionTimeline.map((v, i) => ({ time: i, emotion: v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                          <defs>
                            {(() => {
                              const timelineData = call.emotionTimeline.map((v, i) => ({ time: i, emotion: v }));
                              const maxTime = timelineData.length > 0 ? Math.max(...timelineData.map(d => d.time)) : 1;
                              
                              const getSentimentColor = (value: number) => {
                                // Red for negative (0-1.5), Yellow/Orange for neutral (1.5-3.5), Green for positive (3.5-5)
                                if (value <= 1.5) {
                                  const ratio = value / 1.5;
                                  if (ratio < 0.33) return '#dc2626'; // Dark red
                                  if (ratio < 0.66) return '#ef4444'; // Red
                                  return '#f87171'; // Light red
                                } else if (value <= 3.5) {
                                  const ratio = (value - 1.5) / 2;
                                  if (ratio < 0.33) return '#f97316'; // Orange
                                  if (ratio < 0.66) return '#fbbf24'; // Yellow-orange
                                  return '#eab308'; // Yellow
                                } else {
                                  const ratio = (value - 3.5) / 1.5;
                                  if (ratio < 0.33) return '#84cc16'; // Light green
                                  if (ratio < 0.66) return '#22c55e'; // Green
                                  return '#10b981'; // Dark green
                                }
                              };

                              // Create gradient stops at each data point
                              const lineStops = timelineData.map((point, idx) => {
                                const color = getSentimentColor(point.emotion);
                                const offset = maxTime > 0 
                                  ? (point.time / maxTime) 
                                  : (idx / Math.max(1, timelineData.length - 1));
                                
                                return {
                                  offset: Math.min(1, Math.max(0, offset)),
                                  color,
                                  opacity: 1
                                };
                              });

                              // Ensure we have stops at 0% and 100%
                              if (lineStops.length > 0) {
                                if (lineStops[0].offset > 0) {
                                  lineStops.unshift({ ...lineStops[0], offset: 0 });
                                }
                                if (lineStops[lineStops.length - 1].offset < 1) {
                                  lineStops.push({ ...lineStops[lineStops.length - 1], offset: 1 });
                                }
                              }

                              const areaStops = lineStops.map(stop => ({
                                ...stop,
                                opacity: 0.4
                              }));

                              return (
                                <>
                                  <linearGradient 
                                    id={`sentimentLineGradient-${call.callId}`} 
                                    x1="0" 
                                    y1="0" 
                                    x2="1" 
                                    y2="0"
                                  >
                                    {lineStops.map((stop, idx) => (
                                      <stop 
                                        key={idx} 
                                        offset={`${stop.offset * 100}%`} 
                                        stopColor={stop.color} 
                                        stopOpacity={stop.opacity} 
                                      />
                                    ))}
                                  </linearGradient>
                                  <linearGradient 
                                    id={`sentimentAreaGradient-${call.callId}`} 
                                    x1="0" 
                                    y1="0" 
                                    x2="1" 
                                    y2="0"
                                  >
                                    {areaStops.map((stop, idx) => (
                                      <stop 
                                        key={idx} 
                                        offset={`${stop.offset * 100}%`} 
                                        stopColor={stop.color} 
                                        stopOpacity={stop.opacity} 
                                      />
                                    ))}
                                  </linearGradient>
                                </>
                              );
                            })()}
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="emotion" 
                            stroke={`url(#sentimentLineGradient-${call.callId})`}
                            fill={`url(#sentimentAreaGradient-${call.callId})`}
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">Lower values = better satisfaction (0-5 scale)</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {call.complianceMisses.map((miss, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                        {miss}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{call.aiExplanation}</p>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onCallClick(call.callId)}
                  >
                    Open Call
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intent Distribution - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intent Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Left Side Legend */}
            <div className="flex-shrink-0 space-y-2 min-w-[140px]">
              {intentDistribution.slice(0, Math.ceil(intentDistribution.length / 2)).map((intent, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">{intent.intent}</div>
                    <div className="text-xs text-muted-foreground">{intent.percentage}% • {intent.count} calls</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Donut Chart */}
            <div className="flex-1 h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {intentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
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
                    formatter={(value: number, name: string, props: any) => {
                      const intent = props.payload;
                      return [`${intent.count || 0} calls (${value}%)`, intent.intent || name];
                    }}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Right Side Legend */}
            <div className="flex-shrink-0 space-y-2 min-w-[140px]">
              {intentDistribution.slice(Math.ceil(intentDistribution.length / 2)).map((intent, idx) => {
                const actualIdx = Math.ceil(intentDistribution.length / 2) + idx;
                return (
                  <div key={actualIdx} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" 
                      style={{ backgroundColor: COLORS[actualIdx % COLORS.length] }} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white font-medium truncate">{intent.intent}</div>
                      <div className="text-xs text-muted-foreground">{intent.percentage}% • {intent.count} calls</div>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <div className="flex items-center gap-4 text-xs pb-2 border-b border-white/10">
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
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
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

      {/* Issue Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issue Heatmap</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Shows issue frequency by call type. Higher numbers = more issues detected. Hover cells for details.
          </p>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-3">
              {/* Column Headers */}
              <div className="grid gap-3 text-xs font-semibold text-muted-foreground mb-3 pb-2 border-b border-white/20" style={{ gridTemplateColumns: '140px repeat(5, 1fr)' }}>
                <div className="text-left">Call Type</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help px-2" title="Compliance Deviation">
                      <div className="truncate">Compliance</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Deviation</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Compliance Deviation</p>
                    <p className="text-xs">How often agents miss required banking scripts (KYC, fraud protocols, regulatory statements)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help px-2" title="Tone Problems">
                      <div className="truncate">Tone</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Problems</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Tone Problems</p>
                    <p className="text-xs">Issues with agent tone, empathy, or communication style that affect customer experience</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help px-2" title="Silence Issues">
                      <div className="truncate">Silence</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Issues</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Silence Issues</p>
                    <p className="text-xs">Long pauses or awkward silence patterns during calls that indicate confusion or delays</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help px-2" title="Incorrect Information">
                      <div className="truncate">Incorrect</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Information</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Incorrect Information</p>
                    <p className="text-xs">Cases where agents provided wrong information to customers, leading to confusion or errors</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help px-2" title="Emotional Spikes">
                      <div className="truncate">Emotional</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Spikes</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Emotional Spikes</p>
                    <p className="text-xs">Moments when customer emotion became negative or escalated during the call</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Heatmap Rows */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {issueHeatmap.map((item, idx) => (
                  <div key={idx} className="grid gap-3 items-start py-1.5 hover:bg-white/5 rounded px-1 transition-colors" style={{ gridTemplateColumns: '140px repeat(5, 1fr)' }}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm text-white font-medium cursor-help pr-2 leading-tight" title={item.intent} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          <div className="line-clamp-2">{item.intent}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{item.intent}</p>
                        <p className="text-xs">Call type category showing issue frequency</p>
                      </TooltipContent>
                    </Tooltip>
                    {[
                      { value: item.complianceDeviation, label: 'Compliance Deviation', fullLabel: 'Compliance Deviation' },
                      { value: item.toneProblems, label: 'Tone Problems', fullLabel: 'Tone Problems' },
                      { value: item.silence, label: 'Silence Issues', fullLabel: 'Silence Issues' },
                      { value: item.incorrectInfo, label: 'Incorrect Information', fullLabel: 'Incorrect Information' },
                      { value: item.emotionalSpikes, label: 'Emotional Spikes', fullLabel: 'Emotional Spikes' }
                    ].map((issue, vIdx) => (
                      <Tooltip key={vIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className="h-10 rounded flex items-center justify-center cursor-help transition-all hover:scale-105 hover:shadow-lg border border-white/10 mx-auto w-full"
                            style={{ backgroundColor: getHeatmapColor(issue.value) }}
                            title={`${item.intent} - ${issue.fullLabel}: ${issue.value.toFixed(0)} occurrences`}
                          >
                            <span className="text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {issue.value.toFixed(0)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-semibold">{item.intent}</p>
                            <p className="text-sm">{issue.fullLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-white">{issue.value.toFixed(0)}</span> occurrences detected
                            </p>
                            <p className="text-xs mt-1 pt-1 border-t border-white/20">
                              {issue.value >= 30 ? '🔴 Critical - Immediate attention needed' :
                               issue.value >= 20 ? '🟡 High - Review recommended' :
                               issue.value >= 10 ? '🟠 Moderate - Monitor closely' :
                               '🟢 Low - Within acceptable range'}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

