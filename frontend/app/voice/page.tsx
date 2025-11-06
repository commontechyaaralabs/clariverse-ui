'use client';

import { useState, useEffect } from 'react';
import { KPIRibbon } from '@/components/voice/KPIRibbon';
import { TeamHealthColumn } from '@/components/voice/TeamHealthColumn';
import { CoreIntelligenceColumn } from '@/components/voice/CoreIntelligenceColumn';
import { ActionCoachingColumn } from '@/components/voice/ActionCoachingColumn';
import { CallDetailModal } from '@/components/voice/CallDetailModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
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
  const [teamHealthData, setTeamHealthData] = useState<any>(null);
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('One Month');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    // Initialize date range for "One Month" preset
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1);
    setDateRange({ 
      start: startDate.toISOString().split('T')[0], 
      end: today.toISOString().split('T')[0] 
    });

    // Load all data
    setKpiData(getKPIData());
    setIntentDistribution(getIntentDistribution());
    setIssueHeatmap(getTeamHeatmap());
    setAgentLeaderboard(getAgentLeaderboard());
    setHighRiskCalls(getHighRiskCalls());
    setSkillGapData(getSkillGapData());
    setCoachingTickets(getCoachingTickets());
    setCallList(getCallList());
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

  const handlePresetChange = (value: string) => {
    setDateFilterPreset(value);
    if (value !== 'Custom') {
      // Calculate date range based on preset
      const today = new Date();
      const startDate = new Date(today);
      
      switch (value) {
        case 'All':
          setDateRange({ start: '', end: '' });
          break;
        case 'Current day':
          setDateRange({ 
            start: today.toISOString().split('T')[0], 
            end: today.toISOString().split('T')[0] 
          });
          break;
        case 'One Week':
          startDate.setDate(today.getDate() - 7);
          setDateRange({ 
            start: startDate.toISOString().split('T')[0], 
            end: today.toISOString().split('T')[0] 
          });
          break;
        case 'One Month':
          startDate.setMonth(today.getMonth() - 1);
          setDateRange({ 
            start: startDate.toISOString().split('T')[0], 
            end: today.toISOString().split('T')[0] 
          });
          break;
        case '6 Months':
          startDate.setMonth(today.getMonth() - 6);
          setDateRange({ 
            start: startDate.toISOString().split('T')[0], 
            end: today.toISOString().split('T')[0] 
          });
          break;
        default:
          break;
      }
    }
  };

  const handleApplyFilters = () => {
    // Reload data with new date range
    console.log('Applying filters with date range:', dateRange);
    // In a real implementation, this would filter the data based on dateRange
    // For now, we'll just reload the data
    setKpiData(getKPIData());
    setIntentDistribution(getIntentDistribution());
    setIssueHeatmap(getTeamHeatmap());
    setAgentLeaderboard(getAgentLeaderboard());
    setHighRiskCalls(getHighRiskCalls());
    setSkillGapData(getSkillGapData());
    setCoachingTickets(getCoachingTickets());
    setCallList(getCallList());
    setTeamHealthData(getTeamHealthData());
  };

  if (!kpiData || !teamHealthData) {
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Fluid Intelligence Dashboard - Voice</h1>
            <p className="text-muted-foreground text-lg">✨AI-powered call center intelligence & quality assurance</p>
          </div>
          <div className="flex flex-col gap-3">
            {/* AI Insights Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  // Handle AI insights generation
                  console.log('Generate your day in 2 minutes');
                }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 group h-[38px] px-6"
              >
                <span className="text-lg mr-2 group-hover:rotate-180 transition-transform duration-500 inline-block">✨</span>
                Generate your day in 2 minutes
              </Button>
            </div>
            
            {/* Date Filters */}
            <div className="flex items-center gap-2 justify-end">
              <label className="text-xs text-gray-400 whitespace-nowrap">Filters:</label>
              <div className="relative z-50">
                <Select value={dateFilterPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white text-sm h-[38px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white z-[9999]">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Current day">Current day</SelectItem>
                    <SelectItem value="One Week">One Week</SelectItem>
                    <SelectItem value="One Month">One Month</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Date Pickers - Only show when Custom is selected */}
              {dateFilterPreset === 'Custom' && (
                <>
                  <label className="text-xs text-gray-400 whitespace-nowrap">Start Date:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-[38px]"
                  />
                  <label className="text-xs text-gray-400 whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-[38px]"
                  />
                </>
              )}
              
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 h-[38px]"
              >
                Apply
                <RefreshCw className="h-4 w-4 ml-2" />
              </Button>
            </div>
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

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        open={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setSelectedCall(null);
        }}
      />
    </div>
  );
}
