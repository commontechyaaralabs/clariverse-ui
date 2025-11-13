"use client";

import { Card } from "@/components/ui/card";

interface GaugeInsightsPanelProps {
  data: {
    urgencyIndex: number;
    slaRisk: number;
    pendingFromCompany: number;
  };
  insights?: {
    urgencyIndex?: string;
    slaRisk?: string;
    pendingFromCompany?: string;
  };
  className?: string;
}

const cards = [
  { label: "Urgency Index", key: "urgencyIndex" as const, accent: "text-amber-300" },
  { label: "SLA Risk", key: "slaRisk" as const, accent: "text-rose-300" },
  { label: "Pending From Company", key: "pendingFromCompany" as const, accent: "text-sky-300" },
];

export function GaugeInsightsPanel({ data, insights = {}, className = "" }: GaugeInsightsPanelProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {cards.map((card) => {
        const value = data[card.key] * 100;
        return (
          <Card key={card.key} className="border border-[var(--border)] bg-[var(--card)] px-9 py-7.5 space-y-1 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-100">{card.label}</span>
              <span className={`text-[20px] uppercase tracking-wide ${card.accent}`}>{value.toFixed(0)}%</span>
            </div>
            <div className="rounded border border-[var(--border)] bg-[rgba(26,26,26,0.55)] py-1 text-center">
              <span className="text-base font-semibold text-white">{value.toFixed(1)}%</span>
            </div>
            {insights[card.key] && (
              <p className="text-[11px] text-gray-400 leading-snug">{insights[card.key]}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
