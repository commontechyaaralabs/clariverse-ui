'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  className?: string;
  showArea?: boolean;
}

export default function LineChart({ 
  data, 
  title, 
  color = '#b90abd',
  className = '',
  showArea = false
}: LineChartProps) {
  return (
    <div className={`bg-[#010101] border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 hover:shadow-[#b90abd]/30 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-[#939394] text-sm">Live Data</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#939394" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#939394" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                background: 'rgba(1, 1, 1, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(185, 10, 189, 0.4)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(185, 10, 189, 0.3)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fill={`url(#gradient-${color})`}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: color, strokeWidth: 3, fill: '#ffffff' }}
              />
            </AreaChart>
          ) : (
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#939394" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#939394" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                background: 'rgba(1, 1, 1, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(185, 10, 189, 0.4)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(185, 10, 189, 0.3)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: color, strokeWidth: 3, fill: '#ffffff' }}
              />
            </RechartsLineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
