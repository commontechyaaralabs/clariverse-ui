"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendExplorerChart } from "./TrendExplorerChart";

interface TrendSeries {
  id: string;
  label: string;
  values: { date: string; value: number }[];
}

interface ChannelFlowLink {
  from: string;
  to: string;
  value: number;
}

interface DeepAnalysisSectionProps {
  trendData: TrendSeries[];
  channelFlow: ChannelFlowLink[];
  onOpenIntentDeepDive: () => void;
  onOpenConversationViewer: () => void;
}

export function DeepAnalysisSection({ trendData, channelFlow, onOpenIntentDeepDive, onOpenConversationViewer }: DeepAnalysisSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Deep Analysis Layer</h2>

      <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Intent Deep Dive Modal</h3>
            <p className="text-sm text-muted-foreground">
              Access AI summaries, subclusters, metadata patterns, recommended actions, and forecasts for the selected intent.
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-purple-400/40 text-purple-200" onClick={onOpenIntentDeepDive}>
            Launch Preview
          </Button>
        </div>
        <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[rgba(26,26,26,0.45)] p-6 text-sm text-gray-400">
          TODO: Wire this button to the Intent deep-dive modal once the scaffold is complete.
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TrendExplorerChart series={trendData} />

        <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
          <h3 className="text-lg font-semibold text-white">Channel Flow Diagram</h3>
          <p className="text-sm text-muted-foreground">
            Sankey-style visualization showing how interactions move between channels and escalation pathways.
          </p>
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[rgba(26,26,26,0.45)] p-4 text-xs text-gray-300 space-y-2">
            {channelFlow.map((link) => (
              <div key={`${link.from}-${link.to}`} className="flex items-center justify-between">
                <span className="text-gray-400">
                  {link.from} → {link.to}
                </span>
                <span className="text-gray-200">{link.value}</span>
              </div>
            ))}
            {channelFlow.length === 0 && <p>No channel transitions detected.</p>}
          </div>
        </Card>
      </div>

      <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
        <h3 className="text-lg font-semibold text-white mb-3">Conversation Viewer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Launch the augmented transcript viewer with intent highlights, sentiment markers, metadata tags, and AI-generated next action suggestions.
        </p>
        <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[rgba(26,26,26,0.45)] p-6 text-sm text-gray-400">
          TODO: Integrate the conversation viewer component.
          <div className="mt-4">
            <Button size="sm" variant="secondary" onClick={onOpenConversationViewer}>
              Open Conversation Viewer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
