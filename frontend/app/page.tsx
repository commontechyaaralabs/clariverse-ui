"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UnifiedFiltersBar } from "@/components/unified/filters/UnifiedFiltersBar";
import { SystemHealthRibbon, type SystemHealthMetric } from "@/components/unified/kpi/SystemHealthRibbon";
import { CrossChannelTrendChart } from "@/components/unified/trends/CrossChannelTrendChart";
import { GaugeInsightsPanel } from "@/components/unified/charts/GaugeInsightsPanel";
import { IntentIntelligenceSection } from "@/components/unified/intents/IntentIntelligenceSection";
import { AIDayGeneratorChat } from "@/components/unified/AIDayGeneratorChat";
import { UnifiedIntelligenceWall, AISummaryRail } from "@/components/unified/intelligence/UnifiedIntelligenceWall";
import { PriorityResolutionChart } from "@/components/email/PriorityResolutionChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchIntentClusters,
  fetchSeverityMatrix,
  fetchSystemHealth,
  fetchTrendData,
  fetchCrossChannelActionGrid,
  fetchAISummaryWall,
  type IntentClusterResponse,
  type SeverityMatrixResponse,
  type SystemHealthResponse,
  type TrendPointResponse,
  type ChannelKey,
  type CrossChannelActionGridResponse,
  type AISummaryWallResponse,
} from "@/lib/unified/adapters";
import {
  getEisenhowerThreads,
  generatePriorityResolutionDataForQuadrant,
  type EisenhowerThread,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

type DateRange = {
  start: string;
  end: string;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const PRESET_CONFIGS: Record<string, { volume: number; urgency: number; sentimentShift: number }> = {
  All: { volume: 1, urgency: 1, sentimentShift: 0 },
  "Current day": { volume: 0.18, urgency: 1.15, sentimentShift: -3 },
  "One Week": { volume: 0.35, urgency: 1.1, sentimentShift: -1.5 },
  "One Month": { volume: 0.6, urgency: 1.0, sentimentShift: 0 },
  "6 Months": { volume: 1.2, urgency: 0.9, sentimentShift: 1.5 },
};

const CHANNEL_LABELS_MAP: Record<ChannelKey, string> = {
  email: "Email",
  chat: "Chat",
  ticket: "Ticket",
  social: "Social",
  voice: "Voice",
};

const CHANNEL_TABS: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];

const INITIAL_QUADRANT_STATE: Record<ChannelKey, string | null> = CHANNEL_TABS.reduce(
  (acc, channel) => ({ ...acc, [channel]: null }),
  {} as Record<ChannelKey, string | null>,
);

const QUADRANT_LABELS: Record<string, string> = {
  do: "Do - Now",
  schedule: "Schedule - Later",
  delegate: "Delegate - Team",
  delete: "Postpone",
};
const QUADRANT_DESCRIPTIONS: Record<string, string> = {
  do: "Important & Urgent",
  schedule: "Important, Not Urgent",
  delegate: "Not Important, Urgent",
  delete: "Not Important, Not Urgent",
};

const QUADRANT_COLORS: Record<string, { dot: string; badge: string }> = {
  do: { dot: "bg-red-500", badge: "border-red-500" },
  schedule: { dot: "bg-yellow-500", badge: "border-yellow-500" },
  delegate: { dot: "bg-[#5332ff]", badge: "border-[#5332ff]" },
  delete: { dot: "bg-gray-500", badge: "border-gray-500" },
};

const QUADRANT_ORDER: Array<"do" | "schedule" | "delegate" | "delete"> = [
  "do",
  "schedule",
  "delegate",
  "delete",
];

function computeCustomConfig(range: DateRange): { volume: number; urgency: number; sentimentShift: number } {
  const start = range.start ? new Date(range.start) : null;
  const end = range.end ? new Date(range.end) : null;

  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { volume: 1, urgency: 1, sentimentShift: 0 };
  }

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
  const normalized = clamp(diffDays / 30, 0.1, 2);

  const volume = clamp(normalized, 0.15, 1.5);
  let urgency = 1;
  if (diffDays <= 2) urgency = 1.25;
  else if (diffDays <= 7) urgency = 1.12;
  else if (diffDays >= 60) urgency = 0.85;

  let sentimentShift = 0;
  if (diffDays <= 3) sentimentShift = -2;
  else if (diffDays >= 90) sentimentShift = 2;

  return { volume, urgency, sentimentShift };
}

