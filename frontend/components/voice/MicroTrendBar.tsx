'use client';

import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';

interface TrendData {
  day: number;
  value: number;
}

interface MicroTrendBarProps {
  trends: {
    qaTrend: TrendData[];
    complianceTrend: TrendData[];
    emotionTrend: TrendData[];
    fraudTrend: TrendData[];
    escalationTrend: TrendData[];
    coachingTrend: TrendData[];
  };
}

export function MicroTrendBar({ trends }: MicroTrendBarProps) {
  const trendConfigs = [
    { key: 'qaTrend', label: 'QA', color: '#b90abd' },
    { key: 'complianceTrend', label: 'Compliance', color: '#5332ff' },
    { key: 'emotionTrend', label: 'Emotion', color: '#10b981' },
    { key: 'fraudTrend', label: 'Fraud', color: '#ef4444' },
    { key: 'escalationTrend', label: 'Escalation', color: '#f97316' },
    { key: 'coachingTrend', label: 'Coaching', color: '#06b6d4' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-app-black/90 border-t border-white/10 z-30">
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-6 gap-2 h-full items-center">
          {trendConfigs.map((config) => {
            const data = trends[config.key as keyof typeof trends] as TrendData[];
            return (
              <div key={config.key} className="h-full flex flex-col items-center justify-center py-1">
                <div className="text-xs text-muted-foreground mb-0.5">{config.label}</div>
                <div className="w-full h-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={config.color}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

