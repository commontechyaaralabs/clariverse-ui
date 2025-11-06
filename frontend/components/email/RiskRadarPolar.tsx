'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EisenhowerThread } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface RiskRadarPolarProps {
  threads: EisenhowerThread[];
}

interface RiskDataPoint {
  topic: string;
  valueAtRisk: number;
  escalationProbability: number;
  radius: number; // Normalized for display
}

export function RiskRadarPolar({ threads }: RiskRadarPolarProps) {
  const riskData = useMemo(() => {
    // Group threads by topic/cluster
    const topicMap = new Map<string, {
      threads: EisenhowerThread[];
      totalValue: number;
      escalationCount: number;
    }>();

    threads.forEach((thread) => {
      const topic = thread.dominant_cluster_name || 'Unknown';
      const existing = topicMap.get(topic) || { threads: [], totalValue: 0, escalationCount: 0 };

      // Calculate value at risk (business impact × priority weight)
      const priorityWeights: Record<string, number> = {
        P1: 100,
        P2: 75,
        P3: 50,
        P4: 25,
        P5: 10,
      };
      const value = (thread.business_impact_score || 50) * (priorityWeights[thread.priority] || 50) / 100;

      existing.threads.push(thread);
      existing.totalValue += value;
      existing.escalationCount += thread.escalation_count || 0;

      topicMap.set(topic, existing);
    });

    // Convert to array and calculate metrics
    const dataPoints: RiskDataPoint[] = Array.from(topicMap.entries())
      .map(([topic, data]) => {
        const valueAtRisk = data.totalValue;
        const escalationProbability = data.threads.length > 0
          ? (data.escalationCount / data.threads.length) * 100
          : 0;

        // Normalize radius (0-100 scale)
        const maxValue = Math.max(...Array.from(topicMap.values()).map((d) => d.totalValue));
        const radius = maxValue > 0 ? Math.min(100, (valueAtRisk / maxValue) * 100) : 0; // Cap at 100

        return {
          topic: topic, // Keep full topic name
          valueAtRisk,
          escalationProbability,
          radius,
        };
      })
      .sort((a, b) => b.radius - a.radius)
      .slice(0, 8); // Top 8 topics

    // Format for RadarChart - ensure all values are within 0-100 range
    return dataPoints.map((point) => ({
      topic: point.topic,
      value: Math.min(100, point.radius), // Ensure value doesn't exceed 100
      escalationProb: Math.min(100, point.escalationProbability), // Cap escalation prob too
      originalValue: point.valueAtRisk,
    }));
  }, [threads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">{data.topic}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Value at Risk:</span>
              <span className="text-white font-medium">{data.originalValue.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Escalation Prob:</span>
              <span className={`font-medium ${
                data.escalationProb > 30 ? 'text-red-400' :
                data.escalationProb > 15 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {data.escalationProb.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getColorForEscalation = (escalationProb: number) => {
    if (escalationProb > 30) return '#ef4444'; // red
    if (escalationProb > 15) return '#f97316'; // orange
    if (escalationProb > 5) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Risk Radar</CardTitle>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
            <span className="text-sm">✨</span>
            <span className="text-xs text-purple-300 font-medium">AI Risk Analysis</span>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Polar plot: radius = value at risk, color = escalation probability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value: string) => {
                    // Show full topic name without truncation
                    return value;
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Radar
                  name="Value at Risk"
                  dataKey="value"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Radar
                  name="Escalation Prob"
                  dataKey="escalationProb"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No risk data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

