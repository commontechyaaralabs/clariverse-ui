"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AISummaryWallResponse,
  ChannelKey,
  CrossChannelActionGridResponse,
} from "@/lib/unified/adapters";
import { PressureScatterMap } from "./PressureScatterMap";

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  chat: "Chat",
  ticket: "Ticket",
  social: "Social",
  voice: "Voice",
};

const CHANNEL_ORDER: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];
const STAGE_ORDER = ["Receive", "Authenticate", "Resolution", "Escalation", "Closure"];

function getHeatmapColor(value: number, max: number) {
  if (max <= 0) return "rgba(59,130,246,0.15)";
  const ratio = Math.min(1, value / max);
  const hue = 120 - ratio * 120;
  const alpha = 0.35 + ratio * 0.45;
  return `hsla(${hue}, 82%, 48%, ${alpha})`;
}

function mapTone(tone?: "positive" | "negative" | "neutral") {
  if (tone === "positive") return "success";
  if (tone === "negative") return "danger";
  return "default";
}

interface UnifiedIntelligenceWallProps {
  actionGrid: CrossChannelActionGridResponse | null;
}

export function UnifiedIntelligenceWall({ actionGrid }: UnifiedIntelligenceWallProps) {
  const actionGridMatrix = useMemo(() => {
    if (!actionGrid) return {};
    return actionGrid.entries.reduce<Record<string, Record<string, (typeof actionGrid.entries)[number]>>>((acc, entry) => {
      if (!acc[entry.stage]) acc[entry.stage] = {};
      acc[entry.stage][entry.channel] = entry;
      return acc;
    }, {});
  }, [actionGrid]);

  const actionGridMaxScore = useMemo(() => {
    if (!actionGrid) return 0;
    return Math.max(
      ...actionGrid.entries.map((entry) => entry.avgDelayHours * Math.max(0.01, entry.pendingFromCompany)),
    );
  }, [actionGrid]);

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Cross-Channel Action Grid</CardTitle>
            <CardDescription>Heatmap of stage latency and ownership pressure across channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-8">
            {actionGrid ? (
              <>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-1">
                  <div className="flex flex-col gap-0.5 pt-2">
                    {STAGE_ORDER.map((stage) => (
                      <div
                        key={stage}
                        className="flex h-10 items-center text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <div className="min-w-[480px]">
                      <div
                        className="grid gap-y-2 gap-x-2"
                        style={{ gridTemplateColumns: `repeat(${CHANNEL_ORDER.length}, minmax(0, 1fr))` }}
                      >
                        {CHANNEL_ORDER.map((channel) => (
                          <div
                            key={`${channel}-header`}
                            className="text-center text-[10px] uppercase tracking-wide text-gray-400"
                          >
                            {CHANNEL_LABELS[channel]}
                          </div>
                        ))}

                        {STAGE_ORDER.flatMap((stage) =>
                          CHANNEL_ORDER.map((channel) => {
                            const entry = actionGridMatrix[stage]?.[channel];
                            if (!entry) {
                              return (
                                <div
                                  key={`${stage}-${channel}`}
                                  className="h-10 rounded-lg border border-dashed border-white/10 bg-black/30"
                                />
                              );
                            }
                            const score = entry.avgDelayHours * Math.max(0.01, entry.pendingFromCompany);
                            return (
                              <div
                                key={`${stage}-${channel}`}
                                className="relative flex h-10 flex-col justify-between rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] text-white shadow-inner"
                                style={{ backgroundColor: getHeatmapColor(score, actionGridMaxScore) }}
                              >
                                <div className="flex items-center justify-between font-semibold leading-none">
                                  <span>{entry.avgDelayHours.toFixed(1)}h</span>
                                  <span className="text-[8.5px] uppercase tracking-widest">
                                    {(entry.pendingFromCompany * 100).toFixed(0)}% company
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[8.5px] font-medium text-white/85">
                                  <span>Sent {entry.sentiment.toFixed(1)}</span>
                                  <span>Urg {(entry.urgencyRatio * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            );
                          }),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2.5 md:grid-cols-3">
                  {(actionGrid.insights.length > 0 ? actionGrid.insights : [
                    "Voice resolution stage shows the longest delays for mortgage clients.",
                    "Email has the highest share of bank-side pending investigations.",
                    "Chat resolves debit card disputes the fastest; use it as a benchmark.",
                  ]).map((insight, index) => (
                    <InsightCard
                      key={`${insight}-${index}`}
                      title={index === 0 ? "🔥 Bottleneck" : index === 1 ? "🏢 Ownership" : "⚡ Efficiency"}
                      description={insight}
                      tone={index === 0 ? "danger" : index === 2 ? "success" : "default"}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState label="Cross-channel data not available yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>Intent Overlap ✨</CardTitle>
              <CardDescription>Clusters appearing across multiple channels.</CardDescription>
            </div>
            <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              Emerging Overlap
            </span>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <ScrollArea className="h-[320px] rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="grid gap-3">
                {intentOverlapMock.map((overlap) => (
                  <div
                    key={overlap.cluster}
                    className="rounded-lg border border-white/10 bg-black/40 p-4 shadow-inner transition hover:border-amber-400/40 hover:bg-amber-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{overlap.cluster}</h4>
                      <span className="text-[10px] uppercase tracking-wide text-gray-400">Sent {overlap.avgSentiment.toFixed(1)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{overlap.summary}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {CHANNEL_ORDER.map((channel) => (
                        <span
                          key={`${overlap.cluster}-${channel}`}
                          className={`h-2.5 w-2.5 rounded-full transition ${
                            overlap.channels.includes(channel)
                              ? channelDotClass[channel]
                              : "bg-white/10"
                          }`}
                          title={CHANNEL_LABELS[channel]}
                        />
                      ))}
                    </div>
                    <div className="mt-3 grid gap-1 text-[11px] text-gray-300">
                      <span>
                        <strong className="text-gray-100">Active Channels:</strong> {overlap.channels.map((c) => CHANNEL_LABELS[c]).join(" • ")}
                      </span>
                      <span>
                        <strong className="text-gray-100">Average Sentiment:</strong> {overlap.avgSentiment.toFixed(1)}
                      </span>
                      <span>
                        <strong className="text-gray-100">Unresolved:</strong> {overlap.unresolvedPct}% • <strong>Volume:</strong> {overlap.volume}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
              💬 Mortgage Rate Lock surfaced across Email, Chat, and Voice. Average sentiment 3.1, 41% awaiting underwriting review. Chat conversations resolve fastest (avg 2.8 h).
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <SectionTitle
          title="Cross-Channel Correlation Wall"
          subtitle="Narrative insights tracing how tone and emotion evolve across customer journeys."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <ToneDriftWall toneDrift={toneDriftData} />
          <PrematureClosureAuditWall audits={prematureClosureAuditData} />
        </div>
        <PressureConstellationWall
          nodes={pressureConstellationNodes}
          clusters={pressureConstellationClusters}
          insights={pressureConstellationInsights}
        />
      </div>
    </div>
  );
}

type ToneDriftCorrelationLevel =
  | "Intra-channel drift"
  | "Inter-channel drift (same intent)"
  | "Cross-channel sequence drift";

type ToneDriftSequencePoint = {
  channel: ChannelKey;
  sentiment: number;
  stage?: string;
};

type ToneDriftEntry = {
  intent: string;
  sequence: ToneDriftSequencePoint[];
  aiObservation: string;
  suggestion: string;
  correlationLevel: ToneDriftCorrelationLevel;
};

type ClosureStatus = "closed" | "open" | "in_progress";

type PrematureClosureAuditEntry = {
  intent: string;
  customerId: string;
  closedChannel: {
    channel: ChannelKey;
    sentiment: number;
    stage: string;
    closureTimestamp: string;
  };
  activeChannels: Array<{
    channel: ChannelKey;
    sentiment: number;
    stage: string;
    status: ClosureStatus;
    pendingFromCompany: boolean;
  }>;
  aiObservation: string;
  recommendation: string;
  riskLevel: "high" | "medium" | "low";
};

type PressureConstellationNode = {
  id: string;
  label: string;
  clusterId: string;
  sentiment: number;
  urgencyRate: number;
  backlogRatio: number;
  dominantChannel: ChannelKey;
  pressureScore: number;
  volume: number;
  glow: number;
};

type PressureClusterSummary = {
  id: string;
  name: string;
  dominantChannels: ChannelKey[];
  avgSentiment: number;
  avgUrgency: number;
  avgPressure: number;
  unresolved: number;
  topIntents: string[];
  recommendation: string;
};

type PressureInsight = {
  id: string;
  title: string;
  context: string;
  detail: string;
  aiInsight: string;
  tone?: "default" | "info" | "success" | "warning" | "danger";
  icon: string;
};

function ToneDriftWall({ toneDrift }: { toneDrift: ToneDriftEntry[] }) {
  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>✨ Tone Drift Across Channels</CardTitle>
          <CardDescription>How sentiment evolves as intents travel between touchpoints.</CardDescription>
        </div>
        <Badge className="border-amber-400/40 bg-amber-500/10 text-amber-200">Cross-Channel</Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-400">
          <span>{toneDrift.length} active narratives</span>
          <span className="text-indigo-200/80">AI monitors intra, inter &amp; sequence drift</span>
        </div>
        <ScrollArea className="h-[420px] pr-2">
          <div className="flex flex-col gap-4 pb-2">
            {toneDrift.map((entry) => (
              <ToneDriftCard key={entry.intent} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ToneDriftCard({ entry }: { entry: ToneDriftEntry }) {
  const sentimentPath = entry.sequence.map((point) => point.sentiment.toFixed(1)).join(" → ");
  const channelPath = entry.sequence.map((point) => CHANNEL_LABELS[point.channel]).join(" → ");
  const initialSentiment = entry.sequence[0]?.sentiment ?? 0;
  const finalSentiment = entry.sequence[entry.sequence.length - 1]?.sentiment ?? 0;
  const delta = finalSentiment - initialSentiment;
  const deltaAbsolute = Math.abs(delta);
  const deltaDescriptor =
    deltaAbsolute < 0.05 ? "held steady" : delta > 0 ? "escalated" : "cooled";
  const deltaColor =
    delta > 0 ? "text-rose-300" : delta < 0 ? "text-emerald-300" : "text-indigo-200/80";
  const deltaValue = deltaAbsolute.toFixed(1);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-sm text-gray-300 shadow-inner shadow-indigo-500/10 transition-colors duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-200/80">
          <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2 py-1 text-indigo-100">
            Tone Drift ✨
          </span>
          <span className="rounded-full border border-[color:var(--border)] bg-[rgba(26,26,26,0.55)] px-2 py-1 text-gray-200">
            {entry.correlationLevel}
          </span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{entry.intent}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">Intent cluster</p>
        </div>
        <p className="text-sm text-gray-300">
          Tone {deltaDescriptor} <span className={`${deltaColor} font-semibold`}>{deltaValue}</span> from{" "}
          {sentimentPath} across {channelPath}.
        </p>
        <p className="text-sm text-indigo-100">{entry.aiObservation}</p>
        <ToneDriftSequence sequence={entry.sequence} />
      </div>
      <div className="mt-4 space-y-2 text-xs text-indigo-200/90">
        <p>✨ Suggestion: {entry.suggestion}</p>
        <div className="flex flex-wrap gap-2">
          {entry.sequence.map((point, index) => (
            <span
              key={`${entry.intent}-${point.channel}-${index}`}
              className="rounded-full border border-[color:var(--border)] bg-[rgba(26,26,26,0.55)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-300"
            >
              {CHANNEL_LABELS[point.channel]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToneDriftSequence({ sequence }: { sequence: ToneDriftSequencePoint[] }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-indigo-200/70">
        <span>Journey Timeline</span>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-400/40 via-indigo-200/20 to-indigo-400/40" />
      </div>
      <div className="flex flex-col gap-2.5">
        {sequence.map((point, index) => (
          <div
            key={`${point.channel}-${index}`}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-[rgba(26,26,26,0.5)] px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[color:var(--border)] bg-[rgba(26,26,26,0.55)] px-2 py-1 text-[11px] font-semibold text-gray-100">
                {CHANNEL_LABELS[point.channel]}
              </span>
              {point.stage ? (
                <span className="text-[10px] uppercase tracking-wide text-gray-500">{point.stage}</span>
              ) : null}
              {index < sequence.length - 1 ? (
                <span className="text-[10px] uppercase tracking-wide text-indigo-300/70">→</span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 font-semibold text-gray-200">
              <SentimentBadge score={point.sentiment} />
              <span>{point.sentiment.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrematureClosureAuditWall({ audits }: { audits: PrematureClosureAuditEntry[] }) {
  const highRisk = audits.filter((audit) => audit.riskLevel === "high").length;
  const openChannels = audits.reduce((acc, audit) => acc + audit.activeChannels.length, 0);

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] shadow-lg shadow-rose-500/10 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>✨ Premature Closure Risk Audit</CardTitle>
          <CardDescription>Spots closure conflicts across channels for the same active banking intent.</CardDescription>
        </div>
        <Badge className="border-rose-400/40 bg-rose-500/10 text-rose-100">Cross-Channel</Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="grid gap-3 text-xs text-gray-200 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[rgba(26,26,26,0.5)] p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Cases flagged</div>
            <div className="mt-1 text-xl font-semibold text-white">{audits.length}</div>
            <div className="text-[11px] text-gray-400">Cross-channel mismatches</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[rgba(26,26,26,0.5)] p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Active threads</div>
            <div className="mt-1 text-xl font-semibold text-white">{openChannels}</div>
            <div className="text-[11px] text-gray-400">Still awaiting bank action</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[rgba(26,26,26,0.5)] p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">High risk</div>
            <div className="mt-1 text-xl font-semibold text-white">{highRisk}</div>
            <div className="text-[11px] text-gray-400">Compliance-sensitive closures</div>
          </div>
        </div>

        <ScrollArea className="h-[360px] pr-2">
          <div className="space-y-4 pb-2">
            {audits.map((audit) => (
              <PrematureClosureAuditCard key={`${audit.intent}-${audit.customerId}`} audit={audit} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function PrematureClosureAuditCard({ audit }: { audit: PrematureClosureAuditEntry }) {
  const closedChannelLabel = CHANNEL_LABELS[audit.closedChannel.channel];
  const activeChannelLabels = audit.activeChannels.map((channel) => CHANNEL_LABELS[channel.channel]).join(", ");
  const activeChannelDescriptors = audit.activeChannels.map((channel) => getSentimentDescriptor(channel.sentiment).label);
  const closureDate = formatDateTime(audit.closedChannel.closureTimestamp);
  const closedDescriptor = getSentimentDescriptor(audit.closedChannel.sentiment);

  return (
    <div className="rounded-2xl border border-rose-400/20 bg-gray-950/70 p-5 text-sm text-gray-300 shadow-inner shadow-rose-500/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-rose-200/90">
            <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-2 py-1 text-rose-100">
              Premature Closure Risk
            </span>
            <RiskBadge level={audit.riskLevel} />
            <span className="rounded-full border border-gray-600/60 bg-gray-800 px-2 py-1 text-gray-300">
              Customer {audit.customerId}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white">{audit.intent}</h3>
          <p className="text-xs uppercase tracking-wide text-gray-500">Intent cluster • {closureDate}</p>
        </div>
        <div className="flex flex-col items-start gap-1 text-xs text-gray-400 sm:items-end">
          <span className="font-semibold text-gray-200">
            {closedChannelLabel} closed at {audit.closedChannel.sentiment.toFixed(1)} ({closedDescriptor.label})
          </span>
          <span>
            Active on {activeChannelLabels}
            {activeChannelDescriptors.length > 0 ? ` (${activeChannelDescriptors.join(", ")})` : ""}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-200">
        <p>{audit.aiObservation}</p>
        <p className="text-purple-300">✨ Action: {audit.recommendation}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-gray-300">
        <div className="flex flex-wrap gap-2">
          <ChannelStatusPill
            channel={audit.closedChannel.channel}
            status="closed"
            sentiment={audit.closedChannel.sentiment}
            stage={audit.closedChannel.stage}
          />
          {audit.activeChannels.map((channel, index) => (
            <ChannelStatusPill
              key={`${audit.intent}-${channel.channel}-${index}`}
              channel={channel.channel}
              status={channel.status}
              sentiment={channel.sentiment}
              stage={channel.stage}
              pendingFromCompany={channel.pendingFromCompany}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelStatusPill({
  channel,
  status,
  sentiment,
  stage,
  pendingFromCompany = false,
}: {
  channel: ChannelKey;
  status: ClosureStatus;
  sentiment: number;
  stage: string;
  pendingFromCompany?: boolean;
}) {
  const { bgClass, textClass, icon } = getStatusStyles(status);
  const pendingTag = pendingFromCompany ? " • Pending bank action" : "";
  const descriptor = getSentimentDescriptor(sentiment);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 ${bgClass} ${textClass}`}
      title={`Stage: ${stage}${pendingTag}`}
    >
      <span>{icon}</span>
      <span className="font-semibold">{CHANNEL_LABELS[channel]}</span>
      <span className="font-semibold">{sentiment.toFixed(1)}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/80">{descriptor.label}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/70">{stage}</span>
      {pendingFromCompany ? (
        <span className="text-[10px] uppercase tracking-wide text-white/60">Pending bank action</span>
      ) : null}
    </span>
  );
}

function PressureConstellationWall({
  nodes,
  clusters,
  insights,
}: {
  nodes: PressureConstellationNode[];
  clusters: PressureClusterSummary[];
  insights: PressureInsight[];
}) {
  const totalIntents = nodes.length;
  const averagePressure =
    nodes.reduce((acc, node) => acc + node.pressureScore, 0) / Math.max(1, nodes.length);
  const highestPressureNodes = nodes.slice().sort((a, b) => b.pressureScore - a.pressureScore).slice(0, 5);
  const scatterData = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        displayName: node.label,
        sentiment: node.sentiment,
        urgency: node.urgencyRate,
        backlogPercent: node.backlogRatio * 100,
        pressureScore: node.pressureScore,
        dominantChannel: node.dominantChannel,
        clusterId: node.clusterId,
      })),
    [nodes],
  );

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>✨ AI-Clustered Pressure Constellation Map</CardTitle>
          <CardDescription>
            Scalable constellation of 100+ intents with sentiment, urgency, backlog, and channel pressure correlations.
          </CardDescription>
        </div>
        <Badge className="border-indigo-400/40 bg-indigo-500/10 text-indigo-100">Constellation</Badge>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="rounded-2xl border border-dashed border-white/10 bg-gradient-to-tr from-[#1b1b2f]/70 via-[rgba(26,26,26,0.55)] to-[#2b1d3f]/60 p-6 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-indigo-100/70">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">X → Sentiment (Happy → Frustrated)</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Y → Urgency Index (0 → 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-1">Size = Backlog %</span>
              <span className="rounded-full border border-lime-400/30 bg-lime-500/10 px-2 py-1">Glow = Pressure Score</span>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              Dominant Channel • Email 🔵 Chat 🟢 Ticket 🟣 Social 🟠 Voice 🔴
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)]">
            <div className="relative rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.5)] p-4">
              <PressureScatterMap data={scatterData} />
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.45)] p-5 text-sm text-gray-200">
              <div>
                <div className="text-xs uppercase tracking-wide text-indigo-200/80">Scope</div>
                <div className="mt-1 text-2xl font-semibold text-white">{totalIntents}</div>
                <div className="text-xs text-gray-400">Active intents mapped across five channels</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-indigo-200/80">Avg Pressure</div>
                <div className="mt-1 text-xl font-semibold text-white">{averagePressure.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Weighted by sentiment tension & backlog</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-indigo-200/80">Top Pressure Nodes</div>
                <div className="mt-2 space-y-1 text-xs text-gray-300">
                  {highestPressureNodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between">
                      <span className="font-semibold text-gray-100">{node.label}</span>
                      <span className="text-indigo-200">{CHANNEL_LABELS[node.dominantChannel]}</span>
                      <span className="text-purple-200">{node.pressureScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">AI clusters: {clusters.length}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              High-pressure intents ≥ 4.0: {nodes.filter((node) => node.pressureScore >= 4).length}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              Company accountability &gt; 60%: {nodes.filter((node) => node.backlogRatio >= 0.6).length}
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {clusters.map((cluster) => (
              <PressureClusterCard key={cluster.id} cluster={cluster} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-indigo-200/80">AI Pressure Insight Wall</div>
          <div className="grid gap-3 lg:grid-cols-2">
            {insights.map((insight) => (
              <div key={insight.id} className="rounded-xl border border-white/10 bg-[rgba(26,26,26,0.45)] p-4 text-sm text-gray-200 shadow-inner">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-200/80">
                  <span>{insight.icon}</span>
                  <span>{insight.title}</span>
                </div>
                <div className="mt-1 text-base font-semibold text-white">{insight.context}</div>
                <p className="mt-1 text-xs text-gray-400">{insight.detail}</p>
                <p className="mt-2 text-xs text-purple-300">✨ {insight.aiInsight}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PressureClusterCard({ cluster }: { cluster: PressureClusterSummary }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200 shadow-inner">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-200/80">
          <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-2 py-1 text-indigo-100">Cluster</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-gray-200">
            Dominant: {cluster.dominantChannels.map((channel) => CHANNEL_LABELS[channel]).join(" • ")}
          </span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{cluster.name}</h3>
          <div className="mt-1 text-xs text-gray-400">{cluster.topIntents.join(" • ")}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Sentiment</div>
            <div className="text-sm font-semibold text-white">{cluster.avgSentiment.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Urgency</div>
            <div className="text-sm font-semibold text-white">{(cluster.avgUrgency * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Pressure</div>
            <div className="text-sm font-semibold text-white">{cluster.avgPressure.toFixed(1)}</div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
          Unresolved load: <span className="font-semibold text-white">{cluster.unresolved.toLocaleString()}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-purple-300">✨ {cluster.recommendation}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: PrematureClosureAuditEntry["riskLevel"] }) {
  const riskMeta: Record<PrematureClosureAuditEntry["riskLevel"], { label: string; className: string }> = {
    high: {
      label: "High risk",
      className: "border-rose-500/60 bg-rose-500/15 text-rose-200",
    },
    medium: {
      label: "Medium risk",
      className: "border-amber-500/60 bg-amber-500/15 text-amber-200",
    },
    low: {
      label: "Low risk",
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    },
  };

  const meta = riskMeta[level];

  return <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}>{meta.label}</span>;
}

function getStatusStyles(status: ClosureStatus) {
  switch (status) {
    case "closed":
      return { bgClass: "bg-emerald-500/10", textClass: "text-emerald-100", icon: "✅" };
    case "in_progress":
      return { bgClass: "bg-amber-500/10", textClass: "text-amber-100", icon: "⏳" };
    case "open":
    default:
      return { bgClass: "bg-rose-500/10", textClass: "text-rose-100", icon: "❌" };
  }
}

const CLOSURE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
};

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Timestamp unavailable";
  try {
    return new Intl.DateTimeFormat("en-US", CLOSURE_DATE_FORMAT).format(date);
  } catch {
    return date.toUTCString();
  }
}

function getSentimentDescriptor(score: number) {
  if (score <= 1.49) return { emoji: "😊", label: "Happy" };
  if (score <= 2.49) return { emoji: "🙂", label: "Bit Irritated" };
  if (score <= 3.49) return { emoji: "😐", label: "Moderately Concerned" };
  if (score <= 4.49) return { emoji: "😡", label: "Anger" };
  return { emoji: "😠", label: "Frustrated" };
}

function SentimentBadge({ score }: { score: number }) {
  const { emoji, label } = getSentimentDescriptor(score);
  return (
    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/90">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/20">
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function InsightCard({
  title,
  description,
  tone = "default",
  dense = false,
}: {
  title: string;
  description: string;
  tone?: "default" | "info" | "success" | "warning" | "danger";
  dense?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    default: "border-white/10 bg-black/40",
    info: "border-indigo-400/30 bg-indigo-500/10",
    success: "border-emerald-400/30 bg-emerald-500/10",
    warning: "border-amber-400/30 bg-amber-500/10",
    danger: "border-rose-400/30 bg-rose-500/10",
  };

  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]} ${dense ? "space-y-1" : "space-y-2"}`}>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-gray-300">{description}</div>
    </div>
  );
}

const channelDotClass: Record<ChannelKey, string> = {
  email: "bg-blue-400",
  chat: "bg-emerald-400",
  ticket: "bg-purple-400",
  social: "bg-pink-400",
  voice: "bg-orange-400",
};

const intentOverlapMock: Array<{
  cluster: string;
  channels: ChannelKey[];
  avgSentiment: number;
  unresolvedPct: number;
  volume: number;
  summary: string;
}> = [
  {
    cluster: "Mortgage Rate Lock",
    channels: ["email", "chat", "voice"],
    avgSentiment: 3.1,
    unresolvedPct: 41,
    volume: 540,
    summary: "Borrowers request rate-lock confirmations across Email, Chat, and Voice with 41% still awaiting underwriting updates.",
  },
  {
    cluster: "Credit Card Dispute",
    channels: ["email", "ticket"],
    avgSentiment: 2.9,
    unresolvedPct: 35,
    volume: 460,
    summary: "Cardholders escalate billing errors via Email and Ticket queues with sentiment dipping during compliance reviews.",
  },
  {
    cluster: "Loan Application Status",
    channels: ["chat", "social"],
    avgSentiment: 3.4,
    unresolvedPct: 27,
    volume: 390,
    summary: "Applicants check loan progress through Chat and Social; proactive status pushes could reduce call deflection.",
  },
  {
    cluster: "Account Access Reset",
    channels: ["ticket", "voice"],
    avgSentiment: 3.6,
    unresolvedPct: 19,
    volume: 310,
    summary: "Account recovery spans Ticket and Voice support—consider streamlining multi-factor verification paths.",
  },
];

const prematureClosureAuditData: PrematureClosureAuditEntry[] = [
  {
    intent: "Mortgage Rate Lock",
    customerId: "C-48152",
    closedChannel: {
      channel: "ticket",
      sentiment: 2.1,
      stage: "Resolution",
      closureTimestamp: "2025-11-06T14:22:00Z",
    },
    activeChannels: [
      {
        channel: "voice",
        sentiment: 4.6,
        stage: "Escalation",
        status: "in_progress",
        pendingFromCompany: true,
      },
    ],
    aiObservation: "Ticket closed while borrower escalated the same rate-lock request via voice with declining sentiment.",
    recommendation: "Reopen ticket and assign to compliance QA for premature closure review.",
    riskLevel: "high",
  },
  {
    intent: "Credit Card Dispute",
    customerId: "C-77204",
    closedChannel: {
      channel: "chat",
      sentiment: 2.3,
      stage: "Resolution",
      closureTimestamp: "2025-11-05T19:10:00Z",
    },
    activeChannels: [
      {
        channel: "email",
        sentiment: 4.2,
        stage: "Investigation",
        status: "open",
        pendingFromCompany: true,
      },
      {
        channel: "social",
        sentiment: 4.5,
        stage: "Awareness",
        status: "open",
        pendingFromCompany: true,
      },
    ],
    aiObservation:
      "Chat marked dispute resolved, yet customer continues via email and social with unresolved sentiment and company pending actions.",
    recommendation: "Link channels in dispute workflow and launch follow-up audit on closure criteria.",
    riskLevel: "medium",
  },
  {
    intent: "Premier Package Upgrade",
    customerId: "C-19338",
    closedChannel: {
      channel: "voice",
      sentiment: 1.5,
      stage: "Consult",
      closureTimestamp: "2025-11-04T16:45:00Z",
    },
    activeChannels: [
      {
        channel: "email",
        sentiment: 2.9,
        stage: "Follow-up",
        status: "in_progress",
        pendingFromCompany: false,
      },
    ],
    aiObservation: "Voice agent confirmed upgrade, yet concierge email follow-up still active with outstanding onboarding tasks.",
    recommendation: "Sync concierge checklist completion before voice agents declare upgrade closed.",
    riskLevel: "low",
  },
];

const toneDriftData: ToneDriftEntry[] = [
  {
    intent: "Mortgage Rate Lock",
    correlationLevel: "Cross-channel sequence drift",
    sequence: [
      { channel: "email", sentiment: 2.0, stage: "Application" },
      { channel: "chat", sentiment: 3.3, stage: "Processing" },
      { channel: "voice", sentiment: 4.6, stage: "Escalation" },
    ],
    aiObservation: "Tone escalated as borrowers moved from asynchronous updates to underwriting review calls.",
    suggestion: "Keep loan processors looped into escalation scripts to maintain confidence during rate locks.",
  },
  {
    intent: "Wire Transfer Delay",
    correlationLevel: "Inter-channel drift (same intent)",
    sequence: [
      { channel: "social", sentiment: 4.2, stage: "Awareness" },
      { channel: "chat", sentiment: 1.8, stage: "Resolution" },
    ],
    aiObservation: "Frustration aired on social eased once treasury support joined the real-time chat session.",
    suggestion: "Offer instant chat callbacks when international transfers trend on social.",
  },
  {
    intent: "Digital Account Recovery",
    correlationLevel: "Intra-channel drift",
    sequence: [
      { channel: "voice", sentiment: 4.3, stage: "Escalation" },
      { channel: "ticket", sentiment: 1.6, stage: "Closure" },
    ],
    aiObservation: "Personalized wealth-team follow-up shifted tone back to positive after security escalation.",
    suggestion: "Blend automated resets with empathetic outreach for high-net-worth access issues.",
  },
  {
    intent: "Premier Package Upgrade",
    correlationLevel: "Inter-channel drift (same intent)",
    sequence: [
      { channel: "voice", sentiment: 3.5, stage: "Consult" },
      { channel: "email", sentiment: 1.7, stage: "Follow-up" },
    ],
    aiObservation: "Voice consultation relief improved after proactive email recapped preferred benefits.",
    suggestion: "Send same-day concierge summaries to reinforce premium upgrade decisions.",
  },
  {
    intent: "Debit Card Replacement",
    correlationLevel: "Cross-channel sequence drift",
    sequence: [
      { channel: "ticket", sentiment: 2.2, stage: "Authenticate" },
      { channel: "chat", sentiment: 3.5, stage: "Resolution" },
      { channel: "voice", sentiment: 4.4, stage: "Escalation" },
    ],
    aiObservation: "Tone eroded after repeated fraud checks across channels before escalation.",
    suggestion: "Carry verified security steps forward to prevent re-authentication fatigue.",
  },
  {
    intent: "Statement Fee Clarification",
    correlationLevel: "Intra-channel drift",
    sequence: [
      { channel: "email", sentiment: 3.8, stage: "Receive" },
      { channel: "email", sentiment: 1.5, stage: "Resolution" },
    ],
    aiObservation: "Clarifying fee waivers within a single email thread restored trust without channel jumps.",
    suggestion: "Keep statement fee explanations in-channel when supporting documents are attached.",
  },
  {
    intent: "Mortgage Closing ETA",
    correlationLevel: "Inter-channel drift (same intent)",
    sequence: [
      { channel: "social", sentiment: 2.4, stage: "Awareness" },
      { channel: "ticket", sentiment: 4.2, stage: "Resolution" },
      { channel: "chat", sentiment: 1.9, stage: "Closure" },
    ],
    aiObservation: "Tone dipped during mortgage ticket backlog but recovered once closers pushed ETA via chat.",
    suggestion: "Route urgent closing questions directly into chat when mortgage queues are saturated.",
  },
];

const pressureConstellationNodes: PressureConstellationNode[] = [
  {
    id: "intent-001",
    label: "Mortgage Rate Lock",
    clusterId: "cluster-mortgage",
    sentiment: 4.6,
    urgencyRate: 0.85,
    backlogRatio: 0.22,
    dominantChannel: "voice",
    pressureScore: 8.9,
    volume: 312,
    glow: 0.92,
  },
  {
    id: "intent-002",
    label: "Credit Card Dispute",
    clusterId: "cluster-payments",
    sentiment: 4.4,
    urgencyRate: 0.78,
    backlogRatio: 0.18,
    dominantChannel: "social",
    pressureScore: 7.6,
    volume: 281,
    glow: 0.82,
  },
  {
    id: "intent-003",
    label: "Payment Timeout",
    clusterId: "cluster-payments",
    sentiment: 4.1,
    urgencyRate: 0.64,
    backlogRatio: 0.31,
    dominantChannel: "chat",
    pressureScore: 6.8,
    volume: 245,
    glow: 0.74,
  },
  {
    id: "intent-004",
    label: "KYC Resubmission",
    clusterId: "cluster-security",
    sentiment: 3.7,
    urgencyRate: 0.59,
    backlogRatio: 0.27,
    dominantChannel: "email",
    pressureScore: 5.9,
    volume: 198,
    glow: 0.62,
  },
  {
    id: "intent-005",
    label: "Premier Package Upgrade",
    clusterId: "cluster-loyalty",
    sentiment: 2.3,
    urgencyRate: 0.33,
    backlogRatio: 0.11,
    dominantChannel: "voice",
    pressureScore: 3.4,
    volume: 164,
    glow: 0.41,
  },
  {
    id: "intent-006",
    label: "Debit Card Replacement",
    clusterId: "cluster-card-access",
    sentiment: 4.5,
    urgencyRate: 0.74,
    backlogRatio: 0.24,
    dominantChannel: "voice",
    pressureScore: 8.3,
    volume: 276,
    glow: 0.86,
  },
  {
    id: "intent-007",
    label: "Mobile Deposit Failure",
    clusterId: "cluster-payments",
    sentiment: 3.2,
    urgencyRate: 0.48,
    backlogRatio: 0.19,
    dominantChannel: "ticket",
    pressureScore: 4.6,
    volume: 182,
    glow: 0.54,
  },
  {
    id: "intent-008",
    label: "Rewards Redemption",
    clusterId: "cluster-loyalty",
    sentiment: 2.5,
    urgencyRate: 0.29,
    backlogRatio: 0.14,
    dominantChannel: "email",
    pressureScore: 3.1,
    volume: 141,
    glow: 0.36,
  },
  {
    id: "intent-009",
    label: "Loan Application Status",
    clusterId: "cluster-mortgage",
    sentiment: 3.8,
    urgencyRate: 0.51,
    backlogRatio: 0.21,
    dominantChannel: "chat",
    pressureScore: 5.2,
    volume: 203,
    glow: 0.58,
  },
  {
    id: "intent-010",
    label: "Statement Fee Clarification",
    clusterId: "cluster-billing",
    sentiment: 3.9,
    urgencyRate: 0.44,
    backlogRatio: 0.17,
    dominantChannel: "email",
    pressureScore: 4.9,
    volume: 167,
    glow: 0.52,
  },
  {
    id: "intent-011",
    label: "ACH Reversal",
    clusterId: "cluster-payments",
    sentiment: 4.2,
    urgencyRate: 0.62,
    backlogRatio: 0.26,
    dominantChannel: "ticket",
    pressureScore: 6.3,
    volume: 218,
    glow: 0.7,
  },
  {
    id: "intent-012",
    label: "Digital Account Recovery",
    clusterId: "cluster-security",
    sentiment: 4.7,
    urgencyRate: 0.81,
    backlogRatio: 0.23,
    dominantChannel: "voice",
    pressureScore: 8.6,
    volume: 289,
    glow: 0.88,
  },
];

const pressureConstellationClusters: PressureClusterSummary[] = [
  {
    id: "cluster-payments",
    name: "Payment Failures & Disputes",
    dominantChannels: ["voice", "social"],
    avgSentiment: 4.3,
    avgUrgency: 0.69,
    avgPressure: 7.1,
    unresolved: 742,
    topIntents: ["Credit Card Dispute", "Payment Timeout", "ACH Reversal"],
    recommendation: "Move authentication and retries into real-time Chat to decompress Voice escalations.",
  },
  {
    id: "cluster-mortgage",
    name: "Mortgage & Lending Journey",
    dominantChannels: ["chat", "voice"],
    avgSentiment: 4.2,
    avgUrgency: 0.58,
    avgPressure: 6.5,
    unresolved: 529,
    topIntents: ["Mortgage Rate Lock", "Loan Application Status"],
    recommendation: "Sync underwriting updates into omni-channel timeline to prevent repeated escalations.",
  },
  {
    id: "cluster-security",
    name: "Identity & Security Access",
    dominantChannels: ["email", "voice"],
    avgSentiment: 4.0,
    avgUrgency: 0.63,
    avgPressure: 6.2,
    unresolved: 418,
    topIntents: ["Digital Account Recovery", "KYC Resubmission"],
    recommendation: "Standardize document ask templates and pre-verify submissions before escalation.",
  },
  {
    id: "cluster-billing",
    name: "Billing & Statement Questions",
    dominantChannels: ["email", "ticket"],
    avgSentiment: 3.7,
    avgUrgency: 0.46,
    avgPressure: 5.0,
    unresolved: 332,
    topIntents: ["Statement Fee Clarification", "Rewards Redemption"],
    recommendation: "Automate fee-waiver eligibility and self-service statement annotations.",
  },
  {
    id: "cluster-card-access",
    name: "Card Access & Replacement",
    dominantChannels: ["voice", "ticket"],
    avgSentiment: 4.4,
    avgUrgency: 0.73,
    avgPressure: 7.9,
    unresolved: 388,
    topIntents: ["Debit Card Replacement"],
    recommendation: "Carry fraud verification across channel hops to prevent re-authentication loops.",
  },
];

const pressureConstellationInsights: PressureInsight[] = [
  {
    id: "insight-peak-cluster",
    icon: "🔥",
    title: "Highest Pressure Cluster",
    context: "Payment Failures",
    detail: "Voice dominates backlog at 22%, sentiment 4.3, urgency 0.69.",
    aiInsight: "Re-route authentication into Chat to reduce Voice escalations and cut handle time.",
  },
  {
    id: "insight-volatile-intent",
    icon: "⚡",
    title: "Most Volatile Intent",
    context: "KYC Resubmission",
    detail: "Sentiment swings +2.1 → -1.4 with 3 escalation spikes per week.",
    aiInsight: "Standardize document requirements; surface checklist in Email and Chat concurrently.",
  },
  {
    id: "insight-conflict",
    icon: "❌",
    title: "Multi-Channel Conflict",
    context: "Payment Timeout",
    detail: "Ticket shows closed; Chat pending customer; Voice escalated with sentiment 4.6.",
    aiInsight: "Require CRM timeline acknowledgment before agents close any related channel thread.",
  },
  {
    id: "insight-backlog",
    icon: "📊",
    title: "Backlog Concentration",
    context: "Billing Issues",
    detail: "426 unresolved, sentiment 4.0, urgency flagged high.",
    aiInsight: "Expand automated refund approval thresholds for P2 tickets to relieve backlog.",
  },
  {
    id: "insight-accountability",
    icon: "🏢",
    title: "Accountability Mismatch",
    context: "Account Recovery",
    detail: "Company-owned actions at 68%, sentiment 4.5, backlog trending upward.",
    aiInsight: "Shift low-risk resets to self-service scheduling with biometric verification.",
  },
  {
    id: "insight-escalation-loop",
    icon: "🔁",
    title: "Cross-Channel Escalation Loop",
    context: "Mortgage Rate Lock",
    detail: "Email → Chat → Voice loop raises sentiment from 2.4 to 4.6 within 48 hours.",
    aiInsight: "Inject underwriting updates into Chat transcripts and proactive email digests.",
  },
];

export function AISummaryRail({ aiSummary }: { aiSummary: AISummaryWallResponse | null }) {
  return (
    <Card className="h-full border border-[color:var(--border)] bg-[color:var(--card)] transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <CardHeader>
        <CardTitle>✨ AI Summary Wall</CardTitle>
        <CardDescription>Executive-level highlights generated from live insights.</CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        {aiSummary ? (
          <ScrollArea className="h-full max-h-[360px] pr-2">
            <div className="space-y-3">
              {aiSummary.insights.map((insight, idx) => (
                <InsightCard
                  key={`${insight.title}-${idx}`}
                  title={insight.title}
                  description={insight.description}
                  tone={mapTone(insight.tone)}
                  dense
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <EmptyState label="AI summary wall waiting for data." />
        )}
      </CardContent>
    </Card>
  );
}
