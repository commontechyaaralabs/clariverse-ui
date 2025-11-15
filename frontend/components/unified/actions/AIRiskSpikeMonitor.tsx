"use client";

type RiskSpike = {
  id: string;
  timestamp: string;
  spikeType: "Sentiment Crash" | "Urgency Surge" | "SLA Spike" | "Unresolved Surge" | "Volume Surge";
  magnitude: number;
  channel: "Email" | "Chat" | "Ticket" | "Social" | "Voice";
  topIntent: string;
  sentimentBefore?: number;
  sentimentAfter?: number;
  urgencyBefore?: number;
  urgencyAfter?: number;
  unresolvedBefore?: number;
  unresolvedAfter?: number;
  slaBefore?: number;
  slaAfter?: number;
  aiAction: string;
  severity: "critical" | "moderate" | "low";
};

const spikeIcon: Record<RiskSpike["spikeType"], { icon: string; color: string }> = {
  "Urgency Surge": { icon: "🔥", color: "text-amber-300" },
  "Sentiment Crash": { icon: "💢", color: "text-rose-300" },
  "SLA Spike": { icon: "📉", color: "text-indigo-200" },
  "Unresolved Surge": { icon: "⚠️", color: "text-yellow-300" },
  "Volume Surge": { icon: "📈", color: "text-emerald-300" },
};

const severityStyles: Record<RiskSpike["severity"], string> = {
  critical: "border-rose-500/60 bg-rose-500/5 shadow-rose-500/30",
  moderate: "border-amber-400/60 bg-amber-500/5 shadow-amber-500/20",
  low: "border-yellow-400/40 bg-yellow-500/5 shadow-yellow-500/10",
};

const mockRiskSpikes: RiskSpike[] = [
  {
    id: "spike-urgency-voice",
    timestamp: "3h ago",
    spikeType: "Urgency Surge",
    magnitude: 34,
    channel: "Voice",
    topIntent: "Account Access Reset",
    urgencyBefore: 21,
    urgencyAfter: 55,
    sentimentBefore: 2.2,
    sentimentAfter: 3.9,
    unresolvedBefore: 124,
    unresolvedAfter: 187,
    aiAction: "Enable real-time callback routing and suppress repeat MFA checks.",
    severity: "critical",
  },
  {
    id: "spike-sentiment-chat",
    timestamp: "1h ago",
    spikeType: "Sentiment Crash",
    magnitude: 1.2,
    channel: "Chat",
    topIntent: "Payment Failure",
    urgencyBefore: 12,
    urgencyAfter: 31,
    sentimentBefore: 2.8,
    sentimentAfter: 4.0,
    unresolvedBefore: 210,
    unresolvedAfter: 380,
    aiAction: "Inject payment timeline updates into chatbot and escalate unresolved cases to Ticket.",
    severity: "critical",
  },
  {
    id: "spike-sla-social",
    timestamp: "45m ago",
    spikeType: "SLA Spike",
    magnitude: 19,
    channel: "Social",
    topIntent: "Card Declined",
    slaBefore: 9,
    slaAfter: 28,
    unresolvedBefore: 91,
    unresolvedAfter: 164,
    aiAction: "Trigger expedited follow-up for decline disputes; Social backlog expanding rapidly.",
    severity: "moderate",
  },
  {
    id: "spike-unresolved-email",
    timestamp: "4h ago",
    spikeType: "Unresolved Surge",
    magnitude: 140,
    channel: "Email",
    topIntent: "KYC Resubmission",
    unresolvedBefore: 212,
    unresolvedAfter: 352,
    aiAction: "Auto-prioritize KYC documentation in verification queue to prevent compliance delays.",
    severity: "moderate",
  },
  {
    id: "spike-volume-ticket",
    timestamp: "2h ago",
    spikeType: "Volume Surge",
    magnitude: 68,
    channel: "Ticket",
    topIntent: "Dispute Status",
    urgencyBefore: 18,
    urgencyAfter: 36,
    unresolvedBefore: 98,
    unresolvedAfter: 166,
    aiAction: "Borrow capacity from Chat agents to triage new dispute tickets for the next 4 hours.",
    severity: "low",
  },
];