function getPresetConfig(preset: string, range: DateRange) {
  if (preset === "Custom") {
    return computeCustomConfig(range);
  }
  return PRESET_CONFIGS[preset] ?? PRESET_CONFIGS.All;
}

function rebalanceChannelVolumes(
  desiredTotal: number,
  channels: { channel: ChannelKey; value: number }[],
): { channel: ChannelKey; value: number }[] {
  if (channels.length === 0) return channels;

  const adjusted = [...channels];
  const total = adjusted.reduce((sum, entry) => sum + entry.value, 0);
  const delta = desiredTotal - total;

  if (delta === 0) return adjusted;

  let targetIndex = 0;
  if (delta < 0) {
    const largestValue = Math.max(...adjusted.map((entry) => entry.value));
    targetIndex = adjusted.findIndex((entry) => entry.value === largestValue);
  }

  adjusted[targetIndex] = {
    ...adjusted[targetIndex],
    value: Math.max(1, adjusted[targetIndex].value + delta),
  };

  return adjusted;
}

function transformIntentClusters(
  clusters: IntentClusterResponse[],
  preset: string,
  range: DateRange,
): IntentClusterResponse[] {
  const { volume, urgency, sentimentShift } = getPresetConfig(preset, range);

  return clusters.map((cluster) => {
    const scaledVolume = Math.max(10, Math.round(cluster.volume * volume));
    const scaledUrgency = clamp(cluster.urgency * urgency, 0, 1);
    const scaledSentiment = clamp(cluster.sentiment + sentimentShift, 35, 95);

    const scaledChannels = rebalanceChannelVolumes(
      scaledVolume,
      cluster.volumeByChannel.map((entry) => ({
        channel: entry.channel,
        value: Math.max(1, Math.round(entry.value * volume)),
      })),
    );

    return {
      ...cluster,
      sentiment: scaledSentiment,
      urgency: scaledUrgency,
      volume: scaledVolume,
      volumeByChannel: scaledChannels,
    };
  });
}

