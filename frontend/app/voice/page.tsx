'use client';

import { useState, useEffect } from 'react';
import { KPIRibbon } from '@/components/voice/KPIRibbon';
import { TeamHealthColumn } from '@/components/voice/TeamHealthColumn';
import { CoreIntelligenceColumn } from '@/components/voice/CoreIntelligenceColumn';
import { ActionCoachingColumn } from '@/components/voice/ActionCoachingColumn';
import { CallInsightsDock } from '@/components/voice/CallInsightsDock';
import { CallDetailModal } from '@/components/voice/CallDetailModal';
import { MicroTrendBar } from '@/components/voice/MicroTrendBar';
import {
  getKPIData,
  getIntentDistribution,
  getTeamHeatmap,
  getAgentLeaderboard,
  getHighRiskCalls,
  getSkillGapData,
  getCoachingTickets,
  getCallList,
  getCallDetail,
  getTrendData,
  getTeamHealthData,
  KPIData,
  IntentDistribution,
  IssueHeatmapData,
  AgentPerformance,
  HighRiskCall,
  SkillGapData,
  CoachingTicket,
  CallListItem,
  CallDetail
} from '@/lib/voiceData';

export default function VoiceTranscript() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [intentDistribution, setIntentDistribution] = useState<IntentDistribution[]>([]);
  const [issueHeatmap, setIssueHeatmap] = useState<IssueHeatmapData[]>([]);
  const [agentLeaderboard, setAgentLeaderboard] = useState<AgentPerformance[]>([]);
  const [highRiskCalls, setHighRiskCalls] = useState<HighRiskCall[]>([]);
  const [skillGapData, setSkillGapData] = useState<SkillGapData[]>([]);
  const [coachingTickets, setCoachingTickets] = useState<CoachingTicket[]>([]);
  const [callList, setCallList] = useState<CallListItem[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [trendData, setTrendData] = useState<any>(null);
  const [teamHealthData, setTeamHealthData] = useState<any>(null);

  useEffect(() => {
    // Load all data
    setKpiData(getKPIData());
    setIntentDistribution(getIntentDistribution());
    setIssueHeatmap(getTeamHeatmap());
    setAgentLeaderboard(getAgentLeaderboard());
    setHighRiskCalls(getHighRiskCalls());
    setSkillGapData(getSkillGapData());
    setCoachingTickets(getCoachingTickets());
    setCallList(getCallList());
    setTrendData(getTrendData());
    setTeamHealthData(getTeamHealthData());
  }, []);

  const handleCallClick = (callId: string) => {
    const detail = getCallDetail(callId);
    setSelectedCall(detail);
    setIsCallModalOpen(true);
  };

  const handleAgentClick = (agentId: string) => {
    // Filter calls by agent
    const agentCalls = callList.filter(call => {
      const agent = agentLeaderboard.find(a => a.agentId === agentId);
      return agent && call.agentName.includes(agent.agentName.split(' ')[0]);
    });
    if (agentCalls.length > 0) {
      handleCallClick(agentCalls[0].callId);
    }
  };

  const agentsNeedingAttention = agentLeaderboard.filter(a => a.severity !== 'low');

  if (!kpiData || !teamHealthData || !trendData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b90abd] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-72">
      {/* Header */}
      <div className="space-y-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Voice QA Manager Dashboard</h1>
            <p className="text-muted-foreground text-lg">AI-powered call center intelligence & quality assurance</p>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <KPIRibbon data={kpiData} />

      {/* Main Dashboard Grid */}
      <div className="flex gap-4">
        {/* Left Column - Team Health */}
        <TeamHealthColumn
          qaScore={teamHealthData.qaScore}
          qaBreakdown={teamHealthData.qaBreakdown}
          qaTrend={teamHealthData.qaTrend}
          complianceData={teamHealthData.complianceData}
          emotionData={teamHealthData.emotionData}
          escalationData={teamHealthData.escalationData}
        />

        {/* Center Column - Core Intelligence */}
        <CoreIntelligenceColumn
          highRiskCalls={highRiskCalls}
          intentDistribution={intentDistribution}
          issueHeatmap={issueHeatmap}
          skillGapData={skillGapData}
          onCallClick={handleCallClick}
        />

        {/* Right Column - Action & Coaching */}
        <ActionCoachingColumn
          agentsNeedingAttention={agentsNeedingAttention}
          agentLeaderboard={agentLeaderboard}
          coachingTickets={coachingTickets}
          onAgentClick={handleAgentClick}
        />
      </div>

      {/* Micro Trend Bar */}
      <MicroTrendBar trends={trendData} />

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        open={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setSelectedCall(null);
        }}
      />

      {/* Call Insights Dock */}
      <CallInsightsDock
        calls={callList}
        selectedCall={selectedCall}
        onCallSelect={handleCallClick}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
}
