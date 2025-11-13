"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface IntentLifecycleFunnelProps {
  data: { stage: string; count: number }[];
}

export function IntentLifecycleFunnel({ data }: IntentLifecycleFunnelProps) {
  return (
    <Card className="border border-[var(--border)] bg-[var(--card)] p-6 space-y-3 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
      <h3 className="text-lg font-semibold text-white">Intent Lifecycle Funnel</h3>
      <p className="text-sm text-muted-foreground">
        Friction journey showing attrition between stages. Connect to conversational metadata to display live counts.
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="stage" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 24, 39, 0.95)",
                border: "1px solid rgba(185, 10, 189, 0.4)",
                borderRadius: "12px",
                color: "#f3f4f6",
              }}
            />
            <Area type="monotone" dataKey="count" stroke="#c084fc" fill="url(#funnelGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
