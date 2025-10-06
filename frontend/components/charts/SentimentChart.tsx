'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface SentimentChartProps {
  data: SentimentData[];
  className?: string;
}

export default function SentimentChart({ data, className = '' }: SentimentChartProps) {
  return (
    <div className={`neu-raised rounded-2xl p-6 hover:shadow-neu-hover relative ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment Analysis</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-app-gray-400 text-sm">Real-time</span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              stroke="rgba(0, 0, 0, 0.2)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }} 
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={50}
              formatter={(value) => (
                <span className="text-white text-sm font-medium">{value}</span>
              )}
              iconType="circle"
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {data.reduce((sum, item) => sum + item.value, 0)}%
          </div>
          <div className="text-app-gray-400 text-sm">Total</div>
        </div>
      </div>
    </div>
  );
}
