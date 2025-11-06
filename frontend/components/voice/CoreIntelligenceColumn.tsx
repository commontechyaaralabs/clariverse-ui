'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
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
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={call.emotionTimeline.map((v, i) => ({ time: i, emotion: v }))}>
                        <Line type="monotone" dataKey="emotion" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
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

      {/* Intent Distribution + Issue Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intent Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
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
                    formatter={(value: number, name: string, props: any) => {
                      const intent = props.payload;
                      return [`${intent.count || 0} calls (${value}%)`, intent.intent || name];
                    }}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1 max-h-32 overflow-y-auto">
              {intentDistribution.map((intent, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-muted-foreground">{intent.intent}</span>
                  </div>
                  <span className="text-white font-semibold">{intent.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-1 text-xs text-muted-foreground mb-2">
                <div></div>
                <div className="text-center">Comp</div>
                <div className="text-center">Tone</div>
                <div className="text-center">Silence</div>
                <div className="text-center">Info</div>
                <div className="text-center">Emotion</div>
              </div>
              {issueHeatmap.map((item, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-1 items-center">
                  <div className="text-xs text-muted-foreground truncate">{item.intent}</div>
                  {[
                    item.complianceDeviation,
                    item.toneProblems,
                    item.silence,
                    item.incorrectInfo,
                    item.emotionalSpikes
                  ].map((value, vIdx) => (
                    <div
                      key={vIdx}
                      className="h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: getHeatmapColor(value) }}
                    >
                      <span className="text-xs font-semibold text-white">{value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Skill Gap Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Skill Gap Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skillGapData.map((skill, idx) => {
              const gap = skill.expected - skill.current;
              const gapPercent = (gap / skill.expected) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{skill.skill}</span>
                    <span className="text-white font-semibold">
                      {skill.current}/{skill.expected}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#b90abd] to-[#5332ff]" style={{ width: `${(skill.current / skill.expected) * 100}%` }} />
                    </div>
                    <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-600" style={{ width: `${(skill.expected / 100) * 100}%` }} />
                    </div>
                  </div>
                  {gap > 0 && (
                    <p className="text-xs text-orange-400">Gap: {gap.toFixed(1)} ({gapPercent.toFixed(1)}%)</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

