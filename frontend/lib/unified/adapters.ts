export type ChannelKey = "email" | "chat" | "ticket" | "social" | "voice";

export type SystemHealthResponse = {
  channel: ChannelKey;
  label: string;
  icon: string;
  color: string;
  total: number;
  sentiment: number;
  sentimentDelta: number;
  sentimentTrend: number[];
  urgencyPct: number;
  slaRisk: number;
  unresolved: number;
  unresolvedCompany: number;
  unresolvedCustomer: number;
  unresolvedCompanyPct: number;
  unresolvedCustomerPct: number;
  emergingTheme: string;
};

export interface TrendPointResponse {
  date: string;
  email: number;
  chat: number;
  ticket: number;
  social: number;
  voice: number;
  sentiment: number;
}

export interface IntentClusterResponse {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  sentiment: number;
  urgency: number;
  volume: number;
  trend: "rising" | "falling" | "stable";
  volumeByChannel: { channel: ChannelKey; value: number }[];
}

export interface SeverityMatrixResponse {
  id: string;
  name: string;
  isiScore: number;
  slaRisk: number;
  actionPending: "company" | "customer";
}

export interface CrossChannelActionGridEntry {
  stage: string;
  channel: ChannelKey;
  avgDelayHours: number;
  pendingFromCompany: number;
  sentiment: number;
  urgencyRatio: number;
}

export interface CrossChannelActionGridResponse {
  entries: CrossChannelActionGridEntry[];
  insights: string[];
}

export type EisenhowerQuadrantKey = "do_now" | "schedule" | "delegate" | "ignore";

export interface EisenhowerMatrixPoint {
  id: string;
  messageId: string;
  topic: string;
  importanceScore: number;
  urgencyScore: number;
  sentiment: number;
  priority: "P0" | "P1" | "P2" | "P3";
  followUpRequired: boolean;
  volume: number;
  quadrant: EisenhowerQuadrantKey;
}

export interface EisenhowerQuadrantStat {
  label: string;
  percentage: number;
  topTopics: string[];
  suggestedAction: string;
}

export interface EisenhowerChannelView {
  channel: ChannelKey;
  summary: string;
  quadrants: Record<EisenhowerQuadrantKey, EisenhowerQuadrantStat>;
  points: EisenhowerMatrixPoint[];
}

export interface FollowUpReasonCloudEntry {
  term: string;
  count: number;
  avgDelayDays: number;
  sentimentGain: number;
}

export interface FollowUpDelayEntry {
  channel: ChannelKey;
  avgDelayDays: number;
}

export interface FollowUpSentimentSlice {
  label: string;
  value: number;
}

export interface FollowUpIntelligenceResponse {
  reasons: FollowUpReasonCloudEntry[];
  delays: FollowUpDelayEntry[];
  sentimentSlices: FollowUpSentimentSlice[];
  insights: string[];
}

export interface ActionAccountabilityStage {
  stage: string;
  pendingCompany: number;
  pendingCustomer: number;
}

export interface ActionAccountabilityResponse {
  stages: ActionAccountabilityStage[];
  insights: string[];
}

export interface IntentCorrelationNode {
  id: string;
  label: string;
  sentiment: number;
  totalMessages: number;
  dominantChannels: ChannelKey[];
}

export interface IntentCorrelationEdge {
  source: string;
  target: string;
  similarity: number;
  sharedCustomers: number;
}

export interface IntentCorrelationResponse {
  nodes: IntentCorrelationNode[];
  edges: IntentCorrelationEdge[];
  insights: string[];
}

export interface ConversationLifecycleStage {
  name: string;
  hours: number;
  sentiment: number;
}

export interface ConversationLifecycleEntry {
  channel: ChannelKey;
  stages: ConversationLifecycleStage[];
}

export interface ConversationLifecycleResponse {
  entries: ConversationLifecycleEntry[];
  insights: string[];
}

export interface EmotionMatrixEntry {
  emotion: string;
  channel: ChannelKey;
  percentage: number;
}

export interface EmotionMatrixResponse {
  entries: EmotionMatrixEntry[];
  insights: string[];
}

export interface IntentActionCard {
  intent: string;
  sentiment: number;
  urgency: number;
  actionPendingFrom: "company" | "customer";
  nextActionSuggestion: string;
  tags: string[];
}

export interface IntentActionStackResponse {
  cards: IntentActionCard[];
}

export interface ClusterSentimentNode {
  label: string;
  sentiment: number;
  volume: number;
}

export interface ClusterSentimentAnatomyEntry {
  cluster: string;
  sentiment: number;
  volume: number;
  subclusters: ClusterSentimentNode[];
}

export interface ClusterSentimentAnatomyResponse {
  entries: ClusterSentimentAnatomyEntry[];
  insights: string[];
}

export interface ExperiencePulsePoint {
  timestamp: string;
  channel: ChannelKey;
  emotionIntensity: number;
}

export interface ExperiencePulseResponse {
  points: ExperiencePulsePoint[];
  insights: string[];
}

export interface ChannelSynergyEntry {
  channelA: ChannelKey;
  channelB: ChannelKey;
  synergyScore: number;
}

export interface ChannelSynergyResponse {
  entries: ChannelSynergyEntry[];
  insights: string[];
}

export interface AISummaryInsight {
  title: string;
  description: string;
  tone?: "positive" | "negative" | "neutral";
}

export interface AISummaryWallResponse {
  insights: AISummaryInsight[];
}

