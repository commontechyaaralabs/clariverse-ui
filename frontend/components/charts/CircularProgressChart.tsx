'use client';

import { memo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CircularProgressData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface CircularProgressChartProps {
  data: CircularProgressData[];
  title: string;
  totalValue: number;
  className?: string;
}

const CircularProgressChart = memo(function CircularProgressChart({ 
  data, 
  title, 
  totalValue,
  className = '' 
}: CircularProgressChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Create pie chart data
  const createPieData = () => {
    return data.map((item, index) => ({
      ...item,
      startAngle: 0,
      endAngle: (item.percentage / 100) * 360
    }));
  };

  const pieData = createPieData();

  return (
    <div className={`bg-black border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 relative overflow-hidden ${className}`}>
      {/* Enhanced 3D Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#b90abd]/20 via-[#5332ff]/15 to-[#b90abd]/20 rounded-2xl"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent via-transparent to-white/10 rounded-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl"></div>
      
      {/* 3D Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-[#b90abd]/40"></div>
      <div className="absolute inset-1 rounded-2xl border border-[#b90abd]/20"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#b90abd] rounded-full animate-pulse"></div>
          <span className="text-[#939394] text-sm">Live Data</span>
        </div>
      </div>
      
      <div className="relative z-10 h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Enhanced 3D Gradient Definitions */}
              <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b90abd" stopOpacity={1}/>
                <stop offset="30%" stopColor="#c73acd" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#d54add" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#e35aed" stopOpacity={0.85}/>
              </linearGradient>
              
              <linearGradient id="mediumGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5332ff" stopOpacity={1}/>
                <stop offset="30%" stopColor="#6b4aff" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#8362ff" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#9b7aff" stopOpacity={0.85}/>
              </linearGradient>
              
              <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#939394" stopOpacity={1}/>
                <stop offset="30%" stopColor="#a5a6a7" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#b7b8b9" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#c9cacb" stopOpacity={0.85}/>
              </linearGradient>

            </defs>
            
            {/* Render pie chart */}
            <Pie
              data={data.map(item => ({ name: item.name, value: item.value }))}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${entry.name.toLowerCase()}Gradient)`}
                  className="hover:scale-105 transition-transform duration-300"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        
      </div>

      {/* Legend - Horizontal layout like Urgency Level Distribution */}
      <div className="relative z-10 mt-6">
        <div className="flex justify-center space-x-8">
          {data.map((item, index) => (
            <div 
              key={item.name} 
              className={`flex flex-col items-center space-y-2 transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${0.5 + index * 0.1}s` }}
            >
              <div 
                className="w-6 h-6 rounded-full shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                  boxShadow: `0 0 15px ${item.color}50, 0 0 30px ${item.color}20`
                }}
              ></div>
              <div className="text-center">
                <div className="text-white text-sm font-semibold capitalize">{item.name}</div>
                <div className="text-[#939394] text-xs">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

export default CircularProgressChart;
