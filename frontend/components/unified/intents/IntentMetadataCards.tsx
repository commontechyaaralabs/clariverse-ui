"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface IntentMetadataCardsProps {
  urgencyProfile: { stage: string; value: number }[];
  priorityMix: { level: string; value: number }[];
  actionPendingSplit: { type: "company" | "customer"; value: number }[];
  sentimentTrajectory: { date: string; value: number }[];
  followUpRisk: { label: string; value: number }[];
}

export function IntentMetadataCards({
  urgencyProfile,
  priorityMix,
  actionPendingSplit,
  sentimentTrajectory,
  followUpRisk,
}: IntentMetadataCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="border border-[var(--border)] bg-[var(--card)] p-4 space-y-2 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
        <MetadataHeader title="Urgency Profile" subtitle="Distribution across response windows" />
        <div className="space-y-2 text-xs text-gray-300">
          {urgencyProfile.map((item) => (
            <div key={item.stage} className="flex items-center justify-between">
              <span>{item.stage}</span>
              <Badge variant="outline" className="border-gray-600 text-gray-200">
                {item.value}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
        <MetadataHeader title="Priority Mix" subtitle="Current workload composition" />
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityMix}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="level" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, Math.max(...priorityMix.map((p) => p.value)) + 10]} />
              <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Tooltip content={<ChartTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
        <MetadataHeader title="Action Pending" subtitle="Ownership split" />
        <div className="space-y-2 text-sm text-gray-200">
          {actionPendingSplit.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <span className="capitalize">{item.type}</span>
              <span className="text-gray-300 font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
        <MetadataHeader title="Sentiment Trajectory" subtitle="Past 7 days" />
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentTrajectory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border border-[var(--border)] bg-[var(--card)] p-4 space-y-2 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
        <MetadataHeader title="Follow-up Risk" subtitle="AI predicted escalation types" />
        <div className="space-y-2 text-xs text-gray-300">
          {followUpRisk.map((item) => (
            <div key={item.label} className="flex flex-col">
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="text-gray-200 font-semibold">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(26,26,26,0.55)] overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetadataHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{subtitle}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-purple-400/40 bg-[var(--background)] px-3 py-2 text-xs text-gray-200">
      <p className="font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="capitalize">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}