export interface ActionQueueResponse {
  id: string;
  intentId: string;
  title: string;
  impact: "Low" | "Medium" | "High";
  dueAt: string;
  owner: string;
  status: "pending" | "in-progress" | "completed";
}

export interface RootCauseResponse {
  id: string;
  intentId: string;
  summary: string;
  evidence: string;
}

export interface FollowUpResponse {
  id: string;
  title: string;
  dueDate: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface HeatmapResponse {
  critical: { negative: number; neutral: number; positive: number };
  high: { negative: number; neutral: number; positive: number };
  medium: { negative: number; neutral: number; positive: number };
  low: { negative: number; neutral: number; positive: number };
}

export interface TrendSeriesResponse {
  id: string;
  label: string;
  values: { date: string; value: number }[];
}

export interface ChannelFlowLinkResponse {
  from: ChannelKey | "escalation";
  to: ChannelKey | "escalation";
  value: number;
}

export interface IntentMetadataResponse {
  urgencyProfile: { stage: string; value: number }[];
  priorityMix: { level: string; value: number }[];
  actionPendingSplit: { type: "company" | "customer"; value: number }[];
  sentimentTrajectory: { date: string; value: number }[];
  followUpRisk: { label: string; value: number }[];
}

export interface IntentLifecycleStepResponse {
  stage: string;
  count: number;
}

export interface ChannelDistributionResponse {
  name: string;
  value: number;
}

export interface ConversationRecordResponse {
  id: string;
  participant: string;
  channel: string;
  summary: string;
  transcript: string[];
}

function generateSentimentTrend(base: number, delta: number): number[] {
  const points = 12;
  return Array.from({ length: points }, (_, index) => {
    const progress = (index - points + 1) / points;
    const wave = Math.sin(index / 1.6) * 0.3;
    const noise = (Math.random() - 0.5) * 0.25;
    const value = base + progress * delta * 6 + wave + noise;
    return Number(Math.min(Math.max(value, 1), 5).toFixed(2));
  });
}

export async function fetchSystemHealth(): Promise<SystemHealthResponse[]> {
  return Promise.resolve([
    {
      channel: "email",
      label: "Email",
      icon: "Mail",
      color: "bg-blue-500",
      total: 543,
      sentiment: 3.4,
      sentimentDelta: -0.2,
      sentimentTrend: generateSentimentTrend(3.4, -0.2),
      urgencyPct: 24.6,
      slaRisk: 8.7,
      unresolved: 178,
      unresolvedCompany: 110,
      unresolvedCustomer: 68,
      unresolvedCompanyPct: 62,
      unresolvedCustomerPct: 38,
      emergingTheme: "",
    },
    {
      channel: "chat",
      label: "Chat",
      icon: "MessageCircle",
      color: "bg-green-500",
      total: 782,
      sentiment: 3.9,
      sentimentDelta: 0.1,
      sentimentTrend: generateSentimentTrend(3.9, 0.1),
      urgencyPct: 18.4,
      slaRisk: 3.1,
      unresolved: 89,
      unresolvedCompany: 36,
      unresolvedCustomer: 53,
      unresolvedCompanyPct: 41,
      unresolvedCustomerPct: 59,
      emergingTheme: "",
    },
    {
      channel: "ticket",
      label: "Ticket",
      icon: "Ticket",
      color: "bg-purple-500",
      total: 456,
      sentiment: 3.5,
      sentimentDelta: -0.05,
      sentimentTrend: generateSentimentTrend(3.5, -0.05),
      urgencyPct: 32.1,
      slaRisk: 12.3,
      unresolved: 134,
      unresolvedCompany: 78,
      unresolvedCustomer: 56,
      unresolvedCompanyPct: 58,
      unresolvedCustomerPct: 42,
      emergingTheme: "",
    },
    {
      channel: "social",
      label: "Social",
      icon: "Share2",
      color: "bg-pink-500",
      total: 415,
      sentiment: 3.2,
      sentimentDelta: -0.1,
      sentimentTrend: generateSentimentTrend(3.2, -0.1),
      urgencyPct: 41.7,
      slaRisk: 15.2,
      unresolved: 167,
      unresolvedCompany: 78,
      unresolvedCustomer: 89,
      unresolvedCompanyPct: 47,
      unresolvedCustomerPct: 53,
      emergingTheme: "",
    },
    {
      channel: "voice",
      label: "Voice",
      icon: "Mic",
      color: "bg-orange-500",
      total: 289,
      sentiment: 4.1,
      sentimentDelta: 0.05,
      sentimentTrend: generateSentimentTrend(4.1, 0.05),
      urgencyPct: 12.9,
      slaRisk: 4.2,
      unresolved: 23,
      unresolvedCompany: 8,
      unresolvedCustomer: 15,
      unresolvedCompanyPct: 33,
      unresolvedCustomerPct: 67,
      emergingTheme: "",
    },
  ]);
}

export async function fetchTrendData(): Promise<TrendPointResponse[]> {
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const start = new Date("2025-02-02T00:00:00Z");
  const days = 8;

  const points: TrendPointResponse[] = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const baseVolume = 300 + index * 18;
    const volumeNoise = () => Math.round((Math.random() - 0.5) * 60);

    const email = baseVolume + volumeNoise();
    const chat = baseVolume + 80 + volumeNoise();
    const ticket = baseVolume / 2 + volumeNoise();
    const social = baseVolume / 1.6 + volumeNoise();
    const voice = baseVolume / 2.3 + volumeNoise();

    const sentimentWave = Math.sin(index / 1.4) * 0.8;
    const sentimentNoise = (Math.random() - 0.5) * 0.6;
    const sentiment = clamp(3.2 + sentimentWave + sentimentNoise, 1.4, 4.8);

    return {
      date: date.toISOString().split("T")[0],
      email,
      chat,
      ticket,
      social,
      voice,
      sentiment: Number(sentiment.toFixed(2)),
    };
  });

  return Promise.resolve(points);
}

