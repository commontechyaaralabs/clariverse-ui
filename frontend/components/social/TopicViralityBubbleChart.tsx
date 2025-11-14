import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type TopicViralityPoint = {
  name: string;
  helpfulVotes: number;
  viralityScore: number;
  totalPosts: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
};

interface TopicViralityBubbleChartProps {
  data: TopicViralityPoint[];
  height?: number;
}

const ViralityTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point: TopicViralityPoint = payload[0].payload;

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-200 shadow-lg">
      <div className="font-semibold text-white">{point.name}</div>
      <div className="mt-1 space-y-1">
        <div>
          <span className="text-gray-400">Helpful votes:</span>
          <span className="ml-2 text-white">{point.helpfulVotes.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Virality score:</span>
          <span className="ml-2 text-white">{point.viralityScore.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Total posts:</span>
          <span className="ml-2 text-white">{point.totalPosts.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-2 border-t border-gray-700 pt-2">
        <div className="text-gray-400">Sentiment mix</div>
        <div className="mt-1 flex gap-3 text-[11px]">
          <span className="text-emerald-400">{point.positivePct.toFixed(1)}% +</span>
          <span className="text-gray-300">{point.neutralPct.toFixed(1)}% ·</span>
          <span className="text-red-400">{point.negativePct.toFixed(1)}% −</span>
        </div>
      </div>
    </div>
  );
};

const TopicViralityBubbleChart: React.FC<TopicViralityBubbleChartProps> = ({ data, height }) => {
  const maxHelpfulVotes = data.reduce((max, topic) => Math.max(max, topic.helpfulVotes), 0);
  const helpfulDomain = maxHelpfulVotes > 0 ? Math.ceil(maxHelpfulVotes * 1.02) : 10;

  return (
    <ResponsiveContainer width="100%" height={height ?? 360}>
      <ScatterChart margin={{ top: 20, right: 12, bottom: 20, left: 60 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="helpfulVotes"
          name="Helpful votes"
          stroke="#9CA3AF"
          tickFormatter={(value: number) => value.toLocaleString()}
          domain={[0, helpfulDomain]}
          label={{ value: 'Helpful votes', position: 'insideBottomRight', offset: -10, fill: '#9CA3AF' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          name="Topic"
          stroke="#9CA3AF"
          width={200}
          tick={{ fontSize: 12 }}
        />
        <ZAxis type="number" dataKey="viralityScore" range={[80, 360]} />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }} content={<ViralityTooltip />} />
        <Scatter data={data} fill="#3b82f6" fillOpacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default TopicViralityBubbleChart;

