'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PolarSentimentData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: any;
}

interface PolarAreaChartProps {
  data: PolarSentimentData[];
  title: string;
  className?: string;
}

export default function PolarAreaChart({ data, title, className = '' }: PolarAreaChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

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
      
      <div className="relative z-10 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Enhanced 3D Gradient Definitions with custom palette */}
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b90abd" stopOpacity={1}/>
                <stop offset="30%" stopColor="#c73acd" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#d54add" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#e35aed" stopOpacity={0.85}/>
              </linearGradient>
              
              <linearGradient id="neutralGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5332ff" stopOpacity={1}/>
                <stop offset="30%" stopColor="#6b4aff" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#8362ff" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#9b7aff" stopOpacity={0.85}/>
              </linearGradient>
              
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#939394" stopOpacity={1}/>
                <stop offset="30%" stopColor="#a5a6a7" stopOpacity={0.95}/>
                <stop offset="70%" stopColor="#b7b8b9" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#c9cacb" stopOpacity={0.85}/>
              </linearGradient>


            </defs>
            
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={3}
              dataKey="value"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={3}
              filter="url(#shadow)"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${entry.name.toLowerCase()}Gradient)`}
                  className={`transition-all duration-700 hover:scale-110 cursor-pointer ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transform: isVisible ? 'translateZ(0) rotateX(0deg)' : 'translateZ(-30px) rotateX(-15deg)',
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
                    transformOrigin: 'center center'
                  }}
                />
              ))}
            </Pie>
            
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                color: '#1f2937',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)',
                fontWeight: '600',
                fontSize: '14px',
                padding: '12px 16px'
              }} 
              formatter={(value: number, name: string) => [
                `${value}%`, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      
      {/* Enhanced 3D Legend */}
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
}
