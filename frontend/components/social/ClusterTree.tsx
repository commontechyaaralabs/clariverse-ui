'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Subcluster {
  subcluster: string;
  threads: number;
  sentiment: number;
  growth: number;
}

interface ClusterTreeData {
  cluster: string;
  subclusters: Subcluster[];
}

interface ClusterTreeProps {
  data: ClusterTreeData[];
}

export function ClusterTree({ data }: ClusterTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleCluster = (cluster: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(cluster)) {
      newExpanded.delete(cluster);
    } else {
      newExpanded.add(cluster);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="space-y-2">
      {data.map((cluster, idx) => {
        const isExpanded = expanded.has(cluster.cluster);
        const totalThreads = cluster.subclusters.reduce((sum, s) => sum + s.threads, 0);
        const avgSentiment = cluster.subclusters.reduce((sum, s) => sum + s.sentiment, 0) / cluster.subclusters.length;
        
        return (
          <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
            <div
              className="p-4 bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => toggleCluster(cluster.cluster)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <h3 className="font-semibold text-white">{cluster.cluster}</h3>
                  <span className="text-xs text-gray-400">({totalThreads} threads)</span>
                </div>
                <span className={`text-xs font-semibold ${
                  avgSentiment > 0 ? 'text-green-400' : avgSentiment < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                </span>
              </div>
            </div>
            
            {isExpanded && (
              <div className="border-t border-gray-700 p-4 space-y-3 bg-gray-900/50">
                {cluster.subclusters.map((subcluster, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">{subcluster.subcluster}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        subcluster.growth > 0.3 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {subcluster.growth > 0 ? '+' : ''}{(subcluster.growth * 100).toFixed(0)}% growth
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Threads: {subcluster.threads}</span>
                      <span className={`${
                        subcluster.sentiment > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {subcluster.sentiment > 0 ? '+' : ''}{subcluster.sentiment.toFixed(2)} sentiment
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