export async function fetchIntentClusters(): Promise<IntentClusterResponse[]> {
  return Promise.resolve([
    {
      id: "intent-1",
      name: "Payment Failures",
      severity: "critical",
      sentiment: 58,
      urgency: 0.82,
      volume: 980,
      trend: "rising",
      volumeByChannel: [
        { channel: "email", value: 280 },
        { channel: "chat", value: 240 },
        { channel: "ticket", value: 210 },
        { channel: "social", value: 150 },
        { channel: "voice", value: 100 },
      ],
    },
    {
      id: "intent-2",
      name: "Delivery Delays",
      severity: "high",
      sentiment: 62,
      urgency: 0.74,
      volume: 860,
      trend: "stable",
      volumeByChannel: [
        { channel: "email", value: 190 },
        { channel: "chat", value: 210 },
        { channel: "ticket", value: 180 },
        { channel: "social", value: 170 },
        { channel: "voice", value: 110 },
      ],
    },
    {
      id: "intent-3",
      name: "Account Access",
      severity: "medium",
      sentiment: 76,
      urgency: 0.43,
      volume: 610,
      trend: "falling",
      volumeByChannel: [
        { channel: "email", value: 170 },
        { channel: "chat", value: 155 },
        { channel: "ticket", value: 120 },
        { channel: "social", value: 90 },
        { channel: "voice", value: 75 },
      ],
    },
    {
      id: "intent-4",
      name: "Billing Disputes",
      severity: "high",
      sentiment: 54,
      urgency: 0.68,
      volume: 720,
      trend: "rising",
      volumeByChannel: [
        { channel: "email", value: 210 },
        { channel: "chat", value: 160 },
        { channel: "ticket", value: 150 },
        { channel: "social", value: 110 },
        { channel: "voice", value: 90 },
      ],
    },
    {
      id: "intent-5",
      name: "Product Defects",
      severity: "critical",
      sentiment: 48,
      urgency: 0.59,
      volume: 690,
      trend: "rising",
      volumeByChannel: [
        { channel: "email", value: 160 },
        { channel: "chat", value: 150 },
        { channel: "ticket", value: 145 },
        { channel: "social", value: 135 },
        { channel: "voice", value: 100 },
      ],
    },
    {
      id: "intent-6",
      name: "Loyalty Rewards",
      severity: "low",
      sentiment: 84,
      urgency: 0.21,
      volume: 430,
      trend: "stable",
      volumeByChannel: [
        { channel: "email", value: 120 },
        { channel: "chat", value: 95 },
        { channel: "ticket", value: 70 },
        { channel: "social", value: 80 },
        { channel: "voice", value: 65 },
      ],
    },
    {
      id: "intent-7",
      name: "Onboarding Questions",
      severity: "medium",
      sentiment: 71,
      urgency: 0.37,
      volume: 560,
      trend: "stable",
      volumeByChannel: [
        { channel: "email", value: 150 },
        { channel: "chat", value: 140 },
        { channel: "ticket", value: 105 },
        { channel: "social", value: 90 },
        { channel: "voice", value: 75 },
      ],
    },
    {
      id: "intent-8",
      name: "Returns & Refunds",
      severity: "high",
      sentiment: 63,
      urgency: 0.66,
      volume: 830,
      trend: "rising",
      volumeByChannel: [
        { channel: "email", value: 240 },
        { channel: "chat", value: 185 },
        { channel: "ticket", value: 160 },
        { channel: "social", value: 140 },
        { channel: "voice", value: 105 },
      ],
    },
    {
      id: "intent-9",
      name: "Feature Requests",
      severity: "medium",
      sentiment: 78,
      urgency: 0.29,
      volume: 510,
      trend: "stable",
      volumeByChannel: [
        { channel: "email", value: 160 },
        { channel: "chat", value: 120 },
        { channel: "ticket", value: 85 },
        { channel: "social", value: 80 },
        { channel: "voice", value: 65 },
      ],
    },
    {
      id: "intent-10",
      name: "Outage Complaints",
      severity: "critical",
      sentiment: 41,
      urgency: 0.88,
      volume: 1040,
      trend: "rising",
      volumeByChannel: [
        { channel: "email", value: 300 },
        { channel: "chat", value: 250 },
        { channel: "ticket", value: 220 },
        { channel: "social", value: 170 },
        { channel: "voice", value: 100 },
      ],
    },
  ]);
}

