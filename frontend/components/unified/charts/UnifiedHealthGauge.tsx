"use client";

import GaugeChart from "@/components/charts/GaugeChart";
import { Card } from "@/components/ui/card";

interface UnifiedHealthGaugeProps {
  data: {
    sentimentScore: number;
    urgencyIndex: number;
    slaRisk: number;
    pendingFromCompany: number;
  };
  insights?: {
    overall?: string;
    urgencyIndex?: string;
    slaRisk?: string;
    pendingFromCompany?: string;
  };
}

export function UnifiedHealthGauge({ data, insights = {} }: UnifiedHealthGaugeProps) {
  const { sentimentScore } = data;
  const gaugeData = [
    {
      name: "Overall Health",
      value: sentimentScore,
      percentage: Math.min(100, Math.max(0, sentimentScore)),
      color: "#b90abd",
    },
  ];

  return (
      <div className="w-half max-w-sm p-2 py-0">
        <GaugeChart data={gaugeData} title="Unified Health Gauge" />
      </div>
  );
}
