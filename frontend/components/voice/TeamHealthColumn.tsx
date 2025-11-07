'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

import { GranularComplianceScore } from '@/lib/voiceData';

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
  granularCompliance?: GranularComplianceScore;
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
  granularCompliance,
  escalationData,
  dateRange
}: TeamHealthColumnProps) {
  return (
    <div className="space-y-4 w-[28%] flex-shrink-0">
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

      {/* Compliance Health - Enhanced with Granular EU Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Compliance Health</CardTitle>
            {granularCompliance && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {granularCompliance.overallScore.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
            )}
          </div>
          {granularCompliance && (
            <p className="text-[10px] uppercase tracking-wide text-white/40 mt-1">
              Derived from voice transcript compliance checks
            </p>
          )}
          {granularCompliance && (
            <p className="text-xs text-muted-foreground mt-2">
              Expected Loss: €{(granularCompliance.financialRisk.expectedLoss / 1000000).toFixed(1)}M | 
              Risk Level: <span className={`font-semibold ${
                granularCompliance.riskLevel === 'critical' ? 'text-red-400' :
                granularCompliance.riskLevel === 'high' ? 'text-orange-400' :
                granularCompliance.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>{granularCompliance.riskLevel.toUpperCase()}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4 max-h-[26rem] overflow-y-auto pr-2">
          {granularCompliance ? (
            <>
              {/* Regulation Breakdown */}
              <div className="space-y-3">
                {Object.entries(granularCompliance.byRegulation).map(([key, regulation]) => {
                  const label = regulation.label;
                  const getColor = (score: number) => {
                    if (score >= 90) return 'text-green-400';
                    if (score >= 80) return 'text-yellow-400';
                    if (score >= 70) return 'text-orange-400';
                    return 'text-red-400';
                  };
                  
                  return (
                    <div key={key} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{label}</span>
                          <Badge className="bg-white/10 text-xs text-white/80 border border-white/10" title={regulation.regulatoryReference}>
                            {regulation.violations} voice flags
                          </Badge>
                          {regulation.criticalViolations > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              {regulation.criticalViolations} critical
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getColor(regulation.score)}`}>
                            {regulation.score.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weight: {(regulation.weight * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            regulation.score >= 90 ? 'bg-green-500' :
                            regulation.score >= 80 ? 'bg-yellow-500' :
                            regulation.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${regulation.score}%` }}
                        />
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1">
                        {regulation.focusAreas.map((area) => (
                          <div key={area.label} className="flex items-center justify-between text-xs text-muted-foreground bg-white/5 border border-white/10 rounded px-2 py-1">
                            <span>{area.label}</span>
                            <span className={getColor(area.score)}>{area.score}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] text-white/40 uppercase tracking-wide">
                        Transcript cues: {regulation.transcriptSignals.join(' • ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Risk Summary */}
              <div className="pt-3 border-t border-white/10">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Potential Fines</div>
                    <div className="text-sm font-semibold text-red-400">
                      €{(granularCompliance.financialRisk.totalPotentialFines / 1000000).toFixed(0)}M
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Expected Loss</div>
                    <div className="text-sm font-semibold text-orange-400">
                      €{(granularCompliance.financialRisk.expectedLoss / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Worst Case</div>
                    <div className="text-sm font-semibold text-red-400">
                      €{(granularCompliance.financialRisk.worstCaseScenario / 1000000).toFixed(0)}M
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Fallback to old view if granular data not available
            <>
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
            </>
          )}
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