export async function fetchSeverityMatrix(): Promise<SeverityMatrixResponse[]> {
  return Promise.resolve([
    { id: "intent-1", name: "Payment Failures", isiScore: 92, slaRisk: 0.41, actionPending: "company" },
    { id: "intent-2", name: "Delivery Delays", isiScore: 86, slaRisk: 0.35, actionPending: "company" },
    { id: "intent-3", name: "Account Access", isiScore: 64, slaRisk: 0.12, actionPending: "customer" },
    { id: "intent-4", name: "Billing Disputes", isiScore: 78, slaRisk: 0.28, actionPending: "company" },
    { id: "intent-5", name: "Product Defects", isiScore: 88, slaRisk: 0.33, actionPending: "company" },
    { id: "intent-6", name: "Loyalty Rewards", isiScore: 52, slaRisk: 0.08, actionPending: "customer" },
    { id: "intent-7", name: "Onboarding Questions", isiScore: 58, slaRisk: 0.1, actionPending: "customer" },
    { id: "intent-8", name: "Returns & Refunds", isiScore: 83, slaRisk: 0.31, actionPending: "company" },
    { id: "intent-9", name: "Feature Requests", isiScore: 61, slaRisk: 0.14, actionPending: "customer" },
    { id: "intent-10", name: "Outage Complaints", isiScore: 95, slaRisk: 0.46, actionPending: "company" },
  ]);
}

export async function fetchCrossChannelActionGrid(): Promise<CrossChannelActionGridResponse> {
  const stages = ["Receive", "Authenticate", "Resolution", "Escalation", "Closure"];
  const channels: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];
  const entries = stages.flatMap((stage, stageIndex) =>
    channels.map((channel, channelIndex) => ({
      stage,
      channel,
      avgDelayHours: Number((2 + stageIndex * 1.4 + channelIndex * 0.8).toFixed(1)),
      pendingFromCompany: Math.min(0.9, 0.25 + stageIndex * 0.12 + channelIndex * 0.05),
      sentiment: 2.2 + (channelIndex % 2 === 0 ? -0.3 : 0.4) - stageIndex * 0.1,
      urgencyRatio: Math.min(0.95, 0.3 + stageIndex * 0.16 + channelIndex * 0.04),
    })),
  );

  return Promise.resolve({
    entries,
    insights: [
      "Voice channel escalation stage shows longest delay (avg 9.3 hrs).",
      "Email has highest internal dependency — 68% company-pending.",
      "Chat resolves 42% faster than Ticket; optimize ticket workflow.",
    ],
  });
}

export async function fetchEisenhowerIntelligence(): Promise<EisenhowerChannelView[]> {
  const baseQuadrants: Record<EisenhowerQuadrantKey, EisenhowerQuadrantStat> = {
    do_now: {
      label: "Do Now",
      percentage: 0.41,
      topTopics: ["Refunds", "Payment decline", "Chargebacks"],
      suggestedAction: "Escalate directly to finance responders.",
    },
    schedule: {
      label: "Schedule",
      percentage: 0.33,
      topTopics: ["Delivery ETA", "Ticket status", "Order lookup"],
      suggestedAction: "Batch into daily priority queue.",
    },
    delegate: {
      label: "Delegate",
      percentage: 0.18,
      topTopics: ["FAQ follow-up", "Password reset", "Bot triage"],
      suggestedAction: "Route to automation or knowledge base.",
    },
    ignore: {
      label: "Ignore",
      percentage: 0.08,
      topTopics: ["Spam", "Duplicate request", "Marketing ask"],
      suggestedAction: "Auto-close with macro.",
    },
  };

  const channels: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];
  const channelSummaries: Record<ChannelKey, string> = {
    email: "41% of Email threads are urgent and important — mostly refund-related.",
    chat: "Chat’s urgency spikes but importance remains lower; delegate quadrant dominates.",
    ticket: "Tickets stay balanced with 62% sitting in the Schedule quadrant.",
    social: "Social sees rapid escalations with high urgency but low volume.",
    voice: "Voice calls focus on do-now work with high emotional intensity.",
  };

  const points: EisenhowerMatrixPoint[] = Array.from({ length: 60 }).map((_, index) => {
    const channel = channels[index % channels.length];
    const importanceScore = 0.4 + (index % 5) * 0.12 + (channel === "email" ? 0.15 : 0);
    const urgencyScore = 0.35 + ((index * 7) % 10) * 0.06 + (channel === "voice" ? 0.18 : 0);
    const priority = (["P1", "P2", "P0", "P3"][index % 4] ?? "P2") as EisenhowerMatrixPoint["priority"];
    const quadrant: EisenhowerQuadrantKey =
      urgencyScore >= 0.6 && importanceScore >= 0.6
        ? "do_now"
        : urgencyScore < 0.6 && importanceScore >= 0.6
        ? "schedule"
        : urgencyScore >= 0.6 && importanceScore < 0.6
        ? "delegate"
        : "ignore";

    return {
      id: `pt-${index}`,
      messageId: `${channel.toUpperCase()}-${200 + index}`,
      topic: ["Refunds", "Shipping", "Login", "Policy", "Escalation"][index % 5] ?? "General",
      importanceScore: Number(Math.min(1, importanceScore).toFixed(2)),
      urgencyScore: Number(Math.min(1, urgencyScore).toFixed(2)),
      sentiment: Number((2.1 + (index % 4) * 0.25).toFixed(2)),
      priority,
      followUpRequired: index % 3 === 0,
      volume: 15 + (index % 8) * 5,
      quadrant,
    };
  });

  const response: EisenhowerChannelView[] = channels.map((channel) => ({
    channel,
    summary: channelSummaries[channel],
    quadrants: {
      do_now: { ...baseQuadrants.do_now },
      schedule: { ...baseQuadrants.schedule },
      delegate: { ...baseQuadrants.delegate },
      ignore: { ...baseQuadrants.ignore },
    },
    points: points.filter((point) => point.messageId.startsWith(channel.toUpperCase())),
  }));

  response.forEach((view) => {
    const multiplier = 1 + channels.indexOf(view.channel) * 0.05;
    (Object.keys(view.quadrants) as EisenhowerQuadrantKey[]).forEach((key) => {
      view.quadrants[key].percentage = Number(Math.min(1, view.quadrants[key].percentage * multiplier).toFixed(2));
    });
  });

  return Promise.resolve(response);
}

