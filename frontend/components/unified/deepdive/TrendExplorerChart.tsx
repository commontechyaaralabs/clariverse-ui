"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TrendExplorerChartProps {
  series: { id: string; label: string; values: { date: string; value: number }[] }[];
}

const palette = ["#60a5fa", "#f97316", "#22d3ee", "#f472b6", "#34d399"];

export function TrendExplorerChart({ series }: TrendExplorerChartProps) {
  const [activeIds, setActiveIds] = useState<string[]>(series.slice(0, 2).map((s) => s.id));
  const data = series[0]?.values.map((_, idx) => {
    const point: Record<string, number | string> = { date: series[0].values[idx].date };
    series.forEach((s) => {
      point[s.id] = s.values[idx]?.value ?? 0;
    });
    return point;
  });

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Trend Explorer</h3>
        <div className="flex flex-wrap gap-2">
          {series.map((s, idx) => {
            const active = activeIds.includes(s.id);
            return (
              <Button
                key={s.id}
                size="sm"
                variant={active ? "default" : "outline"}
                className={active ? "bg-purple-500 text-white" : "border-gray-600 text-gray-300"}
                onClick={() =>
                  setActiveIds((prev) =>
                    prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                  )
                }
              >
                {s.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => new Date(value as string).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(17,24,39,0.95)",
                border: "1px solid rgba(185, 10, 189, 0.4)",
                borderRadius: "12px",
                color: "#f3f4f6",
              }}
            />
            {series.map((s, idx) =>
              activeIds.includes(s.id) ? (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
