"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowUpCalendar } from "./FollowUpCalendar";

interface ActionItem {
  id: string;
  intentId: string;
  title: string;
  impact: string;
  dueAt: string;
  owner: string;
  status: "pending" | "in-progress" | "completed";
}

interface RootCauseInsight {
  id: string;
  intentId: string;
  summary: string;
  evidence: string;
}

interface FollowUpRecord {
  id: string;
  title: string;
  dueDate: string;
  severity: string;
}

interface HeatmapData {
  critical: { negative: number; neutral: number; positive: number };
  high: { negative: number; neutral: number; positive: number };
  medium: { negative: number; neutral: number; positive: number };
  low: { negative: number; neutral: number; positive: number };
}

interface ActionabilitySectionProps {
  actions: ActionItem[];
  rootCauses: RootCauseInsight[];
  rootCauseExplanations?: Record<string, string>;
  followUps: FollowUpRecord[];
  heatmapData: HeatmapData;
  onUpdateAction: (id: string, status: ActionItem["status"]) => void;
  onSelectFollowUp: (id: string) => void;
  onSelectHeatCell: (urgency: string, sentiment: string) => void;
}

const statusLabels: Record<ActionItem["status"], string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export function ActionabilitySection({
  actions,
  rootCauses,
  rootCauseExplanations = {},
  followUps,
  heatmapData,
  onUpdateAction,
  onSelectFollowUp,
  onSelectHeatCell,
}: ActionabilitySectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Actionability & Workflow</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Next-Best-Action Queue</h3>
              <p className="text-sm text-muted-foreground">
                Actions prioritized by AI severity, impact, and SLA risk.
              </p>
            </div>
            <Badge variant="outline" className="border-purple-400/40 text-purple-200">
              {actions.length} items
            </Badge>
          </div>
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg border border-[color:var(--border)] bg-[rgba(26,26,26,0.65)] p-4 transition-all hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">{action.title}</h4>
                    <p className="text-xs text-gray-500">Due {action.dueAt} • Owner {action.owner}</p>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                    {action.impact}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={action.status === "completed" ? "default" : "secondary"}
                    className={`text-[10px] uppercase tracking-wide ${
                      action.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {statusLabels[action.status]}
                  </Badge>
                  {action.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-purple-200 hover:text-white"
                      onClick={() => onUpdateAction(action.id, "completed")}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {action.status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-blue-200 hover:text-white"
                      onClick={() => onUpdateAction(action.id, "in-progress")}
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {actions.length === 0 && (
              <p className="text-sm text-muted-foreground">No actions available. Connect data sources to populate.</p>
            )}
          </div>
        </Card>

        <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
          <div>
            <h3 className="text-lg font-semibold text-white">Root Cause Insights</h3>
            <p className="text-sm text-muted-foreground">
              LLM-generated explanations combining semantic patterns with metadata anomalies.
            </p>
          </div>
          <div className="space-y-3">
            {rootCauses.map((insight) => (
              <div key={insight.id} className="rounded-lg border border-[color:var(--border)] bg-[rgba(26,26,26,0.65)] p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-100">{insight.summary}</p>
                <p className="text-xs text-gray-400">Evidence: {insight.evidence}</p>
                <p className="text-xs italic text-purple-200/90">
                  {rootCauseExplanations[insight.id] ?? "LLM explanation pending."}
                </p>
              </div>
            ))}
            {rootCauses.length === 0 && (
              <p className="text-sm text-muted-foreground">Connect LLM pipeline to surface explanations.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FollowUpCalendar followUps={followUps} onSelect={onSelectFollowUp} />

        <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
          <h3 className="text-lg font-semibold text-white">Urgency vs Sentiment Heat Grid</h3>
          <p className="text-sm text-muted-foreground">
            Click tiles to drill into the cluster list filtered by urgency and sentiment band.
          </p>
          <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-300">
            <span />
            <span className="uppercase tracking-wide text-gray-400">Negative</span>
            <span className="uppercase tracking-wide text-gray-400">Neutral</span>
            <span className="uppercase tracking-wide text-gray-400">Positive</span>

            {Object.entries(heatmapData).map(([urgency, sentimentBuckets]) => (
              <div key={urgency} className="contents">
                <span className="font-medium text-gray-400 capitalize">
                  {urgency}
                </span>
                {Object.entries(sentimentBuckets).map(([sentiment, value]) => {
                  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                  return (
                    <HeatCell
                      key={`${urgency}-${sentiment}`}
                      label={sentiment}
                      value={numericValue}
                      onClick={() => onSelectHeatCell(urgency, sentiment)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

interface HeatCellProps {
  label: string;
  value: number;
  onClick: () => void;
}

function HeatCell({ label, value, onClick }: HeatCellProps) {
  const intensity = Math.min(1, value / 50);
  const background = `rgba(168, 85, 247, ${0.1 + intensity * 0.4})`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-[color:var(--border)] bg-[rgba(26,26,26,0.65)] px-3 py-4 flex flex-col items-center justify-center gap-1 transition-all hover:border-[#b90abd]/40 hover:bg-[color:var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b90abd]"
      style={{ background }}
    >
      <span className="text-gray-500 text-[10px] uppercase">{label}</span>
      <span className="text-sm font-semibold text-gray-200">{value}</span>
    </button>
  );
}