export async function fetchFollowUpIntelligence(): Promise<FollowUpIntelligenceResponse> {
  return Promise.resolve({
    reasons: [
      { term: "Awaiting refund approval", count: 420, avgDelayDays: 2.8, sentimentGain: 0.6 },
      { term: "Pending shipment confirmation", count: 360, avgDelayDays: 2.1, sentimentGain: 0.4 },
      { term: "Verification required", count: 280, avgDelayDays: 1.5, sentimentGain: 0.5 },
      { term: "Escalation follow-up", count: 190, avgDelayDays: 3.4, sentimentGain: 0.7 },
      { term: "Customer documents missing", count: 140, avgDelayDays: 2.9, sentimentGain: 0.3 },
    ],
    delays: [
      { channel: "email", avgDelayDays: 3.2 },
      { channel: "chat", avgDelayDays: 1.8 },
      { channel: "ticket", avgDelayDays: 2.9 },
      { channel: "social", avgDelayDays: 2.4 },
      { channel: "voice", avgDelayDays: 2.1 },
    ],
    sentimentSlices: [
      { label: "Improved", value: 64 },
      { label: "No Change", value: 22 },
      { label: "Declined", value: 14 },
    ],
    insights: [
      "Most common follow-up reason: refund validation (36%).",
      "Average delay before resolution: 2.8 days.",
      "Sentiment improves by +0.6 after follow-up closure.",
    ],
  });
}

export async function fetchActionAccountability(): Promise<ActionAccountabilityResponse> {
  return Promise.resolve({
    stages: [
      { stage: "Receive", pendingCompany: 48, pendingCustomer: 52 },
      { stage: "Authenticate", pendingCompany: 35, pendingCustomer: 65 },
      { stage: "Resolution", pendingCompany: 72, pendingCustomer: 28 },
      { stage: "Escalation", pendingCompany: 68, pendingCustomer: 32 },
      { stage: "Close", pendingCompany: 41, pendingCustomer: 59 },
    ],
    insights: [
      "Company holds 72% of pending items during Resolution stage.",
      "Customer dependency spikes in Authentication phase.",
      "Internal delay gap sits at +43% versus external.",
    ],
  });
}

export async function fetchIntentCorrelationCanvas(): Promise<IntentCorrelationResponse> {
  const nodes: IntentCorrelationNode[] = [
    { id: "refund-delay", label: "Refund Delay", sentiment: 2.3, totalMessages: 540, dominantChannels: ["voice", "email"] },
    { id: "payment-issue", label: "Payment Issue", sentiment: 2.6, totalMessages: 620, dominantChannels: ["email", "ticket"] },
    { id: "order-tracking", label: "Order Tracking", sentiment: 3.1, totalMessages: 480, dominantChannels: ["chat", "social"] },
    { id: "login-issue", label: "Login Issue", sentiment: 3.4, totalMessages: 390, dominantChannels: ["ticket"] },
    { id: "delivery-delay", label: "Delivery Delay", sentiment: 2.8, totalMessages: 510, dominantChannels: ["voice", "chat"] },
  ];

  const edges: IntentCorrelationEdge[] = [
    { source: "refund-delay", target: "payment-issue", similarity: 0.79, sharedCustomers: 134 },
    { source: "order-tracking", target: "delivery-delay", similarity: 0.73, sharedCustomers: 116 },
    { source: "refund-delay", target: "delivery-delay", similarity: 0.64, sharedCustomers: 98 },
    { source: "payment-issue", target: "login-issue", similarity: 0.58, sharedCustomers: 74 },
  ];

  return Promise.resolve({
    nodes,
    edges,
    insights: [
      "Refund Delay overlaps with Payment Issue in 79% of Voice threads.",
      "Order Tracking connects Chat + Social at 0.73 similarity.",
      "Login Issues remain isolated — unique to Ticket channel.",
    ],
  });
}

