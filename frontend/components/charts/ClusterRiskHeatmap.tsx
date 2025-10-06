'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterRiskHeatmapData } from '@/lib/api';

interface ClusterRiskHeatmapProps {
  data: ClusterRiskHeatmapData[];
}

export function ClusterRiskHeatmap({ data }: ClusterRiskHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<ClusterRiskHeatmapData | null>(null);

  // Group data by cluster
  const clusterGroups = data.reduce((acc, item) => {
    if (!acc[item.cluster]) {
      acc[item.cluster] = [];
    }
    acc[item.cluster].push(item);
    return acc;
  }, {} as Record<string, ClusterRiskHeatmapData[]>);

  const clusters = Object.keys(clusterGroups);
  const maxRiskScore = Math.max(...data.map(d => d.risk_score));

  const getRiskColor = (riskScore: number) => {
    const intensity = riskScore / maxRiskScore;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getRiskTextColor = (riskScore: number) => {
    const intensity = riskScore / maxRiskScore;
    return intensity > 0.4 ? 'text-white' : 'text-gray-900';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Cluster Risk Heatmap</CardTitle>
        <CardDescription className="text-gray-400">
          Risk distribution across clusters and subclusters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Risk Level:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-gray-300">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-gray-300">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-gray-300">Critical</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid gap-2">
            {clusters.map(cluster => (
              <div key={cluster} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">{cluster}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {clusterGroups[cluster].map((item, index) => (
                    <div
                      key={`${item.cluster}-${item.subcluster}`}
                      className={`
                        relative p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${getRiskColor(item.risk_score)}
                        hover:scale-105 hover:shadow-lg
                      `}
                      onMouseEnter={() => setHoveredCell(item)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={`text-xs font-medium ${getRiskTextColor(item.risk_score)}`}>
                        {item.subcluster}
                      </div>
                      <div className={`text-xs ${getRiskTextColor(item.risk_score)} opacity-80`}>
                        {item.thread_count} threads
                      </div>
                      <div className={`text-xs font-bold ${getRiskTextColor(item.risk_score)}`}>
                        {Math.round(item.risk_score)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Hover Tooltip */}
          {hoveredCell && (
            <div className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl max-w-sm">
              <h4 className="font-medium text-white mb-2">{hoveredCell.subcluster}</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <div>Risk Score: <span className="text-red-400 font-medium">{Math.round(hoveredCell.risk_score)}%</span></div>
                <div>Thread Count: <span className="text-blue-400 font-medium">{hoveredCell.thread_count}</span></div>
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Top Threads:</div>
                  {hoveredCell.top_threads.map((thread, index) => (
                    <div key={thread.thread_id} className="text-xs text-gray-300">
                      {thread.subject_norm} ({Math.round(thread.risk_score)}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

