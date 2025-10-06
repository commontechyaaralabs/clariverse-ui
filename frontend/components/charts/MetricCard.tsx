'use client';

import { memo } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: 'blue' | 'violet' | 'green' | 'orange' | 'purple';
  className?: string;
  style?: React.CSSProperties;
}

const gradientClasses = {
  blue: 'from-[#5332ff] to-[#6b4aff]',
  violet: 'from-[#b90abd] to-[#c73acd]',
  green: 'from-[#b90abd] to-[#c73acd]',
  orange: 'from-[#939394] to-[#a5a6a7]',
  purple: 'from-[#b90abd] to-[#5332ff]'
};

const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient = 'blue',
  className = '',
  style
}: MetricCardProps) {
  return (
    <div className={`bg-[#010101] border border-[#b90abd]/30 rounded-2xl p-6 shadow-lg shadow-[#b90abd]/20 hover:shadow-[#b90abd]/30 group cursor-pointer animate-fade-in transition-all duration-300 ${className}`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? 'bg-[#b90abd]/20 text-[#b90abd]' 
              : 'bg-[#939394]/20 text-[#939394]'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-[#939394] text-sm font-medium">{title}</h3>
        <div className="text-3xl font-bold text-white group-hover:text-gradient transition-all duration-300">
          {value}
        </div>
        {subtitle && (
          <p className="text-[#d6d9d8] text-sm">{subtitle}</p>
        )}
      </div>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
    </div>
  );
});

export default MetricCard;
