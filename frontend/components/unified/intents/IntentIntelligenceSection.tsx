import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface IntentIntelligenceSectionProps {
  clusters: unknown[];
  severityMatrix: unknown[];
  selectedIntentId: string | null;
  onIntentSelect: (intentId: string | null) => void;
}

type ShockBar = {
  channel: string;
  label: string;
  sentimentDelta: number;
  shockScore: number;
  urgencyMultiplier: number;
  dominantIntent: string;
};

type ShockEvent = {
  id: string;
  tone: "critical" | "warning" | "positive";
  channel: string;
  spike: number;
  intent: string;
  cause: string;
  suggestion: string;
};

type ResolutionIssueTone = "danger" | "warning" | "info";

type ResolutionIssue = {
  id: string;
  title: string;
  intent: string;
  summary: string;
  recommendation: string;
  tone: ResolutionIssueTone;
};

function EmotionShockboard({ bars, events }: { bars: ShockBar[]; events: ShockEvent[] }) {
  const chartData = useMemo(
    () =>
      bars.map((entry) => ({
        ...entry,
        color: entry.sentimentDelta >= 0 ? "rgba(244,63,94,0.85)" : "rgba(34,197,94,0.85)",
      })),
    [bars],
  );

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">⚡ Cross-Channel Emotion Shockboard</h2>
          <p className="text-sm text-gray-300">Detects sudden sentiment & emotion spikes within the last 48 hours.</p>
        </div>
        <Badge className="border-rose-400/40 bg-rose-500/10 text-rose-100">Emotion Alerts</Badge>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl border border-white/15 bg-[rgba(26,26,26,0.6)] p-6 pb-8">
          <div className="flex items-start justify-between text-xs uppercase tracking-wide text-gray-400">
            <span>Channel Emotion Shock Score</span>
            <span>Higher = larger sentiment spike with urgency</span>
          </div>
          <div className="mt-2 h-90">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#d1d5db", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: "#d1d5db", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
                  tickLine={false}
                  padding={{ top: 0, bottom: 0 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.3)",
                    color: "#e5e7eb",
                    fontSize: "12px",
                    padding: "10px 12px",
                  }}
                  itemStyle={{ color: "#f9fafb" }}
                  formatter={(value, _name, props) => {
                    const datum = props.payload as ShockBar;
                    return [
                      `Shock Score: ${value}`,
                      `Sentiment spike: ${datum.sentimentDelta > 0 ? "+" : ""}${datum.sentimentDelta.toFixed(1)}`,
                      `Intent: ${datum.dominantIntent}`,
                    ];
                  }}
                />
                <Bar dataKey="shockScore" radius={[10, 10, 4, 4]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.channel} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.55)] px-4 py-4 text-sm text-gray-200 shadow-inner transition hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                <span className="font-semibold text-gray-300">
                  {event.tone === "critical" ? "🔴 Shock" : event.tone === "warning" ? "🟠 Surge" : "🟢 Cooling"}
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-[rgba(26,26,26,0.55)] px-2 py-0.5 text-[10px] text-gray-300">
                  #{index + 1}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold text-white">
                  {event.channel} → {event.spike > 0 ? "+" : ""}
                  {event.spike.toFixed(1)} shift
                </p>
                <p className="text-xs text-gray-300">
                  Triggered Intent: <span className="font-semibold text-indigo-200">{event.intent}</span>
                </p>
                <p className="text-xs text-gray-400">{event.cause}</p>
                <p className="text-xs text-purple-300">✨ {event.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ResolutionIntegrityMonitor({
  score,
  delta,
  issues,
}: {
  score: number;
  delta: number;
  issues: ResolutionIssue[];
}) {
  const scoreRotation = (Math.max(0, Math.min(score, 100)) / 100) * 360;
  const deltaColor = delta >= 0 ? "text-emerald-300" : "text-rose-300";
  const deltaLabel = delta >= 0 ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`;
  const issueToneClasses: Record<ResolutionIssueTone, string> = {
    danger: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    info: "border-indigo-400/30 bg-indigo-500/10 text-indigo-100",
  };

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-lg shadow-emerald-500/10 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">🛡️ Cross-Channel Resolution Integrity Monitor</h2>
          <p className="text-sm text-gray-300">Flags contradictory resolutions, loops, and accountability mismatches across channels.</p>
        </div>
        <Badge className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">Resolution QA</Badge>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1.55fr)]">
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.6)] p-6">
          <div className="relative h-36 w-36">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#34d399 ${scoreRotation}deg, rgba(148,163,184,0.15) ${scoreRotation}deg)`,
              }}
            />
            <div className="absolute inset-3 rounded-full bg-[rgba(12,12,12,0.85)] backdrop-blur-sm" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-sm text-gray-300">
              <span className="text-[11px] uppercase tracking-wide text-gray-400">Integrity Score</span>
              <span className="text-3xl font-semibold text-white">{score}</span>
              <span className={`text-[11px] font-medium uppercase tracking-wide ${deltaColor}`}>{deltaLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.55)] p-5 text-sm text-gray-200 shadow-inner"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                <span className={`rounded-full px-2 py-0.5 ${issueToneClasses[issue.tone]}`}>{issue.title}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-gray-300">
                  Intent: {issue.intent}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-200">{issue.summary}</p>
              <p className="mt-2 text-xs text-purple-300">✨ {issue.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function IntentIntelligenceSection({
  clusters: _clusters,
  severityMatrix: _severityMatrix,
  selectedIntentId: _selectedIntentId,
  onIntentSelect: _onIntentSelect,
}: IntentIntelligenceSectionProps) {
  return (
    <div className="space-y-6">
      <EmotionShockboard bars={emotionShockBars} events={emotionShockEvents} />
      <ResolutionIntegrityMonitor
        score={resolutionIntegrityScore.score}
        delta={resolutionIntegrityScore.delta}
        issues={resolutionIntegrityIssues}
      />
    </div>
  );
}

const emotionShockBars: ShockBar[] = [
  {
    channel: "voice",
    label: "Voice",
    sentimentDelta: 2.1,
    shockScore: 82,
    urgencyMultiplier: 0.9,
    dominantIntent: "Mortgage Rate Lock",
  },
  {
    channel: "social",
    label: "Social",
    sentimentDelta: 2.6,
    shockScore: 91,
    urgencyMultiplier: 0.94,
    dominantIntent: "Credit Card Dispute",
  },
  {
    channel: "chat",
    label: "Chat",
    sentimentDelta: -1.8,
    shockScore: 48,
    urgencyMultiplier: 0.72,
    dominantIntent: "Account Access Reset",
  },
  {
    channel: "email",
    label: "Email",
    sentimentDelta: 1.2,
    shockScore: 55,
    urgencyMultiplier: 0.64,
    dominantIntent: "Billing Clarification",
  },
  {
    channel: "ticket",
    label: "Ticket",
    sentimentDelta: 0.8,
    shockScore: 37,
    urgencyMultiplier: 0.58,
    dominantIntent: "Loyalty Rewards",
  },
];

const emotionShockEvents: ShockEvent[] = [
  {
    id: "shock-critical-social",
    tone: "critical",
    channel: "Social",
    spike: 2.6,
    intent: "Credit Card Dispute",
    cause: "Multiple public complaints referencing delayed chargebacks within 30 minutes.",
    suggestion: "Launch proactive clarification thread and inbox follow-up acknowledging delays.",
  },
  {
    id: "shock-warning-voice",
    tone: "warning",
    channel: "Voice",
    spike: 1.9,
    intent: "Mortgage Rate Lock",
    cause: "Underwriting delays surfaced but agents lacked updated SLA guidance.",
    suggestion: "Push real-time underwriting ETA alert to voice routing & agent assist.",
  },
  {
    id: "shock-positive-chat",
    tone: "positive",
    channel: "Chat",
    spike: -1.8,
    intent: "Account Access Reset",
    cause: "Automated reset flow reduced backlog and anger sentiment in the last hour.",
    suggestion: "Extend self-service reset workflow to email & ticket surfaces automatically.",
  },
];

const resolutionIntegrityScore = {
  score: 62,
  delta: -8,
};

const resolutionIntegrityIssues: ResolutionIssue[] = [
  {
    id: "issue-conflict",
    title: "Conflicting Resolution Messages",
    intent: "Debit Card Replacement",
    summary:
      "Chat confirms card dispatched, Ticket shows pending fraud review, Voice requests resend after verification failure.",
    recommendation: "Sync fraud verification workflow across CRM before allowing channel-specific closure updates.",
    tone: "danger",
  },
  {
    id: "issue-loop",
    title: "Repeated Resolution Loops",
    intent: "Mortgage Rate Lock",
    summary: "Closed → Reopened → Closed → Reopened sequence detected three times this week.",
    recommendation: "Freeze closure until underwriting pipeline clears backlog; alert compliance QA automatically.",
    tone: "warning",
  },
  {
    id: "issue-dependency",
    title: "Action Dependency Mismatch",
    intent: "Account Access Reset",
    summary: "Email flagged customer pending, Voice shows company pending, Ticket already closed.",
    recommendation: "Unify responsibility assignment and auto-reopen channels when conflicting dependencies exist.",
    tone: "info",
  },
];

