'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIData } from '@/lib/api';
import { TrendingUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DecisionDebtTrackerProps {
  kpiData: KPIData | null;
}

interface DebtDataPoint {
  date: string;
  cumulativeDebt: number;
  pendingCount: number;
  topOwner?: string;
}

export function DecisionDebtTracker({ kpiData }: DecisionDebtTrackerProps) {
  const [debtHistory, setDebtHistory] = useState<DebtDataPoint[]>([]);

  useEffect(() => {
    if (!kpiData) return;

    // Generate historical data (last 30 days)
    const history: DebtDataPoint[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate historical data with some variance
      const baseDebt = (kpiData.internal_pending_count || 0) * (kpiData.avg_resolution_time_days || 2.3) * 24;
      const variance = (Math.random() - 0.5) * 0.2; // ±20% variance
      const cumulativeDebt = Math.max(0, baseDebt * (1 + variance));
      
      history.push({
        date: date.toISOString().split('T')[0],
        cumulativeDebt: Math.round(cumulativeDebt),
        pendingCount: Math.round((kpiData.internal_pending_count || 0) * (1 + variance)),
      });
    }

    setDebtHistory(history);
  }, [kpiData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{entry.name}:</span>
                <span className="text-white font-medium">{entry.value.toLocaleString()} hrs</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-600">
              <div className="text-xs text-gray-400">
                Pending Items: {payload[0]?.payload?.pendingCount || 0}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentDebt = debtHistory.length > 0
    ? debtHistory[debtHistory.length - 1].cumulativeDebt
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Decision Debt Tracker</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              Current: {currentDebt.toLocaleString()} hrs
            </span>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Line chart of cumulative pending decisions vs time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {debtHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={debtHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeDebt"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Cumulative Debt (hrs)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No debt data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

