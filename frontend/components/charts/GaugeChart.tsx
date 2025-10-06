'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GaugeData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: any;
}

interface GaugeChartProps {
  data: GaugeData[];
  title: string;
  className?: string;
}

export default function GaugeChart({ data, title, className = '' }: GaugeChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate total for percentage display
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`bg-[#010101] border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 relative overflow-hidden ${className}`}>
      {/* 3D Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#b90abd]/20 via-[#5332ff]/10 to-[#b90abd]/20 rounded-2xl"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent rounded-2xl"></div>
      
      {/* 3D Border Effects */}
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
              {/* 3D Gradient Definitions with specified colors */}
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

              {/* Enhanced 3D Shadow Effects */}
              <filter id="gaugeShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="15" floodColor="rgba(185, 10, 189, 0.4)"/>
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0, 0, 0, 0.3)"/>
              </filter>
              
              <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Inner highlight effect */}
              <filter id="innerHighlight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="innerBlur"/>
                <feMerge> 
                  <feMergeNode in="innerBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={4}
              dataKey="value"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={4}
              filter="url(#gaugeShadow)"
              startAngle={180}
              endAngle={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${entry.name.toLowerCase()}Gradient)`}
                  className={`transition-all duration-800 hover:scale-110 cursor-pointer ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: 'url(#gaugeGlow)',
                    transform: isVisible ? 'translateZ(0) rotateX(0deg)' : 'translateZ(-40px) rotateX(-20deg)',
                    transition: `all 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.2}s`,
                    transformOrigin: 'center center'
                  }}
                />
              ))}
            </Pie>
            
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(1, 1, 1, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(185, 10, 189, 0.4)',
                borderRadius: '16px',
                color: '#ffffff',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(185, 10, 189, 0.3)',
                fontWeight: '600',
                fontSize: '14px',
                padding: '12px 16px'
              }} 
              formatter={(value: number, name: string) => [
                `${value}`, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center Gauge Value */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="text-center transform-gpu">
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {total}
          </div>
          <div className="text-[#939394] text-sm font-medium">Total Items</div>
        </div>
      </div>
      
      {/* Enhanced 3D Legend */}
      <div className="relative z-10 mt-8">
        <div className="flex justify-center space-x-8">
          {data.map((item, index) => (
            <div 
              key={item.name}
              className={`flex items-center space-x-3 transition-all duration-800 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${1.2 + index * 0.2}s` }}
            >
              <div 
                className="w-6 h-6 rounded-full shadow-xl relative"
                style={{ 
                  background: `url(#${item.name.toLowerCase()}Gradient)`,
                  filter: 'url(#gaugeGlow)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(185, 10, 189, 0.2)'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white/20"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold capitalize">{item.name}</span>
                <span className="text-[#939394] text-xs font-medium">{item.value} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${1 + (i % 4)}px`,
              height: `${1 + (i % 4)}px`,
              left: `${10 + i * 10}%`,
              top: `${20 + (i % 5) * 12}%`,
              background: `rgba(185, 10, 189, ${0.1 + (i % 3) * 0.05})`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 2)}s`,
              boxShadow: '0 0 6px rgba(185, 10, 189, 0.4)'
            }}
          />
        ))}
      </div>
      
      {/* Footer with Iron color */}
      <div className="relative z-10 mt-6 pt-4 border-t border-[#d6d9d8]/20">
        <div className="flex justify-center">
          <span className="text-[#d6d9d8] text-xs font-medium">
            Real-time urgency monitoring
          </span>
        </div>
      </div>
    </div>
  );
}