export function AIRiskSpikeMonitor({ spikes = mockRiskSpikes }: { spikes?: RiskSpike[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          ✨ AI Risk Spike Monitor
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-200 tracking-wide uppercase">
          Operational Alerts
        </span>
      </div>
      <p className="text-xs text-gray-400">
        Live detection of sudden sentiment, SLA, urgency, volume, and backlog shocks across channels.
      </p>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {spikes.map((spike) => (
          <RiskSpikeCard key={spike.id} spike={spike} />
        ))}
      </div>
    </div>
  );
}

function RiskSpikeCard({ spike }: { spike: RiskSpike }) {
  const iconMeta = spikeIcon[spike.spikeType];
  const severityClass = severityStyles[spike.severity];

  const detailRows = getDetailRows(spike);

  return (
    <div
      className={`w-70 min-w-[16rem] rounded-2xl border px-4 py-4 text-sm text-gray-200 shadow-lg ${severityClass}`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={`${iconMeta.color} text-lg`}>{iconMeta.icon}</span>
        <span>{labelForSpike(spike.spikeType)}</span>
      </div>
      <div className="mt-3 space-y-1 text-[11px] text-gray-400">
        <div className="flex justify-between">
          <span className="uppercase tracking-wide text-gray-500">Channel</span>
          <span className="text-white">{spike.channel}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase tracking-wide text-gray-500">Top Intent</span>
          <span className="text-white">{spike.topIntent}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase tracking-wide text-gray-500">Time</span>
          <span className="text-white">{spike.timestamp}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-gray-200">
        {detailRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="text-gray-400">{row.label}</span>
            <div className="text-right">
              <div className="font-semibold text-white">{row.value}</div>
              {row.delta ? <div className="text-[11px] text-gray-400">{row.delta}</div> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-100">
        ✨ {spike.aiAction}
      </div>
    </div>
  );
}

function getDetailRows(spike: RiskSpike) {
  const rows: Array<{ label: string; value: string; delta?: string }> = [];
  if (spike.urgencyBefore !== undefined && spike.urgencyAfter !== undefined) {
    rows.push({
      label: "Urgency",
      value: `${spike.urgencyBefore}% → ${spike.urgencyAfter}%`,
      delta: deltaText(spike.urgencyBefore, spike.urgencyAfter, "%"),
    });
  }
  if (spike.sentimentBefore !== undefined && spike.sentimentAfter !== undefined) {
    rows.push({
      label: "Sentiment",
      value: `${spike.sentimentBefore.toFixed(1)} → ${spike.sentimentAfter.toFixed(1)}`,
      delta: spike.sentimentAfter > spike.sentimentBefore ? "↑ anger spike" : "↓ easing tone",
    });
  }
  if (spike.unresolvedBefore !== undefined && spike.unresolvedAfter !== undefined) {
    const diff = spike.unresolvedAfter - spike.unresolvedBefore;
    rows.push({
      label: "Unresolved Load",
      value: `${spike.unresolvedBefore} → ${spike.unresolvedAfter}`,
      delta: diff === 0 ? undefined : `${diff > 0 ? "+" : ""}${diff} in last window`,
    });
  }
  if (spike.slaBefore !== undefined && spike.slaAfter !== undefined) {
    rows.push({
      label: "SLA Risk",
      value: `${spike.slaBefore}% → ${spike.slaAfter}%`,
      delta: deltaText(spike.slaBefore, spike.slaAfter, "%"),
    });
  }
  return rows;
}

function deltaText(before: number, after: number, unit: string) {
  const diff = after - before;
  if (diff === 0) return undefined;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff}${unit}`;
}

function labelForSpike(type: RiskSpike["spikeType"]) {
  switch (type) {
    case "Urgency Surge":
      return "Urgency Spike Detected";
    case "Sentiment Crash":
      return "Sentiment Crash";
    case "SLA Spike":
      return "SLA Breach Spike";
    case "Unresolved Surge":
      return "Unresolved Case Surge";
    case "Volume Surge":
      return "Volume Surge";
    default:
      return type;
  }
}

export type { RiskSpike };


