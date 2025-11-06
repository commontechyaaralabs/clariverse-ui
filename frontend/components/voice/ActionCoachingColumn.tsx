'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentPerformance, CoachingTicket, SkillGapData } from '@/lib/voiceData';
import { AlertCircle, TrendingUp, TrendingDown, User, BookOpen } from 'lucide-react';

interface ActionCoachingColumnProps {
  agentsNeedingAttention: AgentPerformance[];
  agentLeaderboard: AgentPerformance[];
  coachingTickets: CoachingTicket[];
  skillGapData: SkillGapData[];
  onAgentClick: (agentId: string) => void;
}

export function ActionCoachingColumn({
  agentsNeedingAttention,
  agentLeaderboard,
  coachingTickets,
  skillGapData,
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

  return (
    <div className="space-y-4 w-[22%] flex-shrink-0">
      {/* Coaching Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Coaching Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {coachingTickets.map((ticket) => (
            <Card key={ticket.agentId} className="p-3 border-blue-500/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{ticket.agentName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(ticket.severity)}`}>
                    {ticket.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.problemSummary}</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Issues:</p>
                  <ul className="space-y-0.5">
                    {ticket.lastIssues.map((issue, idx) => (
                      <li key={idx} className="text-xs text-white flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-blue-400 mb-1">Recommended Training:</p>
                  <p className="text-xs text-white">{ticket.recommendedTraining}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs mt-2"
                  onClick={() => onAgentClick(ticket.agentId)}
                >
                  Schedule Coaching
                </Button>
              </div>
            </Card>
          ))}
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