export async function fetchConversationLifecycle(): Promise<ConversationLifecycleResponse> {
  return Promise.resolve({
    entries: [
      {
        channel: "email",
        stages: [
          { name: "Receive", hours: 1.2, sentiment: 3.8 },
          { name: "Diagnose", hours: 2.4, sentiment: 3.3 },
          { name: "Resolution", hours: 6.4, sentiment: 2.9 },
          { name: "Close", hours: 1, sentiment: 3.4 },
        ],
      },
      {
        channel: "chat",
        stages: [
          { name: "Receive", hours: 0.3, sentiment: 4.1 },
          { name: "Diagnose", hours: 0.7, sentiment: 3.6 },
          { name: "Resolution", hours: 1.6, sentiment: 3.4 },
          { name: "Close", hours: 0.4, sentiment: 3.9 },
        ],
      },
      {
        channel: "ticket",
        stages: [
          { name: "Receive", hours: 1.4, sentiment: 3.5 },
          { name: "Diagnose", hours: 2.7, sentiment: 3.1 },
          { name: "Resolution", hours: 7.9, sentiment: 2.4 },
          { name: "Escalate", hours: 2.6, sentiment: 2.1 },
          { name: "Close", hours: 1.1, sentiment: 2.9 },
        ],
      },
      {
        channel: "social",
        stages: [
          { name: "Receive", hours: 0.6, sentiment: 3.2 },
          { name: "Diagnose", hours: 1.1, sentiment: 2.8 },
          { name: "Resolution", hours: 3.1, sentiment: 2.6 },
          { name: "Close", hours: 0.7, sentiment: 3.1 },
        ],
      },
      {
        channel: "voice",
        stages: [
          { name: "Receive", hours: 0.2, sentiment: 3.9 },
          { name: "Diagnose", hours: 0.6, sentiment: 3.5 },
          { name: "Resolution", hours: 4.8, sentiment: 2.8 },
          { name: "Escalate", hours: 2.1, sentiment: 2.6 },
          { name: "Close", hours: 0.5, sentiment: 3.3 },
        ],
      },
    ],
    insights: [
      "Escalation stage consumes 48% of lifecycle time in Voice.",
      "Chat resolves 2.5× faster with minimal emotional drop.",
      "Ticket sentiment dips sharply (-1.1) during Resolution.",
    ],
  });
}

export async function fetchEmotionMatrix(): Promise<EmotionMatrixResponse> {
  const emotions = ["Anger", "Gratitude", "Confusion", "Relief", "Frustration", "Joy"];
  const channels: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];

  const entries: EmotionMatrixEntry[] = emotions.flatMap((emotion, emotionIndex) =>
    channels.map((channel, channelIndex) => ({
      emotion,
      channel,
      percentage: Math.round(8 + emotionIndex * 4 + channelIndex * 3 + (emotion === "Anger" && channel === "voice" ? 10 : 0)),
    })),
  );

  return Promise.resolve({
    entries,
    insights: [
      "Voice carries highest anger (23%) and relief (18%) mix.",
      "Chat dominates gratitude-driven sentiment (31%).",
      "Social skews toward confusion and frustration clusters.",
    ],
  });
}

export async function fetchIntentActionStack(): Promise<IntentActionStackResponse> {
  return Promise.resolve({
    cards: [
      {
        intent: "Refund Delay",
        sentiment: 2.3,
        urgency: 0.7,
        actionPendingFrom: "company",
        nextActionSuggestion: "Automate refund approvals",
        tags: ["Urgency: High", "Pending: Company", "Volume: 540"],
      },
      {
        intent: "Payment Issue",
        sentiment: 2.6,
        urgency: 0.82,
        actionPendingFrom: "company",
        nextActionSuggestion: "Deploy payment health monitor",
        tags: ["Priority: P1", "High Escalations"],
      },
      {
        intent: "Order Tracking",
        sentiment: 3.1,
        urgency: 0.55,
        actionPendingFrom: "customer",
        nextActionSuggestion: "Integrate proactive shipment updates",
        tags: ["Delegate", "Automation"],
      },
      {
        intent: "Login Issue",
        sentiment: 3.4,
        urgency: 0.48,
        actionPendingFrom: "company",
        nextActionSuggestion: "Streamline MFA reset flow",
        tags: ["Schedule", "Knowledge Base"],
      },
    ],
  });
}

export async function fetchClusterSentimentAnatomy(): Promise<ClusterSentimentAnatomyResponse> {
  return Promise.resolve({
    entries: [
      {
        cluster: "Order Issue",
        sentiment: 2.9,
        volume: 730,
        subclusters: [
          { label: "Delivery delay", sentiment: 2.7, volume: 420 },
          { label: "Tracking failure", sentiment: 3.1, volume: 210 },
          { label: "Incorrect item", sentiment: 2.5, volume: 100 },
        ],
      },
      {
        cluster: "Refund Journey",
        sentiment: 2.5,
        volume: 650,
        subclusters: [
          { label: "Approval pending", sentiment: 2.1, volume: 300 },
          { label: "Confirmation", sentiment: 3.4, volume: 180 },
          { label: "Processing delay", sentiment: 2.4, volume: 170 },
        ],
      },
      {
        cluster: "Account Access",
        sentiment: 3.6,
        volume: 410,
        subclusters: [
          { label: "Password reset", sentiment: 3.2, volume: 160 },
          { label: "2FA challenge", sentiment: 2.8, volume: 140 },
          { label: "Login success", sentiment: 4.1, volume: 110 },
        ],
      },
    ],
    insights: [
      "Refund cluster shows extreme polarity: delays negative, confirmations positive.",
      "Voice amplifies dissatisfaction inside Delivery subtopics.",
      "Self-service wins evident in Account Access recovery.",
    ],
  });
}

export async function fetchExperiencePulseStrip(): Promise<ExperiencePulseResponse> {
  const channels: ChannelKey[] = ["email", "chat", "ticket", "social", "voice"];
  const baseDate = new Date("2025-11-12T08:00:00Z");
  const points: ExperiencePulsePoint[] = [];

  for (let hour = 0; hour < 12; hour++) {
    channels.forEach((channel, index) => {
      const ts = new Date(baseDate.getTime() + hour * 60 * 60 * 1000);
      const emotionIntensity = Number((0.3 + index * 0.05 + Math.sin(hour / 2) * 0.2).toFixed(2));
      points.push({
        timestamp: ts.toISOString(),
        channel,
        emotionIntensity: Math.max(0, Math.min(1, emotionIntensity)),
      });
    });
  }

  return Promise.resolve({
    points,
    insights: [
      "Emotional volatility peaks in Voice during the 3–5PM window.",
      "Chat stays calmest with a stable emotion rhythm.",
      "Ticket and Email share matching sentiment spikes post-lunch.",
    ],
  });
}

