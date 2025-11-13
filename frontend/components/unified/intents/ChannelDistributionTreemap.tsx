"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, Treemap } from "recharts";

interface ChannelDistributionTreemapProps {
  data: { name: string; value: number }[];
}

export function ChannelDistributionTreemap({ data }: ChannelDistributionTreemapProps) {
  return (
    <Card className="border border-[var(--border)] bg-[var(--card)] p-6 space-y-3 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[var(--background)]">
      <h3 className="text-lg font-semibold text-white">Channel Distribution Treemap</h3>
      <p className="text-sm text-muted-foreground">
        Visualizes how the selected intent manifests across channels. Size denotes volume share.
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            nameKey="name"
            stroke="#1f2937"
            fill="#6366f1"
            content={(props) => <TreemapNode {...props} />}
          />
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TreemapNode(props: any) {
  const { x, y, width, height, name, value, depth } = props;
  if (!width || !height) return null;
  const colors = ["#6366f1", "#22d3ee", "#f97316", "#ec4899", "#10b981"];
  const fill = colors[depth % colors.length];

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill, opacity: 0.8, stroke: "#0f172a" }} />
      {width > 40 && height > 20 && (
        <text x={x + 4} y={y + 16} fill="#f8fafc" fontSize={12} fontWeight={600} pointerEvents="none">
          {name}
        </text>
      )}
      {width > 40 && height > 36 && (
        <text x={x + 4} y={y + 32} fill="#e2e8f0" fontSize={10} pointerEvents="none">
          {value}%
        </text>
      )}
    </g>
  );
}
