"use client";

import {
  ToneDriftWall,
  PrematureClosureAuditWall,
} from "@/components/unified/intelligence/UnifiedIntelligenceWall";
import { EmotionShockboard, ResolutionIntegrityMonitor } from "@/components/unified/intents/IntentIntelligenceSection";

export default function ChannelAnalysisPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b90abd]">Channel Analysis</p>
        <h1 className="text-3xl font-bold text-white">Cross-Channel Resolution Intelligence</h1>
        <p className="text-sm text-gray-400">
          Monitor tone drift, closure risk, emotion shocks, and resolution integrity across Email, Chat, Ticket, Social, and Voice.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ToneDriftWall />
        <PrematureClosureAuditWall />
      </div>
      <EmotionShockboard />
      <ResolutionIntegrityMonitor />
    </div>
  );
}