export async function fetchChannelSynergyMap(): Promise<ChannelSynergyResponse> {
  return Promise.resolve({
    entries: [
      { channelA: "email", channelB: "chat", synergyScore: 0.76 },
      { channelA: "email", channelB: "ticket", synergyScore: 0.68 },
      { channelA: "email", channelB: "social", synergyScore: 0.44 },
      { channelA: "email", channelB: "voice", synergyScore: 0.29 },
      { channelA: "chat", channelB: "ticket", synergyScore: 0.82 },
      { channelA: "chat", channelB: "social", synergyScore: 0.57 },
      { channelA: "chat", channelB: "voice", synergyScore: 0.49 },
      { channelA: "ticket", channelB: "social", synergyScore: 0.51 },
      { channelA: "ticket", channelB: "voice", synergyScore: 0.46 },
      { channelA: "social", channelB: "voice", synergyScore: 0.38 },
    ],
    insights: [
      "Chat ↔ Ticket synergy strongest (0.82) — shared resolution flow.",
      "Voice ↔ Email weakest (0.29) — communication gap to bridge.",
      "Social supports early detection for downstream Ticket issues.",
    ],
  });
}

export async function fetchAISummaryWall(): Promise<AISummaryWallResponse> {
  return Promise.resolve({
    insights: [
      { title: "Top Intent of the Week", description: "Refund-related messages across 3 channels make up 41% of total volume.", tone: "negative" },
      { title: "Action Bottleneck", description: "Resolution stage drives 62% of SLA breaches; assign tiger team.", tone: "negative" },
      { title: "Emotional Outlier", description: "Voice sentiment dropped 1.3 points yesterday — escalate coaching.", tone: "negative" },
      { title: "Ownership Gap", description: "Company dependency sits at 71% overall — internal bottleneck persists.", tone: "neutral" },
      { title: "Response Velocity", description: "Chat leads with avg latency 1.2 hrs; Email lags at 5.7 hrs.", tone: "positive" },
      { title: "Cross-Channel Correlation", description: "Login & Access Issues overlap across Ticket + Email engagement.", tone: "neutral" },
      { title: "Efficiency Gain", description: "AI automation in follow-ups could reduce backlog by 19%.", tone: "positive" },
      { title: "Experience Focus", description: "Escalations trending up in social — consider proactive outreach.", tone: "negative" },
    ],
  });
}

export async function fetchActionQueue(): Promise<ActionQueueResponse[]> {
  return Promise.resolve([
    { id: "nba-1", intentId: "intent-1", title: "Expedite refunds for failed payments", impact: "High", dueAt: "2025-02-09", owner: "Finance", status: "pending" },
    { id: "nba-2", intentId: "intent-2", title: "Notify ops about delivery backlog", impact: "Medium", dueAt: "2025-02-10", owner: "Logistics", status: "pending" },
    { id: "nba-3", intentId: "intent-3", title: "Update authentication FAQ", impact: "Medium", dueAt: "2025-02-11", owner: "CX Enablement", status: "in-progress" },
    { id: "nba-4", intentId: "intent-4", title: "Recalculate disputed invoices", impact: "High", dueAt: "2025-02-12", owner: "Billing Ops", status: "pending" },
    { id: "nba-5", intentId: "intent-5", title: "Run containment for defective batch", impact: "High", dueAt: "2025-02-09", owner: "Product QA", status: "pending" },
    { id: "nba-6", intentId: "intent-6", title: "Publish loyalty refresh explainer", impact: "Low", dueAt: "2025-02-15", owner: "Marketing", status: "pending" },
    { id: "nba-7", intentId: "intent-7", title: "Automate onboarding checklist email", impact: "Medium", dueAt: "2025-02-13", owner: "Lifecycle Marketing", status: "pending" },
  ]);
}

export async function fetchRootCauseInsights(intentId?: string): Promise<RootCauseResponse[]> {
  const data: RootCauseResponse[] = [
    { id: "rca-1", intentId: "intent-1", summary: "Fee introduced in September causing confusion", evidence: "42% of transcripts mention 'new fee'" },
    { id: "rca-2", intentId: "intent-2", summary: "Warehouse 3 experiencing staffing shortage", evidence: "Delivery metadata shows spike in region West" },
    { id: "rca-3", intentId: "intent-3", summary: "Chatbot instructions inconsistent for MFA reset", evidence: "LLM detected conflicting guidance in 58% of chats" },
    { id: "rca-4", intentId: "intent-4", summary: "Discount codes applying incorrect tax", evidence: "Billing audit flagged 28% discrepancy" },
    { id: "rca-5", intentId: "intent-5", summary: "Batch QA misses sensor calibration", evidence: "IoT telemetry reveals faulty lot #4821" },
    { id: "rca-6", intentId: "intent-6", summary: "Reward tiers unclear post-program refresh", evidence: "Community threads highlight missing FAQs" },
    { id: "rca-7", intentId: "intent-7", summary: "Welcome emails lack setup sequence", evidence: "70% of new users ask for onboarding checklist" },
    { id: "rca-8", intentId: "intent-8", summary: "Return portal latency spikes after promotions", evidence: "Average handling time doubled for returns queue" },
    { id: "rca-9", intentId: "intent-9", summary: "Feedback backlog hides most requested features", evidence: "Roadmap tags show 63% mention mobile customization" },
    { id: "rca-10", intentId: "intent-10", summary: "Legacy infra triggers cascading service degradation", evidence: "PagerDuty traces highlight DC-3 saturation" },
  ];

  if (!intentId) return data;
  return data.filter((item) => item.intentId === intentId);
}

