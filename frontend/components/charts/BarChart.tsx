'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  color?: string;
  className?: string;
}

export default function BarChart({ 
  data, 
  title, 
  color = '#b90abd',
  className = '' 
}: BarChartProps) {
  return (
    <div className={`bg-[#010101] border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 hover:shadow-[#b90abd]/30 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#b90abd] rounded-full animate-pulse"></div>
          <span className="text-[#939394] text-sm">Distribution</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              {/* Enhanced gradient for equalizer-style bars */}
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b90abd" stopOpacity={1}/>
                <stop offset="30%" stopColor="#c73acd" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#d54add" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#e35aed" stopOpacity={0.85}/>
              </linearGradient>
              
            </defs>
            
            {/* Grid */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(147, 147, 148, 0.1)" 
              strokeWidth={1}
            />
            
            {/* X Axis */}
            <XAxis 
              dataKey="name" 
              stroke="#939394" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#939394' }}
            />
            
            {/* Y Axis */}
            <YAxis 
              stroke="#939394" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#939394' }}
            />
            
            {/* Tooltip */}
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(1, 1, 1, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(185, 10, 189, 0.4)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(185, 10, 189, 0.3)'
              }} 
            />
            
            {/* Bars with equalizer-style design */}
            <Bar 
              dataKey="value" 
              fill="url(#barGradient)"
              radius={[6, 6, 6, 6]}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
        
      </div>
    </div>
  );
}
