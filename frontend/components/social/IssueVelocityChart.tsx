'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { IssueVelocityData } from '@/lib/api';

interface IssueVelocityChartProps {
  data: IssueVelocityData[];
}

export function IssueVelocityChart({ data }: IssueVelocityChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    'Critical Issues': item.criticalIssues,
    'All Issues': item.allIssues,
    'Resolved Issues': item.resolvedIssues,
    'Backlog Gap': item.allIssues - item.resolvedIssues,
    annotations: item.annotations,
  }));

  // Calculate total statistics
  const totalCritical = data.reduce((sum, d) => sum + d.criticalIssues, 0);
  const totalAll = data.reduce((sum, d) => sum + d.allIssues, 0);
  const totalResolved = data.reduce((sum, d) => sum + d.resolvedIssues, 0);
  const avgGap = (totalAll - totalResolved) / data.length;

  // Find today's date for highlighting
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="text-2xl font-bold text-red-400">{totalCritical}</div>
          <div className="text-xs text-gray-400">Critical Issues</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{totalAll}</div>
          <div className="text-xs text-gray-400">All Issues</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{totalResolved}</div>
          <div className="text-xs text-gray-400">Resolved</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-400">{Math.round(avgGap)}</div>
          <div className="text-xs text-gray-400">Avg Backlog Gap</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="allGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#939394" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#939394" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="Critical Issues" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="All Issues" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Resolved Issues" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
            />
            {/* Reference line for today */}
            {chartData.some(d => d.date === today) && (
              <ReferenceLine 
                x={today} 
                stroke="#a855f7" 
                strokeDasharray="3 3" 
                label={{ value: "Today", position: "top", fill: "#a855f7" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
        <p className="text-sm text-purple-200">
          <strong>Key Insight:</strong> Issue creation is {avgGap > 0 ? 'outpacing' : 'keeping pace with'} resolution by{' '}
          {totalAll > 0 ? ((totalAll / totalResolved) * 100).toFixed(1) : '0'}% - 
          {avgGap > 0 ? ' capacity problem detected' : ' healthy resolution rate'}
        </p>
      </div>
    </div>
  );
}