export async function fetchRootCauseExplanation(intentId: string, rootCauseId: string): Promise<string> {
  return Promise.resolve(
    `AI insight for ${intentId}/${rootCauseId}: Customers highlight hidden policies and inconsistent agent responses. Recommend updating macros and notifying product.`,
  );
}

export async function fetchFollowUps(): Promise<FollowUpResponse[]> {
  return Promise.resolve([
    { id: "fu-1", title: "P1 ticket review", dueDate: "2025-02-08", severity: "critical" },
    { id: "fu-2", title: "Chat queue coaching", dueDate: "2025-02-09", severity: "high" },
    { id: "fu-3", title: "Voice compliance audit", dueDate: "2025-02-12", severity: "medium" },
  ]);
}

export async function fetchHeatmapData(): Promise<HeatmapResponse> {
  return Promise.resolve({
    critical: { negative: 42, neutral: 12, positive: 4 },
    high: { negative: 38, neutral: 20, positive: 8 },
    medium: { negative: 24, neutral: 30, positive: 16 },
    low: { negative: 8, neutral: 18, positive: 42 },
  });
}

export async function fetchIntentMetadata(intentId: string): Promise<IntentMetadataResponse> {
  return Promise.resolve({
    urgencyProfile: [
      { stage: "Immediate", value: 42 },
      { stage: "Same Day", value: 33 },
      { stage: "48 Hours", value: 15 },
      { stage: ">48 Hours", value: 10 },
    ],
    priorityMix: [
      { level: "P1", value: 18 },
      { level: "P2", value: 32 },
      { level: "P3", value: 28 },
      { level: "P4", value: 22 },
    ],
    actionPendingSplit: [
      { type: "company", value: 62 },
      { type: "customer", value: 38 },
    ],
    sentimentTrajectory: [
      { date: "2025-02-02", value: 61 },
      { date: "2025-02-03", value: 59 },
      { date: "2025-02-04", value: 57 },
      { date: "2025-02-05", value: 58 },
      { date: "2025-02-06", value: 60 },
      { date: "2025-02-07", value: 62 },
      { date: "2025-02-08", value: 64 },
    ],
    followUpRisk: [
      { label: "SLA Breach", value: 44 },
      { label: "Escalation", value: 26 },
      { label: "Compliance", value: 18 },
      { label: "Churn", value: 12 },
    ],
  });
}

export async function fetchIntentLifecycle(intentId: string): Promise<IntentLifecycleStepResponse[]> {
  return Promise.resolve([
    { stage: "Inbound", count: 320 },
    { stage: "Acknowledged", count: 260 },
    { stage: "Diagnosed", count: 185 },
    { stage: "Actioned", count: 142 },
    { stage: "Follow-up", count: 98 },
    { stage: "Resolved", count: 74 },
  ]);
}

export async function fetchChannelDistribution(intentId: string): Promise<ChannelDistributionResponse[]> {
  return Promise.resolve([
    { name: "Email", value: 37 },
    { name: "Chat", value: 24 },
    { name: "Ticket", value: 18 },
    { name: "Social", value: 12 },
    { name: "Voice", value: 9 },
  ]);
}

export async function fetchMetricExplanation(topic: string): Promise<string> {
  return Promise.resolve(
    `AI insight for ${topic}: Placeholder explanation referencing sentiment drivers, trending intents, and operational metadata.`,
  );
}

export async function fetchConversationRecord(id: string): Promise<ConversationRecordResponse> {
  return Promise.resolve({
    id,
    participant: "Customer • Alex Doe",
    channel: "Email",
    summary:
      "Customer experienced repeated payment failures after new fee introduction. Requests escalation to finance and refund confirmation.",
    transcript: [
      "Agent: Hello Alex, I see you've had issues with payment processing since yesterday.",
      "Customer: Yes, every attempt triggers a new fee and the payment fails. It's urgent.",
      "Agent: I'm escalating this to finance immediately and will update you within the hour.",
    ],
  });
}

export async function fetchTrendExplorer(): Promise<TrendSeriesResponse[]> {
  const trends = await fetchTrendData();
  return [
    { id: "trend-1", label: "Sentiment", values: trends.map((point) => ({ date: point.date, value: point.sentiment })) },
    {
      id: "trend-2",
      label: "Total Volume",
      values: trends.map((point) => ({
        date: point.date,
        value: point.email + point.chat + point.ticket + point.social + point.voice,
      })),
    },
    {
      id: "trend-3",
      label: "Escalations",
      values: trends.map((point, index) => ({ date: point.date, value: 12 + index * 3 })),
    },
  ];
}

export async function fetchChannelFlow(): Promise<ChannelFlowLinkResponse[]> {
  return Promise.resolve([
    { from: "chat", to: "ticket", value: 64 },
    { from: "email", to: "ticket", value: 38 },
    { from: "social", to: "chat", value: 26 },
    { from: "voice", to: "escalation", value: 14 },
  ]);
}