function EisenhowerSummaryCard({
  channel,
  threads,
  selectedQuadrant,
  onQuadrantSelect,
}: {
  channel: ChannelKey;
  threads: EisenhowerThread[];
  selectedQuadrant: string | null;
  onQuadrantSelect: (quadrant: string) => void;
}) {
  const total = threads.length || 1;

  const quadrantStats = QUADRANT_ORDER.map((quadrant) => {
    const count = threads.filter((thread) => thread.quadrant === quadrant).length;
    const rawPercentage = (count / total) * 100;
    const percentage = rawPercentage < 1 && rawPercentage > 0 ? Number(rawPercentage.toFixed(1)) : Math.round(rawPercentage);

    return {
      quadrant,
      count,
      percentage,
      label: QUADRANT_LABELS[quadrant],
      description: QUADRANT_DESCRIPTIONS[quadrant],
      colors: QUADRANT_COLORS[quadrant],
    };
  });

  const activeQuadrant = selectedQuadrant;

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] shadow-lg transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-[#b90abd]" />
            {CHANNEL_LABELS_MAP[channel]} • Eisenhower Quadrant Distribution
          </CardTitle>
          <div className="flex items-center gap-2 px-2 py-1 bg-[#b90abd]/10 border border-[#b90abd]/30 rounded-md">
            <span className="text-sm">✨</span>
            <span className="text-xs text-[#b90abd] font-medium">AI Priority Analysis</span>
          </div>
        </div>
        <CardDescription className="text-gray-400 flex items-center gap-2">
          <span>Focus on critical items first</span>
          <span className="text-[#b90abd]">•</span>
          <span>Thread distribution across priority quadrants</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {quadrantStats.map(({ quadrant, count, percentage, label, description, colors }) => {
            const isSelected = activeQuadrant === quadrant;
            const isLeftColumn = quadrant === "do" || quadrant === "delegate";
            const isTopRow = quadrant === "do" || quadrant === "schedule";
            const hasHighPriorityGlow = quadrant === "do" && count > 500;

            return (
              <div
                key={`${channel}-${quadrant}`}
                className={`relative rounded-lg p-5 cursor-pointer transition-all duration-200 text-center ${
                  isSelected
                    ? "bg-[color:var(--background)] ring-2 ring-[#b90abd] shadow-lg"
                    : "bg-[color:var(--card)] hover:bg-[color:var(--background)]"
                } ${
                  isLeftColumn ? "lg:border-r lg:border-[color:var(--border)]" : ""
                } ${isTopRow ? "border-b border-[color:var(--border)]" : ""}`}
                onClick={() => onQuadrantSelect(quadrant)}
              >
                {hasHighPriorityGlow && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
                )}
                <div className="relative z-10 flex items-center justify-center mb-3 gap-2">
                  {hasHighPriorityGlow && <span className="text-sm animate-pulse">✨</span>}
                  <div className={`w-3.5 h-3.5 rounded-full ${colors.dot}`} />
                  <span className="text-sm font-semibold text-gray-200">{label}</span>
                </div>
                <div className="relative z-10 text-3xl font-bold text-white mb-1">{count}</div>
                <div className="relative z-10 text-xs text-gray-400 mb-3">{percentage}%</div>
                <div className="relative z-10 text-xs text-gray-500">{description}</div>

                {quadrant === "do" && count > 0 && (
                  <Button
                    className="relative z-10 mt-4 w-full bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      onQuadrantSelect("do");
                    }}
                  >
                    <span className="mr-2">◎</span>
                    Work on Top Priority →
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [dateFilterPreset, setDateFilterPreset] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });

  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendPointResponse[]>([]);
  const [intentClusters, setIntentClusters] = useState<IntentClusterResponse[]>([]);
  const [allIntentClusters, setAllIntentClusters] = useState<IntentClusterResponse[]>([]);
  const [appliedPreset, setAppliedPreset] = useState<string>("All");
  const [appliedRange, setAppliedRange] = useState<DateRange>({ start: "", end: "" });
  const [severityMatrix, setSeverityMatrix] = useState<SeverityMatrixResponse[]>([]);
  const [metricExplanations, setMetricExplanations] = useState<Record<string, string>>({});

  const [actionGrid, setActionGrid] = useState<CrossChannelActionGridResponse | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummaryWallResponse | null>(null);

  const [eisenhowerThreads, setEisenhowerThreads] = useState<EisenhowerThread[]>([]);
  const [activeEisenhowerChannel, setActiveEisenhowerChannel] = useState<ChannelKey>("email");
  const [selectedQuadrants, setSelectedQuadrants] = useState<Record<ChannelKey, string | null>>(() => ({
    ...INITIAL_QUADRANT_STATE,
  }));
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [
        health,
        trend,
        clusters,
        matrix,
        actionGridData,
        aiSummaryData,
        eisenhowerThreadsData,
      ] = await Promise.all([
        fetchSystemHealth(),
        fetchTrendData(),
        fetchIntentClusters(),
        fetchSeverityMatrix(),
        fetchCrossChannelActionGrid(),
        fetchAISummaryWall(),
        getEisenhowerThreads(),
      ]);

      if (!mounted) return;

      const mappedHealth = health.map<SystemHealthMetric>((item: SystemHealthResponse) => ({
        channel: item.channel,
        label: item.label,
        icon: item.icon as SystemHealthMetric["icon"],
        color: item.color,
        total: item.total,
        sentiment: item.sentiment,
        sentimentDelta: item.sentimentDelta,
        sentimentTrend: item.sentimentTrend,
        urgencyPct: item.urgencyPct,
        slaRisk: item.slaRisk,
        unresolved: item.unresolved,
        unresolvedCompany: item.unresolvedCompany,
        unresolvedCustomer: item.unresolvedCustomer,
        unresolvedCompanyPct: item.unresolvedCompanyPct,
        unresolvedCustomerPct: item.unresolvedCustomerPct,
        emergingTheme: item.emergingTheme,
      }));

      const explanationMap: Record<string, string> = {};
      mappedHealth.forEach((metric) => {
        const direction = metric.sentimentDelta >= 0 ? "up" : "down";
        const delta = Math.abs(metric.sentimentDelta).toFixed(2);
        explanationMap[metric.channel] = `${metric.label} sentiment sits at ${metric.sentiment.toFixed(1)} (${getSentimentLabel(metric.sentiment)}) with sentiment trending ${direction} ${delta}. Urgent workload is ${metric.urgencyPct}% and ${metric.unresolved} items remain unresolved, exposing ${metric.slaRisk}% SLA risk.`;
      });

      setSystemHealth(mappedHealth);
      setMetricExplanations(explanationMap);
      setTrendData(trend);
      setAllIntentClusters(clusters);
      setSeverityMatrix(matrix);
      setActionGrid(actionGridData);
      setAiSummary(aiSummaryData);
      setEisenhowerThreads(eisenhowerThreadsData);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleQuadrantSelect = useCallback((channel: ChannelKey, quadrant: string) => {
    setSelectedQuadrants((prev) => ({
      ...prev,
      [channel]: prev[channel] === quadrant ? null : quadrant,
    }));
  }, []);

  useEffect(() => {
    if (allIntentClusters.length === 0) return;
    setIntentClusters(transformIntentClusters(allIntentClusters, appliedPreset, appliedRange));
  }, [allIntentClusters, appliedPreset, appliedRange]);

  useEffect(() => {
    if (intentClusters.length === 0) {
      setSelectedIntentId(null);
      return;
    }
    setSelectedIntentId((prev) =>
      prev && intentClusters.some((cluster) => cluster.id === prev) ? prev : intentClusters[0].id,
    );
  }, [intentClusters]);

  const threadsByChannel = useMemo<Record<ChannelKey, EisenhowerThread[]>>(() => {
    const base = CHANNEL_TABS.reduce((acc, channel) => {
      acc[channel] = [];
      return acc;
    }, {} as Record<ChannelKey, EisenhowerThread[]>);

    eisenhowerThreads.forEach((thread) => {
      const channel = thread.channel as ChannelKey;
      if (base[channel]) {
        base[channel].push(thread);
      }
    });

    return base;
  }, [eisenhowerThreads]);

  const handlePresetChange = (value: string) => {
    setDateFilterPreset(value);
    if (value !== "Custom") {
      const today = new Date();
      const startDate = new Date(today);

      switch (value) {
        case "All":
          setDateRange({ start: "", end: "" });
          break;
        case "Current day":
          setDateRange({
            start: today.toISOString().split("T")[0],
            end: today.toISOString().split("T")[0],
          });
          break;
        case "One Week":
          startDate.setDate(today.getDate() - 7);
          setDateRange({
            start: startDate.toISOString().split("T")[0],
            end: today.toISOString().split("T")[0],
          });
          break;
        case "One Month":
          startDate.setMonth(today.getMonth() - 1);
          setDateRange({
            start: startDate.toISOString().split("T")[0],
            end: today.toISOString().split("T")[0],
          });
          break;
        case "6 Months":
          startDate.setMonth(today.getMonth() - 6);
          setDateRange({
            start: startDate.toISOString().split("T")[0],
            end: today.toISOString().split("T")[0],
          });
          break;
        default:
          break;
      }
    }
  };

  const handleApplyFilters = () => {
    console.log("Applying filters", {
      preset: dateFilterPreset,
      dateRange,
    });
    setAppliedPreset(dateFilterPreset);
    setAppliedRange({ ...dateRange });
    // TODO: trigger refetch with filters
  };

  const gaugeData = useMemo(() => {
    if (systemHealth.length === 0) {
      return {
        values: { sentimentScore: 0, urgencyIndex: 0, slaRisk: 0, pendingFromCompany: 0 },
        insights: {
          overall: "",
          urgencyIndex: "",
          slaRisk: "",
          pendingFromCompany: "",
        },
      };
    }

    const sentimentRaw =
      systemHealth.reduce((sum, item) => sum + item.sentiment, 0) / systemHealth.length;
    const sentimentScore = Math.max(1, Math.min(5, sentimentRaw));
    const sentimentPercent = ((sentimentScore - 1) / 4) * 100;
    const urgencyIndex =
      systemHealth.reduce((sum, item) => sum + item.urgencyPct, 0) /
      (systemHealth.length * 100);
    const slaRisk =
      systemHealth.reduce((sum, item) => sum + item.slaRisk, 0) /
      (systemHealth.length * 100);
    const companyPendingCount = severityMatrix.filter((row) => row.actionPending === "company").length;
    const pendingFromCompany = severityMatrix.length === 0 ? 0 : companyPendingCount / severityMatrix.length;

    const lowestSentiment = systemHealth.reduce((prev, curr) =>
      curr.sentiment < prev.sentiment ? curr : prev,
    systemHealth[0]);
    const highestSentiment = systemHealth.reduce((prev, curr) =>
      curr.sentiment > prev.sentiment ? curr : prev,
    systemHealth[0]);
    const highestUrgent = systemHealth.reduce((prev, curr) =>
      curr.urgencyPct > prev.urgencyPct ? curr : prev,
    systemHealth[0]);
    const highestSla = systemHealth.reduce((prev, curr) =>
      curr.slaRisk > prev.slaRisk ? curr : prev,
    systemHealth[0]);

    const customerPendingCount = severityMatrix.length - companyPendingCount;

    const insights = {
      overall: `Average sentiment sits at ${sentimentScore.toFixed(1)} (${getSentimentLabel(sentimentScore)}). ${lowestSentiment.label} trails at ${lowestSentiment.sentiment.toFixed(1)}, while ${highestSentiment.label} leads recovery at ${highestSentiment.sentiment.toFixed(1)}.`,
      urgencyIndex: `${(urgencyIndex * 100).toFixed(1)}% of conversations carry urgency flags. ${highestUrgent.label} contributes ${highestUrgent.urgencyPct}% alone, indicating where teams should allocate capacity first.`,
      slaRisk: `${(slaRisk * 100).toFixed(1)}% SLA risk overall. ${highestSla.label} accounts for the largest share at ${highestSla.slaRisk}% with ${highestSla.unresolved} unresolved cases awaiting action.`,
      pendingFromCompany: `${(pendingFromCompany * 100).toFixed(1)}% of intents are waiting on internal owners (${companyPendingCount} clusters) versus ${customerPendingCount} pending on customers.`,
    };

    return {
      values: { sentimentScore: sentimentPercent, urgencyIndex, slaRisk, pendingFromCompany },
      insights,
    };
  }, [systemHealth, severityMatrix]);

  return (
    <div className="space-y-6 animate-fade-in pb-6 bg-[var(--background)]">
      <UnifiedFiltersBar
        dateFilterPreset={dateFilterPreset}
        dateRange={dateRange}
        onPresetChange={handlePresetChange}
        onDateRangeChange={setDateRange}
        onApply={handleApplyFilters}
        onOpenAI={() => setIsChatOpen(true)}
      />

      {systemHealth.length > 0 && (
         <SystemHealthRibbon data={systemHealth} explanations={metricExplanations} onChannelSelect={setSelectedIntentId} />
       )}
 
       {trendData.length > 0 ? (
         <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)_360px] items-stretch">
          <div className="h-full">
            <AISummaryRail aiSummary={aiSummary} />
          </div>
          <div className="h-full">
            <CrossChannelTrendChart data={trendData} />
          </div>
          <GaugeInsightsPanel className="h-full" data={gaugeData.values} insights={gaugeData.insights} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)_360px] items-stretch">
          <div className="h-full">
            <AISummaryRail aiSummary={aiSummary} />
          </div>
          <div className="h-full" />
          <GaugeInsightsPanel className="h-full" data={gaugeData.values} insights={gaugeData.insights} />
        </div>
      )}

      {eisenhowerThreads.length > 0 && (
        <Tabs
          value={activeEisenhowerChannel}
          onValueChange={(value) => setActiveEisenhowerChannel(value as ChannelKey)}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap gap-2 bg-transparent">
            {CHANNEL_TABS.map((channel) => {
              const count = threadsByChannel[channel].length;
              return (
                <TabsTrigger
                  key={channel}
                  value={channel}
                  className="rounded-md border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-wide text-gray-200 data-[state=active]:bg-[#b90abd]/20 data-[state=active]:text-white"
                >
                  {CHANNEL_LABELS_MAP[channel]}
                  <span className="ml-2 text-[11px] text-gray-400">{count}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CHANNEL_TABS.map((channel) => {
             const channelThreads = threadsByChannel[channel];
             const channelQuadrant = selectedQuadrants[channel];
            const quadrantData = channelQuadrant
              ? generatePriorityResolutionDataForQuadrant(channelThreads, channelQuadrant)
              : [];
 
             return (
               <TabsContent key={channel} value={channel} className="space-y-6">
                 <div className="space-y-4">
                  {channelQuadrant ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <EisenhowerSummaryCard
                        channel={channel}
                        threads={channelThreads}
                        selectedQuadrant={channelQuadrant}
                        onQuadrantSelect={(quadrant) => handleQuadrantSelect(channel, quadrant)}
                      />

                      <Card className="border border-[color:var(--border)] bg-[color:var(--card)] shadow-lg transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Target className="h-5 w-5 text-[#b90abd]" />
                              Priority Resolution Matrix
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuadrantSelect(channel, channelQuadrant)}
                              className="text-gray-400 hover:text-white"
                            >
                              Close
                            </Button>
                          </div>
                          <CardDescription className="text-gray-400">
                            {CHANNEL_LABELS_MAP[channel]} • {QUADRANT_LABELS[channelQuadrant] ?? channelQuadrant}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {quadrantData.length > 0 ? (
                            <PriorityResolutionChart
                              data={quadrantData}
                              threads={channelThreads}
                              selectedQuadrant={channelQuadrant}
                            />
                          ) : (
                            <div className="py-8 text-center text-sm text-gray-400">No priority data available.</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <EisenhowerSummaryCard
                      channel={channel}
                      threads={channelThreads}
                      selectedQuadrant={channelQuadrant}
                      onQuadrantSelect={(quadrant) => handleQuadrantSelect(channel, quadrant)}
                    />
                  )}
                 </div>
               </TabsContent>
             );
           })}
         </Tabs>
       )}

      <IntentIntelligenceSection
        clusters={intentClusters}
        severityMatrix={severityMatrix}
        selectedIntentId={selectedIntentId}
        onIntentSelect={setSelectedIntentId}
      />

      <UnifiedIntelligenceWall
         actionGrid={actionGrid}
       />
 
      <AIDayGeneratorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

function getSentimentLabel(value: number) {
  if (value < 1.5) return "Happy";
  if (value < 2.5) return "Bit Irritated";
  if (value < 3.5) return "Moderately Concerned";
  if (value < 4.5) return "Anger";
  return "Frustrated";
}
