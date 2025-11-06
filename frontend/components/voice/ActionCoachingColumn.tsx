'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentPerformance, CoachingTicket } from '@/lib/voiceData';
import { AlertCircle, TrendingUp, TrendingDown, User, BookOpen } from 'lucide-react';

interface ActionCoachingColumnProps {
  agentsNeedingAttention: AgentPerformance[];
  agentLeaderboard: AgentPerformance[];
  coachingTickets: CoachingTicket[];
  onAgentClick: (agentId: string) => void;
}

export function ActionCoachingColumn({
  agentsNeedingAttention,
  agentLeaderboard,
  coachingTickets,
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
    <div className="space-y-4 w-[22%]">
      {/* Agents Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Agents Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
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

      {/* Coaching Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Coaching Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
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
    </div>
  );
}

