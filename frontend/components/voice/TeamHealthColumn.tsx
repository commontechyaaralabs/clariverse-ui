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
}

export function TeamHealthColumn({
  qaScore,
  qaBreakdown,
  qaTrend,
  complianceData,
  emotionData,
  escalationData
}: TeamHealthColumnProps) {
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
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{emotionData.positive}%</p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{emotionData.neutral}%</p>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{emotionData.negative}%</p>
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emotionData.timeline.map((v, i) => ({ time: i, emotion: v }))}>
                <Area type="monotone" dataKey="emotion" stroke="#b90abd" fill="#b90abd" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Risk Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalation Risk Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius={40} outerRadius={60} data={[{ value: escalationData.riskScore }]}>
                  <RadialBar dataKey="value" fill="#f97316" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{escalationData.riskScore.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Risk Score</p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calls at Risk</span>
              <span className="text-sm font-semibold text-white">{escalationData.callsAtRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agents Involved</span>
              <span className="text-sm font-semibold text-white">{escalationData.agentsInvolved.length}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Top Causes:</p>
            <ul className="space-y-1">
              {escalationData.topCauses.map((cause, idx) => (
                <li key={idx} className="text-xs text-white flex items-center gap-1">
                  <span className="w-1 h-1 bg-orange-500 rounded-full" />
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

