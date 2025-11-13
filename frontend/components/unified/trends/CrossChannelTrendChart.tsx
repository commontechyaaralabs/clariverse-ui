"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface TrendPoint {
  date: string;
  email: number;
  chat: number;
  ticket: number;
  social: number;
  voice: number;
  sentiment: number;
}

interface CrossChannelTrendChartProps {
  data: TrendPoint[];
}

const channelPalette: { key: keyof TrendPoint; label: string; color: string }[] = [
  { key: "email", label: "Email", color: "#60a5fa" },
  { key: "chat", label: "Chat", color: "#34d399" },
  { key: "ticket", label: "Ticket", color: "#a855f7" },
  { key: "social", label: "Social", color: "#f472b6" },
  { key: "voice", label: "Voice", color: "#f97316" },
];

const SENTIMENT_LABELS: Record<number, string> = {
  1: "Happy",
  2: "Bit Irritated",
  3: "Moderately Concerned",
  4: "Anger",
  5: "Frustrated",
};

function sentimentLabel(value: number) {
  const rounded = Math.round(value);
  return SENTIMENT_LABELS[rounded] ?? `Sentiment ${value.toFixed(1)}`;
}

export function CrossChannelTrendChart({ data }: CrossChannelTrendChartProps) {
  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] px-6.5 py-6.5 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold text-white">Cross-Channel Volume & Sentiment Trend</h2>
        <p className="text-sm text-muted-foreground">
          Stacked interaction volume by channel with sentiment trajectory overlay. Mouse over to view exact values.
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 0 }} barCategoryGap="28%" barGap={4}>
            <defs>
              {channelPalette.map((channel) => (
                <linearGradient key={channel.key} id={`${channel.key}-gradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={channel.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={channel.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#fbbf24"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => sentimentLabel(Number(value))}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 24, 39, 0.95)",
                color: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid rgba(185, 10, 189, 0.4)",
                backdropFilter: "blur(14px)",
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              formatter={(value: number, name: string) =>
                name === "Sentiment"
                  ? [`${value.toFixed(2)} · ${sentimentLabel(value)}`, name]
                  : [value, name]
              }
            />
            <Legend
              wrapperStyle={{ color: "#9ca3af" }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
            />
            {channelPalette.map((channel) => (
              <Bar
                key={channel.key}
                yAxisId="left"
                dataKey={channel.key}
                name={channel.label}
                stackId="volume"
                fill={`url(#${channel.key}-gradient)`}
                barSize={28}
              />
            ))}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sentiment"
              name="Sentiment"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 3, stroke: "#fbbf24", strokeWidth: 2, fill: "#111827" }}
              activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2, fill: "#fde68a" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
