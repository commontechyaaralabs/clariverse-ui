'use client';

import { useState } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface GlowingLineChartProps {
  data: ChartDataPoint[];
  title: string;
  className?: string;
  timePeriods?: { label: string; value: string }[];
  onTimePeriodChange?: (period: string) => void;
}

export default function GlowingLineChart({ 
  data, 
  title, 
  className = '',
  timePeriods = [
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '1w' },
    { label: '1 Month', value: '1m' }
  ],
  onTimePeriodChange
}: GlowingLineChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1m');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onTimePeriodChange?.(period);
  };

  return (
    <div className={`bg-[#010101] border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        
        {/* Time Period Selector */}
        <div className="flex items-center space-x-2">
          {timePeriods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period.value
                  ? 'bg-[#b90abd] text-white shadow-lg shadow-[#b90abd]/30'
                  : 'bg-[#5332ff]/20 text-[#939394] hover:bg-[#5332ff]/30 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {/* Glowing gradient definition with custom palette */}
              <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b90abd" stopOpacity={0.8}/>
                <stop offset="25%" stopColor="#c73acd" stopOpacity={0.7}/>
                <stop offset="50%" stopColor="#5332ff" stopOpacity={0.6}/>
                <stop offset="75%" stopColor="#6b4aff" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#939394" stopOpacity={0.8}/>
              </linearGradient>
              
              {/* Area fill gradient */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b90abd" stopOpacity={0.3}/>
                <stop offset="25%" stopColor="#c73acd" stopOpacity={0.2}/>
                <stop offset="50%" stopColor="#5332ff" stopOpacity={0.15}/>
                <stop offset="75%" stopColor="#6b4aff" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#939394" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth={1}
            />
            
            <XAxis 
              dataKey="date" 
              stroke="#939394" 
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (selectedPeriod === '1d') {
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                } else if (selectedPeriod === '1w') {
                  return date.toLocaleDateString('en-US', { weekday: 'short' });
                } else {
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
              }}
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
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(185, 10, 189, 0.3)'
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Sentiment']}
            />
            
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="url(#glowGradient)"
              fill="url(#areaGradient)"
              strokeWidth={3}
              dot={{ 
                fill: '#ffffff', 
                strokeWidth: 2, 
                r: 4,
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#ffffff', 
                strokeWidth: 3, 
                fill: '#8b5cf6',
                filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}
